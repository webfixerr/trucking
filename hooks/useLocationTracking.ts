import { useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { useTripStore } from '@/stores/tripStore';
import { Alert } from 'react-native';
import api from '@/lib/api';

const LOCATION_TASK_NAME = 'RoadFuel Tracking';

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
      const { currentTripId } = useTripStore.getState();
      const tripId = currentTripId || 'UNKNOWN';
      console.log('Background location:', {
        latitude,
        longitude,
        timestamp,
        tripId,
      });
      // try {
      //   await api.post(
      //     '/locations',
      //     {
      //       latitude: latitude.toString(),
      //       longitude: longitude.toString(),
      //       timestamp,
      //       trip_id: tripId,
      //       created_at: timestamp,
      //     },
      //     {
      //       headers: { Accept: 'application/json' },
      //     }
      //   );
      //   console.log('Background location sent to API:', {
      //     latitude,
      //     longitude,
      //     timestamp,
      //     tripId,
      //   });
      // } catch (apiError) {
      //   console.error('Failed to send background location to API:', apiError);
      // }
    }
  }
});

export const useLocationTracking = () => {
  const watchIdRef = useRef<Location.LocationSubscription | null>(null);
  const { setCurrentTripId } = useTripStore();

  const startTracking = async (tripId: string) => {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      console.log('Location services enabled:', servicesEnabled);
      console.log(
        'Location provider status:',
        await Location.getProviderStatusAsync()
      );
      if (!servicesEnabled) {
        await new Promise<void>((resolve) => {
          Alert.alert(
            'Enable Location Services',
            'Please enable location services (GPS) on your device to track your journey.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
              {
                text: 'Open Settings',
                onPress: async () => {
                  await Location.requestForegroundPermissionsAsync();
                  resolve();
                },
              },
            ]
          );
        });
        Toast.show({
          type: 'error',
          text1: 'Location Services Disabled',
          text2: 'Please enable GPS in your device settings.',
        });
        throw new Error('Location services disabled');
      }

      setCurrentTripId(tripId);

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
        async (location) => {
          if (!location || !location.coords) {
            console.error('Invalid location data');
            return;
          }
          const { latitude, longitude } = location.coords;
          const timestamp = new Date(location.timestamp).toISOString();
          const { currentTripId } = useTripStore.getState();
          console.log('Foreground location:', {
            latitude,
            longitude,
            timestamp,
            tripId: currentTripId,
          });
          console.log(
            'Full location object:',
            JSON.stringify(location, null, 2)
          );
          // try {
          //   await api.post(
          //     '/locations',
          //     {
          //       latitude: latitude.toString(),
          //       longitude: longitude.toString(),
          //       timestamp,
          //       trip_id: currentTripId || 'UNKNOWN',
          //       created_at: timestamp,
          //     },
          //     {
          //       headers: { Accept: 'application/json' },
          //     }
          //   );
          //   console.log('Foreground location sent to API:', {
          //     latitude,
          //     longitude,
          //     timestamp,
          //     tripId: currentTripId,
          //   });
          // } catch (apiError) {
          //   console.error(
          //     'Failed to send foreground location to API:',
          //     apiError
          //   );
          // }
        }
      );
    } catch (error) {
      console.error('Start tracking error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start location tracking.',
      });
      throw error;
    }
  };

  const stopTracking = async () => {
    try {
      if (watchIdRef.current) {
        watchIdRef.current.remove();
        watchIdRef.current = null;
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        await Notifications.cancelAllScheduledNotificationsAsync();
        setCurrentTripId(null);
        Toast.show({
          type: 'success',
          text1: 'Tracking Stopped',
          text2: 'Location tracking has been stopped.',
        });
      }
    } catch (error) {
      console.error('Stop tracking error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to stop location tracking.',
      });
    }
  };

  return { startTracking, stopTracking };
};
