'use client';

import { useState, useEffect } from 'react';
import { Habit, Goal, JournalEntry, UserStats, StreakBadge } from '@/lib/types';
import { calculateStreak, calculateBestStreak, getToday, getWeekDates } from '@/lib/utils';

const initialStats: UserStats = {
  totalHabits: 0,
  activeGoals: 0,
  longestStreak: 0,
  journalEntries: 0,
  currentStreaks: {},
  bestStreaks: {},
  weeklyCompletion: [0, 0, 0, 0, 0, 0, 0],
  todayCompleted: 0,
  todayTotal: 0,
};

const initialBadges: StreakBadge[] = [
  { days: 7, label: 'Week Warrior', emoji: '🔥', color: '#f59e0b', unlocked: false },
  { days: 21, label: 'Habit Builder', emoji: '💪', color: '#ef4444', unlocked: false },
  { days: 30, label: 'Monthly Master', emoji: '🏆', color: '#8b5cf6', unlocked: false },
  { days: 66, label: 'Habit Formed', emoji: '⭐', color: '#6366f1', unlocked: false },
  { days: 100, label: 'Century Club', emoji: '💎', color: '#3b82f6', unlocked: false },
  { days: 365, label: 'Year Legend', emoji: '👑', color: '#f59e0b', unlocked: false },
];

export function useStats(habits: Habit[], goals: Goal[], entries: JournalEntry[]) {
  const [stats, setStats] = useState<UserStats>(initialStats);
  const [badges, setBadges] = useState<StreakBadge[]>(initialBadges);

  useEffect(() => {
    const computeStats = () => {
      const today = getToday();
      const weekDates = getWeekDates();

      const currentStreaks: Record<string, number> = {};
      const bestStreaks: Record<string, number> = {};
      let longestStreak = 0;

      habits.forEach((h) => {
        const current = calculateStreak(h.completions);
        const best = calculateBestStreak(h.completions);
        currentStreaks[h.id] = current;
        bestStreaks[h.id] = best;
        longestStreak = Math.max(longestStreak, current, best);
      });

      const dailyHabits = habits.filter((h) => h.frequency === 'daily');
      const todayCompleted = dailyHabits.filter((h) => h.completions[today]).length;
      const todayTotal = dailyHabits.length;

      // Weekly completion rates (last 7 days)
      const weeklyCompletion = weekDates.map((date) => {
        if (dailyHabits.length === 0) return 0;
        const completed = dailyHabits.filter((h) => h.completions[date]).length;
        return Math.round((completed / dailyHabits.length) * 100);
      });

      setStats({
        totalHabits: habits.length,
        activeGoals: goals.filter((g) => g.status === 'in-progress').length,
        longestStreak,
        journalEntries: entries.length,
        currentStreaks,
        bestStreaks,
        weeklyCompletion,
        todayCompleted,
        todayTotal,
      });

      const maxStreak = Math.max(
        0,
        ...Object.values(bestStreaks),
        ...Object.values(currentStreaks)
      );

      setBadges([
        { days: 7, label: 'Week Warrior', emoji: '🔥', color: '#f59e0b', unlocked: maxStreak >= 7 },
        { days: 21, label: 'Habit Builder', emoji: '💪', color: '#ef4444', unlocked: maxStreak >= 21 },
        { days: 30, label: 'Monthly Master', emoji: '🏆', color: '#8b5cf6', unlocked: maxStreak >= 30 },
        { days: 66, label: 'Habit Formed', emoji: '⭐', color: '#6366f1', unlocked: maxStreak >= 66 },
        { days: 100, label: 'Century Club', emoji: '💎', color: '#3b82f6', unlocked: maxStreak >= 100 },
        { days: 365, label: 'Year Legend', emoji: '👑', color: '#f59e0b', unlocked: maxStreak >= 365 },
      ]);
    };

    computeStats();

    window.addEventListener('nexdev-day-changed', computeStats);
    window.addEventListener('visibilitychange', computeStats);
    window.addEventListener('focus', computeStats);
    const interval = setInterval(computeStats, 15000);
    return () => {
      window.removeEventListener('nexdev-day-changed', computeStats);
      window.removeEventListener('visibilitychange', computeStats);
      window.removeEventListener('focus', computeStats);
      clearInterval(interval);
    };
  }, [habits, goals, entries]);

  return { stats, badges };
}
