// app/(tabs)/_layout.tsx
import { useState, useEffect } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import {
  HomeIcon,
  MapMarkerIcon,
  GasPumpIcon as FuelPumpIcon,
  SettingsIcon,
} from '@/components/Icons';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useTripStore } from '@/stores/tripStore';
import { useRefuelStore } from '@/stores/refuelStore';
import { useServiceStationStore } from '@/stores/serviceStationStore';
import { RootParamList } from '@/types/navigation';

import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import AddTripModal from '@/components/AddTripModal';
import AddRefuelModal from '@/components/AddRefuelModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import * as Location from 'expo-location';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useLocationStore } from '@/stores/location';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();
  const { startTracking, stopTracking } = useLocationTracking();
  const { tenantDomain } = useTenantStore();
  const {
    loadTrips,
    addTrip,
    setJourneyStarted,
    isJourneyStarted,
    trips,
    finishTrip,
    setCurrentTripId,
  } = useTripStore();
  const { setCurrentLocation, resetLocation } = useLocationStore();
  const { loadRefuel, syncPending: syncPendingRefuel } = useRefuelStore();
  const { loadServiceStations, syncPending: syncPendingServiceStations } =
    useServiceStationStore();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootParamList>>();

  const [isAddTripModalVisible, setAddTripModalVisible] = useState(false);
  const [isAddRefuelModalVisible, setAddRefuelModalVisible] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any | null>(null);

  const handleStartJourney = async (trip: {
    origin: string;
    destination: string;
    beginning_kilometers: string;
    started_at: string;
  }) => {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Toast.show({
          type: 'error',
          text1: t('locationDisabled'),
          text2: t('requestLocation'),
        });
        return;
      }

      // Check permissions
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();
      if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
        Toast.show({
          type: 'error',
          text1: t('permissionDenied'),
          text2: t('requiredPermission'),
        });
        return;
      }

      // Add trip
      const newTrip = await addTrip({
        origin: trip.origin,
        destination: trip.destination,
        beginning_kilometers: trip.beginning_kilometers,
        started_at: trip.started_at,
        active: true,
        end_notification_sent: false,
      });

      // Start location tracking
      await startTracking(newTrip.id);
      setJourneyStarted(true);
      Toast.show({
        type: 'success',
        text1: t('journeyStarted'),
        text2: t('journeyStartedTracking', {
          origin: trip.origin,
          destination: trip.destination,
        }),
      });

      // Update current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error starting journey:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('failedToStartJourney'),
      });
    }
  };

  const handleFinishJourney = async (tripId: string) => {
    try {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error(t('tripNotFound'));
      }
      const distance = (await finishTrip(tripId, '0', new Date().toISOString()))
        .distance;
      const beginningKilometers = parseFloat(trip.beginning_kilometers);
      const endingKilometers = (beginningKilometers + distance).toFixed(2);

      // Call finishTrip with calculated ending_kilometers
      await finishTrip(tripId, endingKilometers, new Date().toISOString());

      stopTracking();
      setJourneyStarted(false);
      setCurrentTripId(null);
      resetLocation();
      Alert.alert(
        t('tripCompleted'),
        t('totalDistance', {
          distance,
          endingKilometers,
        }),
        [{ text: t('ok'), style: 'default' }],
        { cancelable: false }
      );
      Toast.show({
        type: 'success',
        text1: t('journeyFinished'),
        text2: t('tripDataSynced'),
      });
    } catch (error) {
      console.error('Error finishing journey:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('failedToFinishJourney'),
      });
    }
  };

  useEffect(() => {
    const active = trips.find((trip) => trip.active);
    setActiveTrip(active || null);
  }, [trips, isJourneyStarted]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    if (!isAuthenticated || !tenantDomain) {
      console.log('Cannot refresh: Not authenticated or no tenant domain');
      return;
    }
    setRefreshing(true);
    try {
      await Promise.all([
        loadAuth(), // Refresh auth state
        loadTrips(), // Refresh trips
        loadRefuel(), // Refresh refuel logs
        syncPendingRefuel(), // Sync pending refuel
        loadServiceStations(), // Refresh service stations
        syncPendingServiceStations(), // Sync pending service stations
      ]);
      console.log('Global refresh completed');
    } catch (error) {
      console.error('Global refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated || isLoading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Redirecting...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#000000']} // Match login button and tab bar active color
          tintColor="#000000"
        />
      }
    >
      {activeTrip && (
        <View style={[styles.activeTripBar, { paddingTop: insets.top }]}>
          <View style={styles.activeTripDetails}>
            <MapMarkerIcon size={16} color="#555" />
            <Text style={styles.activeTripText}>
              {t('activeTrip', {
                origin: activeTrip.origin,
                destination: activeTrip.destination,
                beginningKilometers: activeTrip.beginning_kilometers,
              })}
            </Text>
          </View>
        </View>
      )}
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#000000',
          tabBarStyle: { display: 'none' },
        }}
        tabBar={(props) => (
          <View
            style={{
              flexDirection: 'row',
              paddingBottom: insets.bottom || 10,
              height: (insets.bottom || 10) + 60,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
            }}
          >
            {props.state.routes.map((route, index) => {
              const isFocused = props.state.index === index;
              const routeName = route.name as
                | 'index'
                | 'places'
                | 'refuel'
                | 'stations'
                | 'profile';

              const icon = {
                index: (
                  <HomeIcon
                    size={24}
                    color={isFocused ? '#000000' : '#6b7280'}
                  />
                ),
                places: (
                  <MapMarkerIcon
                    size={24}
                    color={isFocused ? '#000000' : '#6b7280'}
                  />
                ),
                refuel: (
                  <FuelPumpIcon
                    size={24}
                    color={isFocused ? '#000000' : '#6b7280'}
                  />
                ),
                stations: (
                  <FuelPumpIcon
                    size={24}
                    color={isFocused ? '#000000' : '#6b7280'}
                  />
                ),
                profile: (
                  <SettingsIcon
                    size={24}
                    color={isFocused ? '#000000' : '#6b7280'}
                  />
                ),
              }[routeName];

              const label = {
                index: 'Home',
                places: 'Routes',
                refuel: 'Refuel',
                stations: 'Stations',
                profile: 'Settings',
              }[routeName];

              return (
                <TouchableOpacity
                  key={route.key}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 8,
                  }}
                  onPress={() => {
                    console.log('Navigating to:', `(tabs)/${routeName}`);
                    navigation.navigate('(tabs)', { screen: routeName });
                  }}
                >
                  {icon}
                  <Text
                    style={{
                      fontSize: 12,
                      color: isFocused ? '#000000' : '#6b7280',
                      marginTop: 4,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'James Truck', headerTitleAlign: 'center' }}
        />
        <Tabs.Screen name="places" options={{ title: 'Routes' }} />
        <Tabs.Screen name="refuel" options={{ title: 'Refuel' }} />
        <Tabs.Screen name="stations" options={{ title: 'Service Stations' }} />
        <Tabs.Screen name="profile" options={{ title: 'Settings' }} />
      </Tabs>
      <AddTripModal
        visible={isAddTripModalVisible}
        onClose={() => setAddTripModalVisible(false)}
        onSubmit={handleStartJourney}
      />

      <AddRefuelModal
        visible={isAddRefuelModalVisible}
        onClose={() => setAddRefuelModalVisible(false)}
      />

      <FloatingActionButton
        onStartJourneyPress={() => setAddTripModalVisible(true)}
        onAddRefuelPress={() => setAddRefuelModalVisible(true)}
        onFinishJourneyPress={() => handleFinishJourney(activeTrip.id)}
        isJourneyStarted={isJourneyStarted}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  activeTripBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeTripDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeTripText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  finishTripButton: {
    backgroundColor: '#767577',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  finishTripButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
