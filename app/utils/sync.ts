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

  async getSyncedEntries(): Promise<JournalEntry[]> {
    if (!this.userId) throw new Error('User not authenticated');

    try {
      const q = query(
        this.getUserEntriesCollection(),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as JournalEntry[];
    } catch (error) {
      console.error('Error fetching synced entries:', error);
      throw error;
    }
  }

  subscribeToEntries(callback: (entries: JournalEntry[]) => void): () => void {
    if (!this.userId) throw new Error('User not authenticated');

    const q = query(
      this.getUserEntriesCollection(),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const entries = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as JournalEntry[];
      callback(entries);
    });
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

  async mergeLocalAndRemote(localEntries: JournalEntry[]): Promise<JournalEntry[]> {
    if (!this.userId) return localEntries;

    try {
      const remoteEntries = await this.getSyncedEntries();

      // Simple merge strategy: prefer local entries, but add any remote-only entries
      const mergedEntries = [...localEntries];

      remoteEntries.forEach(remoteEntry => {
        const localIndex = localEntries.findIndex(local => local.id === remoteEntry.id);
        if (localIndex === -1) {
          // Remote entry doesn't exist locally, add it
          mergedEntries.push(remoteEntry);
        }
      });

      return mergedEntries;
    } catch (error) {
      console.error('Error merging entries:', error);
      return localEntries; // Fallback to local entries
    }
  }
}

export const syncService = new SyncService();
