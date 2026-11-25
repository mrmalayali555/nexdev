'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  X,
  Calendar,
  Utensils,
  CheckSquare,
  Zap,
  Clock,
  ArrowRight,
  Flame,
  Sun,
  Coffee,
  FileText,
  Plus,
  MoreVertical,
  BookOpen,
  Calculator,
  TrendingUp,
  LayoutGrid,
  Home,
  Settings,
  Moon,
  Trash2,
  Pin,
  Sparkles,
  MapPin,
  GraduationCap,
  Layers,
  ChefHat,
  Check,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useAcademics } from '@/hooks/useAcademics';
import { useCareer } from '@/hooks/useCareer';
import { getHubNotes, saveHubNotes, HubNote } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptics';
import { DayOfWeek } from '@/lib/academicTypes';
import { useCloudAuth } from '@/components/auth/CloudUnlockModal';

export default function HomePage() {
  const { isCloudLocked, authChecked, openUnlockModal } = useCloudAuth();
  const {
    profile: academicProfile,
    loaded: academicLoaded,
    timetable,
    earliestExam,
    toggleHomework,
  } = useAcademics();

  const {
    profile: careerProfile,
    loaded: careerLoaded,
    getJourneyStats,
  } = useCareer();

  // Notes state
  const [notes, setNotes] = useState<HubNote[]>([]);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'academic' | 'career' | 'general'>('academic');
  const [selectedNote, setSelectedNote] = useState<HubNote | null>(null);
  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null);

  // Mobile Drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Desktop Timetable Filter State ('Today' | 'Week' | 'All')
  const [scheduleFilter, setScheduleFilter] = useState<'Today' | 'Week' | 'All'>('Today');

  // Schedule View Mode: 'auto' (after 4pm defaults to tomorrow) | 'today' | 'tomorrow' | 'week'
  const [scheduleTab, setScheduleTab] = useState<'auto' | 'today' | 'tomorrow' | 'week'>('auto');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Mess Menu View Mode: 'auto' (after 9pm defaults to tomorrow) | 'today' | 'tomorrow'
  const [messTab, setMessTab] = useState<'auto' | 'today' | 'tomorrow'>('auto');

  // Interactive Quick Access Modal / View State
  const [activeDayView, setActiveDayView] = useState<'none' | 'timetable' | 'mess' | 'work' | 'routine'>('none');

  // Search input state
  const [desktopSearch, setDesktopSearch] = useState('');

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setNotes(getHubNotes());
    return () => clearInterval(timer);
  }, []);

  const isLoaded = academicLoaded && careerLoaded;

  // Day & Time calculations
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = days[currentTime.getDay()];
  const isWeekend = todayDayName === 'Saturday' || todayDayName === 'Sunday';

  const currentHour = currentTime.getHours();
  // College classes finish at 3:45 PM (15:45). After 4:00 PM (16:00), automatically switch to Tomorrow's Schedule for packing & prep!
  const isAfter4PM = currentHour >= 16;
  // Hostel dinner ends at 9:00 PM. After 9:00 PM, show tomorrow's meals so students know breakfast & lunch!
  const isAfter9PM = currentHour >= 21;

  // Calculate tomorrow's academic day (Mon -> Tue -> Wed -> Thu -> Fri -> Mon)
  const getNextClassDay = (currentDay: DayOfWeek): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' => {
    switch (currentDay) {
      case 'Monday': return 'Tuesday';
      case 'Tuesday': return 'Wednesday';
      case 'Wednesday': return 'Thursday';
      case 'Thursday': return 'Friday';
      case 'Friday':
      case 'Saturday':
      case 'Sunday':
      default:
        return 'Monday';
    }
  };
  const nextClassDay = getNextClassDay(todayDayName);

  // Tomorrow's calendar day for mess menu
  const tomorrowCalendarDay = days[(currentTime.getDay() + 1) % 7];

  // Active Schedule Day calculation
  const activeScheduleDay = useMemo<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>(() => {
    if (scheduleTab === 'week') return selectedDay;
    if (scheduleTab === 'today') return isWeekend ? 'Monday' : (todayDayName as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday');
    if (scheduleTab === 'tomorrow') return nextClassDay;
    // 'auto' mode: after 4 PM or on weekends, show tomorrow's schedule!
    return (isAfter4PM || isWeekend) ? nextClassDay : (todayDayName as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday');
  }, [scheduleTab, selectedDay, isWeekend, todayDayName, nextClassDay, isAfter4PM]);

  const isShowingTomorrow = activeScheduleDay === nextClassDay && (isAfter4PM || scheduleTab === 'tomorrow' || isWeekend);

  const displayTimetable = useMemo(() => {
    const found = timetable.find((t) => t.day === activeScheduleDay);
    return found || timetable.find((t) => t.day === 'Monday') || timetable[0];
  }, [timetable, activeScheduleDay]);

  // Active Mess Day calculation
  const isMessTomorrow = messTab === 'tomorrow' || (messTab === 'auto' && isAfter9PM);
  const activeMessDay = isMessTomorrow ? tomorrowCalendarDay : todayDayName;
  const displayMess = useMemo(() => {
    const found = academicProfile.messMenu.find((m) => m.day === activeMessDay);
    return found || academicProfile.messMenu.find((m) => m.day === 'Monday') || academicProfile.messMenu[0];
  }, [academicProfile.messMenu, activeMessDay]);

  // Dynamic greeting based on current local hour
  const getGreeting = (hour: number) => {
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };
  const greetingText = getGreeting(currentTime.getHours());

  // Helper to compute live countdown for any exam date & time
  const getExamCountdown = useCallback(
    (targetDateStr: string, timeStr?: string) => {
      let targetTime = '09:30:00';
      if (timeStr && timeStr.includes(':')) {
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (match) targetTime = `${match[1].padStart(2, '0')}:${match[2]}:00`;
      }
      const examDateTime = new Date(`${targetDateStr}T${targetTime}+05:30`);
      const diffMs = examDateTime.getTime() - currentTime.getTime();

      if (diffMs <= 0) {
        return { days: '00', hours: '00', minutes: '00', isPast: true };
      }
      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return {
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        isPast: false,
      };
    },
    [currentTime]
  );

  // Next 3 Upcoming Exams (filtering out completed past exams such as Nov 23)
  const upcoming3Exams = useMemo(() => {
    const todayStr = '2026-11-23';
    const sorted = [...academicProfile.exams]
      .filter((exam) => {
        // Exclude practical exam 1 or any exam on or before Nov 23 since user confirmed it is completed
        if (exam.id === 'exam-prac-1' || exam.date <= todayStr) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fallback: return top 3 upcoming
    return sorted.length >= 3 ? sorted.slice(0, 3) : sorted.length > 0 ? sorted : academicProfile.exams.slice(1, 4);
  }, [academicProfile.exams]);

  // Real Career Streak Stats
  const streakStats = getJourneyStats();
  const streakCount = streakStats.currentStreak;

  // Real 28-day activity heatmap data (4 weeks ending with today)
  const heatmapData = useMemo(() => {
    const today = new Date(currentTime);
    const result: { dateStr: string; dayLetter: string; isToday: boolean; count: number; intensity: string }[] = [];

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayIndex];
      const isCurrentDay = i === 0;

      // Count real activity on this date
      let activityScore = 0;

      // 1. Career daily log activity
      const cLog = careerProfile.dailyLogs.find((l) => l.date === dateStr);
      if (cLog) {
        const tasksCount = Object.values(cLog.checklist || {}).filter(Boolean).length;
        const examTasksCount = Object.values(cLog.examChecklist || {}).filter(Boolean).length;
        const dsaCount = (cLog.dsaProblems || []).filter((p) => p.solved).length;
        const studyHrs = cLog.studyHours || 0;
        activityScore += tasksCount + examTasksCount + dsaCount + (studyHrs > 0 ? 1 : 0);
      }

      // 2. Homework completed on this date
      const hwCount = academicProfile.homework.filter(
        (h) => h.completed && (h.dueDate === dateStr || h.createdAt?.startsWith(dateStr))
      ).length;
      activityScore += hwCount;

      let intensity = 'bg-slate-800/80 border border-slate-700/40';
      if (activityScore === 1) {
        intensity = 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm';
      } else if (activityScore === 2) {
        intensity = 'bg-emerald-600 border border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]';
      } else if (activityScore >= 3) {
        intensity = 'bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      }

      result.push({
        dateStr,
        dayLetter,
        isToday: isCurrentDay,
        count: activityScore,
        intensity,
      });
    }

    return result;
  }, [currentTime, careerProfile.dailyLogs, academicProfile.homework]);

  // Notes actions
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const newNote: HubNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: noteTitle.trim(),
      content: noteContent.trim() || 'No additional content provided.',
      category: noteCategory,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveHubNotes(updated);
    setNoteTitle('');
    setNoteContent('');
    setShowNewNoteModal(false);
    triggerHaptic('success');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveHubNotes(updated);
    if (selectedNote?.id === id) setSelectedNote(null);
    setActiveMenuNoteId(null);
    triggerHaptic('light');
  };

  const handleTogglePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
    setNotes(updated);
    saveHubNotes(updated);
    setActiveMenuNoteId(null);
    triggerHaptic('light');
  };

  // Pre-seed sample tasks if homework is empty
  const displayHomework = academicProfile.homework && academicProfile.homework.length > 0
    ? academicProfile.homework.slice(0, 4)
    : [
        { id: 'hw-1', title: 'Chemistry Chapter 4 Study', dueDate: '2026-11-23', completed: false },
        { id: 'hw-2', title: 'Chemistry Prep for Seminar', dueDate: '2026-11-24', completed: false },
        { id: 'hw-3', title: 'EE Padiknm', dueDate: '2026-11-30', completed: false },
      ];

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F8FAFC] flex selection:bg-purple-500/30 selection:text-purple-200">
      {/* =========================================================================
          DESKTOP LEFT SIDEBAR (Visible on md/lg screens, exact match to screenshot)
         ========================================================================= */}
      <aside className="hidden lg:flex flex-col justify-between w-60 shrink-0 border-r border-slate-800/80 bg-[#0A0D1D]/90 backdrop-blur-xl p-5 sticky top-0 h-screen z-30">
        <div className="space-y-6">
          {/* Top Brand Logo - Large and prominent without text */}
          <Link href="/" className="flex items-center px-2 group py-1">
            <div className="relative h-11 w-48 flex items-center">
              <Image
                src="/logo.png"
                alt="NexDev Logo"
                fill
                sizes="200px"
                className="object-contain object-left group-hover:scale-105 transition-transform"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm font-medium">
            <Link
              href="/"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold transition-all"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link
              href="/academics"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <BookOpen size={18} />
              <span>Academics</span>
            </Link>

            <Link
              href="/academics?tab=timetable"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <Calendar size={18} />
              <span>Planner</span>
            </Link>

            <Link
              href="/academics?tab=exams"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <GraduationCap size={18} />
              <span>Exams</span>
            </Link>

            <a
              href="#notes-section"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <FileText size={18} />
              <span>Notes</span>
            </a>

            <Link
              href="/academics?tab=tools"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <LayoutGrid size={18} />
              <span>Tools</span>
            </Link>

            <Link
              href="/career"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <TrendingUp size={18} />
              <span>Growth</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Sidebar Settings */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between px-2 text-slate-500">
          <button
            onClick={() => triggerHaptic('light')}
            className="p-2 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          {authChecked && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                openUnlockModal();
              }}
              className={`p-2 rounded-lg transition-colors ${
                isCloudLocked
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                  : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-white/[0.05]'
              }`}
              title={isCloudLocked ? 'Cloud Sync Locked — Unlock' : 'Cloud Sync Active'}
              aria-label={isCloudLocked ? 'Unlock Cloud Sync' : 'Cloud Sync Status'}
            >
              {isCloudLocked ? <Lock size={18} /> : <ShieldCheck size={18} />}
            </button>
          )}
          <button
            onClick={() => triggerHaptic('light')}
            className="p-2 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Theme Mode"
          >
            <Moon size={18} />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION AREA (Mobile First & Desktop Two-Column Layout)
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-12">
        {/* =======================================================================
            SECTION 1: TOP HEADER (Mobile Header + Desktop Action Bar)
           ======================================================================= */}
        <header className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/60 bg-[#080B16]/95 backdrop-blur-md sticky top-0 z-20">
          {/* Mobile Left: Hamburger + Logo + Brand Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsMobileDrawerOpen(true);
              }}
              className="lg:hidden p-2 -ml-1 text-slate-300 hover:text-white active:scale-95 transition-transform"
              aria-label="Open Navigation Drawer"
            >
              <Menu size={22} />
            </button>

            {/* Large Brand Logo without text */}
            <Link href="/" className="flex items-center group py-0.5">
              <div className="relative h-10 sm:h-12 w-40 sm:w-48 flex items-center">
                <Image
                  src="/logo.png"
                  alt="NexDev Logo"
                  fill
                  sizes="200px"
                  className="object-contain object-left group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Center: Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search anything... (Ctrl + K)"
                value={desktopSearch}
                onChange={(e) => setDesktopSearch(e.target.value)}
                className="w-full bg-[#14182A] border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Controls: Date (desktop), Notification Bell, Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Calendar size={14} className="text-purple-400" />
              <span>
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Notification Bell with indicator */}
            <button
              onClick={() => triggerHaptic('light')}
              className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#080B16] animate-pulse" />
            </button>

            {/* Circular Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/40 relative shadow-md shadow-purple-500/10">
              <Image
                src="/avatar.svg"
                alt="Justin Avatar"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-6">
          {/* =====================================================================
              SECTION 2: PERSONAL GREETING / HERO
             ===================================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {greetingText},{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent font-extrabold">
                    Justin
                  </span>{' '}
                  👋
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                <span className="hidden sm:inline"> • Plan • Study • Build • Grow</span>
              </p>
            </div>

            {/* Academic Info Badges */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14182A] border border-slate-700/60 text-xs font-semibold text-slate-300 shadow-sm">
                <GraduationCap size={13} className="text-purple-400" />
                <span>{academicProfile.studentInfo?.batch || 'S1 CSE-3'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14182A] border border-slate-700/60 text-xs font-semibold text-slate-300 shadow-sm">
                <MapPin size={13} className="text-purple-400" />
                <span>{academicProfile.studentInfo?.room || 'AD 207'} • Group A</span>
              </span>
            </div>
          </div>

          {/* =====================================================================
              SECTION 3: CINEMATIC MOUNTAIN BANNER
             ===================================================================== */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#0e0e22] min-h-[120px] sm:min-h-[145px] flex items-center">
            {/* Mountain Sunset Background SVG */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-90 transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('/mountain-banner.svg')` }}
            />

            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B16]/90 via-[#080B16]/50 to-transparent pointer-events-none" />

            {/* Banner Quote Content */}
            <div className="relative z-10 px-5 sm:px-7 py-4 flex items-center justify-between w-full">
              <div className="flex items-center gap-3.5 max-w-lg">
                <div className="w-1 h-9 sm:h-11 bg-purple-500 rounded-full shrink-0 shadow-lg shadow-purple-500/50" />
                <div>
                  <p className="text-sm sm:text-base font-semibold text-white tracking-wide leading-snug drop-shadow-md">
                    &ldquo;Small consistent efforts
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white tracking-wide leading-snug drop-shadow-md">
                    build a big version of you.&rdquo;
                  </p>
                </div>
              </div>

              {/* Desktop Badges on Right of Mountain Banner */}
              <div className="hidden md:flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
                  🎓 {academicProfile.studentInfo?.batch || 'S1 CSE-3'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
                  📍 {academicProfile.studentInfo?.room || 'AD 207'} • Group A
                </span>
              </div>
            </div>
          </div>

          {/* =====================================================================
              SECTION 4: 4 QUICK ACCESS CARDS
             ===================================================================== */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Timetable */}
              <Link
                href="/academics?tab=timetable"
                onClick={() => triggerHaptic('light')}
                className="group p-4 rounded-2xl bg-[#14182A] border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg flex flex-col justify-between h-28"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                    <span>Timetable</span>
                    {isShowingTomorrow && (
                      <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
                        🎒 {activeScheduleDay.slice(0, 3)}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {isShowingTomorrow
                      ? `Tomorrow: ${displayTimetable.periods.length} Periods (${activeScheduleDay.slice(0, 3)}) →`
                      : `Today: ${displayTimetable.periods.length} Periods (${activeScheduleDay.slice(0, 3)}) →`}
                  </p>
                </div>
              </Link>

              {/* Card 2: Mess Menu */}
              <Link
                href="/academics?tab=mess"
                onClick={() => triggerHaptic('light')}
                className="group p-4 rounded-2xl bg-[#14182A] border border-slate-700/50 hover:border-amber-500/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg flex flex-col justify-between h-28"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Mess Menu
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    4 Meals (Guruvayur) →
                  </p>
                </div>
              </Link>

              {/* Card 3: Work & Goals */}
              <Link
                href="/personal"
                onClick={() => triggerHaptic('light')}
                className="group p-4 rounded-2xl bg-[#14182A] border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg flex flex-col justify-between h-28"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Work &amp; Goals
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {displayHomework.length} Tasks Pending →
                  </p>
                </div>
              </Link>

              {/* Card 4: Daily Routine */}
              <Link
                href="/academics?tab=scheduler"
                onClick={() => triggerHaptic('light')}
                className="group p-4 rounded-2xl bg-[#14182A] border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg flex flex-col justify-between h-28"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Daily Routine
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Hour-by-Hour Plan →
                  </p>
                </div>
              </Link>
            </div>

            {/* Mobile Carousel Indicator Dots */}
            <div className="flex md:hidden items-center justify-center gap-1.5 mt-3">
              <span className="w-4 h-1.5 rounded-full bg-purple-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            </div>
          </div>

          {/* =====================================================================
              SECTION 6: UPCOMING EXAMS HUB (Next 3 Targets in 1 Row as 3 Columns)
             ===================================================================== */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-rose-500/30 p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white tracking-tight">Upcoming Exam Targets</h2>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      Next 3 Exams
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Active Examination Schedule • Live Countdown per Exam
                  </p>
                </div>
              </div>

              <Link
                href="/academics?tab=exams"
                onClick={() => triggerHaptic('light')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors self-start sm:self-auto px-1 py-0.5"
              >
                <span>View All 8 Exams</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* 3 Columns in One Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 pt-3 sm:pt-4">
              {upcoming3Exams.map((exam, i) => {
                const cd = getExamCountdown(exam.date, exam.time);
                return (
                  <div
                    key={exam.id}
                    className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e1224] border transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px] sm:h-44 ${
                      i === 0
                        ? 'border-rose-500/40 shadow-lg shadow-rose-950/20'
                        : i === 1
                        ? 'border-purple-500/30'
                        : 'border-blue-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-1">
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider border truncate ${
                            exam.type === 'practical'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {exam.type}
                        </span>
                        <span className="text-[9px] sm:text-[11px] font-mono font-semibold text-slate-300 shrink-0">
                          {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="text-[11px] sm:text-sm font-bold text-white line-clamp-2 leading-tight">
                        {exam.subject}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-1 truncate hidden sm:block">
                        {exam.courseCode} • {exam.batch || 'Batch 1'}
                      </p>
                    </div>

                    {/* Individual Countdown Boxes */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center font-mono pt-1.5 sm:pt-2 border-t border-slate-800/80">
                      <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-[#080B16] border border-slate-800">
                        <span className="text-xs sm:text-sm font-black text-rose-300 block">{cd.days}</span>
                        <span className="text-[7px] sm:text-[8px] uppercase font-sans text-slate-400 font-semibold">Days</span>
                      </div>
                      <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-[#080B16] border border-slate-800">
                        <span className="text-xs sm:text-sm font-black text-rose-300 block">{cd.hours}</span>
                        <span className="text-[7px] sm:text-[8px] uppercase font-sans text-slate-400 font-semibold">Hrs</span>
                      </div>
                      <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-[#080B16] border border-slate-800">
                        <span className="text-xs sm:text-sm font-black text-rose-300 block">{cd.minutes}</span>
                        <span className="text-[7px] sm:text-[8px] uppercase font-sans text-slate-400 font-semibold">Mins</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =====================================================================
              TWO-COLUMN RESPONSIVE LAYOUT
              Left: Schedule + Mess Menu + Quick Tools
              Right: Upcoming/Focus + Exam Hub + Streak + Notes
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* -------------------------------------------------------------------
                LEFT COLUMN (Span 7 on lg)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-6">
              {/* SECTION 5: TODAY'S / TOMORROW'S SCHEDULE */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-slate-700/50 p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isShowingTomorrow ? 'bg-purple-500/25 text-purple-300 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white tracking-tight">
                          {isShowingTomorrow ? "Tomorrow's Schedule" : "Today's Schedule"}
                        </h2>
                        {isShowingTomorrow && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300 shadow-sm animate-pulse">
                            🎒 Pack Bag Mode • {activeScheduleDay}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isShowingTomorrow
                          ? `College finished at 3:45 PM • Showing ${activeScheduleDay} schedule to pack bag & prepare`
                          : `Room AD 207 • Group A • ${activeScheduleDay}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Schedule Mode Toggles: Tomorrow (Pack) | Today | Week */}
                    <div className="flex items-center bg-[#0e1120] p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setScheduleTab('tomorrow');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                          isShowingTomorrow && scheduleTab !== 'week'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Tomorrow</span>
                        {isAfter4PM && <span className="text-[9px] opacity-80 font-mono">(Pack)</span>}
                      </button>

                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setScheduleTab('today');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          !isShowingTomorrow && scheduleTab !== 'week'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Today
                      </button>

                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setScheduleTab(scheduleTab === 'week' ? 'auto' : 'week');
                          setSelectedDay(activeScheduleDay as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          scheduleTab === 'week'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Week
                      </button>
                    </div>

                    <Link
                      href="/academics?tab=timetable"
                      onClick={() => triggerHaptic('light')}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors px-1"
                    >
                      <span>View Full</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Day selector pills when 'Week' mode is selected */}
                {scheduleTab === 'week' && (
                  <div className="flex items-center gap-1.5 pt-3 pb-1 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedDay(day);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedDay === day
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-[#101426] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}

                {/* Vertical Timeline List */}
                <div className="pt-4 relative">
                  {/* Vertical line down the left */}
                  <div className="absolute left-[7px] top-6 bottom-4 w-0.5 bg-purple-500/30" />

                  <div className="space-y-3.5">
                    {displayTimetable.periods.map((period, idx) => (
                      <div key={idx} className="relative flex items-center pl-6 text-xs sm:text-sm group">
                        {/* Glowing dot on timeline */}
                        <div className="absolute left-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-[#14182A] group-hover:scale-125 transition-transform" />

                        {/* Timing */}
                        <span className="w-24 sm:w-28 text-slate-400 font-mono font-medium text-xs shrink-0">
                          {period.timeRange}
                        </span>

                        {/* Period Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] sm:text-xs font-bold mr-2.5 shrink-0">
                          P{period.periodNumber}
                        </span>

                        {/* Subject Title & Badges */}
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-100 font-medium truncate group-hover:text-purple-200 transition-colors">
                            {period.subject}
                          </span>
                          {period.isLab && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold shrink-0">
                              LAB
                            </span>
                          )}
                          {period.room && period.room !== 'AD 207' && (
                            <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08] text-[9px] font-mono shrink-0">
                              {period.room}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 7: TODAY'S / TOMORROW'S MESS MENU */}
              <div id="mess-section" className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-slate-700/50 p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Utensils size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white tracking-tight">
                          {isMessTomorrow ? "Tomorrow's Mess Menu" : "Today's Mess Menu"}
                        </h2>
                        {isMessTomorrow && (
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                            🌙 Next Meals ({activeMessDay})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Guruvayur Catering • {activeMessDay}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Mess toggles */}
                    <div className="flex items-center bg-[#0e1120] p-1 rounded-xl border border-slate-800 text-[10px] font-semibold">
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setMessTab('tomorrow');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          isMessTomorrow ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tomorrow
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setMessTab('today');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          !isMessTomorrow ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Today
                      </button>
                    </div>

                    <Link
                      href="/academics?tab=mess"
                      onClick={() => triggerHaptic('light')}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors px-1"
                    >
                      <span>All 7 Days</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* 4 Meal Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                  {/* Breakfast */}
                  <div className="p-3 rounded-xl bg-[#101426] border border-slate-800/80 hover:border-amber-500/30 transition-all flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Breakfast</span>
                      <Sun size={14} className="text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block truncate">
                        {displayMess.breakfast.items[0] || 'Poori Masala'}
                      </span>
                      <span className="text-[10px] text-amber-400/90 font-mono font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {displayMess.breakfast.time}
                      </span>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="p-3 rounded-xl bg-[#101426] border border-slate-800/80 hover:border-emerald-500/30 transition-all flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Lunch</span>
                      <ChefHat size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block truncate">
                        {displayMess.lunch.items[0] || 'Meals'}
                      </span>
                      <span className="text-[10px] text-emerald-400/90 font-mono font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {displayMess.lunch.time}
                      </span>
                    </div>
                  </div>

                  {/* Tea & Snacks */}
                  <div className="p-3 rounded-xl bg-[#101426] border border-slate-800/80 hover:border-purple-500/30 transition-all flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Tea &amp; Snacks</span>
                      <Coffee size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block truncate">
                        {displayMess.snacks.items[0] || 'Tea, Snacks'}
                      </span>
                      <span className="text-[10px] text-purple-400/90 font-mono font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {displayMess.snacks.time}
                      </span>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="p-3 rounded-xl bg-[#101426] border border-slate-800/80 hover:border-blue-500/30 transition-all flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Dinner</span>
                      <Utensils size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block truncate">
                        {displayMess.dinner.items[0] || 'CKN / Veg Biryani'}
                      </span>
                      <span className="text-[10px] text-blue-400/90 font-mono font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {displayMess.dinner.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK TOOLS (Desktop specific from reference, also responsive on mobile) */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-slate-700/50 p-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={16} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Quick Tools</h3>
                  </div>
                  <Link
                    href="/academics?tab=tools"
                    onClick={() => triggerHaptic('light')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <span>All Tools</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-2.5 pt-3">
                  <Link
                    href="/academics?tab=syllabus"
                    onClick={() => triggerHaptic('light')}
                    className="p-3 rounded-xl bg-[#101426] border border-slate-800 hover:border-purple-500/40 text-center group transition-all"
                  >
                    <BookOpen size={18} className="mx-auto text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-slate-200 block">S1 Syllabus</span>
                  </Link>

                  <Link
                    href="/academics?tab=atlas"
                    onClick={() => triggerHaptic('light')}
                    className="p-3 rounded-xl bg-[#101426] border border-slate-800 hover:border-emerald-500/40 text-center group transition-all"
                  >
                    <FileText size={18} className="mx-auto text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-slate-200 block">PYQs</span>
                  </Link>

                  <Link
                    href="/academics?tab=tools"
                    onClick={() => triggerHaptic('light')}
                    className="p-3 rounded-xl bg-[#101426] border border-slate-800 hover:border-blue-500/40 text-center group transition-all"
                  >
                    <Calculator size={18} className="mx-auto text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-slate-200 block">Calc</span>
                  </Link>

                  <Link
                    href="/academics?tab=performance"
                    onClick={() => triggerHaptic('light')}
                    className="p-3 rounded-xl bg-[#101426] border border-slate-800 hover:border-amber-500/40 text-center group transition-all"
                  >
                    <TrendingUp size={18} className="mx-auto text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-slate-200 block">CGPA</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                RIGHT COLUMN (Span 5 on lg)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-6">
              {/* SECTION 6: STUDY STREAK (Data-Driven from careerProfile.dailyLogs & academicProfile.homework) */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-emerald-500/30 p-5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Flame size={16} className="fill-emerald-400/30" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Study Streak</h3>
                      <p className="text-[10px] text-slate-400">Consistent Daily Progress</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/40 bg-emerald-500/10">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white tracking-tight font-mono">
                        {streakCount}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Days
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      Keep it going! 🔥
                    </p>
                  </div>

                  {/* GitHub/LeetCode Style Real 28-Day Heatmap (4 rows of 7 days) */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-slate-400 text-center">
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                      <span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {heatmapData.map((day) => (
                        <div
                          key={day.dateStr}
                          title={`${day.dateStr}: ${day.count} activities completed`}
                          className={`w-3 h-3 rounded-sm ${day.intensity} transition-transform hover:scale-125 cursor-pointer`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">Nov 12 – Nov 23 Active Streak</span>
                  <Link
                    href="/career"
                    onClick={() => triggerHaptic('light')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>View Logs</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* SECTION 8A: UPCOMING / FOCUS */}
              <div id="focus-section" className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-slate-700/50 p-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Upcoming / Focus</h3>
                  </div>

                  <Link
                    href="/academics?tab=homework"
                    onClick={() => triggerHaptic('light')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="space-y-2.5 pt-3">
                  {displayHomework.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        triggerHaptic('light');
                        toggleHomework(task.id);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#101426] border border-slate-800/80 hover:border-slate-700 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            task.completed
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-600 group-hover:border-purple-400'
                          }`}
                        >
                          {task.completed && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span
                          className={`text-xs font-medium truncate ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold ml-2 shrink-0 ${
                          task.dueDate === '2026-11-23'
                            ? 'text-rose-400'
                            : task.dueDate === '2026-11-24'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {task.dueDate.replace('2026-', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8B: NOTES & SCRATCHPAD */}
              <div id="notes-section" className="rounded-2xl sm:rounded-3xl bg-[#14182A] border border-slate-700/50 p-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Notes</h3>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setShowNewNoteModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1 transition-all"
                    title="New Note"
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline">New Note</span>
                  </button>
                </div>

                <div className="space-y-2 pt-3">
                  {notes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-[#101426] border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-2 group transition-all"
                    >
                      <div
                        onClick={() => setSelectedNote(note)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      >
                        <FileText size={14} className="text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-purple-300 transition-colors">
                            {note.title}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {note.category || 'Academic'}
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuNoteId(activeMenuNoteId === note.id ? null : note.id);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/[0.05]"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {/* Note Context Menu */}
                        {activeMenuNoteId === note.id && (
                          <div className="absolute right-0 top-6 w-28 bg-[#1a1f36] border border-slate-700 rounded-xl shadow-2xl p-1 z-30 space-y-1">
                            <button
                              onClick={() => handleTogglePin(note.id)}
                              className="w-full text-left px-2 py-1 text-[11px] text-slate-300 hover:bg-white/[0.08] rounded flex items-center gap-1.5"
                            >
                              <Pin size={11} /> {note.pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="w-full text-left px-2 py-1 text-[11px] text-rose-400 hover:bg-rose-500/10 rounded flex items-center gap-1.5"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 9: FIXED FLOATING BOTTOM NAVIGATION (Mobile Capsule)
         ========================================================================= */}
      <div className="lg:hidden fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40 bg-[#0e1224]/90 backdrop-blur-2xl border border-slate-700/50 rounded-full px-3 py-2 shadow-2xl flex items-center justify-between">
        <Link
          href="/"
          onClick={() => triggerHaptic('light')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/30 text-[10px] font-bold"
        >
          <Home size={16} />
          <span>Home</span>
        </Link>

        <Link
          href="/academics"
          onClick={() => triggerHaptic('light')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-slate-400 hover:text-white text-[10px] font-medium"
        >
          <BookOpen size={16} />
          <span>Academics</span>
        </Link>

        <Link
          href="/academics?tab=timetable"
          onClick={() => triggerHaptic('light')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-slate-400 hover:text-white text-[10px] font-medium"
        >
          <Calendar size={16} />
          <span>Planner</span>
        </Link>

        <Link
          href="/academics?tab=tools"
          onClick={() => triggerHaptic('light')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-slate-400 hover:text-white text-[10px] font-medium"
        >
          <LayoutGrid size={16} />
          <span>Tools</span>
        </Link>

        <Link
          href="/career"
          onClick={() => triggerHaptic('light')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-slate-400 hover:text-white text-[10px] font-medium"
        >
          <TrendingUp size={16} />
          <span>Growth</span>
        </Link>
      </div>

      {/* =========================================================================
          SLIDE-IN MOBILE NAVIGATION DRAWER
         ========================================================================= */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-4/5 max-w-xs bg-[#0A0D1D] border-r border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="relative h-10 w-40 flex items-center">
                    <Image
                      src="/logo.png"
                      alt="NexDev Logo"
                      fill
                      sizes="180px"
                      className="object-contain object-left"
                    />
                  </div>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#14182A] border border-slate-700/50 space-y-1">
                  <span className="text-xs font-bold text-white block">Justin</span>
                  <span className="text-[11px] text-slate-400 block">
                    {academicProfile.studentInfo?.batch || 'S1 CSE-3'} • {academicProfile.studentInfo?.room || 'AD 207'}
                  </span>
                </div>

                <nav className="space-y-1 text-sm font-medium">
                  <Link
                    href="/"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-600 text-white font-bold"
                  >
                    <Home size={18} />
                    <span>Home Dashboard</span>
                  </Link>

                  <Link
                    href="/academics"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.05]"
                  >
                    <GraduationCap size={18} className="text-purple-400" />
                    <span>Academic OS</span>
                  </Link>

                  <Link
                    href="/personal"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.05]"
                  >
                    <Sparkles size={18} className="text-blue-400" />
                    <span>Personal Growth OS</span>
                  </Link>

                  <Link
                    href="/career"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.05]"
                  >
                    <TrendingUp size={18} className="text-emerald-400" />
                    <span>Big Tech Career Hub</span>
                  </Link>

                  <Link
                    href="/academics?tab=atlas"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.05]"
                  >
                    <Layers size={18} className="text-cyan-400" />
                    <span>Chemistry PYQ Atlas</span>
                  </Link>

                  <Link
                    href="/academics?tab=timetable"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.05]"
                  >
                    <Calendar size={18} className="text-amber-400" />
                    <span>Class Timetable</span>
                  </Link>

                  <Link
                    href="/academics?tab=mess"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.05]"
                  >
                    <Utensils size={18} className="text-rose-400" />
                    <span>Hostel Mess Menu</span>
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>JKTools v2.6 • SCMS Autonomous</span>
                {authChecked && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsMobileDrawerOpen(false);
                      openUnlockModal();
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors ${
                      isCloudLocked
                        ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                        : 'bg-white/[0.04] border-white/[0.08] text-emerald-400'
                    }`}
                  >
                    {isCloudLocked ? <Lock size={11} /> : <ShieldCheck size={11} />}
                    <span>{isCloudLocked ? 'Unlock' : 'Synced'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          NEW NOTE MODAL
         ========================================================================= */}
      <AnimatePresence>
        {showNewNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewNoteModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#14182A] border border-slate-700 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />
                  <span>Create Quick Note</span>
                </h3>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workshop Lab Viva Questions"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-[#0d1122] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full bg-[#0d1122] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="career">Career</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write key equations, reminders, ideas..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full bg-[#0d1122] border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewNoteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW NOTE MODAL
         ========================================================================= */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#14182A] border border-slate-700 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                    {selectedNote.category || 'Academic'} Note
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedNote.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-[#0d1122] p-4 rounded-xl border border-slate-800">
                {selectedNote.content}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                <span>{new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 size={13} />
                  <span>Delete Note</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}