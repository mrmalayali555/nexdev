'use client';

import { useState, useEffect, useCallback } from 'react';
import { Challenge, HabitCategory } from '@/lib/types';
import { getChallenges, saveChallenges, hydrateFromCloud } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export const DEFAULT_CHALLENGES: Omit<Challenge, 'id' | 'createdAt' | 'currentDay' | 'checkins' | 'status' | 'startDate'>[] = [
  {
    title: '21-Day Neural Habit Genesis',
    description: 'Break through the initial resistance threshold and wire a daily habit into your brain.',
    category: 'Productivity',
    durationDays: 21,
    color: '#8b5cf6',
    emoji: '⚡',
  },
  {
    title: '66-Day Habit Automation Lock-in',
    description: 'The scientifically proven timeframe to turn a conscious behavior into an automated lifestyle reflex.',
    category: 'Health',
    durationDays: 66,
    color: '#10b981',
    emoji: '🧬',
  },
  {
    title: '30-Day Mindful Reflection Challenge',
    description: 'Write daily reflections and track emotional wellness every evening for 30 consecutive days.',
    category: 'Mindfulness',
    durationDays: 30,
    color: '#f59e0b',
    emoji: '🧘',
  },
  {
    title: '75 Hard Mental Toughness',
    description: '75 days of discipline: daily workout, 10 pages reading, clean hydration, and progress tracking.',
    category: 'Fitness',
    durationDays: 75,
    color: '#ef4444',
    emoji: '🔥',
  },
];

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial local load
    const stored = getChallenges();
    setChallenges(stored);
    setLoaded(true);

    // 2. Hydrate from live Supabase Postgres
    hydrateFromCloud().then((cloudData) => {
      if (cloudData && Array.isArray(cloudData.challenges)) {
        if (cloudData.challenges.length > 0) {
          setChallenges(cloudData.challenges);
        } else if (stored.length === 0) {
          // If both remote and local are completely empty, initialize default challenges
          const now = new Date().toISOString();
          const defaults: Challenge[] = DEFAULT_CHALLENGES.map((d, index) => ({
            ...d,
            id: `challenge-${index + 1}`,
            startDate: now.split('T')[0],
            currentDay: 1,
            checkins: {},
            status: 'active',
            createdAt: now,
          }));
          setChallenges(defaults);
          saveChallenges(defaults);
        }
      }
    });
  }, []);

  const persist = useCallback((updated: Challenge[]) => {
    setChallenges(updated);
    saveChallenges(updated);
  }, []);

  const addChallenge = useCallback(
    (data: {
      title: string;
      description: string;
      category: HabitCategory;
      durationDays: number;
      color: string;
      emoji: string;
      targetHabitId?: string;
    }) => {
      const now = new Date().toISOString();
      const newChallenge: Challenge = {
        ...data,
        id: generateId(),
        startDate: now.split('T')[0],
        currentDay: 1,
        checkins: {},
        status: 'active',
        createdAt: now,
      };
      persist([...challenges, newChallenge]);
    },
    [challenges, persist]
  );

  const checkinDay = useCallback(
    (challengeId: string, dayNumber: number) => {
      const updated = challenges.map((c) => {
        if (c.id !== challengeId) return c;
        const key = `day-${dayNumber}`;
        const newCheckins = { ...c.checkins, [key]: !c.checkins[key] };
        const completedDays = Object.values(newCheckins).filter(Boolean).length;
        const isDone = completedDays >= c.durationDays;
        return {
          ...c,
          checkins: newCheckins,
          currentDay: Math.min(dayNumber + 1, c.durationDays),
          status: isDone ? ('completed' as const) : c.status,
        };
      });
      persist(updated);
    },
    [challenges, persist]
  );

  const deleteChallenge = useCallback(
    (id: string) => {
      persist(challenges.filter((c) => c.id !== id));
    },
    [challenges, persist]
  );

  const updateChallenge = useCallback(
    (id: string, partial: Partial<Challenge>) => {
      persist(challenges.map((c) => (c.id === id ? { ...c, ...partial } : c)));
    },
    [challenges, persist]
  );

  return {
    challenges,
    loaded,
    addChallenge,
    checkinDay,
    deleteChallenge,
    updateChallenge,
  };
}
