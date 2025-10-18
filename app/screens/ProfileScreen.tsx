import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { palette, shadows } from "../theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Profile" subtitle="Coming soon" />
        <View style={styles.card}>
          <Text style={styles.title}>Stay tuned</Text>
          <Text style={styles.body}>
            The profile space will soon host your streaks, reflections, and more ways to stay connected with your daily practice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 24,
    backgroundColor: palette.surface,
    padding: 24,
    ...shadows.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: palette.textStrong,
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
  },
});
