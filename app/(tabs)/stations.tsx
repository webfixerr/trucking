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
import { GasPumpIcon } from '@/components/Icons';
import { useTranslation } from 'react-i18next';

export default function ServiceStationsScreen() {
  const { t } = useTranslation();
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
      {/* <TextInput
        style={styles.searchInput}
        placeholderTextColor={'#888'}
        placeholder={t('searchServiceStations')}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity
        style={styles.customButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{t('addServiceStation')}</Text>
      </TouchableOpacity> */}
      <ScrollView>
        <Text style={styles.sectionTitle}>{t('serviceStations')}</Text>
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
                {t('stationInfo', {
                  fuel_price: station.fuel_price,
                  rating: station.rating,
                  is_global: station.is_global ? t('global') : '',
                })}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <GasPumpIcon size={16} color="#555" />
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
