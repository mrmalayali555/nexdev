'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalCategory } from '@/lib/types';
import { getGoals, saveGoals, hydrateFromCloud } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { getSeedGoals } from '@/lib/seed';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getGoals();
    setGoals(stored);
    setLoaded(true);

    // Hydrate directly from Supabase PostgreSQL
    hydrateFromCloud().then((cloudData) => {
      if (cloudData && Array.isArray(cloudData.goals)) {
        setGoals(cloudData.goals);
      }
    });
  }, []);

  const persist = useCallback((updated: Goal[]) => {
    setGoals(updated);
    saveGoals(updated);
  }, []);

  const addGoal = useCallback(
    (data: {
      title: string;
      description?: string;
      category: GoalCategory;
      targetDate: string;
      color: string;
      milestones: string[];
    }) => {
      const newGoal: Goal = {
        id: generateId(),
        title: data.title,
        description: data.description || '',
        category: data.category,
        targetDate: data.targetDate,
        progress: 0,
        status: 'in-progress',
        color: data.color,
        createdAt: new Date().toISOString(),
        milestones: data.milestones.map((m) => ({
          id: generateId(),
          title: m,
          completed: false,
        })),
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
    (goalId: string, milestoneId: string) => {
      let isDone = false;
      const updated = goals.map((g) => {
        if (g.id !== goalId) return g;
        const newMilestones = g.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const nextState = !m.completed;
          isDone = nextState;
          return {
            ...m,
            completed: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
        });
        const completedCount = newMilestones.filter((m) => m.completed).length;
        const progress = newMilestones.length > 0
          ? Math.round((completedCount / newMilestones.length) * 100)
          : g.progress;
        const status = progress === 100 ? ('completed' as const) : g.status;
        return { ...g, milestones: newMilestones, progress, status };
      });
      persist(updated);
      return isDone;
    },
    [goals, persist]
  );

  const setProgress = useCallback(
    (goalId: string, progress: number) => {
      persist(
        goals.map((g) =>
          g.id === goalId
            ? { ...g, progress, status: progress === 100 ? 'completed' : g.status }
            : g
        )
      );
    },
    [goals, persist]
  );

  const loadTemplates = useCallback(() => {
    const seed = getSeedGoals();
    persist(seed);
  }, [persist]);

  return { goals, loaded, addGoal, updateGoal, deleteGoal, toggleMilestone, setProgress, loadTemplates };
}
