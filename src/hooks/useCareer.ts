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
  DSATopic,
} from '@/lib/types';
import { getCareerProfile, saveCareerProfile, hydrateFromCloud } from '@/lib/storage';
import { generateId, getToday, formatDate } from '@/lib/utils';

const DEFAULT_PROFILE: CareerProfile = {
  totalProblems: 0,
  currentRating: {
    LeetCode: 0,
    Codeforces: 0,
    CodeChef: 0,
    HackerRank: 0,
    GFG: 0,
    Other: 0,
  },
  projects: [],
  contests: [],
  applications: [],
  dailyLogs: [],
  coreSubjects: {
    os: 0,
    dbms: 0,
    cn: 0,
    oop: 0,
  },
};

function sanitizeProfile(raw: CareerProfile | null): CareerProfile {
  if (!raw) return { ...DEFAULT_PROFILE };
  return {
    totalProblems: raw.totalProblems ?? 0,
    currentRating: { ...DEFAULT_PROFILE.currentRating, ...(raw.currentRating || {}) },
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    contests: Array.isArray(raw.contests) ? raw.contests : [],
    applications: Array.isArray(raw.applications) ? raw.applications : [],
    dailyLogs: Array.isArray(raw.dailyLogs) ? raw.dailyLogs : [],
    coreSubjects: {
      os: raw.coreSubjects?.os ?? 0,
      dbms: raw.coreSubjects?.dbms ?? 0,
      cn: raw.coreSubjects?.cn ?? 0,
      oop: raw.coreSubjects?.oop ?? 0,
    },
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

  const getTodayLog = useCallback((): CareerDailyLog => {
    const today = getToday();
    const existing = profile.dailyLogs.find((l) => l.date === today);
    if (existing) return existing;
    return {
      id: generateId(),
      date: today,
      dsaProblems: [],
      studyHours: 0,
      notes: '',
      createdAt: new Date().toISOString(),
    };
  }, [profile.dailyLogs]);

  const addDSAProblem = useCallback(
    (problem: DSAProblem, date?: string) => {
      const dateStr = date || getToday();
      const logs = [...profile.dailyLogs];
      const existingIdx = logs.findIndex((l) => l.date === dateStr);

      if (existingIdx >= 0) {
        const targetLog = logs[existingIdx];
        logs[existingIdx] = {
          ...targetLog,
          dsaProblems: [problem, ...(targetLog.dsaProblems || [])],
        };
      } else {
        logs.unshift({
          id: generateId(),
          date: dateStr,
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
        logs[existingIdx] = { ...logs[existingIdx], notes };
      } else {
        logs.unshift({
          id: generateId(),
          date,
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

      persist({
        ...profile,
        contests: updatedContests,
        currentRating: updatedRating,
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
      persist({
        ...profile,
        projects: [newProject, ...profile.projects],
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
      persist({
        ...profile,
        coreSubjects: {
          ...profile.coreSubjects,
          [subject]: clamped,
        },
      });
    },
    [profile, persist]
  );

  const getWeeklyDSAStats = useCallback((): { date: string; count: number; hours: number }[] => {
    const result: { date: string; count: number; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const log = profile.dailyLogs.find((l) => l.date === dateStr);
      const count = (log?.dsaProblems || []).filter((p) => p.solved).length;
      result.push({
        date: dateStr,
        count,
        hours: log?.studyHours || 0,
      });
    }
    return result;
  }, [profile.dailyLogs]);

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
    getTodayLog,
    addDSAProblem,
    removeDSAProblem,
    toggleDSAProblem,
    setStudyHours,
    updateDailyNotes,
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
    getDifficultyCounts,
    getTopicCounts,
  };
}
