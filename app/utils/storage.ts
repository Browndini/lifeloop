import AsyncStorage from "@react-native-async-storage/async-storage";

export type JournalEntry = {
  id: string;
  date: string;
  imageUri: string;
  caption: string;
  createdAt: number;
};

const STORAGE_KEY = "lifeloop.entries";

export async function getEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: JournalEntry[] = JSON.parse(raw);
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Failed to load entries", error);
    return [];
  }
}

export async function saveEntries(entries: JournalEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to save entries", error);
  }
}

export async function upsertEntry(newEntry: JournalEntry): Promise<JournalEntry[]> {
  const entries = await getEntries();
  const filtered = entries.filter((entry) => entry.date !== newEntry.date);
  const updated = [newEntry, ...filtered].sort((a, b) => b.createdAt - a.createdAt);
  await saveEntries(updated);
  return updated;
}

export async function removeEntry(id: string): Promise<JournalEntry[]> {
  const entries = await getEntries();
  const updated = entries.filter((entry) => entry.id !== id);
  await saveEntries(updated);
  return updated;
}
