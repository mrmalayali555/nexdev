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


// ===== CAREER TRACKER TYPES =====

export interface PlacementDailyChecklist {
  dsaPractice: boolean;      // Solved at least 1-2 DSA / LeetCode problems
  coreCsStudy: boolean;      // Studied Core CS (OS, DBMS, CN, or OOP)
  devProject: boolean;       // Dev project work or pushed GitHub commit
  speedOrContest: boolean;   // Timed speed drill or contest problem
  learnNotes: boolean;       // Logged mistakes, learnings, or revision notes
}

export const DEFAULT_PLACEMENT_CHECKLIST: PlacementDailyChecklist = {
  dsaPractice: false,
  coreCsStudy: false,
  devProject: false,
  speedOrContest: false,
  learnNotes: false,
};

// ===== EXAM MODE (STREAK SHIELD) TYPES =====
export interface ExamModeChecklist {
  studyCProg: boolean;       // Study C Programming (Theory / Lab syllabus overlap)
  codeTracing: boolean;      // 1 Quick output finding / code tracing question (5 mins)
  patternThinking: boolean;  // Algorithmic thinking & pattern breakdown (5 mins)
  quickProblem: boolean;     // 1 Warmup / easy question (LeetCode/GFG/Lab)
  conceptRevision: boolean;  // 1 CS fundamental / syntax review note
}

export const DEFAULT_EXAM_CHECKLIST: ExamModeChecklist = {
  studyCProg: false,
  codeTracing: false,
  patternThinking: false,
  quickProblem: false,
  conceptRevision: false,
};

export const EXAM_CHECKLIST_ITEMS: {
  key: keyof ExamModeChecklist;
  label: string;
  emoji: string;
  desc: string;
  category: string;
  estMinutes: number;
}[] = [
  {
    key: 'studyCProg',
    label: 'C Programming Revision',
    emoji: '💻',
    desc: 'Study C pointers, arrays, memory, recursion, or lab codes (Direct S1 exam & placement overlap)',
    category: 'S1 Overlap',
    estMinutes: 15,
  },
  {
    key: 'codeTracing',
    label: '1 Code Tracing / Output Puzzle',
    emoji: '🔍',
    desc: 'Trace 1 tricky pointer, loop, or recursion snippet and predict the output (5 min)',
    category: 'Mental Tracing',
    estMinutes: 5,
  },
  {
    key: 'patternThinking',
    label: 'Algorithmic Pattern Thinking',
    emoji: '🧠',
    desc: 'Mental walk-through of 1 algorithmic pattern (Two-pointer, sliding window, frequency, or flowchart)',
    category: 'Pattern Logic',
    estMinutes: 10,
  },
  {
    key: 'quickProblem',
    label: '1 Quick Warmup Question',
    emoji: '⚡',
    desc: 'Solve 1 easy problem on LeetCode/GFG or write 1 clean C lab function (10 min)',
    category: 'Code Muscle',
    estMinutes: 10,
  },
  {
    key: 'conceptRevision',
    label: '1 Key CS / Technical Flashcard',
    emoji: '📝',
    desc: 'Quick 3-min review: Time complexity, storage classes, compilation pipeline, or memory layout',
    category: 'Concept Depth',
    estMinutes: 5,
  },
];

export const PLACEMENT_CHECKLIST_ITEMS: {
  key: keyof PlacementDailyChecklist;
  label: string;
  emoji: string;
  desc: string;
  category: string;
}[] = [
  {
    key: 'dsaPractice',
    label: 'DSA Problem Practice',
    emoji: '🧩',
    desc: 'Solve 1-2 pattern problems (Striver A2Z / NeetCode 150)',
    category: 'Algorithms',
  },
  {
    key: 'coreCsStudy',
    label: 'Core CS Concept',
    emoji: '📖',
    desc: 'Learn 1 topic in OS, DBMS, Networks, or OOP',
    category: 'Computer Science',
  },
  {
    key: 'devProject',
    label: 'Dev & Project Coding',
    emoji: '💻',
    desc: 'Write project code, commit to GitHub, or debug repos',
    category: 'Engineering',
  },
  {
    key: 'speedOrContest',
    label: 'Timed Speed / Aptitude',
    emoji: '⚡',
    desc: 'Timed 20-min LeetCode Medium, Codeforces Div 3, or OA drill',
    category: 'Speed & Accuracy',
  },
  {
    key: 'learnNotes',
    label: 'Daily Reflection & Learnings',
    emoji: '📝',
    desc: 'Note down edge cases, mistakes made, or formulas',
    category: 'Retention',
  },
];

