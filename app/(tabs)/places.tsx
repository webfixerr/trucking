import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useTripStore } from '@/stores/tripStore';
import { MapMarkerIcon } from '@/components/Icons';
import Toast from 'react-native-toast-message';
import TruckSummary from '@/components/TruckSummary';
import { useTranslation } from 'react-i18next';
import { useLocationStore } from '@/stores/location';

export default function TripsScreen() {
  const { t } = useTranslation();
  const { trips, isLoading, isJourneyStarted, loadTrips } = useTripStore();

  const { currentLocation } = useLocationStore();

  useEffect(() => {
    loadTrips();
  }, []);

  const recentTrips = trips
    .filter((trip) => !trip.active)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <View style={styles.container}>
      <TruckSummary mileage="84,502 mi" />
      {isLoading && <Text style={styles.loadingText}>{t('loadingTrips')}</Text>}

      {recentTrips.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('recentTrips')}</Text>
          <ScrollView>
            {recentTrips.map((trip) => (
              <View key={trip.id} style={styles.tripContainer}>
                <View style={styles.tripDetails}>
                  <MapMarkerIcon size={16} color="#555" />
                  <Text style={styles.tripText}>
                    {t('recentTrip', {
                      origin: trip.origin,
                      destination: trip.destination,
                      beginningKilometers: trip.beginning_kilometers,
                    })}
                  </Text>
                </View>
                {trip.ending_kilometers && (
                  <Text style={styles.tripText}>
                    {t('endingKilometers', {
                      value: trip.ending_kilometers,
                    })}
                  </Text>
                )}
                {trip.start_latitude && trip.start_longitude && (
                  <Text style={styles.tripText}>
                    {t('startLocationText', {
                      latitude: parseFloat(trip.start_latitude).toFixed(4),
                      longitude: parseFloat(trip.start_longitude).toFixed(4),
                    })}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}
      {isJourneyStarted && currentLocation && (
        <Text style={styles.locationText}>
          {t('currentLocation', {
            latitude: currentLocation.latitude.toFixed(4),
            longitude: currentLocation.longitude.toFixed(4),
          })}
        </Text>
      )}
      <Toast />
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
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: '#767577',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  tripContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  tripDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    color: '#000',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
});
