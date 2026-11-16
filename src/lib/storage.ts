import { Habit, Goal, JournalEntry, Challenge, TechNewsStory } from './types';

const STORAGE_KEYS = {
  habits: 'nexdev_habits',
  goals: 'nexdev_goals',
  journal: 'nexdev_journal',
  challenges: 'nexdev_challenges',
  news: 'nexdev_news',
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
  triggerCloudSync({ habits });
}

export function getGoals(): Goal[] {
  return storage.get<Goal[]>(STORAGE_KEYS.goals) || [];
}

export function saveGoals(goals: Goal[]): void {
  storage.set(STORAGE_KEYS.goals, goals);
  triggerCloudSync({ goals });
}

export function getJournalEntries(): JournalEntry[] {
  return storage.get<JournalEntry[]>(STORAGE_KEYS.journal) || [];
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  storage.set(STORAGE_KEYS.journal, entries);
  triggerCloudSync({ journal: entries });
}

export function getChallenges(): Challenge[] {
  return storage.get<Challenge[]>(STORAGE_KEYS.challenges) || [];
}

export function saveChallenges(challenges: Challenge[]): void {
  storage.set(STORAGE_KEYS.challenges, challenges);
  triggerCloudSync({ challenges });
}

export function getNews(): TechNewsStory[] {
  return storage.get<TechNewsStory[]>(STORAGE_KEYS.news) || [];
}

export function saveNews(news: TechNewsStory[]): void {
  storage.set(STORAGE_KEYS.news, news);
  triggerCloudSync({ news });
}

/**
 * Background Cloud Synchronization with Supabase / Postgres
 * Fire-and-forget: does not block the UI or throw errors if offline.
 */
let syncDebounceTimer: any = null;

export function triggerCloudSync(data: {
  habits?: Habit[];
  goals?: Goal[];
  journal?: JournalEntry[];
  challenges?: Challenge[];
  news?: TechNewsStory[];
}) {
  if (typeof window === 'undefined') return;

  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      const payload = {
        habits: data.habits || getHabits(),
        goals: data.goals || getGoals(),
        journal: data.journal || getJournalEntries(),
        challenges: data.challenges || getChallenges(),
        news: data.news || getNews(),
      };

      const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
      await fetch(`${apiBase}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.log('Local-first storage active. Cloud sync will retry on next write.');
    }
  }, 600);
}

/**
 * Hydrates local storage from Supabase Postgres
 */
export async function hydrateFromCloud(): Promise<{
  habits?: Habit[];
  goals?: Goal[];
  journal?: JournalEntry[];
  challenges?: Challenge[];
  news?: TechNewsStory[];
} | null> {
  if (typeof window === 'undefined') return null;

  try {
    const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
    const res = await fetch(`${apiBase}/api/sync`);
    if (!res.ok) return null;
    const data = await res.json();

    if (data.configured) {
      if (Array.isArray(data.habits)) storage.set(STORAGE_KEYS.habits, data.habits);
      if (Array.isArray(data.goals)) storage.set(STORAGE_KEYS.goals, data.goals);
      if (Array.isArray(data.journal)) storage.set(STORAGE_KEYS.journal, data.journal);
      if (Array.isArray(data.challenges)) storage.set(STORAGE_KEYS.challenges, data.challenges);
      if (Array.isArray(data.news)) storage.set(STORAGE_KEYS.news, data.news);
      return {
        habits: data.habits,
        goals: data.goals,
        journal: data.journal,
        challenges: data.challenges,
        news: data.news,
      };
    }
  } catch (e) {
    // Fail silently to local storage
  }
  return null;
}
