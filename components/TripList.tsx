import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Trip {
  pickUpToDestiny: string;
  distance: string;
  date: string;
}

interface Props {
  data: Trip[];
}

const TripList: React.FC<Props> = ({ data }) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Recent Trips</Text>
      {data.map((trip, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.itemTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {trip.pickUpToDestiny}
            </Text>
            <Text style={styles.itemSubtitle}>{trip.distance}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.itemDate}>{trip.date}</Text>
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

export default TripList;
