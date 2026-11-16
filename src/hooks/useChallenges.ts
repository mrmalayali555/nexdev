'use client';

import { useState, useEffect, useCallback } from 'react';
import { Challenge, HabitCategory } from '@/lib/types';
import { getChallenges, saveChallenges, hydrateFromCloud } from '@/lib/storage';
import { generateId } from '@/lib/utils';

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
        setChallenges(cloudData.challenges);
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
