'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal } from '@/lib/types';
import { getGoals, saveGoals, hydrateFromCloud } from '@/lib/storage';
import { getSeedGoals } from '@/lib/seed';
import { generateId } from '@/lib/utils';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getGoals();
    if (stored.length > 0) {
      setGoals(stored);
    } else {
      const seed = getSeedGoals();
      setGoals(seed);
      saveGoals(seed);
    }
    setLoaded(true);

    // Background sync check from Vercel Postgres
    hydrateFromCloud().then((hasCloudData) => {
      if (hasCloudData) {
        setGoals(getGoals());
      }
    });
  }, []);

  const persist = useCallback((updated: Goal[]) => {
    setGoals(updated);
    saveGoals(updated);
  }, []);

  const addGoal = useCallback(
    (goal: Omit<Goal, 'id' | 'createdAt' | 'milestones' | 'progress' | 'status'> & { milestones?: string[] }) => {
      const newGoal: Goal = {
        id: generateId(),
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetDate: goal.targetDate,
        color: goal.color,
        progress: 0,
        milestones: (goal.milestones || []).map((title) => ({
          id: generateId(),
          title,
          completed: false,
        })),
        status: 'in-progress',
        createdAt: new Date().toISOString(),
      };
      persist([...goals, newGoal]);
    },
    [goals, persist]
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<Goal>) => {
      persist(goals.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    },
    [goals, persist]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      persist(goals.filter((g) => g.id !== id));
    },
    [goals, persist]
  );

  const toggleMilestone = useCallback(
    (goalId: string, milestoneId: string): boolean => {
      let justCompleted = false;
      persist(
        goals.map((g) => {
          if (g.id !== goalId) return g;
          const milestones = g.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            const completed = !m.completed;
            if (completed) justCompleted = true;
            return {
              ...m,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
            };
          });
          const completedCount = milestones.filter((m) => m.completed).length;
          const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : g.progress;
          const status = progress === 100 ? 'completed' as const : g.status === 'completed' ? 'in-progress' as const : g.status;
          return { ...g, milestones, progress, status };
        })
      );
      return justCompleted;
    },
    [goals, persist]
  );

  const setProgress = useCallback(
    (goalId: string, progress: number) => {
      persist(
        goals.map((g) => {
          if (g.id !== goalId) return g;
          const status = progress === 100 ? 'completed' as const : g.status === 'completed' ? 'in-progress' as const : g.status;
          return { ...g, progress, status };
        })
      );
    },
    [goals, persist]
  );

  return { goals, loaded, addGoal, updateGoal, deleteGoal, toggleMilestone, setProgress };
}
