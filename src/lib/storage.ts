import { Habit, Goal, JournalEntry } from './types';

const STORAGE_KEYS = {
  habits: 'nexdev_habits',
  goals: 'nexdev_goals',
  journal: 'nexdev_journal',
} as const;

// Generic storage helpers — easy to swap to API calls later
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

// Domain-specific helpers
export function getHabits(): Habit[] {
  return storage.get<Habit[]>(STORAGE_KEYS.habits) || [];
}

export function saveHabits(habits: Habit[]): void {
  storage.set(STORAGE_KEYS.habits, habits);
}

export function getGoals(): Goal[] {
  return storage.get<Goal[]>(STORAGE_KEYS.goals) || [];
}

export function saveGoals(goals: Goal[]): void {
  storage.set(STORAGE_KEYS.goals, goals);
}

export function getJournalEntries(): JournalEntry[] {
  return storage.get<JournalEntry[]>(STORAGE_KEYS.journal) || [];
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  storage.set(STORAGE_KEYS.journal, entries);
}

