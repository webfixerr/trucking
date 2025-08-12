import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Trip } from '@/types/trip';
import { useTranslation } from 'react-i18next';

interface Props {
  data: Trip[];
  title?: string;
  onFinishPress?: () => void;
  endingKilometers?: string;
  setEndingKilometers?: (value: string) => void;
}

const TripList: React.FC<Props> = ({
  data,
  title,
  onFinishPress,
  endingKilometers,
  setEndingKilometers,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {data.length === 0 ? (
        <Text style={styles.noTripsText}>
          {title === t('ongoingTrip') ? t('noOngoingTrip') : t('noRecentTrips')}
        </Text>
      ) : (
        data.map((trip, index) => {
          const [origin, destination] = trip.pickUpToDestiny.split(' to ');
          return (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name="local-shipping"
                  size={24}
                  color="#000"
                  style={styles.icon}
                />
                <Text style={styles.cardTitle}>
                  {t('tripId', {
                    id: trip.id,
                  })}
                </Text>
              </View>
              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <MaterialIcons name="place" size={20} color="#4CAF50" />
                  <Text style={styles.routeLabel}>{t('origin')}</Text>
                  <Text style={styles.routeText}>{origin}</Text>
                </View>
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color="#555"
                  style={styles.arrowIcon}
                />
                <View style={styles.routePoint}>
                  <MaterialIcons name="flag" size={20} color="#F44336" />
                  <Text style={styles.routeLabel}>{t('destination')}</Text>
                  <Text style={styles.routeText}>{destination}</Text>
                </View>
              </View>
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{t('distance')}</Text>
                  <Text style={styles.detailText}>{trip.distance} km</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{t('date')}</Text>
                  <Text style={styles.detailText}>{trip.date}</Text>
                </View>
              </View>
              {onFinishPress && (
                <View style={styles.finishContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterEndingKilometers')}
                    keyboardType="numeric"
                    value={endingKilometers}
                    onChangeText={setEndingKilometers}
                  />
                  <TouchableOpacity
                    style={styles.finishButton}
                    onPress={onFinishPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>{t('finishJourney')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  noTripsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routePoint: {
    flex: 1,
    alignItems: 'flex-start',
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  arrowIcon: {
    marginHorizontal: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginTop: 2,
  },
  finishContainer: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  finishButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TripList;
