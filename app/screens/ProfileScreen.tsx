import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { Header } from "../components/Header";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f9f6f2]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Header title="Profile" subtitle="Coming soon" />
        <View className="rounded-3xl bg-white p-6 shadow-sm shadow-sand-200">
          <Text className="text-lg font-semibold text-sand-700">Stay tuned</Text>
          <Text className="mt-3 text-base leading-6 text-sand-500">
            The profile space will soon host your streaks, reflections, and more ways to stay connected with your daily practice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
