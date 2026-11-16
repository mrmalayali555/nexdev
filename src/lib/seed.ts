import { Habit, Goal, JournalEntry } from './types';
import { generateId, getDaysAgo, getToday } from './utils';

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
      id: generateId(),
      name: 'Morning Meditation',
      emoji: '🧘',
      category: 'Mindfulness',
      frequency: 'daily',
      createdAt: getDaysAgo(45),
      completions: buildCompletions(30, [5, 12, 18]),
      color: '#8b5cf6',
    },
    {
      id: generateId(),
      name: 'Exercise',
      emoji: '💪',
      category: 'Fitness',
      frequency: 'daily',
      createdAt: getDaysAgo(60),
      completions: buildCompletions(25, [3, 8, 15, 22]),
      color: '#ef4444',
    },
    {
      id: generateId(),
      name: 'Read 30 mins',
      emoji: '📚',
      category: 'Learning',
      frequency: 'daily',
      createdAt: getDaysAgo(30),
      completions: buildCompletions(20, [7, 14]),
      color: '#f59e0b',
    },
    {
      id: generateId(),
      name: 'Drink 8 glasses of water',
      emoji: '💧',
      category: 'Health',
      frequency: 'daily',
      createdAt: getDaysAgo(40),
      completions: buildCompletions(35, [2, 9, 16, 23, 30]),
      color: '#10b981',
    },
    {
      id: generateId(),
      name: 'Write in journal',
      emoji: '✍️',
      category: 'Mindfulness',
      frequency: 'daily',
      createdAt: getDaysAgo(25),
      completions: buildCompletions(15, [4, 11]),
      color: '#6366f1',
    },
    {
      id: generateId(),
      name: 'Learn a new word',
      emoji: '🔤',
      category: 'Learning',
      frequency: 'daily',
      createdAt: getDaysAgo(20),
      completions: buildCompletions(18, [6, 13]),
      color: '#3b82f6',
    },
  ];
}

export function getSeedGoals(): Goal[] {
  return [
    {
      id: generateId(),
      title: 'Run a Half Marathon',
      description: 'Train and complete a half marathon by spring.',
      category: 'Health',
      targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      progress: 40,
      milestones: [
        { id: generateId(), title: 'Run 5K without stopping', completed: true, completedAt: getDaysAgo(20) },
        { id: generateId(), title: 'Run 10K', completed: true, completedAt: getDaysAgo(5) },
        { id: generateId(), title: 'Run 15K', completed: false },
        { id: generateId(), title: 'Complete half marathon', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(45),
      color: '#10b981',
    },
    {
      id: generateId(),
      title: 'Learn TypeScript',
      description: 'Master TypeScript fundamentals and advanced patterns.',
      category: 'Education',
      targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      progress: 65,
      milestones: [
        { id: generateId(), title: 'Complete basics course', completed: true, completedAt: getDaysAgo(30) },
        { id: generateId(), title: 'Build a project with TS', completed: true, completedAt: getDaysAgo(10) },
        { id: generateId(), title: 'Learn advanced generics', completed: false },
        { id: generateId(), title: 'Contribute to open source', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(60),
      color: '#3b82f6',
    },
    {
      id: generateId(),
      title: 'Save $5,000 Emergency Fund',
      description: 'Build an emergency fund of $5,000.',
      category: 'Financial',
      targetDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
      progress: 55,
      milestones: [
        { id: generateId(), title: 'Save first $1,000', completed: true, completedAt: getDaysAgo(40) },
        { id: generateId(), title: 'Reach $2,500', completed: true, completedAt: getDaysAgo(15) },
        { id: generateId(), title: 'Reach $4,000', completed: false },
        { id: generateId(), title: 'Reach $5,000 goal', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(90),
      color: '#f59e0b',
    },
    {
      id: generateId(),
      title: 'Read 24 Books This Year',
      description: 'Read two books per month for the entire year.',
      category: 'Personal',
      targetDate: new Date(Date.now() + 200 * 86400000).toISOString().split('T')[0],
      progress: 30,
      milestones: [
        { id: generateId(), title: 'Finish 6 books', completed: true, completedAt: getDaysAgo(25) },
        { id: generateId(), title: 'Finish 12 books', completed: false },
        { id: generateId(), title: 'Finish 18 books', completed: false },
        { id: generateId(), title: 'Finish 24 books', completed: false },
      ],
      status: 'in-progress',
      createdAt: getDaysAgo(100),
      color: '#8b5cf6',
    },
  ];
}

export function getSeedJournal(): JournalEntry[] {
  return [
    {
      id: generateId(),
      date: getToday(),
      content: `## Today's Reflections\n\nHad a productive morning! Woke up early and got through my meditation session without distractions. The weather was beautiful for a run.\n\n### Key takeaways\n- Consistency beats intensity\n- Small wins compound over time\n- Need to focus more on deep work sessions`,
      mood: '😊',
      gratitude: ['Beautiful sunrise this morning', 'Supportive friends', 'Good health'],
      tags: ['productivity', 'reflection', 'morning-routine'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: getDaysAgo(1),
      content: `## A Day of Learning\n\nSpent most of the day diving into TypeScript generics. It's starting to click! Built a small utility library that I'm proud of.\n\n### Notes\n- Conditional types are powerful\n- Template literal types are mind-blowing\n- Need to practice more with mapped types`,
      mood: '🤩',
      gratitude: ['Free learning resources online', 'My comfortable workspace', 'Coffee ☕'],
      tags: ['learning', 'typescript', 'coding'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      date: getDaysAgo(3),
      content: `## Rest Day\n\nTook it easy today. Sometimes rest is the most productive thing you can do. Watched a documentary about habits and read a chapter of Atomic Habits.\n\n### Quote that stuck with me\n> "You do not rise to the level of your goals. You fall to the level of your systems." — James Clear`,
      mood: '😐',
      gratitude: ['A warm home', 'Good books', 'Time to rest'],
      tags: ['rest', 'reading', 'self-care'],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: generateId(),
      date: getDaysAgo(5),
      content: `## Milestone Hit! 🎉\n\nRan my first 10K today! Felt amazing crossing that distance marker. All the training is paying off. Next stop: 15K.\n\nTime: 58 minutes — not bad for a first attempt!`,
      mood: '🤩',
      gratitude: ['My running shoes', 'The park trail', 'My own determination'],
      tags: ['fitness', 'milestone', 'running'],
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
}

