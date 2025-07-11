import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import { useServiceStationStore } from '@/stores/serviceStationStore';
import { useEffect, useState } from 'react';
import { ServiceStation } from '@/types/serviceStation';
import AddServiceStationModal from '@/components/AddServiceStationModal';
import { FuelPumpIcon } from '@/components/Icons';

export default function ServiceStationsScreen() {
  const { serviceStations, loadServiceStations, syncPending } =
    useServiceStationStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState<ServiceStation[]>(
    []
  );

  useEffect(() => {
    loadServiceStations();
    syncPending();
  }, []);

  useEffect(() => {
    setFilteredStations(
      serviceStations.filter(
        (station) =>
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, serviceStations]);

  const handleStationAdded = (stationId: string) => {
    loadServiceStations();
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search service stations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity
        style={styles.customButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Add Service Station</Text>
      </TouchableOpacity>
      <ScrollView>
        <Text style={styles.sectionTitle}>Service Stations</Text>
        {filteredStations.map((station) => (
          <View key={station.id} style={styles.itemContainer}>
            <View style={{ flex: 1 }}>
              <Text
                style={styles.itemTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {station.name} - {station.location}
              </Text>
              <Text style={styles.itemSubtitle}>
                Fuel Price: ${station.fuel_price}/L, Rating: {station.rating}
                {station.is_global ? ' (Global)' : ''}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <FuelPumpIcon size={16} color="#555" />
            </View>
          </View>
        ))}
      </ScrollView>
      <AddServiceStationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onStationAdded={handleStationAdded}
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  customButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
