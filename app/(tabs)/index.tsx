import { View, Text } from 'react-native';
import { useAuthStore } from '@/stores/auth';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-2xl font-bold mb-4">Welcome, {user?.name}</Text>
      <Text className="text-gray-600 text-center">
        This is your home screen. Start building your app here!
      </Text>
    </View>
  );
}