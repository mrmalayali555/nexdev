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

/**
 * Purges legacy mock/seed items and old fragmented news batches from user browser localStorage
 */
function purgeLegacySeedData() {
  if (typeof window === 'undefined') return;
  try {
    const isPurged = localStorage.getItem('nexdev_seed_purged_v4');
    if (!isPurged) {
      const legacyHabitNames = [
        'Morning Meditation',
        'Exercise',
        'Workout & Fitness',
        'Drink 8 glasses of water',
        'Hydration (2.5L Water)',
        'Read 30 mins',
        'Deep Reading (20 min)',
        'Write in journal',
        'Evening Reflection',
        'Learn a new word',
      ];
      const legacyGoalTitles = [
        'Run a Half Marathon',
        'Complete 10K Endurance Run',
        'Read 24 Books This Year',
        'Read 12 High-Impact Nonfiction Books',
        'Save $5,000 Emergency Fund',
        'Learn TypeScript',
      ];

      // Purge habits
      const habits = storage.get<Habit[]>(STORAGE_KEYS.habits) || [];
      const cleanHabits = habits.filter(
        (h) =>
          !h.id.startsWith('seed-') &&
          !h.id.startsWith('1794836651567-') &&
          !h.id.startsWith('1794836651565-') &&
          !legacyHabitNames.includes(h.name)
      );
      storage.set(STORAGE_KEYS.habits, cleanHabits);

      // Purge goals
      const goals = storage.get<Goal[]>(STORAGE_KEYS.goals) || [];
      const cleanGoals = goals.filter(
        (g) =>
          !g.id.startsWith('seed-') &&
          !g.id.startsWith('1794836651569-') &&
          !legacyGoalTitles.includes(g.title)
      );
      storage.set(STORAGE_KEYS.goals, cleanGoals);

      // Purge journal
      const journal = storage.get<JournalEntry[]>(STORAGE_KEYS.journal) || [];
      const cleanJournal = journal.filter(
        (j) => !j.id.startsWith('seed-') && !j.id.startsWith('1794836651570-')
      );
      storage.set(STORAGE_KEYS.journal, cleanJournal);

      // Purge old fragmented news so user can paste fresh with clean 5-story splitting
      storage.set(STORAGE_KEYS.news, []);

      localStorage.setItem('nexdev_seed_purged_v4', 'true');
    }
  } catch (e) {
    console.warn('LocalStorage cleanup skipped:', e);
  }
}

// Run cleanup immediately upon evaluation in client browser
if (typeof window !== 'undefined') {
  purgeLegacySeedData();
}

// Domain-specific local getters & setters
export function getHabits(): Habit[] {
  purgeLegacySeedData();
  return storage.get<Habit[]>(STORAGE_KEYS.habits) || [];
}

export function saveHabits(habits: Habit[]): void {
  storage.set(STORAGE_KEYS.habits, habits);
  triggerCloudSync({ habits });
}

export function getGoals(): Goal[] {
  purgeLegacySeedData();
  return storage.get<Goal[]>(STORAGE_KEYS.goals) || [];
}

export function saveGoals(goals: Goal[]): void {
  storage.set(STORAGE_KEYS.goals, goals);
  triggerCloudSync({ goals });
}

export function getJournalEntries(): JournalEntry[] {
  purgeLegacySeedData();
  return storage.get<JournalEntry[]>(STORAGE_KEYS.journal) || [];
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  storage.set(STORAGE_KEYS.journal, entries);
  triggerCloudSync({ journal: entries });
}

export function getChallenges(): Challenge[] {
  purgeLegacySeedData();
  return storage.get<Challenge[]>(STORAGE_KEYS.challenges) || [];
}

export function saveChallenges(challenges: Challenge[]): void {
  storage.set(STORAGE_KEYS.challenges, challenges);
  triggerCloudSync({ challenges });
}

export function getNews(): TechNewsStory[] {
  purgeLegacySeedData();
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
      // Send only data layers that were explicitly passed
      const payload: Record<string, any> = {};
      if (data.habits !== undefined) payload.habits = data.habits;
      if (data.goals !== undefined) payload.goals = data.goals;
      if (data.journal !== undefined) payload.journal = data.journal;
      if (data.challenges !== undefined) payload.challenges = data.challenges;
      if (data.news !== undefined) payload.news = data.news;

      // Don't send empty payload
      if (Object.keys(payload).length === 0) return;

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
    // Real-time serverless pull via POST to guarantee fresh live Supabase data with zero caching
    let res = await fetch(`${apiBase}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify({ pull: true }),
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(`${apiBase}/api/sync`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      }).catch(() => null);
    }

    if (!res || !res.ok) return null;
    const data = await res.json();

    if (data.configured) {
      // Smart Safe Hydration: If cloud has data, update local storage.
      // If cloud is empty but local storage already has items, NEVER wipe local!
      // Instead, trigger cloud sync to push local items to Supabase!
      const localHabits = storage.get<Habit[]>(STORAGE_KEYS.habits) || [];
      const localGoals = storage.get<Goal[]>(STORAGE_KEYS.goals) || [];
      const localJournal = storage.get<JournalEntry[]>(STORAGE_KEYS.journal) || [];
      const localChallenges = storage.get<Challenge[]>(STORAGE_KEYS.challenges) || [];
      const localNews = storage.get<TechNewsStory[]>(STORAGE_KEYS.news) || [];

      let resolvedHabits = data.habits;
      if (Array.isArray(data.habits)) {
        if (data.habits.length > 0) {
          storage.set(STORAGE_KEYS.habits, data.habits);
        } else if (localHabits.length > 0) {
          resolvedHabits = localHabits;
          triggerCloudSync({ habits: localHabits });
        }
      }

      let resolvedGoals = data.goals;
      if (Array.isArray(data.goals)) {
        if (data.goals.length > 0) {
          storage.set(STORAGE_KEYS.goals, data.goals);
        } else if (localGoals.length > 0) {
          resolvedGoals = localGoals;
          triggerCloudSync({ goals: localGoals });
        }
      }

      let resolvedJournal = data.journal;
      if (Array.isArray(data.journal)) {
        if (data.journal.length > 0) {
          storage.set(STORAGE_KEYS.journal, data.journal);
        } else if (localJournal.length > 0) {
          resolvedJournal = localJournal;
          triggerCloudSync({ journal: localJournal });
        }
      }

      let resolvedChallenges = data.challenges;
      if (Array.isArray(data.challenges)) {
        if (data.challenges.length > 0) {
          storage.set(STORAGE_KEYS.challenges, data.challenges);
        } else if (localChallenges.length > 0) {
          resolvedChallenges = localChallenges;
          triggerCloudSync({ challenges: localChallenges });
        }
      }

      let resolvedNews = data.news;
      if (Array.isArray(data.news)) {
        if (data.news.length > 0) {
          storage.set(STORAGE_KEYS.news, data.news);
        } else if (localNews.length > 0) {
          resolvedNews = localNews;
          triggerCloudSync({ news: localNews });
        }
      }

      return {
        habits: resolvedHabits,
        goals: resolvedGoals,
        journal: resolvedJournal,
        challenges: resolvedChallenges,
        news: resolvedNews,
      };
    }
  } catch (e) {
    // Fail silently to local storage
  }
  return null;
}
