'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Flame,
  Calendar,
  Clock,
  Utensils,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Pin,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useAcademics } from '@/hooks/useAcademics';
import { useCareer } from '@/hooks/useCareer';
import { getHubNotes, saveHubNotes, HubNote } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptics';
import { DayOfWeek } from '@/lib/academicTypes';

export default function HomePage() {
  const {
    profile: academicProfile,
    loaded: academicLoaded,
    timetable,
    earliestExam,
    getCurrentPeriodInfo,
  } = useAcademics();

  const { profile: careerProfile, loaded: careerLoaded, getTodayLog, toggleDailyTask } = useCareer();

  // Notes state
  const [notes, setNotes] = useState<HubNote[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'academic' | 'career' | 'general' | 'urgent'>('academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);

  // Today dynamic quick view modal / section state
  const [activeDayView, setActiveDayView] = useState<'none' | 'timetable' | 'mess' | 'work' | 'scheduler'>('none');

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setNotes(getHubNotes());
    return () => clearInterval(timer);
  }, []);

  const isLoaded = academicLoaded && careerLoaded;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wide">
            Initializing NexDev Home Command Hub...
          </p>
        </div>
      </div>
    );
  }

  // Current Day info
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = days[currentTime.getDay()];
  const isWeekend = todayDayName === 'Saturday' || todayDayName === 'Sunday';

  const todayTimetable = timetable.find((t) => t.day === todayDayName);
  const todayMess = academicProfile.messMenu.find((m) => m.day === todayDayName);
  const radarInfo = getCurrentPeriodInfo();

  // Homework due today or tomorrow
  const todayStr = currentTime.toISOString().split('T')[0];
  const pendingHomework = academicProfile.homework.filter((h) => !h.completed);

  // Career checklist for today
  const todayCareerLog = getTodayLog();

  // Notes actions
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const newNote: HubNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
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
    triggerHaptic('light');
  };

  const handleTogglePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
    setNotes(updated);
    saveHubNotes(updated);
    triggerHaptic('light');
  };

  // Exam countdown helper
  const getExamCountdown = (targetDateStr: string, timeStr?: string) => {
    let targetTime = '09:30:00';
    if (timeStr && timeStr.includes(':')) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        targetTime = `${match[1].padStart(2, '0')}:${match[2]}:00`;
      }
    }
    const examDateTime = new Date(`${targetDateStr}T${targetTime}+05:30`);
    const diffMs = examDateTime.getTime() - currentTime.getTime();

    if (diffMs <= 0) return { isToday: true, isPast: false, days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { isToday: false, isPast: false, days, hours, minutes };
  };

  const examCD = earliestExam ? getExamCountdown(earliestExam.date, earliestExam.time) : null;

  // Filter notes
  const filteredNotes = notes
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      {/* 1. TOP HEADER & LIVE IST CLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              jkjtools.earth • Home Hub
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            NexDev Mission Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Central Command • Select a Portal or Inspect Today&apos;s Operations
          </p>
        </div>

        {/* Live IST Clock Card */}
        <div className="flex items-center gap-3 bg-[#070914] px-4 py-2.5 rounded-2xl border border-white/[0.08] self-start md:self-auto shadow-lg">
          <Clock size={16} className="text-purple-400" />
          <div>
            <div className="text-xs font-mono font-bold text-white">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </div>
            <div className="text-[10px] text-purple-300/80 font-bold">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Next Exam Banner */}
      {earliestExam && examCD && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#070a14] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/40 text-[10px] animate-pulse flex items-center gap-1">
              <AlertTriangle size={11} /> UPCOMING EXAM
            </span>
            <span className="text-white font-bold">{earliestExam.subject}</span>
            <span className="text-slate-400">({earliestExam.date})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-purple-300 font-bold">
              {examCD.days}d {examCD.hours}h {examCD.minutes}m remaining
            </span>
            <Link
              href="/academics?tab=exams"
              onClick={() => triggerHaptic('light')}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2 ml-1"
            >
              View Schedule →
            </Link>
          </div>
        </div>
      )}

      {/* 2. THE 2 MASTER DESTINATION GATEWAY BUTTONS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-400" /> Select Your Portal
          </h2>
          <span className="text-xs text-slate-500">2 Independent Apps</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* OPTION 1: ACADEMICS PORTAL */}
          <Link
            href="/academics"
            onClick={() => triggerHaptic('medium')}
            className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-purple-950/40 via-[#0d1024] to-[#070914] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_12px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                  <GraduationCap size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                  PORTAL 1
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-purple-200 transition-colors">
                  Go to Academics OS
                </h3>
                <p className="text-xs text-purple-300/80 font-medium mt-1">
                  SCMS School of Engineering & Technology (S1 CSE-3 • Room AD 207)
                </p>
              </div>

              <p className="text-xs text-slate-300/80 leading-relaxed">
                Period-by-period class timetable, 9 upcoming practical & theory exams countdown, full S1 syllabus topic tracker, daily hostel mess menu & 75% attendance rule compliance.
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  Launch Academic OS <ArrowRight size={14} />
                </span>
                <span className="text-[10px] text-slate-500 font-mono">jkjtools.earth/academics</span>
              </div>
            </div>
          </Link>

          {/* OPTION 2: PERSONAL GROWTH PORTAL */}
          <Link
            href="/personal"
            onClick={() => triggerHaptic('medium')}
            className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-950/40 via-[#091228] to-[#070914] border border-blue-500/30 hover:border-blue-500/60 shadow-[0_12px_40px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                  <Flame size={24} className="fill-white" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                  PORTAL 2
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-200 transition-colors">
                  Go to Personal OS
                </h3>
                <p className="text-xs text-blue-300/80 font-medium mt-1">
                  Big Tech Career Mission Control & Habit Tracking Engine
                </p>
              </div>

              <p className="text-xs text-slate-300/80 leading-relaxed">
                Daily habits streak tracker, FAANG placement 18-month journey with DSA problem logging, core CS concepts, daily screen time tracker, curated tech news & AI growth coach.
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  Launch Personal OS <ArrowRight size={14} />
                </span>
                <span className="text-[10px] text-slate-500 font-mono">jkjtools.earth/personal</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. TODAY'S DYNAMIC QUICK ACTIONS (E.G. TUESDAY / TODAY'S OVERVIEW) */}
      <GlassCard className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              <span>Today&apos;s Quick Operations — {todayDayName}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any quick action below to immediately inspect today&apos;s schedule, food, tasks or hour-by-hour timeline
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-purple-300 self-start sm:self-auto">
            {isWeekend ? 'Weekend Mode' : 'AD 207 • Batch 1'}
          </span>
        </div>

        {/* 4 Interactive Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Button 1: Today's Timetable */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveDayView(activeDayView === 'timetable' ? 'none' : 'timetable');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
              activeDayView === 'timetable'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Calendar size={18} className={activeDayView === 'timetable' ? 'text-white' : 'text-purple-400'} />
              <span className="text-[10px] font-mono font-bold opacity-80">AD 207</span>
            </div>
            <div>
              <span className="text-xs font-bold block">Today&apos;s Timetable</span>
              <span className="text-[10px] opacity-75">
                {isWeekend ? 'No classes' : `${todayTimetable?.periods.length || 7} Periods`}
              </span>
            </div>
          </button>

          {/* Button 2: Today's Mess Food */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveDayView(activeDayView === 'mess' ? 'none' : 'mess');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
              activeDayView === 'mess'
                ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Utensils size={18} className={activeDayView === 'mess' ? 'text-white' : 'text-amber-400'} />
              <span className="text-[10px] font-mono font-bold opacity-80">Hostel</span>
            </div>
            <div>
              <span className="text-xs font-bold block">Today&apos;s Mess Food</span>
              <span className="text-[10px] opacity-75">4 Daily Meals</span>
            </div>
          </button>

          {/* Button 3: Today's Work & Goals */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveDayView(activeDayView === 'work' ? 'none' : 'work');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
              activeDayView === 'work'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <CheckSquare size={18} className={activeDayView === 'work' ? 'text-white' : 'text-emerald-400'} />
              <span className="text-[10px] font-mono font-bold opacity-80">Pending</span>
            </div>
            <div>
              <span className="text-xs font-bold block">Today&apos;s Work & Goals</span>
              <span className="text-[10px] opacity-75">
                {pendingHomework.length} HW tasks
              </span>
            </div>
          </button>

          {/* Button 4: Daily Scheduler */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveDayView(activeDayView === 'scheduler' ? 'none' : 'scheduler');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
              activeDayView === 'scheduler'
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Clock size={18} className={activeDayView === 'scheduler' ? 'text-white' : 'text-blue-400'} />
              <span className="text-[10px] font-mono font-bold opacity-80">Routine</span>
            </div>
            <div>
              <span className="text-xs font-bold block">Daily Scheduler</span>
              <span className="text-[10px] opacity-75">Hour-by-Hour Plan</span>
            </div>
          </button>
        </div>

        {/* Dynamic Display Drawer for the clicked button */}
        <AnimatePresence>
          {activeDayView !== 'none' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-4 border-t border-white/[0.06] overflow-hidden"
            >
              {/* VIEW 1: TIMETABLE */}
              {activeDayView === 'timetable' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      {todayDayName} Class Schedule (Room AD 207)
                    </h4>
                    <Link
                      href="/academics?tab=timetable"
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold"
                    >
                      Open Full Timetable →
                    </Link>
                  </div>

                  {isWeekend ? (
                    <p className="text-xs text-slate-400 py-3">
                      It is {todayDayName}! No regular college classes scheduled. Enjoy your weekend study & rest!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {todayTimetable?.periods.map((p) => (
                        <div
                          key={p.periodNumber}
                          className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-purple-300 font-bold">P{p.periodNumber}: </span>
                            <span className="font-bold text-white">{p.subject}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{p.timeRange}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: MESS FOOD */}
              {activeDayView === 'mess' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {todayDayName} Hostel Mess Menu (SCMS Men&apos;s Hostel)
                    </h4>
                    <Link
                      href="/academics?tab=mess"
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                    >
                      Open Full Mess Menu →
                    </Link>
                  </div>

                  {todayMess && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] font-bold uppercase text-amber-400 block">🍳 Breakfast</span>
                        <p className="font-semibold text-white mt-0.5">{todayMess.breakfast.items.join(', ')}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">{todayMess.breakfast.time}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 block">🍛 Lunch</span>
                        <p className="font-semibold text-white mt-0.5">{todayMess.lunch.items.join(', ')}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">{todayMess.lunch.time}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] font-bold uppercase text-purple-400 block">☕ Evening Snacks</span>
                        <p className="font-semibold text-white mt-0.5">{todayMess.snacks.items.join(', ')}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">{todayMess.snacks.time}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] font-bold uppercase text-blue-400 block">🍲 Dinner</span>
                        <p className="font-semibold text-white mt-0.5">{todayMess.dinner.items.join(', ')}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">{todayMess.dinner.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 3: WORK & GOALS */}
              {activeDayView === 'work' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Today&apos;s Homework Submissions & Placement Tasks
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Academic Homework */}
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                      <span className="font-bold text-purple-300 block">Academic Tasks Due:</span>
                      {pendingHomework.length === 0 ? (
                        <p className="text-slate-400">All homework completed! No pending assignments.</p>
                      ) : (
                        pendingHomework.slice(0, 3).map((hw) => (
                          <div key={hw.id} className="flex items-center justify-between text-white">
                            <span>• {hw.title}</span>
                            <span className="text-[10px] font-mono text-purple-300">{hw.dueDate}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Placement Checklist */}
                    <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-2">
                      <span className="font-bold text-blue-300 block">Placement Daily Checklist:</span>
                      {[
                        { key: 'dsaSolved', label: '1+ DSA Problem (LeetCode/GFG)' },
                        { key: 'coreConcept', label: '1 Core CS Topic (OS/DBMS/CN)' },
                        { key: 'devTime', label: 'Project Dev Time' },
                      ].map(({ key, label }) => {
                        const isDone = !!(todayCareerLog?.checklist && (todayCareerLog.checklist as any)[key]);
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              triggerHaptic('light');
                              toggleDailyTask(todayStr, key as any);
                            }}
                            className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300"
                          >
                            <CheckCircle2 size={13} className={isDone ? 'text-emerald-400' : 'text-slate-500'} />
                            <span className={isDone ? 'line-through text-slate-500' : ''}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4: DAILY SCHEDULER */}
              {activeDayView === 'scheduler' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Optimal Daily Routine & Schedule
                  </h4>

                  <div className="space-y-2 text-xs">
                    {[
                      { time: '07:30 AM – 08:30 AM', title: 'Breakfast & Morning Routine', desc: 'Hostel mess breakfast & prep for college.' },
                      { time: '08:45 AM – 11:30 AM', title: 'College Morning Lectures (Room AD 207)', desc: 'Calculus, Engineering Graphics, or Chemistry.' },
                      { time: '11:30 AM – 12:15 PM', title: 'Hostel Lunch Break', desc: 'Nutritious lunch & power recharge.' },
                      { time: '12:15 PM – 03:45 PM', title: 'Afternoon Lectures & Practical Labs', desc: 'Programming in C Lab, Electrical/Electronics workshop.' },
                      { time: '04:30 PM – 05:30 PM', title: 'Evening Tea, Snacks & Physical Workout', desc: 'Hostel tea break + workout / push-up routine.' },
                      { time: '05:30 PM – 07:30 PM', title: 'Big Tech Placement Prep Session', desc: '1-2 DSA LeetCode problems + 1 Core CS concept revision.' },
                      { time: '07:30 PM – 08:30 PM', title: 'Dinner at Mess & Relaxation', desc: 'Evening meal & social winding down.' },
                      { time: '08:30 PM – 10:30 PM', title: 'Academic Homework & Semester Exam Prep', desc: 'Lab record completion, calculus practice, textbook reading.' },
                      { time: '10:30 PM – 11:00 PM', title: 'Daily Review, Habit Check & Screen Time Log', desc: 'NexDev check-off, journaling & peaceful sleep.' },
                    ].map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white">{slot.title}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{slot.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono text-blue-300/80 whitespace-nowrap ml-3">
                          {slot.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* 4. FULL-FEATURED NOTES APP & DAILY SCRATCHPAD */}
      <GlassCard className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-purple-400" />
              <span>Daily Notes & Scratchpad App</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quickly jot down lecture notes, lab instructions, DSA algorithmic hints or personal reminders
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-8 pr-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 w-36 sm:w-48"
              />
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setShowNewNoteModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-600/30 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-white/[0.01] border border-white/[0.04] rounded-2xl">
              <p className="text-xs text-slate-400">No notes found. Click &quot;New Note&quot; to create your first note!</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  note.pinned
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-sm shadow-purple-500/10'
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        note.category === 'academic'
                          ? 'bg-purple-500/20 text-purple-300'
                          : note.category === 'career'
                          ? 'bg-blue-500/20 text-blue-300'
                          : note.category === 'urgent'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-white/[0.05] text-slate-400'
                      }`}
                    >
                      {note.category || 'General'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className={`p-1 rounded-lg hover:bg-white/[0.06] ${
                          note.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                      >
                        <Pin size={13} className={note.pinned ? 'fill-amber-400' : ''} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.06]"
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{note.title}</h4>
                  <p className="text-xs text-slate-300/80 whitespace-pre-line line-clamp-3">
                    {note.content}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-white/[0.04]">
                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* New Note Modal */}
      <AnimatePresence>
        {showNewNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#070914] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  Create New Note
                </h3>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Note Title *</label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. C Programming Lab Experiment 5 notes"
                    className="w-full mt-1 px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-[#0d1020] border border-white/[0.08] rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="academic">Academic (College / Exams / Lab)</option>
                    <option value="career">Career (DSA / Big Tech / Dev)</option>
                    <option value="urgent">Urgent / Priority Reminder</option>
                    <option value="general">General Idea</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Note Content</label>
                  <textarea
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write details, key formulas, problem links, or thoughts here..."
                    className="w-full mt-1 px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowNewNoteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-90"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
