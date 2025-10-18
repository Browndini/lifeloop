import { Text, View } from "react-native";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View className="mb-6">
      <Text className="text-3xl font-display text-sand-800">{title}</Text>
      {subtitle ? <Text className="mt-1 text-base text-sand-600">{subtitle}</Text> : null}
    </View>
  );
}
