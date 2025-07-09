import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { useTripStore } from '@/stores/tripStore';
import TruckSummary from '@/components/TruckSummary';
import TripList from '@/components/TripList';
import StartTripModal from '@/components/StartTripModal';
import { useEffect, useState } from 'react';

export default function PlacesScreen() {
  const { trips, isJourneyStarted, loadTrips, setJourneyStarted, syncPending } =
    useTripStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadTrips();
    syncPending();
  }, []);

  const handleButtonPress = () => {
    if (isJourneyStarted) {
      setJourneyStarted(false);
    } else {
      setIsModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TruckSummary mileage="84,502 mi" />
        <TouchableOpacity
          style={styles.customButton}
          onPress={handleButtonPress}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isJourneyStarted ? 'Finish Route' : 'Start Journey'}
          </Text>
        </TouchableOpacity>
        <TripList data={trips} />
      </ScrollView>

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
  customButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});
