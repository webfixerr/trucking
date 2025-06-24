import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Fuel {
  station: string;
  capacity: string;
  date: string;
}

interface Props {
  data: Fuel[];
}

const RefuelList: React.FC<Props> = ({ data }) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Refueling Log</Text>
      {data.map((fuel, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.itemTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {fuel.station}
            </Text>
            <Text style={styles.itemSubtitle}>{fuel.capacity}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.itemDate}>{fuel.date}</Text>
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
