import { Habit, Goal, JournalEntry, Challenge, TechNewsStory, ScreenTimeEntry, CareerProfile } from './types';
import { AcademicProfile } from './academicTypes';
import { INITIAL_ACADEMIC_PROFILE } from './academicSeed';

const STORAGE_KEYS = {
  habits: 'nexdev_habits',
  goals: 'nexdev_goals',
  journal: 'nexdev_journal',
  challenges: 'nexdev_challenges',
  news: 'nexdev_news',
  screentime: 'nexdev_screentime',
  career: 'nexdev_career',
  academics: 'nexdev_academics',
  notes: 'nexdev_hub_notes',
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

export function getCareerProfile(): CareerProfile | null {
  return storage.get<CareerProfile>(STORAGE_KEYS.career) || null;
}

export function saveCareerProfile(profile: CareerProfile): void {
  storage.set(STORAGE_KEYS.career, profile);
  triggerCloudSync({ career: profile });
}

export function getAcademicProfile(): AcademicProfile {
  const stored = storage.get<AcademicProfile>(STORAGE_KEYS.academics);
  if (!stored) {
    storage.set(STORAGE_KEYS.academics, INITIAL_ACADEMIC_PROFILE);
    return INITIAL_ACADEMIC_PROFILE;
  }

  // Ensure official Guruvayur Catering Oct 26 mess menu is loaded
  const isGuruvayur = stored.messMenu?.some(
    (m) => m.day === 'Monday' && m.breakfast.items.includes('Poori Masala')
  );

  const updatedProfile: AcademicProfile = {
    ...INITIAL_ACADEMIC_PROFILE,
    ...stored,
    exams: stored.exams && stored.exams.length > 0 ? stored.exams : INITIAL_ACADEMIC_PROFILE.exams,
    messMenu: isGuruvayur ? stored.messMenu : INITIAL_ACADEMIC_PROFILE.messMenu,
  };

  if (!isGuruvayur) {
    storage.set(STORAGE_KEYS.academics, updatedProfile);
    triggerCloudSync({ academics: updatedProfile });
  }

  return updatedProfile;
}

export interface HubNote {
  id: string;
  title: string;
  content: string;
  category?: 'academic' | 'career' | 'general' | 'urgent';
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_HUB_NOTES: HubNote[] = [
  {
    id: 'note-1',
    title: 'Electronics Workshop Lab Guidelines',
    content: 'Review 555 timer pinout, soldering precautions, and passive component color code charts before the lab exam.',
    category: 'academic',
    pinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Big Tech Roadmap Goal: S1-S2 DSA Core',
    content: 'Target 1-2 LeetCode problems every evening. Complete Blind 75 and Striver A2Z sheet before S3.',
    category: 'career',
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getHubNotes(): HubNote[] {
  const notes = storage.get<HubNote[]>(STORAGE_KEYS.notes);
  if (!notes || notes.length === 0) {
    storage.set(STORAGE_KEYS.notes, DEFAULT_HUB_NOTES);
    return DEFAULT_HUB_NOTES;
  }
  return notes;
}

export function saveHubNotes(notes: HubNote[]): void {
  storage.set(STORAGE_KEYS.notes, notes);
}

export function saveAcademicProfile(profile: AcademicProfile): void {
  storage.set(STORAGE_KEYS.academics, profile);
  triggerCloudSync({ academics: profile });
}

export function getScreenTime(): ScreenTimeEntry[] {
  return storage.get<ScreenTimeEntry[]>(STORAGE_KEYS.screentime) || [];
}

export function saveScreenTime(entries: ScreenTimeEntry[]): void {
  storage.set(STORAGE_KEYS.screentime, entries);
  triggerCloudSync({ screentime: entries });
}

/**
 * Background Cloud Synchronization with Supabase / Postgres
 * Fire-and-forget: does not block the UI or throw errors if offline.
 */
let syncDebounceTimer: ReturnType<typeof setTimeout> | undefined;

export function triggerCloudSync(data: {
  habits?: Habit[];
  goals?: Goal[];
  journal?: JournalEntry[];
  challenges?: Challenge[];
  news?: TechNewsStory[];
  screentime?: ScreenTimeEntry[];
  career?: CareerProfile;
  academics?: AcademicProfile;
}) {
  if (typeof window === 'undefined') return;

  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      // Send only data layers that were explicitly passed
      const payload: Record<string, unknown> = {};
      if (data.habits !== undefined) payload.habits = data.habits;
      if (data.goals !== undefined) payload.goals = data.goals;
      if (data.journal !== undefined) payload.journal = data.journal;
      if (data.challenges !== undefined) payload.challenges = data.challenges;
      if (data.news !== undefined) payload.news = data.news;
      if (data.screentime !== undefined) payload.screentime = data.screentime;
      if (data.career !== undefined) payload.career = data.career;
      if (data.academics !== undefined) payload.academics = data.academics;

      // Don't send empty payload
      if (Object.keys(payload).length === 0) return;

      const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch(`${apiBase}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: apiBase ? 'include' : 'same-origin',
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('nexdev-auth-required'));
        }
      } finally {
        clearTimeout(timeoutId);
      }
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
  screentime?: ScreenTimeEntry[];
  career?: CareerProfile;
  academics?: AcademicProfile;
} | null> {
  if (typeof window === 'undefined') return null;

  try {
    const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let res: Response | null = null;
    try {
      // Real-time serverless pull via POST to guarantee fresh live Supabase data with zero caching
      res = await fetch(`${apiBase}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        credentials: apiBase ? 'include' : 'same-origin',
        body: JSON.stringify({ pull: true }),
        signal: controller.signal,
      }).catch(() => null);

      if (res?.status === 401) {
        window.dispatchEvent(new CustomEvent('nexdev-auth-required'));
        return null;
      }

      if (!res || !res.ok) {
        res = await fetch(`${apiBase}/api/sync`, {
          cache: 'no-store',
          credentials: apiBase ? 'include' : 'same-origin',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
          signal: controller.signal,
        }).catch(() => null);
        if (res?.status === 401) {
          window.dispatchEvent(new CustomEvent('nexdev-auth-required'));
          return null;
        }
      }
    } finally {
      clearTimeout(timeoutId);
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
      const localScreentime = storage.get<ScreenTimeEntry[]>(STORAGE_KEYS.screentime) || [];

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

      let resolvedScreentime = data.screentime;
      if (Array.isArray(data.screentime)) {
        if (data.screentime.length > 0) {
          storage.set(STORAGE_KEYS.screentime, data.screentime);
        } else if (localScreentime.length > 0) {
          resolvedScreentime = localScreentime;
          triggerCloudSync({ screentime: localScreentime });
        }
      }

      const localCareer = storage.get<CareerProfile>(STORAGE_KEYS.career);
      let resolvedCareer = data.career;
      if (data.career) {
        if (Object.keys(data.career).length > 0) {
          storage.set(STORAGE_KEYS.career, data.career);
        } else if (localCareer && Object.keys(localCareer).length > 0) {
          resolvedCareer = localCareer;
          triggerCloudSync({ career: localCareer });
        }
      }

      const localAcademics = storage.get<AcademicProfile>(STORAGE_KEYS.academics);
      let resolvedAcademics = data.academics;
      if (data.academics) {
        if (Object.keys(data.academics).length > 0) {
          storage.set(STORAGE_KEYS.academics, data.academics);
        } else if (localAcademics && Object.keys(localAcademics).length > 0) {
          resolvedAcademics = localAcademics;
          triggerCloudSync({ academics: localAcademics });
        }
      }

      return {
        habits: resolvedHabits,
        goals: resolvedGoals,
        journal: resolvedJournal,
        challenges: resolvedChallenges,
        news: resolvedNews,
        screentime: resolvedScreentime,
        career: resolvedCareer,
        academics: resolvedAcademics,
      };
    }
  } catch (e) {
    // Fail silently to local storage
  }
  return null;
}
