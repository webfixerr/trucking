import { StyleSheet, ScrollView, Text } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { tripData, fuelData } from '@/lib/dummy/list';
import TruckSummary from '@/components/TruckSummary';
import TripList from '@/components/TripList';
import RefuelList from '@/components/RefuelList';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  console.log('USER - ', user);

  return (
    <ScrollView style={styles.container}>
      <TruckSummary mileage="84,502 mi" fuelLevel="65%" />
      <Text style={styles.title}>Home page</Text>
      {/* <TripList data={tripData} />
      <RefuelList data={fuelData} /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});
