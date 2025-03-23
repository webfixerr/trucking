import { View, Text } from 'react-native';

export default function PlacesScreen() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-2xl font-bold mb-4">Places</Text>
      <Text className="text-gray-600 text-center">
        Discover interesting places around you.
      </Text>
    </View>
  );
}