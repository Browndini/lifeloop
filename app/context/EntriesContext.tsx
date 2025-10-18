import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getEntries, JournalEntry, removeEntry, upsertEntry } from "../utils/storage";

type EntriesContextValue = {
  entries: JournalEntry[];
  loading: boolean;
  addOrUpdateEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const EntriesContext = createContext<EntriesContextValue | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
};

export function EntriesProvider({ children }: ProviderProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const stored = await getEntries();
    setEntries(stored);
    setLoading(false);
  };

  const addOrUpdateEntry = async (entry: JournalEntry) => {
    setLoading(true);
    const updated = await upsertEntry(entry);
    setEntries(updated);
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    setLoading(true);
    const updated = await removeEntry(id);
    setEntries(updated);
    setLoading(false);
  };

  const value = useMemo(
    () => ({ entries, loading, addOrUpdateEntry, deleteEntry, refresh }),
    [entries, loading]
  );

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error("useEntries must be used within EntriesProvider");
  }
  return context;
}
