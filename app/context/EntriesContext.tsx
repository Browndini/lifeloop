import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addOrUpdateEntry as upsertEntry, getEntries, JournalEntry, removeEntry, saveEntries } from "../utils/storage";
import { syncService } from "../utils/sync";
import { useAuth } from "./AuthContext";

const GUEST_USER_ID_KEY = '@guest_user_id';

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
  const [hasMigratedGuestEntries, setHasMigratedGuestEntries] = useState(false);
  const { user, currentUserId, isGuestMode } = useAuth();

  useEffect(() => {
    if (user) {
      syncService.setUserId(user.uid);
    }
  }, [user]);

  // Migrate guest entries when user signs in
  useEffect(() => {
    const migrateGuestEntries = async () => {
      if (user && !hasMigratedGuestEntries) {
        const guestId = await AsyncStorage.getItem(GUEST_USER_ID_KEY);

        if (guestId) {
          console.log('[Entries] 🔄 Migrating guest entries from:', guestId, 'to:', user.uid);

          const allEntries = await getEntries();
          let migratedCount = 0;

          // Update all guest entries to be associated with the new Firebase UID
          const updatedEntries = allEntries.map(entry => {
            if (!entry.userId || entry.userId === guestId) {
              migratedCount++;
              return { ...entry, userId: user.uid };
            }
            return entry;
          });

          if (migratedCount > 0) {
            await saveEntries(updatedEntries);
            console.log('[Entries] ✅ Migrated', migratedCount, 'entries to authenticated user');

            // Sync all migrated entries to cloud
            console.log('[Entries] ☁️ Syncing migrated entries to cloud...');
            await syncService.batchSync(updatedEntries);
            console.log('[Entries] ✅ Migration sync complete');
          }

          setHasMigratedGuestEntries(true);
        }
      }
    };

    migrateGuestEntries();
  }, [user, hasMigratedGuestEntries]);

  useEffect(() => {
    refresh();
  }, [user, currentUserId]); // Refresh when user or currentUserId changes

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await getEntries();

      console.log('[Entries] 📥 Loaded', stored.length, 'entries from storage');
      console.log('[Entries] Sample entry:', stored[0] || 'No entries');

      if (user) {
        // Merge local and remote entries
        const mergedEntries = await syncService.mergeLocalAndRemote(stored);
        console.log('[Entries] ☁️ Merged with cloud, total:', mergedEntries.length);
        setEntries(mergedEntries);
      } else {
        setEntries(stored);
      }
    } catch (error) {
      console.error('[Entries] ❌ Error refreshing entries:', error);
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
      // Associate entry with current user ID (guest or authenticated)
      const entryWithUser = {
        ...entry,
        userId: currentUserId || undefined,
      };

      console.log('[Entries] ➕ Adding/updating entry:', {
        id: entryWithUser.id,
        date: entryWithUser.date,
        userId: entryWithUser.userId,
      });

      const updated = await upsertEntry(entryWithUser);
      setEntries(updated);

      // Sync to Firebase if user is authenticated (not guest)
      if (user && !isGuestMode) {
        console.log('[Entries] ☁️ Syncing to cloud...');
        await syncService.syncEntry(entryWithUser);
        console.log('[Entries] ✅ Synced to cloud');
      } else if (isGuestMode) {
        console.log('[Entries] 💾 Saved locally (guest mode)');
      }
    } catch (error) {
      console.error('[Entries] ❌ Error adding/updating entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentUserId, isGuestMode]);

  const deleteEntry = useCallback(async (id: string) => {
    setLoading(true);
    try {
      console.log('[Entries] 🗑️ Deleting entry:', id);
      const updated = await removeEntry(id);
      setEntries(updated);

      // Delete from Firebase if user is authenticated
      if (user && !isGuestMode) {
        console.log('[Entries] ☁️ Deleting from cloud...');
        await syncService.deleteEntry(id);
        console.log('[Entries] ✅ Deleted from cloud');
      }
    } catch (error) {
      console.error('[Entries] ❌ Error deleting entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, isGuestMode]);

  const syncToCloud = useCallback(async () => {
    if (!user) {
      throw new Error('User must be authenticated to sync');
    }

    setSyncLoading(true);
    try {
      console.log('[Entries] ☁️ Force syncing', entries.length, 'entries to cloud...');
      await syncService.batchSync(entries);
      console.log('[Entries] ✅ Force sync complete');
    } catch (error) {
      console.error('[Entries] ❌ Error syncing to cloud:', error);
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