export interface CareerDailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  checklist?: PlacementDailyChecklist;
  examChecklist?: ExamModeChecklist;
  dsaProblems: DSAProblem[];
  studyHours: number; // total hours studied today
  notes: string;
  createdAt: string;
}

export interface DSAProblem {
  name: string;
  platform: DSAPlatform;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: DSATopic;
  solved: boolean;
  timeMins?: number; // time taken in minutes
}

export type DSAPlatform = 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank' | 'GFG' | 'Other';

export const DSA_PLATFORMS: { name: DSAPlatform; color: string; emoji: string }[] = [
  { name: 'LeetCode', color: '#ffa116', emoji: '🟡' },
  { name: 'Codeforces', color: '#1890ff', emoji: '🔵' },
  { name: 'CodeChef', color: '#5b4638', emoji: '🟤' },
  { name: 'HackerRank', color: '#00ea64', emoji: '🟢' },
  { name: 'GFG', color: '#2f8d46', emoji: '📗' },
  { name: 'Other', color: '#64748b', emoji: '⚪' },
];

export type DSATopic =
  | 'Arrays'
  | 'Strings'
  | 'Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Binary Search'
  | 'Linked Lists'
  | 'Stacks & Queues'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Recursion'
  | 'Greedy'
  | 'Heap'
  | 'Backtracking'
  | 'Bit Manipulation'
  | 'Math'
  | 'Other';

export const DSA_TOPICS: { name: DSATopic; color: string; emoji: string }[] = [
  { name: 'Arrays', color: '#6366f1', emoji: '📊' },
  { name: 'Strings', color: '#ec4899', emoji: '🔤' },
  { name: 'Hashing', color: '#f59e0b', emoji: '#️⃣' },
  { name: 'Two Pointers', color: '#10b981', emoji: '👉' },
  { name: 'Sliding Window', color: '#06b6d4', emoji: '🪟' },
  { name: 'Binary Search', color: '#8b5cf6', emoji: '🔍' },
  { name: 'Linked Lists', color: '#14b8a6', emoji: '🔗' },
  { name: 'Stacks & Queues', color: '#f97316', emoji: '📚' },
  { name: 'Trees', color: '#22c55e', emoji: '🌲' },
  { name: 'Graphs', color: '#3b82f6', emoji: '🕸️' },
  { name: 'Dynamic Programming', color: '#ef4444', emoji: '🧩' },
  { name: 'Recursion', color: '#a855f7', emoji: '🔄' },
  { name: 'Greedy', color: '#eab308', emoji: '💎' },
  { name: 'Heap', color: '#d946ef', emoji: '⛰️' },
  { name: 'Backtracking', color: '#64748b', emoji: '↩️' },
  { name: 'Bit Manipulation', color: '#0ea5e9', emoji: '🔢' },
  { name: 'Math', color: '#84cc16', emoji: '➗' },
  { name: 'Other', color: '#94a3b8', emoji: '✨' },
];

export interface CareerContest {
  id: string;
  platform: DSAPlatform;
  contestName: string;
  rank?: number;
  ratingChange?: number;
  currentRating?: number;
  date: string;
  createdAt: string;
}

export interface CareerProject {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  status: 'planning' | 'in-progress' | 'completed' | 'deployed';
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
}

export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  status: 'wishlist' | 'applied' | 'oa' | 'interview' | 'offered' | 'rejected';
  appliedDate?: string;
  notes?: string;
  createdAt: string;
}

export const APPLICATION_STATUSES: { name: CareerApplication['status']; label: string; color: string; emoji: string }[] = [
  { name: 'wishlist', label: 'Wishlist', color: '#64748b', emoji: '📋' },
  { name: 'applied', label: 'Applied', color: '#3b82f6', emoji: '📨' },
  { name: 'oa', label: 'Online Assessment', color: '#f59e0b', emoji: '💻' },
  { name: 'interview', label: 'Interview', color: '#8b5cf6', emoji: '🎤' },
  { name: 'offered', label: 'Offered', color: '#10b981', emoji: '🎉' },
  { name: 'rejected', label: 'Rejected', color: '#ef4444', emoji: '❌' },
];

export interface CareerProfile {
  totalProblems: number;
  currentRating: Record<DSAPlatform, number>;
  projects: CareerProject[];
  contests: CareerContest[];
  applications: CareerApplication[];
  dailyLogs: CareerDailyLog[];
  coreSubjects: CoreSubjectProgress;
  journeyStartDate?: string;
  targetPlacementDate?: string;
  isExamMode?: boolean; // Exam season mode with lightweight micro-tasks to shield streaks
}

export interface CoreSubjectProgress {
  os: number; // 0-100
  dbms: number;
  cn: number;
  oop: number;
}
