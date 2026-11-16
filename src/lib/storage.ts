import { Habit, Goal, JournalEntry } from './types';

const STORAGE_KEYS = {
  habits: 'nexdev_habits',
  goals: 'nexdev_goals',
  journal: 'nexdev_journal',
  lastSync: 'nexdev_last_sync',
} as const;

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Domain-specific local getters & setters
export function getHabits(): Habit[] {
  return storage.get<Habit[]>(STORAGE_KEYS.habits) || [];
}

export function saveHabits(habits: Habit[]): void {
  storage.set(STORAGE_KEYS.habits, habits);
  // Trigger background sync to Vercel Postgres if connected
  triggerCloudSync({ habits });
}

export function getGoals(): Goal[] {
  return storage.get<Goal[]>(STORAGE_KEYS.goals) || [];
}

export function saveGoals(goals: Goal[]): void {
  storage.set(STORAGE_KEYS.goals, goals);
  // Trigger background sync to Vercel Postgres if connected
  triggerCloudSync({ goals });
}

export function getJournalEntries(): JournalEntry[] {
  return storage.get<JournalEntry[]>(STORAGE_KEYS.journal) || [];
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  storage.set(STORAGE_KEYS.journal, entries);
  // Trigger background sync to Vercel Postgres if connected
  triggerCloudSync({ journal: entries });
}

/**
 * Background Cloud Synchronization with Vercel Postgres
 * Fire-and-forget: does not block the UI or throw errors if offline.
 */
let syncDebounceTimer: any = null;

export function triggerCloudSync(data: {
  habits?: Habit[];
  goals?: Goal[];
  journal?: JournalEntry[];
}) {
  if (typeof window === 'undefined') return;

  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      const payload = {
        habits: data.habits || getHabits(),
        goals: data.goals || getGoals(),
        journal: data.journal || getJournalEntries(),
      };

      const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
      await fetch(`${apiBase}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Offline or database not connected yet — local storage remains safe
      console.log('Local-first storage active. Cloud sync will retry on next write.');
    }
  }, 1000);
}

/**
 * Hydrates local storage from Vercel Postgres if remote records exist
 */
export async function hydrateFromCloud(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
    const res = await fetch(`${apiBase}/api/sync`);
    if (!res.ok) return false;
    const data = await res.json();

    if (data.configured && (data.habits?.length > 0 || data.goals?.length > 0 || data.journal?.length > 0)) {
      if (data.habits?.length > 0) storage.set(STORAGE_KEYS.habits, data.habits);
      if (data.goals?.length > 0) storage.set(STORAGE_KEYS.goals, data.goals);
      if (data.journal?.length > 0) storage.set(STORAGE_KEYS.journal, data.journal);
      return true;
    }
  } catch (e) {
    // Fail silently to local storage
  }
  return false;
}
