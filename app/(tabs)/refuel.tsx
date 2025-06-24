import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRefuelStore } from '@/stores/refuelStore';
import RefuelList from '@/components/RefuelList';
import TruckSummary from '@/components/TruckSummary';

export default function RefuelScreen() {
  const { refuel } = useRefuelStore();

  return (
    <ScrollView style={styles.container}>
      <TruckSummary fuelLevel="65%" />
      <RefuelList data={refuel} />
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