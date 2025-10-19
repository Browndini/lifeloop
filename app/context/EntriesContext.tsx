import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addOrUpdateEntry as upsertEntry, getEntries, JournalEntry, removeEntry } from "../utils/storage";
import { syncService } from "../utils/sync";
import { useAuth } from "./AuthContext";

type EntriesContextValue = {
  entries: JournalEntry[];
  loading: boolean;
  syncLoading: boolean;
  addOrUpdateEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  syncToCloud: () => Promise<void>;
};

const EntriesContext = createContext<EntriesContextValue | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
};

export function EntriesProvider({ children }: ProviderProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      syncService.setUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [user]); // Refresh when user changes (login/logout)

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await getEntries();

      if (user) {
        // Merge local and remote entries
        const mergedEntries = await syncService.mergeLocalAndRemote(stored);
        setEntries(mergedEntries);
      } else {
        setEntries(stored);
      }
    } catch (error) {
      console.error('Error refreshing entries:', error);
      // Fallback to local entries
      const stored = await getEntries();
      setEntries(stored);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addOrUpdateEntry = useCallback(async (entry: JournalEntry) => {
    setLoading(true);
    try {
      const updated = await upsertEntry(entry);
      setEntries(updated);

      // Sync to Firebase if user is authenticated
      if (user) {
        await syncService.syncEntry(entry);
      }
    } catch (error) {
      console.error('Error adding/updating entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteEntry = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const updated = await removeEntry(id);
      setEntries(updated);

      // Delete from Firebase if user is authenticated
      if (user) {
        await syncService.deleteEntry(id);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const syncToCloud = useCallback(async () => {
    if (!user) {
      throw new Error('User must be authenticated to sync');
    }

    setSyncLoading(true);
    try {
      await syncService.batchSync(entries);
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw error;
    } finally {
      setSyncLoading(false);
    }
  }, [user, entries]);

  const value = useMemo(
    () => ({ entries, loading, syncLoading, addOrUpdateEntry, deleteEntry, refresh, syncToCloud }),
    [entries, loading, syncLoading, addOrUpdateEntry, deleteEntry, refresh, syncToCloud]
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

export default EntriesProvider;
