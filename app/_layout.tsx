import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/auth';

export default function RootLayout() {
  useFrameworkReady();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}