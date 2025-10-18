import { Image, Pressable, Text, View } from "react-native";
import { JournalEntry } from "../utils/storage";

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
      android_ripple={{ color: "#e8dbcf" }}
      className="mb-4 overflow-hidden rounded-3xl bg-white shadow-sm shadow-sand-200"
    >
      <Image source={{ uri: entry.imageUri }} className="h-60 w-full" resizeMode="cover" />
      <View className="p-5">
        <Text className="text-sm uppercase tracking-wide text-sand-500">
          {new Date(entry.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text className="mt-2 text-lg font-display text-sand-800">{entry.caption}</Text>
      </View>
    </Pressable>
  );
}
