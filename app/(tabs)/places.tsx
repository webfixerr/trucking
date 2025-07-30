import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useTripStore } from '@/stores/tripStore';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import AddTripModal from '@/components/AddTripModal';
import { MapMarkerIcon } from '@/components/Icons';
import Toast from 'react-native-toast-message';
import TruckSummary from '@/components/TruckSummary';
import * as Location from 'expo-location';

export default function TripsScreen() {
  const {
    trips,
    isLoading,
    isJourneyStarted,
    loadTrips,
    addTrip,
    finishTrip,
    setJourneyStarted,
    setCurrentTripId,
  } = useTripStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { startTracking, stopTracking } = useLocationTracking();

  useEffect(() => {
    loadTrips();
  }, []);

  const handleStartJourney = async (trip: {
    origin: string;
    destination: string;
    beginning_kilometers: string;
    started_at: string;
  }) => {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Toast.show({
          type: 'error',
          text1: 'Location Services Disabled',
          text2: 'Please enable GPS to start a trip.',
        });
        return;
      }

      // Check permissions
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();
      if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Location permissions are required to start a trip.',
        });
        return;
      }

      // Add trip
      const newTrip = await addTrip({
        origin: trip.origin,
        destination: trip.destination,
        beginning_kilometers: trip.beginning_kilometers,
        started_at: trip.started_at,
        active: true,
        end_notification_sent: false,
      });

      // Start location tracking
      await startTracking(newTrip.id);
      setJourneyStarted(true);
      Toast.show({
        type: 'success',
        text1: 'Journey Started',
        text2: `Tracking trip from ${trip.origin} to ${trip.destination}`,
      });

      // Update current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error starting journey:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start journey.',
      });
    }
  };

  const handleFinishJourney = async (tripId: string) => {
    try {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
      const distance = (await finishTrip(tripId, '0', new Date().toISOString()))
        .distance;
      const beginningKilometers = parseFloat(trip.beginning_kilometers);
      const endingKilometers = (beginningKilometers + distance).toFixed(2);

      // Call finishTrip with calculated ending_kilometers
      await finishTrip(tripId, endingKilometers, new Date().toISOString());

      stopTracking();
      setJourneyStarted(false);
      setCurrentTripId(null);
      setCurrentLocation(null);
      Alert.alert(
        'Trip Completed',
        `Total distance traveled: ${distance} km\nPredicted ending odometer: ${endingKilometers} km`,
        [{ text: 'OK', style: 'default' }],
        { cancelable: false }
      );
      Toast.show({
        type: 'success',
        text1: 'Journey Finished',
        text2: 'Trip data synced.',
      });
    } catch (error) {
      console.error('Error finishing journey:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to finish journey.',
      });
    }
  };

  // Sort trips: active trip first, then non-active by created_at descending
  const activeTrip = trips.find((trip) => trip.active);
  const recentTrips = trips
    .filter((trip) => !trip.active)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <View style={styles.container}>
      <TruckSummary mileage="84,502 mi" />
      {isLoading && <Text style={styles.loadingText}>Loading trips...</Text>}
      <TouchableOpacity
        style={[styles.customButton, isJourneyStarted && styles.buttonDisabled]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
        disabled={isJourneyStarted}
      >
        <Text style={styles.buttonText}>Start Journey</Text>
      </TouchableOpacity>
      {activeTrip && (
        <View style={styles.tripContainer}>
          <View style={styles.tripDetails}>
            <MapMarkerIcon size={16} color="#555" />
            <Text style={styles.tripText}>
              {activeTrip.origin} to {activeTrip.destination},{' '}
              {activeTrip.beginning_kilometers} km
            </Text>
          </View>
          {activeTrip.start_latitude && activeTrip.start_longitude && (
            <Text style={styles.locationText}>
              Start Location: {parseFloat(activeTrip.start_latitude).toFixed(4)}
              , {parseFloat(activeTrip.start_longitude).toFixed(4)}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.customButton, styles.finishButton]}
            onPress={() => handleFinishJourney(activeTrip.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Finish Journey</Text>
          </TouchableOpacity>
        </View>
      )}
      {recentTrips.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <ScrollView>
            {recentTrips.map((trip) => (
              <View key={trip.id} style={styles.tripContainer}>
                <View style={styles.tripDetails}>
                  <MapMarkerIcon size={16} color="#555" />
                  <Text style={styles.tripText}>
                    {trip.origin} to {trip.destination},{' '}
                    {trip.beginning_kilometers} km
                  </Text>
                </View>
                {trip.ending_kilometers && (
                  <Text style={styles.tripText}>
                    Ending Kilometers: {trip.ending_kilometers} km
                  </Text>
                )}
                {trip.start_latitude && trip.start_longitude && (
                  <Text style={styles.tripText}>
                    Start Location: {parseFloat(trip.start_latitude).toFixed(4)}
                    , {parseFloat(trip.start_longitude).toFixed(4)}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}
      {isJourneyStarted && currentLocation && (
        <Text style={styles.locationText}>
          Current Location: {currentLocation.latitude.toFixed(4)},{' '}
          {currentLocation.longitude.toFixed(4)}
        </Text>
      )}
      <AddTripModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleStartJourney}
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  customButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: '#767577',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  tripContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  tripDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    color: '#000',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
});
