import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRefuelStore } from '@/stores/refuelStore';
import RefuelList from '@/components/RefuelList';
import TruckSummary from '@/components/TruckSummary';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function RefuelScreen() {
  const { t } = useTranslation();
  const { refuelLogs, loadRefuel, syncPending } = useRefuelStore();

  useEffect(() => {
    loadRefuel();
    syncPending();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <TruckSummary fuelLevel="65%" />
        <RefuelList data={refuelLogs} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});
