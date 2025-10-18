import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../components/EmptyState";
import { EntryCard } from "../components/EntryCard";
import { Header } from "../components/Header";
import { useEntries } from "../context/EntriesContext";
import type { JournalEntry } from "../utils/storage";
import { palette, shadows } from "../theme";

const VIEW_MODES = [
  { key: "list", title: "Timeline" },
  { key: "grid", title: "Grid" },
] as const;

type ViewModeKey = (typeof VIEW_MODES)[number]["key"];

export default function HomeScreen() {
  const { entries, loading, refresh } = useEntries();
  const [viewMode, setViewMode] = useState<ViewModeKey>("list");

  const columns = viewMode === "grid" ? 2 : 1;

  const renderItem = useCallback(
    ({ item, index }: { item: JournalEntry; index: number }) => {
      if (columns === 2) {
        return (
          <View style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}>
            <EntryCard entry={item} />
          </View>
        );
      }
      return <EntryCard entry={item} />;
    },
    [columns]
  );

  const header = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <Header title="Memories" subtitle="Your daily reflections" />
        <View style={styles.toggleGroup}>
          {VIEW_MODES.map((mode) => (
            <ViewToggle
              key={mode.key}
              label={mode.title}
              active={viewMode === mode.key}
              onPress={() => setViewMode(mode.key)}
            />
          ))}
        </View>
      </View>
    ),
    [viewMode]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={entries}
        key={columns}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#966f51" />}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState message="Capture your first moment to see it here." />}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: columns === 2 ? 16 : 24,
        }}
        columnWrapperStyle={columns === 2 ? styles.columnWrapper : undefined}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

type ToggleProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function ViewToggle({ label, active, onPress }: ToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggleButton, active && styles.toggleButtonActive]}
    >
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  toggleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 999,
    padding: 10,
    marginBottom: 24,
    ...shadows.sm,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleButtonActive: {
    backgroundColor: palette.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.textMuted,
  },
  toggleTextActive: {
    color: "white",
  },
  gridItemLeft: {
    paddingRight: 8,
  },
  gridItemRight: {
    paddingLeft: 8,
  },
  columnWrapper: {
    paddingHorizontal: 0,
  },
});
