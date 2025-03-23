import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View className="flex-1 p-6">
      <View className="mb-8">
        <Text className="text-2xl font-bold mb-2">{user?.name}</Text>
        <Text className="text-gray-600">{user?.email}</Text>
      </View>

      <TouchableOpacity
        className="bg-red-500 p-4 rounded-lg"
        onPress={handleLogout}
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}