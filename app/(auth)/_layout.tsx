import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="TenantScreen">
      <Stack.Screen name="TenantScreen" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
