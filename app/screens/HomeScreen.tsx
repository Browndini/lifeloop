import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import Lightbox from "../components/Lightbox";
import Timeline from "../components/Timeline";
import { useEntries } from "../context/EntriesContext";
import { palette } from "../theme";
import type { JournalEntry } from "../utils/storage";

export default function HomeScreen() {
  const { entries, loading, refresh } = useEntries();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const handleEntryPress = useCallback((entry: JournalEntry) => {
    setSelectedEntry(entry);
    setLightboxVisible(true);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxVisible(false);
    setSelectedEntry(null);
  }, []);

  const header = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <Header title="Memories" subtitle="Your daily reflections" />
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#966f51" />}
        contentContainerStyle={styles.timelineContainer}
      >
        {header}
        {entries.length === 0 ? (
          <EmptyState message="Capture your first moment to see it here." />
        ) : (
          <Timeline entries={entries} onEntryPress={handleEntryPress} />
        )}
      </ScrollView>
      <Lightbox
        visible={lightboxVisible}
        entry={selectedEntry}
        onClose={handleCloseLightbox}
      />
    </SafeAreaView>
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
  timelineContainer: {
    paddingBottom: 120,
  },
});
