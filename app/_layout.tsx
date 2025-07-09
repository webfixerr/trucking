import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { useTripStore } from '@/stores/tripStore';
import { useRefuelStore } from '@/stores/refuelStore';
import { useTenantStore } from '@/stores/tenantStore';
import { openDatabase, debugDatabase } from '@/services/db/migrations';
import { initializeApiInterceptors } from '@/lib/api';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugAuthTable } from '@/services/db/authService';

function useProtectedRoute(
  isAuthenticated: boolean,
  isAuthLoaded: boolean,
  isMounted: boolean,
  tenantDomain: string | null
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoaded || !isMounted) {
      return;
    }

    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';
      if (!tenantDomain && !inAuthGroup) {
        router.replace('/TenantScreen');
      } else if (!isAuthenticated && !inAuthGroup) {
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)/places');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isAuthLoaded, isMounted, tenantDomain, segments]);
}

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, loadAuth } = useAuthStore();
  const {
    loadTrips,
    syncPending: syncPendingTrips,
    debugPendingTrips,
  } = useTripStore();
  const {
    loadRefuel,
    syncPending: syncPendingRefuel,
    debugPendingRefuel,
  } = useRefuelStore();
  const { tenantDomain } = useTenantStore();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useProtectedRoute(isAuthenticated, isAuthLoaded, isMounted, tenantDomain);

  useEffect(() => {
    async function initializeApp() {
      try {
        openDatabase(); // Initialize SQLite database
        const authData = await loadAuth(); // Load auth data from SQLite
        const tenant = await AsyncStorage.getItem('tenant-storage');
        if (tenant) {
          console.log('Tenant loaded from AsyncStorage:', tenant);
        }
        if (tenantDomain && authData) {
          initializeApiInterceptors(); // Initialize API only if tenant and auth are ready
          loadTrips();
          loadRefuel();
        }
        setIsAuthLoaded(true);

        // Debug database state
        debugDatabase();
        debugAuthTable();
        debugPendingTrips();
        debugPendingRefuel();
      } catch (err: any) {
        console.error('App initialization error:', err);
        setError('Failed to initialize app: ' + err.message);
        setIsAuthLoaded(true);
      }
    }
    initializeApp();
  }, [tenantDomain]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync pending data when network is available
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isAuthenticated && tenantDomain) {
        syncPendingTrips();
        syncPendingRefuel();
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, tenantDomain]);

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
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
