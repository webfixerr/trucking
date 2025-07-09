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

export default function RefuelScreen() {
  const { refuel, loadRefuel, syncPending } = useRefuelStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadRefuel();
    syncPending();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <TruckSummary fuelLevel="65%" />
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Add Refuel</Text>
        </TouchableOpacity>
        <RefuelList data={refuel} />
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
