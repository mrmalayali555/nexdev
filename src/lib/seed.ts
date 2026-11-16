import { Habit, Goal, JournalEntry } from './types';
import { getDaysAgo, getToday } from './utils';

function buildCompletions(daysBack: number, skipDays: number[] = []): Record<string, boolean> {
  const completions: Record<string, boolean> = {};
  for (let i = 0; i < daysBack; i++) {
    if (!skipDays.includes(i)) {
      completions[getDaysAgo(i)] = true;
    }
  }
  return completions;
}

export function getSeedHabits(): Habit[] {
  return [
    {
      id: 'seed-habit-meditation',
      name: 'Morning Meditation',
      emoji: '🧘',
      category: 'Mindfulness',
      frequency: 'daily',
      createdAt: getDaysAgo(45),
      completions: buildCompletions(30, [5, 12, 18]),
      color: '#8b5cf6',
      challengeMode: '21-day',
      challengeStartDate: getDaysAgo(15),
    },
    {
      id: 'seed-habit-exercise',
      name: 'Workout & Fitness',
      emoji: '💪',
      category: 'Fitness',
      frequency: 'daily',
      createdAt: getDaysAgo(60),
      completions: buildCompletions(25, [3, 8, 15, 22]),
      color: '#ef4444',
      challengeMode: '66-day',
      challengeStartDate: getDaysAgo(25),
    },
    {
      id: 'seed-habit-reading',
      name: 'Deep Reading (20 min)',
      emoji: '📚',
      category: 'Learning',
      frequency: 'daily',
      createdAt: getDaysAgo(30),
      completions: buildCompletions(20, [7, 14]),
      color: '#f59e0b',
    },
    {
      id: 'seed-habit-water',
      name: 'Hydration (2.5L Water)',
      emoji: '💧',
      category: 'Health',
      frequency: 'daily',
      createdAt: getDaysAgo(40),
      completions: buildCompletions(35, [2, 9, 16, 23, 30]),
      color: '#10b981',
    },
    {
      id: 'seed-habit-journal',
      name: 'Evening Reflection',
      emoji: '✍️',
      category: 'Mindfulness',
      frequency: 'daily',
      createdAt: getDaysAgo(20),
      completions: buildCompletions(15, [4, 11]),
      color: '#ec4899',
    },
  ];
}

export function getSeedGoals(): Goal[] {
  return [
    {
      id: 'seed-goal-marathon',
      title: 'Complete 10K Endurance Run',
      description: 'Build cardiovascular endurance and discipline through structured weekly running targets.',
      category: 'Health',
      targetDate: getDaysAgo(-60),
      progress: 60,
      milestones: [
        { id: 'm1', title: 'Run 3km without stopping', completed: true, completedAt: getDaysAgo(20) },
        { id: 'm2', title: 'Complete 5km under 30 mins', completed: true, completedAt: getDaysAgo(8) },
        { id: 'm3', title: 'Reach 8km long run pace', completed: false },
        { id: 'm4', title: 'Cross official 10K finish line', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(30),
      color: '#10b981',
    },
    {
      id: 'seed-goal-books',
      title: 'Read 12 High-Impact Nonfiction Books',
      description: 'Expand knowledge across psychology, systems thinking, philosophy, and personal leadership.',
      category: 'Education',
      targetDate: getDaysAgo(-120),
      progress: 50,
      milestones: [
        { id: 'm1', title: 'Atomic Habits by James Clear', completed: true, completedAt: getDaysAgo(25) },
        { id: 'm2', title: 'Deep Work by Cal Newport', completed: true, completedAt: getDaysAgo(10) },
        { id: 'm3', title: 'Thinking, Fast and Slow by Daniel Kahneman', completed: false },
        { id: 'm4', title: 'Antifragile by Nassim Taleb', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(45),
      color: '#f59e0b',
    },
    {
      id: 'seed-goal-savings',
      title: 'Build $10,000 Peace of Mind Reserve',
      description: 'Automate weekly savings transfers into high-yield account for financial security.',
      category: 'Financial',
      targetDate: getDaysAgo(-90),
      progress: 75,
      milestones: [
        { id: 'm1', title: 'Save first $2,500 milestone', completed: true, completedAt: getDaysAgo(50) },
        { id: 'm2', title: 'Cross $5,000 threshold', completed: true, completedAt: getDaysAgo(25) },
        { id: 'm3', title: 'Reach $7,500 reserve', completed: true, completedAt: getDaysAgo(5) },
        { id: 'm4', title: 'Achieve full $10,000 target', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(60),
      color: '#6366f1',
    },
  ];
}

export function getSeedJournal(): JournalEntry[] {
  return [
    {
      id: 'seed-journal-today',
      date: getToday(),
      content:
        'Focused on deep work this morning. The mental clarity was refreshing after avoiding phone screens for the first hour of the day. Consistency is starting to feel natural rather than forced.',
      mood: '🤩',
      gratitude: ['Peaceful morning without notifications', 'Good cup of coffee', 'Productive creative session'],
      tags: ['deep-work', 'mindset', 'clarity'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'seed-journal-yesterday',
      date: getDaysAgo(1),
      content:
        'Felt a bit of resistance before my workout, but honored the 2-minute rule and got moving anyway. Felt amazing afterward. Motion creates emotion.',
      mood: '😊',
      gratitude: ['Health and energy', 'Supportive friendship', 'Progress on my side project'],
      tags: ['discipline', 'fitness'],
      createdAt: getDaysAgo(1),
      updatedAt: getDaysAgo(1),
    },
    {
      id: 'seed-journal-day3',
      date: getDaysAgo(3),
      content:
        'Read an inspiring chapter on compounding habits. Every decision is a vote for the type of person I want to become.',
      mood: '🤔',
      gratitude: ['Access to great books', 'Clean air', 'Quiet evening reflection'],
      tags: ['growth', 'reading'],
      createdAt: getDaysAgo(3),
      updatedAt: getDaysAgo(3),
    },
  ];
}
