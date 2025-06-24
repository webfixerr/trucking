import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  mileage?: string;
  fuelLevel?: string;
}

const TruckSummary: React.FC<Props> = ({ mileage, fuelLevel }) => {
  if (!mileage && !fuelLevel) return null;

  const cards = [
    mileage && { title: 'Current Mileage', value: mileage },
    fuelLevel && { title: 'Fuel Level', value: fuelLevel },
  ].filter(Boolean) as { title: string; value: string }[];

  return (
    <View
      style={[
        styles.cardContainer,
        cards.length === 1 ? styles.singleCardContainer : undefined,
      ]}
    >
      {cards.map((card, index) => (
        <View
          key={index}
          style={[
            styles.squareCard,
            cards.length === 1 ? null : undefined,
          ]}
        >
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardValue}>{card.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  singleCardContainer: {
    justifyContent: 'flex-start',
  },
  squareCard: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '48%',
  },
  cardTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 2,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default TruckSummary;
