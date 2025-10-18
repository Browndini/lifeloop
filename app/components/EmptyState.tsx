import { Text, View } from "react-native";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View className="mb-6 h-28 w-28 items-center justify-center rounded-full bg-sand-100">
        <Text className="text-4xl">📷</Text>
      </View>
      <Text className="text-center text-lg text-sand-600">{message}</Text>
    </View>
  );
}
