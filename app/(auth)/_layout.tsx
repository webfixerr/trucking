import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="tenantscreen"
    >
      <Stack.Screen name="tenantscreen" />
      <Stack.Screen name="activation" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
