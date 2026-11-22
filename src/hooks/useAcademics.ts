'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AcademicProfile,
  AcademicExam,
  AcademicHomework,
  DayOfWeek,
  TimetablePeriod,
  SubjectSyllabus,
} from '@/lib/academicTypes';
import {
  SEED_EXAMS,
  SEED_TIMETABLE,
  SEED_MESS_MENU,
  SEED_SYLLABUS,
  INITIAL_ACADEMIC_PROFILE,
} from '@/lib/academicSeed';
import {
  getAcademicProfile,
  saveAcademicProfile,
  hydrateFromCloud,
} from '@/lib/storage';

export function useAcademics() {
  const [profile, setProfile] = useState<AcademicProfile>(INITIAL_ACADEMIC_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Load and hydrate profile
  useEffect(() => {
    const localData = getAcademicProfile();
    setProfile(localData);
    setLoaded(true);

    hydrateFromCloud().then((cloudData) => {
      if (cloudData?.academics) {
        const isGuruvayur = cloudData.academics.messMenu?.some(
          (m) => m.day === 'Monday' && m.breakfast.items.includes('Poori Masala')
        );
        const resolved = {
          ...cloudData.academics,
          messMenu: isGuruvayur ? cloudData.academics.messMenu : SEED_MESS_MENU,
        };
        setProfile(resolved);
      }
    });
  }, []);

  // Update profile helper
  const updateProfile = useCallback((updater: (prev: AcademicProfile) => AcademicProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveAcademicProfile(next);
      return next;
    });
  }, []);

  // Exam Management
  const addExam = useCallback((examData: Omit<AcademicExam, 'id'>) => {
    const newExam: AcademicExam = {
      ...examData,
      id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    updateProfile((prev) => ({
      ...prev,
      exams: [...prev.exams, newExam].sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, [updateProfile]);

  const updateExam = useCallback((id: string, updates: Partial<AcademicExam>) => {
    updateProfile((prev) => ({
      ...prev,
      exams: prev.exams.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex)),
    }));
  }, [updateProfile]);

  const deleteExam = useCallback((id: string) => {
    updateProfile((prev) => ({
      ...prev,
      exams: prev.exams.filter((ex) => ex.id !== id),
    }));
  }, [updateProfile]);

  // Homework Management
  const addHomework = useCallback((hwData: Omit<AcademicHomework, 'id' | 'createdAt'>) => {
    const newHw: AcademicHomework = {
      ...hwData,
      id: `hw-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    updateProfile((prev) => ({
      ...prev,
      homework: [newHw, ...prev.homework],
    }));
  }, [updateProfile]);

  const toggleHomework = useCallback((id: string) => {
    updateProfile((prev) => ({
      ...prev,
      homework: prev.homework.map((hw) =>
        hw.id === id ? { ...hw, completed: !hw.completed } : hw
      ),
    }));
  }, [updateProfile]);

  const deleteHomework = useCallback((id: string) => {
    updateProfile((prev) => ({
      ...prev,
      homework: prev.homework.filter((hw) => hw.id !== id),
    }));
  }, [updateProfile]);

  // Syllabus Topic Progress
  const toggleTopic = useCallback((topicId: string) => {
    updateProfile((prev) => {
      const current = !!prev.syllabusProgress[topicId];
      return {
        ...prev,
        syllabusProgress: {
          ...prev.syllabusProgress,
          [topicId]: !current,
        },
      };
    });
  }, [updateProfile]);

  const isTopicCompleted = useCallback((topicId: string) => {
    return !!profile.syllabusProgress[topicId];
  }, [profile.syllabusProgress]);

  // Subject and Module Readiness calculations
  const getSubjectReadiness = useCallback((subjectCode: string) => {
    const subject = SEED_SYLLABUS.find((s) => s.code === subjectCode);
    if (!subject) return { totalTopics: 0, completedTopics: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    subject.modules.forEach((mod) => {
      mod.topics.forEach((top) => {
        total += 1;
        if (profile.syllabusProgress[top.id]) {
          completed += 1;
        }
      });
    });

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { totalTopics: total, completedTopics: completed, percentage };
  }, [profile.syllabusProgress]);

  const getModuleReadiness = useCallback((subjectCode: string, moduleNumber: number) => {
    const subject = SEED_SYLLABUS.find((s) => s.code === subjectCode);
    if (!subject) return { totalTopics: 0, completedTopics: 0, percentage: 0 };

    const mod = subject.modules.find((m) => m.moduleNumber === moduleNumber);
    if (!mod) return { totalTopics: 0, completedTopics: 0, percentage: 0 };

    const total = mod.topics.length;
    const completed = mod.topics.filter((t) => profile.syllabusProgress[t.id]).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { totalTopics: total, completedTopics: completed, percentage };
  }, [profile.syllabusProgress]);

  // Mess Menu Management
  const updateMessMeal = useCallback((
    day: DayOfWeek,
    mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    items: string[]
  ) => {
    updateProfile((prev) => ({
      ...prev,
      messMenu: prev.messMenu.map((m) => {
        if (m.day !== day) return m;
        return {
          ...m,
          [mealType]: {
            ...m[mealType],
            items,
          },
        };
      }),
    }));
  }, [updateProfile]);

  // Attendance Management
  const updateAttendance = useCallback((subjectCode: string, total: number, attended: number) => {
    updateProfile((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [subjectCode]: { total, attended },
      },
    }));
  }, [updateProfile]);

  // Internal Marks Management
  const updateInternalMarks = useCallback((
    subjectCode: string,
    marks: { iat1?: number; iat2?: number; cta?: number; attendance?: number }
  ) => {
    updateProfile((prev) => ({
      ...prev,
      internalMarks: {
        ...prev.internalMarks,
        [subjectCode]: {
          ...prev.internalMarks[subjectCode],
          ...marks,
        },
      },
    }));
  }, [updateProfile]);

  // Quick Notes Management
  const updateQuickNotes = useCallback((notes: string) => {
    updateProfile((prev) => ({
      ...prev,
      quickNotes: notes,
    }));
  }, [updateProfile]);

  // Reset to default seed
  const resetToDefaults = useCallback(() => {
    updateProfile(() => INITIAL_ACADEMIC_PROFILE);
  }, [updateProfile]);

  // Earliest Upcoming Exam
  const earliestExam = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = profile.exams
      .filter((ex) => ex.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [profile.exams]);

  // Current Timetable Period Radar
  const getCurrentPeriodInfo = useCallback(() => {
    const now = new Date();
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];

    if (currentDay === 'Saturday' || currentDay === 'Sunday') {
      return {
        isWeekend: true,
        currentDay,
        activePeriod: null,
        nextPeriod: null,
        statusText: 'Weekend — No Classes Scheduled',
        isBreak: false,
      };
    }

    const dayTimetable = SEED_TIMETABLE.find((t) => t.day === currentDay);
    if (!dayTimetable) {
      return {
        isWeekend: false,
        currentDay,
        activePeriod: null,
        nextPeriod: null,
        statusText: 'No schedule found for today',
        isBreak: false,
      };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Helper to parse "08:45 - 09:35" or "12:15 - 01:05" (PM conversions)
    const parsePeriodTime = (range: string) => {
      const [startRaw, endRaw] = range.split('-').map((s) => s.trim());
      const toMins = (t: string) => {
        const [hStr, mStr] = t.split(':').map((s) => parseInt(s, 10));
        let h = hStr;
        // Classes are between 8am and 4pm. If hour is 1, 2, or 3, it is PM (13, 14, 15)
        if (h >= 1 && h <= 5) h += 12;
        return h * 60 + mStr;
      };
      return { start: toMins(startRaw), end: toMins(endRaw) };
    };

    let activePeriod: TimetablePeriod | null = null;
    let nextPeriod: TimetablePeriod | null = null;
    let isBreak = false;
    let statusText = 'Classes finished for the day';

    const firstPeriodTime = parsePeriodTime(dayTimetable.periods[0].timeRange);
    const lastPeriodTime = parsePeriodTime(dayTimetable.periods[dayTimetable.periods.length - 1].timeRange);

    if (currentMinutes < firstPeriodTime.start) {
      nextPeriod = dayTimetable.periods[0];
      const diff = firstPeriodTime.start - currentMinutes;
      statusText = `College starts in ${diff} mins (Period 1: ${nextPeriod.subject})`;
      return { isWeekend: false, currentDay, activePeriod: null, nextPeriod, statusText, isBreak: false };
    }

    if (currentMinutes > lastPeriodTime.end) {
      statusText = 'College classes ended for today';
      return { isWeekend: false, currentDay, activePeriod: null, nextPeriod: null, statusText, isBreak: false };
    }

    // Check lunch break
    if (currentDay === 'Friday') {
      // Friday lunch: 12:15 to 14:15 (12:15pm - 2:15pm)
      if (currentMinutes >= 12 * 60 + 15 && currentMinutes < 14 * 60 + 15) {
        return {
          isWeekend: false,
          currentDay,
          activePeriod: null,
          nextPeriod: dayTimetable.periods.find((p) => p.periodNumber === 6) || null,
          statusText: 'Friday Lunch Break (12:15 PM – 2:15 PM)',
          isBreak: true,
        };
      }
    } else {
      // Mon-Thu lunch: 11:30 to 12:15
      if (currentMinutes >= 11 * 60 + 30 && currentMinutes < 12 * 60 + 15) {
        return {
          isWeekend: false,
          currentDay,
          activePeriod: null,
          nextPeriod: dayTimetable.periods.find((p) => p.periodNumber === 4) || null,
          statusText: 'Lunch Break (11:30 AM – 12:15 PM)',
          isBreak: true,
        };
      }
    }

    // Check periods
    for (let i = 0; i < dayTimetable.periods.length; i++) {
      const p = dayTimetable.periods[i];
      const { start, end } = parsePeriodTime(p.timeRange);

      if (currentMinutes >= start && currentMinutes < end) {
        activePeriod = p;
        nextPeriod = dayTimetable.periods[i + 1] || null;
        const minsRemaining = end - currentMinutes;
        statusText = `Period ${p.periodNumber} Ongoing (${minsRemaining}m left)`;
        return { isWeekend: false, currentDay, activePeriod, nextPeriod, statusText, isBreak: false };
      }
    }

    return { isWeekend: false, currentDay, activePeriod, nextPeriod, statusText, isBreak };
  }, []);

  return {
    profile,
    loaded,
    timetable: SEED_TIMETABLE,
    syllabus: SEED_SYLLABUS,
    addExam,
    updateExam,
    deleteExam,
    addHomework,
    toggleHomework,
    deleteHomework,
    toggleTopic,
    isTopicCompleted,
    getSubjectReadiness,
    getModuleReadiness,
    updateMessMeal,
    updateAttendance,
    updateInternalMarks,
    updateQuickNotes,
    resetToDefaults,
    earliestExam,
    getCurrentPeriodInfo,
  };
}
