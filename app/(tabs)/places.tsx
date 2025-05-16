import { StyleSheet, ScrollView } from 'react-native';
import { useTripStore } from '@/stores/tripStore';
import TruckSummary from '@/components/TruckSummary';
import TripList from '@/components/TripList';

export default function PlacesScreen() {
  const { trips } = useTripStore();

  return (
    <ScrollView style={styles.container}>
      <TruckSummary mileage="84,502 mi" />
      <TripList data={trips} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});