import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { JournalEntry } from './storage';

const ENTRIES_COLLECTION = 'entries';

export interface SyncedEntry extends JournalEntry {
  userId: string;
  syncedAt: number;
}

export class SyncService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  private getUserEntriesCollection() {
    if (!this.userId) throw new Error('User not authenticated');
    return collection(db, 'users', this.userId, ENTRIES_COLLECTION);
  }

  async syncEntry(entry: JournalEntry): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    try {
      const syncedEntry: SyncedEntry = {
        ...entry,
        userId: this.userId,
        syncedAt: Date.now(),
      };

      await setDoc(doc(this.getUserEntriesCollection(), entry.id), syncedEntry);
    } catch (error) {
      console.error('Error syncing entry:', error);
      throw error;
    }
  }

  async deleteEntry(entryId: string): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(this.getUserEntriesCollection(), entryId));
    } catch (error) {
      console.error('Error deleting synced entry:', error);
      throw error;
    }
  }

  async batchSync(entries: JournalEntry[]): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    try {
      const batch = writeBatch(db);
      const userId = this.userId; // Capture the non-null value

      entries.forEach(entry => {
        const syncedEntry: SyncedEntry = {
          ...entry,
          userId,
          syncedAt: Date.now(),
        };
        const entryRef = doc(this.getUserEntriesCollection(), entry.id);
        batch.set(entryRef, syncedEntry);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error batch syncing entries:', error);
      throw error;
    }
  }

  async fetchEntries(): Promise<JournalEntry[]> {
    if (!this.userId) throw new Error('User not authenticated');

    try {
      const q = query(this.getUserEntriesCollection(), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data() as SyncedEntry;
        // Remove Firebase-specific fields before returning
        const { userId, syncedAt, ...entry } = data;
        return entry;
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  }

  subscribeToEntries(callback: (entries: JournalEntry[]) => void): () => void {
    if (!this.userId) throw new Error('User not authenticated');

    const q = query(
      this.getUserEntriesCollection(),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map(doc => {
          const data = doc.data() as SyncedEntry;
          // Remove Firebase-specific fields before returning
          const { userId, syncedAt, ...entry } = data;
          return entry;
        });
        callback(entries);
      },
      (error) => {
        console.error('Error in entries subscription:', error);
      }
    );

    return unsubscribe;
  }

  async mergeLocalAndRemote(localEntries: JournalEntry[]): Promise<JournalEntry[]> {
    try {
      const remoteEntries = await this.fetchEntries();
      
      // Create a map of remote entries by date for quick lookup
      const remoteMap = new Map(remoteEntries.map(entry => [entry.date, entry]));
      
      // Merge strategy: prefer remote entries, fallback to local
      const mergedEntries = localEntries.map(localEntry => {
        const remoteEntry = remoteMap.get(localEntry.date);
        if (remoteEntry) {
          // Use remote entry if it exists and is newer
          return remoteEntry.createdAt > localEntry.createdAt ? remoteEntry : localEntry;
        }
        return localEntry;
      });

      // Add any remote entries that don't exist locally
      const localDates = new Set(localEntries.map(entry => entry.date));
      const newRemoteEntries = remoteEntries.filter(entry => !localDates.has(entry.date));
      
      return [...mergedEntries, ...newRemoteEntries].sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error merging entries:', error);
      return localEntries; // Fallback to local entries
    }
  }
}

export const syncService = new SyncService();

// Default export for Expo Router compatibility
export default syncService;