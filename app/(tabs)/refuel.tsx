import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRefuelStore } from '@/stores/refuelStore';
import RefuelList from '@/components/RefuelList';

export default function RefuelScreen() {
  const { refuel } = useRefuelStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Refuel</Text>
        <Text style={styles.subtitle}>Track your refueling history and expenses.</Text>
      </View>
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
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});