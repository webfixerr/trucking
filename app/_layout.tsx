import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/auth';
import { View, Text } from 'react-native';

function useProtectedRoute(isAuthenticated: boolean, isAuthLoaded: boolean, isMounted: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // console.log('useProtectedRoute called:', { isAuthenticated, isAuthLoaded, isMounted, segments });

    if (!isAuthLoaded || !isMounted) {
      // console.log('Waiting for auth to load or navigator to mount');
      return;
    }

    // Add a slight delay to ensure the Stack is mounted
    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      } else {
        console.log('No redirect needed:', { inAuthGroup, isAuthenticated });
      }
    }, 100); // 100ms delay to allow Stack to mount

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isAuthLoaded, isMounted, segments]);
}

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, loadAuth, debugAuthTable } = useAuthStore();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useProtectedRoute(isAuthenticated, isAuthLoaded, isMounted);

  useEffect(() => {
    async function initializeAuth() {
      try {
        debugAuthTable(); // Keep for debugging
        await loadAuth();
        setIsAuthLoaded(true);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setIsAuthLoaded(true);
      }
    }
    initializeAuth();
  }, []);

  useEffect(() => {
    setIsMounted(true);
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