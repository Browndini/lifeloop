import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { JournalEntry } from "../utils/storage";
import { palette, shadows } from "../theme";

type EntryCardProps = {
  entry: JournalEntry;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function EntryCard({ entry, onPress, onLongPress }: EntryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: palette.border }}
      style={styles.card}
    >
      <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.date}>
          {new Date(entry.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.caption}>{entry.caption}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: palette.surface,
    overflow: "hidden",
    ...shadows.sm,
  },
  image: {
    height: 240,
    width: "100%",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  date: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette.textMuted,
  },
  caption: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "600",
    color: palette.textStrong,
  },
});
