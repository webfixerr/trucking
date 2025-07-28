// src/services/useLocationTracking.ts
import { useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { openDatabase } from '@/services/db';

const LOCATION_TASK_NAME = 'RoadFuel Tracking';

// Add type-safe property to globalThis for currentTripId
declare global {
  // eslint-disable-next-line no-var
  var currentTripId: string | null | undefined;
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      const { latitude, longitude } = location.coords;
      const timestamp = new Date(location.timestamp).toISOString();
      const tripId = location?.mocked
        ? 'TEST_TRIP'
        : globalThis.currentTripId || 'UNKNOWN'; // Use global or context for tripId
      const db = openDatabase();
      db.withTransactionSync(() => {
        db.runSync(
          'INSERT INTO pending_locations (latitude, longitude, timestamp, trip_id, created_at) VALUES (?, ?, ?, ?, ?);',
          [
            latitude.toString(),
            longitude.toString(),
            timestamp,
            tripId,
            timestamp,
          ]
        );
      });
      console.log('Background location stored:', {
        latitude,
        longitude,
        timestamp,
        tripId,
      });
    }
  }
});

export const useLocationTracking = () => {
  const watchIdRef = useRef<Location.LocationSubscription | null>(null);

  const requestLocationPermissions = async () => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Foreground location permission is required.',
        });
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Background location permission is required.',
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permissions error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to request location permissions.',
      });
      return false;
    }
  };

  const startTracking = async (tripId: string) => {
    const hasPermissions = await requestLocationPermissions();
    if (!hasPermissions) return;

    globalThis.currentTripId = tripId; // Store tripId for background task

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tracking Your Location',
        body: 'Location tracking is active for your journey.',
        sticky: true,
      },
      trigger: null,
    });

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000,
      distanceInterval: 100,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Tracking Your Location',
        notificationBody: 'Location tracking is active for your journey.',
        notificationColor: '#000000',
      },
    });

    watchIdRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,
        distanceInterval: 100,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const timestamp = new Date(location.timestamp).toISOString();
        const db = openDatabase();
        db.withTransactionSync(() => {
          db.runSync(
            'INSERT INTO pending_locations (latitude, longitude, timestamp, trip_id, created_at) VALUES (?, ?, ?, ?, ?);',
            [
              latitude.toString(),
              longitude.toString(),
              timestamp,
              tripId,
              timestamp,
            ]
          );
        });
        console.log('Foreground location:', {
          latitude,
          longitude,
          timestamp,
          tripId,
        });
      }
    );
  };

  const stopTracking = async () => {
    if (watchIdRef.current) {
      watchIdRef.current.remove();
      watchIdRef.current = null;
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      await Notifications.cancelAllScheduledNotificationsAsync();
      globalThis.currentTripId = null; // Clear tripId
      Toast.show({
        type: 'success',
        text1: 'Tracking Stopped',
        text2: 'Location tracking has been stopped.',
      });
    }
  };

  return { requestLocationPermissions, startTracking, stopTracking };
};
