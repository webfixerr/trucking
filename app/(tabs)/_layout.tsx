// app/(tabs)/_layout.tsx
import { useState, useEffect } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import {
  HomeIcon,
  MapMarkerIcon,
  FuelPumpIcon,
  SettingsIcon,
} from '@/components/Icons';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useTripStore } from '@/stores/tripStore';
import { useRefuelStore } from '@/stores/refuelStore';
import { useServiceStationStore } from '@/stores/serviceStationStore';

type RootParamList = {
  '(tabs)': {
    screen?: 'index' | 'places' | 'refuel' | 'stations' | 'profile';
  };
  '(auth)': undefined;
  '+not-found': undefined;
};

export default function TabsLayout() {
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();
  const { tenantDomain } = useTenantStore();
  const { loadTrips } = useTripStore();
  const { loadRefuel, syncPending: syncPendingRefuel } = useRefuelStore();
  const { loadServiceStations, syncPending: syncPendingServiceStations } =
    useServiceStationStore();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootParamList>>();

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
    </ScrollView>
  );
}
