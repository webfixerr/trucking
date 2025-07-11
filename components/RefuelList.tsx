import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useServiceStationStore } from '@/stores/serviceStationStore';
import { Refuel } from '@/types/refuel';

interface Props {
  data: Refuel[];
}

const RefuelList: React.FC<Props> = ({ data }) => {
  const { serviceStations } = useServiceStationStore();

  const getStationName = (serviceStationId: string) => {
    const station = serviceStations.find((s) => s.id === serviceStationId);
    return station
      ? `${station.name} - ${station.location}`
      : 'Unknown Station';
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Refueling Log</Text>
      {data.map((fuel, index) => (
        <View key={fuel.id} style={styles.itemContainer}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.itemTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getStationName(fuel.service_station_id)}
            </Text>
            <Text style={styles.itemSubtitle}>
              {fuel.litres_fueled} L at ${fuel.price_per_litre}/L,{' '}
              {fuel.kilometers_at_refuel} km
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.itemDate}>
              {new Date(fuel.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
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
  itemDate: {
    fontSize: 12,
    color: '#555',
  },
  dateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default RefuelList;
