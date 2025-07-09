import { Tabs } from 'expo-router';
import {
  HomeIcon,
  MapMarkerIcon,
  SettingsIcon,
  FuelPumpIcon,
} from '@/components/Icons';

import { useAuthStore } from '@/stores/authStore';
import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

// Define the route param list for the parent Stack navigator
type RootParamList = {
  '(tabs)': { screen?: 'index' | 'places' | 'refuel' | 'profile' };
  '(auth)': undefined;
  '+not-found': undefined;
};

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const navigation = useNavigation<NavigationProp<RootParamList>>();

  console.log('TabLayout rendered', { isAuthenticated, isLoading, insets });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isAuthenticated || isLoading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Redirecting...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#000000',
        tabBarStyle: {
          display: 'none', // Hide default tab bar
        },
      }}
      tabBar={(props) => {
        console.log(
          'Tab bar routes:',
          props.state.routes.map((r) => r.name)
        );
        console.log('Navigation state:', navigation.getState());
        return (
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
        );
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'James Truck', headerTitleAlign: 'center' }}
      />
      <Tabs.Screen name="places" options={{ title: 'Routes' }} />
      <Tabs.Screen name="refuel" options={{ title: 'Refuel' }} />
      <Tabs.Screen name="profile" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
