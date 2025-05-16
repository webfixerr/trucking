import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/auth';
import { useTripStore } from '@/stores/tripStore';
import { useRefuelStore } from '@/stores/refuelStore';
import { View, Text } from 'react-native';
import { runMigrations } from '@/services/db/migrations';
import { insertTrip } from '@/services/db/tripService';
import { insertRefuel } from '@/services/db/refuelService';
import { tripData, fuelData } from '@/lib/dummy/list';

function useProtectedRoute(isAuthenticated: boolean, isAuthLoaded: boolean, isMounted: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('useProtectedRoute called:', { isAuthenticated, isAuthLoaded, isMounted, segments });

    if (!isAuthLoaded || !isMounted) {
      console.log('Waiting for auth to load or navigator to mount');
      return;
    }

    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuthenticated && !inAuthGroup) {
        console.log('Redirecting to /login');
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        console.log('Redirecting to /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('No redirect needed:', { inAuthGroup, isAuthenticated });
      }
    }, 200); // Increased delay to 200ms

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isAuthLoaded, isMounted, segments]);
}

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, loadAuth, debugAuthTable } = useAuthStore();
  const { loadTrips, debugTrips } = useTripStore();
  const { loadRefuel, debugRefuel } = useRefuelStore();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useProtectedRoute(isAuthenticated, isAuthLoaded, isMounted);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Run migrations first
        runMigrations();

        // Seed dummy data
        const db = require('@/services/db').openDatabase();
        const tripCount = db.getFirstSync('SELECT COUNT(*) as count FROM trips;').count;
        if (tripCount === 0) {
          tripData.forEach((trip) => insertTrip(trip));
          console.log('Seeded trip data');
        }
        const refuelCount = db.getFirstSync('SELECT COUNT(*) as count FROM refuel;').count;
        if (refuelCount === 0) {
          fuelData.forEach((refuel) => insertRefuel(refuel));
          console.log('Seeded refuel data');
        }

        // Debug tables after migrations and seeding
        debugAuthTable();
        debugTrips();
        debugRefuel();

        // Load state
        await loadAuth();
        loadTrips();
        loadRefuel();
        setIsAuthLoaded(true);
      } catch (err) {
        console.error('App initialization error:', err);
        setError('Failed to initialize app');
        setIsAuthLoaded(true);
      }
    }
    initializeApp();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    console.log('RootLayout mounted');
  }, []);

  if (!isAuthLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}