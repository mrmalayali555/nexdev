export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  completions: Record<string, boolean>;
  color: string;
  challengeMode?: '21-day' | '66-day' | null;
  challengeStartDate?: string;
}

export type HabitCategory =
  | 'Health'
  | 'Productivity'
  | 'Learning'
  | 'Mindfulness'
  | 'Fitness'
  | 'Social'
  | 'Creative'
  | 'Other';

export const HABIT_CATEGORIES: { name: HabitCategory; color: string; emoji: string }[] = [
  { name: 'Health', color: '#10b981', emoji: '💚' },
  { name: 'Productivity', color: '#6366f1', emoji: '⚡' },
  { name: 'Learning', color: '#f59e0b', emoji: '📚' },
  { name: 'Mindfulness', color: '#8b5cf6', emoji: '🧘' },
  { name: 'Fitness', color: '#ef4444', emoji: '💪' },
  { name: 'Social', color: '#ec4899', emoji: '👥' },
  { name: 'Creative', color: '#14b8a6', emoji: '🎨' },
  { name: 'Other', color: '#64748b', emoji: '✨' },
];

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  status: 'in-progress' | 'completed' | 'paused';
  createdAt: string;
  color: string;
}

export type GoalCategory =
  | 'Career'
  | 'Health'
  | 'Personal'
  | 'Financial'
  | 'Education'
  | 'Relationships'
  | 'Other';

export const GOAL_CATEGORIES: { name: GoalCategory; color: string; emoji: string }[] = [
  { name: 'Career', color: '#6366f1', emoji: '💼' },
  { name: 'Health', color: '#10b981', emoji: '🏃' },
  { name: 'Personal', color: '#8b5cf6', emoji: '🌟' },
  { name: 'Financial', color: '#f59e0b', emoji: '💰' },
  { name: 'Education', color: '#3b82f6', emoji: '🎓' },
  { name: 'Relationships', color: '#ec4899', emoji: '❤️' },
  { name: 'Other', color: '#64748b', emoji: '🎯' },
];

export type Mood = '😊' | '😐' | '😔' | '😡' | '🤩' | '😴' | '🤔' | '😰';

export const MOODS: { emoji: Mood; label: string; color: string }[] = [
  { emoji: '🤩', label: 'Amazing', color: '#f59e0b' },
  { emoji: '😊', label: 'Good', color: '#10b981' },
  { emoji: '🤔', label: 'Thoughtful', color: '#6366f1' },
  { emoji: '😐', label: 'Okay', color: '#64748b' },
  { emoji: '😴', label: 'Tired', color: '#8b5cf6' },
  { emoji: '😔', label: 'Sad', color: '#3b82f6' },
  { emoji: '😰', label: 'Anxious', color: '#ef4444' },
  { emoji: '😡', label: 'Frustrated', color: '#dc2626' },
];

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: Mood;
  gratitude: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalHabits: number;
  activeGoals: number;
  longestStreak: number;
  journalEntries: number;
  currentStreaks: Record<string, number>;
  bestStreaks: Record<string, number>;
  weeklyCompletion: number[];
  todayCompleted: number;
  todayTotal: number;
}

export interface StreakBadge {
  days: number;
  label: string;
  emoji: string;
  color: string;
  unlocked: boolean;
}

