import { View, Text } from 'react-native';

export default function RefuelScreen() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-2xl font-bold mb-4">Refuel</Text>
      <Text className="text-gray-600 text-center">
        Track your refueling history and expenses.
      </Text>
    </View>
  );
}