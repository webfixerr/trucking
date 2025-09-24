import { StyleSheet, ScrollView, Text } from 'react-native';
import { useAuthStore } from '@/stores/authStore';

import TruckSummary from '@/components/TruckSummary';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container}>
      <TruckSummary mileage="84,502 mi" fuelLevel="65%" />
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
