'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit } from '@/lib/types';
import { getHabits, saveHabits, hydrateFromCloud } from '@/lib/storage';
import { getSeedHabits } from '@/lib/seed';
import { generateId, getToday } from '@/lib/utils';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getHabits();
    setHabits(stored);
    setLoaded(true);

    // Background sync check directly from Supabase Postgres
    hydrateFromCloud().then((cloudData) => {
      if (cloudData && Array.isArray(cloudData.habits)) {
        if (cloudData.habits.length > 0) {
          setHabits(cloudData.habits);
        } else if (stored.length === 0) {
          const seed = getSeedHabits();
          setHabits(seed);
          saveHabits(seed);
        }
      }
    });
  }, []);

  const persist = useCallback((updated: Habit[]) => {
    setHabits(updated);
    saveHabits(updated);
  }, []);

  const addHabit = useCallback(
    (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => {
      const newHabit: Habit = {
        ...habit,
        id: generateId(),
        createdAt: new Date().toISOString(),
        completions: {},
      };
      persist([...habits, newHabit]);
    },
    [habits, persist]
  );

  const updateHabit = useCallback(
    (id: string, updates: Partial<Habit>) => {
      persist(habits.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    },
    [habits, persist]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
    },
    [habits, persist]
  );

  const toggleCompletion = useCallback(
    (id: string, date?: string) => {
      const dateStr = date || getToday();
      persist(
        habits.map((h) => {
          if (h.id !== id) return h;
          const completions = { ...h.completions };
          completions[dateStr] = !completions[dateStr];
          if (!completions[dateStr]) delete completions[dateStr];
          return { ...h, completions };
        })
      );
    },
    [habits, persist]
  );

  return { habits, loaded, addHabit, updateHabit, deleteHabit, toggleCompletion };
}
