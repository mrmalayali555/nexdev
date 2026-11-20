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

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  durationDays: number;
  currentDay: number;
  status: 'active' | 'completed' | 'abandoned';
  color: string;
  emoji: string;
  targetHabitId?: string;
  startDate: string;
  checkins: Record<string, boolean>;
  createdAt: string;
}

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

export interface TechNewsStory {
  id: string;
  title: string;
  category: string;
  summary: string;
  fullContent: string;
  sourceUrl?: string;
  read: boolean;
  date: string;
  deepDive?: string;
  createdAt: string;
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

export interface ScreenTimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  apps: ScreenTimeApp[];
  totalMinutes: number;
  createdAt: string;
}

export interface ScreenTimeApp {
  name: string;
  minutes: number;
  category: ScreenTimeCategory;
}

export type ScreenTimeCategory =
  | 'Social'
  | 'Productivity'
  | 'Entertainment'
  | 'Education'
  | 'Gaming'
  | 'Communication'
  | 'Utilities'
  | 'Other';

export const SCREENTIME_CATEGORIES: { name: ScreenTimeCategory; color: string; emoji: string }[] = [
  { name: 'Social', color: '#ec4899', emoji: '📱' },
  { name: 'Productivity', color: '#6366f1', emoji: '⚡' },
  { name: 'Entertainment', color: '#f59e0b', emoji: '🎬' },
  { name: 'Education', color: '#10b981', emoji: '📚' },
  { name: 'Gaming', color: '#ef4444', emoji: '🎮' },
  { name: 'Communication', color: '#3b82f6', emoji: '💬' },
  { name: 'Utilities', color: '#64748b', emoji: '🔧' },
  { name: 'Other', color: '#8b5cf6', emoji: '✨' },
];

export interface StreakBadge {
  days: number;
  label: string;
  emoji: string;
  color: string;
  unlocked: boolean;
}

