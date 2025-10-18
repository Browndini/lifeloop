import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, SafeAreaView, Text, View } from "react-native";
import { EmptyState } from "../components/EmptyState";
import { EntryCard } from "../components/EntryCard";
import { Header } from "../components/Header";
import { useEntries } from "../context/EntriesContext";
import type { JournalEntry } from "../utils/storage";

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
          <View className={index % 2 === 0 ? "pr-2" : "pl-2"}>
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
      <View className="px-6 pt-10">
        <Header title="Memories" subtitle="Your daily reflections" />
        <View className="mb-6 flex-row gap-2 rounded-full bg-white p-2 shadow-sm shadow-sand-200">
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
    <SafeAreaView className="flex-1 bg-[#f9f6f2]">
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
        columnWrapperStyle={columns === 2 ? { paddingHorizontal: 0 } : undefined}
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
      className={`flex-1 items-center justify-center rounded-full px-4 py-2 ${
        active ? "bg-sand-600 shadow-md shadow-sand-300" : "bg-transparent"
      }`}
    >
      <Text className={`text-sm font-semibold ${active ? "text-white" : "text-sand-500"}`}>{label}</Text>
    </Pressable>
  );
}
