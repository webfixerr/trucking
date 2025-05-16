import { Tabs } from 'expo-router';
import { Chrome as Home, MapPin, Fuel, User } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth';
import { View, Text } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  console.log('TabLayout rendered', { isAuthenticated, isLoading });

  if (!isAuthenticated || isLoading) {
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
        tabBarActiveTintColor: '#3b82f6',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '🚚 Truck X829',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: 'Places',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="refuel"
        options={{
          title: 'Refuel',
          tabBarIcon: ({ color, size }) => <Fuel size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}