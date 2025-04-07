import { StyleSheet, ScrollView } from 'react-native';
import { tripData } from '@/lib/dummy/list';
import TruckSummary from '@/components/TruckSummary';
import TripList from '@/components/TripList';

export default function PlacesScreen() {
  return (
    <ScrollView style={styles.container}>
      <TruckSummary mileage="84,502 mi" />
      <TripList data={tripData} />
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
