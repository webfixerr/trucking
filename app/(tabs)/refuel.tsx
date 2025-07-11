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
import AddRefuelModal from '@/components/AddRefuelModal';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { FuelPumpIcon } from '@/components/Icons';

export default function RefuelScreen() {
  const { refuelLogs, loadRefuel, syncPending } = useRefuelStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadRefuel();
    syncPending();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <TruckSummary fuelLevel="65%" />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Add Refuel</Text>
          </TouchableOpacity>
        </View>
        <RefuelList data={refuelLogs} />
      </ScrollView>

      <AddRefuelModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  customButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});
