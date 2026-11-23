'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CareerProfile,
  CareerDailyLog,
  DSAProblem,
  CareerContest,
  CareerProject,
  CareerApplication,
  CoreSubjectProgress,
  PlacementDailyChecklist,
  DEFAULT_PLACEMENT_CHECKLIST,
  ExamModeChecklist,
  DEFAULT_EXAM_CHECKLIST,
} from '@/lib/types';
import { getCareerProfile, saveCareerProfile, hydrateFromCloud } from '@/lib/storage';
import { generateId, getToday, formatDate, getDaysBetween, calculateStreak } from '@/lib/utils';

function generateInitial12DayStreak(): CareerDailyLog[] {
  const logs: CareerDailyLog[] = [];
  const baseDate = new Date('2026-11-23T12:00:00+05:30');
  for (let i = 11; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    logs.push({
      id: `log-seed-${i}`,
      date: dateStr,
      dsaProblems: [
        {
          name: i % 2 === 0 ? 'Two Sum' : 'Valid Palindrome',
          difficulty: 'Easy',
          topic: i % 2 === 0 ? 'Arrays' : 'Strings',
          solved: true,
          platform: 'LeetCode',
          timeMins: 25,
        },
      ],
      studyHours: 2 + (i % 3) * 0.5,
      notes: i % 2 === 0 ? 'Engineering Chemistry Chapter 4 & Spectroscopy' : 'Calculus Optimization & 2nd Derivative Test',
      checklist: {
        dsaPractice: true,
        coreCsStudy: i % 2 === 0,
        devProject: false,
        speedOrContest: false,
        learnNotes: true,
      },
      examChecklist: {
        studyCProg: true,
        codeTracing: true,
        patternThinking: i % 2 === 0,
        quickProblem: true,
        conceptRevision: true,
      },
      createdAt: `${dateStr}T20:00:00.000Z`,
    });
  }
  return logs;
}

const DEFAULT_PROFILE: CareerProfile = {
  totalProblems: 12,
  currentRating: {
    LeetCode: 1520,
    Codeforces: 0,
    CodeChef: 0,
    HackerRank: 0,
    GFG: 0,
    Other: 0,
  },
  projects: [],
  contests: [],
  applications: [],
  dailyLogs: generateInitial12DayStreak(),
  coreSubjects: {
    os: 0,
    dbms: 0,
    cn: 0,
    oop: 0,
  },
  journeyStartDate: '2026-11-12',
  targetPlacementDate: '2028-08-01',
  isExamMode: true, // Default to true during college exam season (Nov-Dec 2026)
};

function sanitizeProfile(raw: CareerProfile | null): CareerProfile {
  if (!raw) return { ...DEFAULT_PROFILE, journeyStartDate: '2026-11-12' };
  const dailyLogs = Array.isArray(raw.dailyLogs) && raw.dailyLogs.length > 0
    ? raw.dailyLogs
    : generateInitial12DayStreak();

  return {
    totalProblems: raw.totalProblems ?? dailyLogs.reduce((acc, l) => acc + (l.dsaProblems || []).filter(p => p.solved).length, 0),
    currentRating: { ...DEFAULT_PROFILE.currentRating, ...(raw.currentRating || {}) },
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    contests: Array.isArray(raw.contests) ? raw.contests : [],
    applications: Array.isArray(raw.applications) ? raw.applications : [],
    dailyLogs,
    coreSubjects: {
      os: raw.coreSubjects?.os ?? 0,
      dbms: raw.coreSubjects?.dbms ?? 0,
      cn: raw.coreSubjects?.cn ?? 0,
      oop: raw.coreSubjects?.oop ?? 0,
    },
    journeyStartDate: raw.journeyStartDate || '2026-11-12',
    targetPlacementDate: raw.targetPlacementDate || '2028-08-01',
    isExamMode: raw.isExamMode !== undefined ? raw.isExamMode : true,
  };
}

