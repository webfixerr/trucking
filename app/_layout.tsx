import i18n from '@/app/i18n/i18n';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { useTripStore } from '@/stores/tripStore';
import { useRefuelStore } from '@/stores/refuelStore';
import { useTenantStore } from '@/stores/tenantStore';
import { openDatabase } from '@/services/db';
import { initializeApiInterceptors } from '@/lib/api';
import { View, Text, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugAuthTable } from '@/services/db/authService';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { debugDatabase } from '@/services/db/migrations';

SplashScreen.preventAutoHideAsync();

async function requestLocationPermissions() {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    console.log('Location services enabled:', servicesEnabled);
    if (!servicesEnabled) {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Enable Location Services',
          'Please enable location services (GPS) on your device to track your journey.',
          [
            {
              text: 'Open Settings',
              onPress: async () => {
                await Linking.openSettings();
                resolve();
              },
            },
            { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
          ],
          { cancelable: true, onDismiss: () => resolve() }
        );
      });
      Toast.show({
        type: 'error',
        text1: 'Location Services Disabled',
        text2: 'Please enable GPS in your device settings.',
      });
      return false;
    }

    const foregroundStatus = await Location.getForegroundPermissionsAsync();
    console.log('Foreground permission status:', foregroundStatus.status);
    const backgroundStatus = await Location.getBackgroundPermissionsAsync();
    console.log('Background permission status:', backgroundStatus.status);

    if (
      foregroundStatus.status === 'undetermined' ||
      backgroundStatus.status === 'undetermined'
    ) {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Location Permission Required',
          'RoadFuel needs access to your location to track your journey in the foreground and background. This helps you log trips and navigate efficiently.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
            { text: 'Continue', onPress: () => resolve() },
          ],
          { cancelable: true, onDismiss: () => resolve() }
        );
      });
    }

    let foregroundResult = foregroundStatus;
    let backgroundResult = backgroundStatus;

    if (foregroundStatus.status !== 'granted') {
      foregroundResult = await Location.requestForegroundPermissionsAsync();
      console.log('Foreground permission requested:', foregroundResult.status);
    }

    if (backgroundStatus.status !== 'granted') {
      backgroundResult = await Location.requestBackgroundPermissionsAsync();
      console.log('Background permission requested:', backgroundResult.status);
    }

    if (foregroundResult.status !== 'granted') {
      console.log(
        'Foreground permission not granted:',
        foregroundResult.status
      );
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2:
          'Foreground location permission is required to track your journey.',
      });
      return false;
    }

    if (backgroundResult.status !== 'granted') {
      console.log(
        'Background permission not granted:',
        backgroundResult.status
      );
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2:
          'Background location permission is required to track your journey even when the app is closed.',
      });
      return false;
    }

    console.log('Location permissions granted (foreground and background)');
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to request location permissions.',
    });
    return false;
  }
}

async function initializeApp() {
  try {
    const permissionsGranted = await requestLocationPermissions();
    if (!permissionsGranted) {
      console.warn(
        'Location permissions not granted at startup. App will still run.'
      );
      // throw new Error('Location permissions not granted');
    }

    let db;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        db = openDatabase();
        console.log('Database initialized successfully');
        break;
      } catch (dbError) {
        console.error(
          `Database initialization attempt ${attempts + 1} failed:`,
          dbError
        );
        attempts++;
        if (attempts === maxAttempts) {
          throw new Error(
            'Failed to initialize database after multiple attempts'
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const authData = await AsyncStorage.getItem('auth-storage');
    const tenant = await AsyncStorage.getItem('tenant-storage');
    if (tenant) {
      console.log('Tenant loaded from AsyncStorage:', tenant);
    }
    return { authData, tenant, db };
  } catch (err: any) {
    console.error('App initialization error:', err);
    // throw new Error('Failed to initialize app: ' + err.message);
    return { authData: null, tenant: null, db: null };
  }
}

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

    const inAuthGroup = segments[0] === '(auth)';
    if (!tenantDomain && !inAuthGroup) {
      console.log('Navigating to TenantScreen');
      router.replace('/tenantscreen');
    } else if (!isAuthenticated && !inAuthGroup) {
      console.log('Navigating to login');
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log('Navigating to places');
      router.replace('/(tabs)/places');
    }
  }, [isAuthenticated, isAuthLoaded, isMounted, tenantDomain, segments]);
}

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, loadAuth } = useAuthStore();
  const { loadTrips } = useTripStore();
  const { loadRefuel, syncPending: syncPendingRefuel } = useRefuelStore();
  const { tenantDomain } = useTenantStore();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useProtectedRoute(isAuthenticated, isAuthLoaded, isMounted, tenantDomain);

  useEffect(() => {
    async function prepare() {
      try {
        const { authData, tenant, db } = await initializeApp();
        if (tenantDomain && authData) {
          initializeApiInterceptors();
          await Promise.all([loadTrips(), loadRefuel(), syncPendingRefuel()]);
          console.log('Global refresh completed');
        }
        debugDatabase();
        debugAuthTable();
        setIsAuthLoaded(true);
      } catch (err: any) {
        console.error('App preparation error:', err);
        setError(err.message);
        setIsAuthLoaded(true);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [tenantDomain]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Clear stored language on first load (remove after testing)
    AsyncStorage.removeItem('language')
      .then(() => console.log('Cleared stored language'))
      .catch((error) => console.error('Error clearing AsyncStorage:', error));
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isAuthenticated && tenantDomain) {
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
        <Stack.Screen name="i18n/i18n" />
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </SafeAreaProvider>
  );
}
