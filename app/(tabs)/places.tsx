import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import TruckSummary from '@/components/TruckSummary';
import TripList from '@/components/TripList';
import StartTripModal from '@/components/StartTripModal';
import { useEffect, useState } from 'react';
import { Trip as TripListTrip } from '@/types/trip';

export default function PlacesScreen() {
  const {
    trips,
    isJourneyStarted,
    loadTrips,
    setJourneyStarted,
    syncPending,
    isLoading: isTripsLoading,
  } = useTripStore();
  const { token, isLoading: isAuthLoading } = useAuthStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Log token and load trips when token is available
  useEffect(() => {
    console.log('PlacesScreen - Auth token:', token);
    if (!isAuthLoading && token) {
      loadTrips();
      syncPending();
    }
  }, [loadTrips, syncPending, token, isAuthLoading]);

  // Categorize trips
  const ongoingTrip = trips.find((trip) => trip.active);
  const recentTrips = trips.filter((trip) => !trip.active);

  // Map trips to TripList format
  const ongoingTripData: TripListTrip[] = ongoingTrip
    ? [
        {
          id: Number(ongoingTrip.id),
          pickUpToDestiny: `${ongoingTrip.origin} to ${ongoingTrip.destination}`,
          distance: ongoingTrip.beginning_kilometers,
          date: new Date(ongoingTrip.created_at).toLocaleDateString(),
        },
      ]
    : [];
  const recentTripData: TripListTrip[] = recentTrips.map((trip) => ({
    id: Number(trip.id),
    pickUpToDestiny: `${trip.origin} to ${trip.destination}`,
    distance: trip.beginning_kilometers,
    date: new Date(trip.created_at).toLocaleDateString(),
  }));

  const handleButtonPress = async () => {
    if (ongoingTripData.length > 0) {
      if (ongoingTripData[0] && ongoingTripData[0].id !== undefined) {
        await handleFinishTrip(ongoingTripData[0].id.toString());
      }
    } else {
      setIsModalVisible(true);
    }
  };

  const handleFinishTrip = async (id: string) => {
    try {
      await useTripStore.getState().finishTrip(
        id,
        '1000', // Hardcoded ending_kilometers
        new Date().toISOString()
      );
      setJourneyStarted(false);
      await loadTrips(); // Refresh page
    } catch (error) {
      alert('Failed to finish trip');
    }
  };

  return (
    <View style={styles.container}>
      {isAuthLoading || isTripsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TruckSummary mileage="84,502 mi" />
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleButtonPress}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {ongoingTripData.length > 0 ? 'Finish Journey' : 'Start Journey'}
            </Text>
          </TouchableOpacity>

          {/* Ongoing Trip Section (read-only) */}
          <TripList data={ongoingTripData} title="Ongoing Trip" />

          {/* Recent Trips Section */}
          <TripList data={recentTripData} title="Recent Trips" />
        </ScrollView>
      )}

      <StartTripModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#000',
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
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});
