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
            cards.length === 1 ? styles.singleCard : undefined,
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
    aspectRatio: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleCard: {
    flex: undefined,
    width: 150,
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default TruckSummary;