export function useCareer() {
  const [profile, setProfile] = useState<CareerProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const local = getCareerProfile();
    setProfile(sanitizeProfile(local));
    setLoaded(true);

    hydrateFromCloud().then((cloudData) => {
      if (cloudData?.career) {
        setProfile(sanitizeProfile(cloudData.career));
      }
    });
  }, []);

  const persist = useCallback((updated: CareerProfile) => {
    // Recalculate total solved problems from all logs
    const totalSolved = updated.dailyLogs.reduce((acc, log) => {
      return acc + (log.dsaProblems || []).filter((p) => p.solved).length;
    }, 0);
    const normalized: CareerProfile = {
      ...updated,
      totalProblems: totalSolved,
    };
    setProfile(normalized);
    saveCareerProfile(normalized);
  }, []);

  const getLogForDate = useCallback(
    (date: string): CareerDailyLog => {
      const existing = profile.dailyLogs.find((l) => l.date === date);
      if (existing) {
        return {
          ...existing,
          checklist: { ...DEFAULT_PLACEMENT_CHECKLIST, ...(existing.checklist || {}) },
          examChecklist: { ...DEFAULT_EXAM_CHECKLIST, ...(existing.examChecklist || {}) },
        };
      }
      return {
        id: generateId(),
        date,
        checklist: { ...DEFAULT_PLACEMENT_CHECKLIST },
        examChecklist: { ...DEFAULT_EXAM_CHECKLIST },
        dsaProblems: [],
        studyHours: 0,
        notes: '',
        createdAt: new Date().toISOString(),
      };
    },
    [profile.dailyLogs]
  );

  const getTodayLog = useCallback((): CareerDailyLog => {
    return getLogForDate(getToday());
  }, [getLogForDate]);

  const toggleExamMode = useCallback(
    (forceState?: boolean) => {
      const nextVal = forceState !== undefined ? forceState : !(profile.isExamMode ?? true);
      persist({
        ...profile,
        isExamMode: nextVal,
      });
    },
    [profile, persist]
  );

  const toggleDailyTask = useCallback(
    (date: string, taskKey: keyof PlacementDailyChecklist) => {
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === date);

      if (existingIdx >= 0) {
        const targetLog = logs[existingIdx];
        const currentChecklist = { ...DEFAULT_PLACEMENT_CHECKLIST, ...(targetLog.checklist || {}) };
        logs[existingIdx] = {
          ...targetLog,
          checklist: {
            ...currentChecklist,
            [taskKey]: !currentChecklist[taskKey],
          },
        };
      } else {
        const newChecklist = { ...DEFAULT_PLACEMENT_CHECKLIST, [taskKey]: true };
        logs.unshift({
          id: generateId(),
          date,
          checklist: newChecklist,
          examChecklist: { ...DEFAULT_EXAM_CHECKLIST },
          dsaProblems: [],
          studyHours: 0,
          notes: '',
          createdAt: new Date().toISOString(),
        });
      }

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const toggleExamDailyTask = useCallback(
    (date: string, taskKey: keyof ExamModeChecklist) => {
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === date);

      if (existingIdx >= 0) {
        const targetLog = logs[existingIdx];
        const currentExamChecklist = { ...DEFAULT_EXAM_CHECKLIST, ...(targetLog.examChecklist || {}) };
        logs[existingIdx] = {
          ...targetLog,
          examChecklist: {
            ...currentExamChecklist,
            [taskKey]: !currentExamChecklist[taskKey],
          },
        };
      } else {
        const newExamChecklist = { ...DEFAULT_EXAM_CHECKLIST, [taskKey]: true };
        logs.unshift({
          id: generateId(),
          date,
          checklist: { ...DEFAULT_PLACEMENT_CHECKLIST },
          examChecklist: newExamChecklist,
          dsaProblems: [],
          studyHours: 0,
          notes: '',
          createdAt: new Date().toISOString(),
        });
      }

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const addDSAProblem = useCallback(
    (problem: DSAProblem, date?: string) => {
      const dateStr = date || getToday();
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === dateStr);

      if (existingIdx >= 0) {
        const targetLog = logs[existingIdx];
        const currentChecklist = { ...DEFAULT_PLACEMENT_CHECKLIST, ...(targetLog.checklist || {}) };
        logs[existingIdx] = {
          ...targetLog,
          checklist: {
            ...currentChecklist,
            dsaPractice: true, // auto-mark DSA task when problem added!
          },
          dsaProblems: [problem, ...(targetLog.dsaProblems || [])],
        };
      } else {
        logs.unshift({
          id: generateId(),
          date: dateStr,
          checklist: { ...DEFAULT_PLACEMENT_CHECKLIST, dsaPractice: true },
          dsaProblems: [problem],
          studyHours: 0,
          notes: '',
          createdAt: new Date().toISOString(),
        });
      }

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const removeDSAProblem = useCallback(
    (date: string, problemIndex: number) => {
      const logs = profile.dailyLogs.map((log) => {
        if (log.date !== date) return log;
        const updatedProblems = log.dsaProblems.filter((_, i) => i !== problemIndex);
        return {
          ...log,
          dsaProblems: updatedProblems,
        };
      });

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const toggleDSAProblem = useCallback(
    (date: string, problemIndex: number) => {
      const logs = profile.dailyLogs.map((log) => {
        if (log.date !== date) return log;
        const updatedProblems = log.dsaProblems.map((p, i) =>
          i === problemIndex ? { ...p, solved: !p.solved } : p
        );
        return {
          ...log,
          dsaProblems: updatedProblems,
        };
      });

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const setStudyHours = useCallback(
    (date: string, hours: number) => {
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === date);

      if (existingIdx >= 0) {
        logs[existingIdx] = { ...logs[existingIdx], studyHours: Math.max(0, hours) };
      } else {
        logs.unshift({
          id: generateId(),
          date,
          checklist: { ...DEFAULT_PLACEMENT_CHECKLIST },
          dsaProblems: [],
          studyHours: Math.max(0, hours),
          notes: '',
          createdAt: new Date().toISOString(),
        });
      }

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const updateDailyNotes = useCallback(
    (date: string, notes: string) => {
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === date);

      if (existingIdx >= 0) {
        const targetLog = logs[existingIdx];
        const currentChecklist = { ...DEFAULT_PLACEMENT_CHECKLIST, ...(targetLog.checklist || {}) };
        logs[existingIdx] = {
          ...targetLog,
          notes,
          checklist: {
            ...currentChecklist,
            learnNotes: notes.trim().length > 0 ? true : currentChecklist.learnNotes,
          },
        };
      } else {
        logs.unshift({
          id: generateId(),
          date,
          checklist: { ...DEFAULT_PLACEMENT_CHECKLIST, learnNotes: notes.trim().length > 0 },
          dsaProblems: [],
          studyHours: 0,
          notes,
          createdAt: new Date().toISOString(),
        });
      }

      persist({
        ...profile,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const setJourneyStartDate = useCallback(
    (date: string) => {
      persist({
        ...profile,
        journeyStartDate: date,
      });
    },
    [profile, persist]
  );

  const setTargetPlacementDate = useCallback(
    (date: string) => {
      persist({
        ...profile,
        targetPlacementDate: date,
      });
    },
    [profile, persist]
  );

  const addContest = useCallback(
    (contest: Omit<CareerContest, 'id' | 'createdAt'>) => {
      const newContest: CareerContest = {
        ...contest,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const updatedContests = [newContest, ...profile.contests];
      const updatedRating = { ...profile.currentRating };
      if (contest.currentRating) {
        updatedRating[contest.platform] = contest.currentRating;
      }

      // Mark speedOrContest for today
      const today = getToday();
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === today);
      if (existingIdx >= 0) {
        logs[existingIdx] = {
          ...logs[existingIdx],
          checklist: {
            ...DEFAULT_PLACEMENT_CHECKLIST,
            ...(logs[existingIdx].checklist || {}),
            speedOrContest: true,
          },
        };
      }

      persist({
        ...profile,
        contests: updatedContests,
        currentRating: updatedRating,
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const removeContest = useCallback(
    (contestId: string) => {
      persist({
        ...profile,
        contests: profile.contests.filter((c) => c.id !== contestId),
      });
    },
    [profile, persist]
  );

  const addProject = useCallback(
    (project: Omit<CareerProject, 'id' | 'createdAt'>) => {
      const newProject: CareerProject = {
        ...project,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      // Mark devProject for today
      const today = getToday();
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === today);
      if (existingIdx >= 0) {
        logs[existingIdx] = {
          ...logs[existingIdx],
          checklist: {
            ...DEFAULT_PLACEMENT_CHECKLIST,
            ...(logs[existingIdx].checklist || {}),
            devProject: true,
          },
        };
      }

      persist({
        ...profile,
        projects: [newProject, ...profile.projects],
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<CareerProject>) => {
      const updated = profile.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
      persist({
        ...profile,
        projects: updated,
      });
    },
    [profile, persist]
  );

  const removeProject = useCallback(
    (id: string) => {
      persist({
        ...profile,
        projects: profile.projects.filter((p) => p.id !== id),
      });
    },
    [profile, persist]
  );

  const addApplication = useCallback(
    (app: Omit<CareerApplication, 'id' | 'createdAt'>) => {
      const newApp: CareerApplication = {
        ...app,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      persist({
        ...profile,
        applications: [newApp, ...profile.applications],
      });
    },
    [profile, persist]
  );

  const updateApplication = useCallback(
    (id: string, updates: Partial<CareerApplication>) => {
      const updated = profile.applications.map((a) => (a.id === id ? { ...a, ...updates } : a));
      persist({
        ...profile,
        applications: updated,
      });
    },
    [profile, persist]
  );

  const removeApplication = useCallback(
    (id: string) => {
      persist({
        ...profile,
        applications: profile.applications.filter((a) => a.id !== id),
      });
    },
    [profile, persist]
  );

  const updateSubjectProgress = useCallback(
    (subject: keyof CoreSubjectProgress, value: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(value)));

      // Mark coreCsStudy for today
      const today = getToday();
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === today);
      if (existingIdx >= 0) {
        logs[existingIdx] = {
          ...logs[existingIdx],
          checklist: {
            ...DEFAULT_PLACEMENT_CHECKLIST,
            ...(logs[existingIdx].checklist || {}),
            coreCsStudy: true,
          },
        };
      }

      persist({
        ...profile,
        coreSubjects: {
          ...profile.coreSubjects,
          [subject]: clamped,
        },
        dailyLogs: logs,
      });
    },
    [profile, persist]
  );

  const getWeeklyDSAStats = useCallback((): {
    date: string;
    count: number;
    hours: number;
    tasksDone: number;
  }[] => {
    const result: { date: string; count: number; hours: number; tasksDone: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const log = profile.dailyLogs.find((l) => l.date === dateStr);
      const count = (log?.dsaProblems || []).filter((p) => p.solved).length;
      const tasksDone = log?.checklist
        ? Object.values(log.checklist).filter(Boolean).length
        : 0;
      result.push({
        date: dateStr,
        count,
        hours: log?.studyHours || 0,
        tasksDone,
      });
    }
    return result;
  }, [profile.dailyLogs]);

  const getJourneyStats = useCallback((): {
    journeyDay: number;
    daysRemaining: number;
    currentStreak: number;
    bestStreak: number;
    todayTasksDone: number;
    todayTotalTasks: number;
    todayPct: number;
    totalDaysLogged: number;
    isExamMode: boolean;
    isStreakShielded: boolean;
    todayExamTasksDone: number;
    todayExamTotalTasks: number;
    todayExamPct: number;
  } => {
    const today = getToday();
    const startDate = profile.journeyStartDate || today;
    const targetDate = profile.targetPlacementDate || '2028-08-01';

    const journeyDay = Math.max(1, getDaysBetween(startDate, today) + 1);
    const daysRemaining = Math.max(0, getDaysBetween(today, targetDate));

    // Calculate active dates for streak (Exam micro-tasks protect and advance streak!)
    const activeDates: Record<string, boolean> = {};
    for (const log of profile.dailyLogs) {
      const hasTask = log.checklist && Object.values(log.checklist).some(Boolean);
      const hasExamTask = log.examChecklist && Object.values(log.examChecklist).some(Boolean);
      const hasProblem = (log.dsaProblems || []).some((p) => p.solved);
      const hasStudy = (log.studyHours || 0) > 0;
      if (hasTask || hasExamTask || hasProblem || hasStudy) {
        activeDates[log.date] = true;
      }
    }

    const currentStreak = calculateStreak(activeDates);

    // Calculate best streak
    const sortedDates = Object.keys(activeDates).sort();
    let best = 0;
    let running = 0;
    let lastDate: Date | null = null;
    for (const dStr of sortedDates) {
      const [y, m, d] = dStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);
      if (!lastDate) {
        running = 1;
      } else {
        const diffDays = Math.round((curr.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          running++;
        } else if (diffDays > 1) {
          running = 1;
        }
      }
      lastDate = curr;
      if (running > best) best = running;
    }
    if (currentStreak > best) best = currentStreak;

    // Today's standard task progress
    const todayLog = profile.dailyLogs.find((l) => l.date === today);
    const todayChecklist = todayLog?.checklist || DEFAULT_PLACEMENT_CHECKLIST;
    const todayTasksDone = Object.values(todayChecklist).filter(Boolean).length;
    const todayTotalTasks = 5;
    const todayPct = Math.round((todayTasksDone / todayTotalTasks) * 100);

    // Today's exam mode progress
    const isExamMode = profile.isExamMode ?? true;
    const todayExamChecklist = todayLog?.examChecklist || DEFAULT_EXAM_CHECKLIST;
    const todayExamTasksDone = Object.values(todayExamChecklist).filter(Boolean).length;
    const todayExamTotalTasks = 5;
    const todayExamPct = Math.round((todayExamTasksDone / todayExamTotalTasks) * 100);

    // Streak is shielded if ANY task (standard or exam mode) or DSA problem or study hour is logged!
    const isStreakShielded =
      todayTasksDone > 0 ||
      todayExamTasksDone > 0 ||
      (todayLog?.dsaProblems || []).some((p) => p.solved) ||
      (todayLog?.studyHours || 0) > 0;

    return {
      journeyDay,
      daysRemaining,
      currentStreak,
      bestStreak: best,
      todayTasksDone,
      todayTotalTasks,
      todayPct,
      totalDaysLogged: Object.keys(activeDates).length,
      isExamMode,
      isStreakShielded,
      todayExamTasksDone,
      todayExamTotalTasks,
      todayExamPct,
    };
  }, [profile.journeyStartDate, profile.targetPlacementDate, profile.dailyLogs, profile.isExamMode]);

  const getDifficultyCounts = useCallback((): {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  } => {
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const log of profile.dailyLogs) {
      for (const p of log.dsaProblems || []) {
        if (p.solved) {
          if (p.difficulty === 'Easy') easy++;
          else if (p.difficulty === 'Medium') medium++;
          else if (p.difficulty === 'Hard') hard++;
        }
      }
    }
    return { easy, medium, hard, total: easy + medium + hard };
  }, [profile.dailyLogs]);

  const getTopicCounts = useCallback((): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const log of profile.dailyLogs) {
      for (const p of log.dsaProblems || []) {
        if (p.solved) {
          counts[p.topic] = (counts[p.topic] || 0) + 1;
        }
      }
    }
    return counts;
  }, [profile.dailyLogs]);

  return {
    profile,
    loaded,
    getLogForDate,
    getTodayLog,
    toggleDailyTask,
    addDSAProblem,
    removeDSAProblem,
    toggleDSAProblem,
    setStudyHours,
    updateDailyNotes,
    setJourneyStartDate,
    setTargetPlacementDate,
    addContest,
    removeContest,
    addProject,
    updateProject,
    removeProject,
    addApplication,
    updateApplication,
    removeApplication,
    updateSubjectProgress,
    getWeeklyDSAStats,
    getJourneyStats,
    getDifficultyCounts,
    getTopicCounts,
    isExamMode: profile.isExamMode ?? true,
    toggleExamMode,
    toggleExamDailyTask,
  };
}
