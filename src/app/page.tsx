'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Flame,
  Calendar,
  Clock,
  CheckSquare,
  AlertTriangle,
  BookOpen,
  Utensils,
  Smartphone,
  Newspaper,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Target,
  Zap,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useAcademics } from '@/hooks/useAcademics';
import { useHabits } from '@/hooks/useHabits';
import { useCareer } from '@/hooks/useCareer';
import { getScreenTime } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptics';

export default function GlobalCommandHub() {
  const {
    profile: academicProfile,
    loaded: academicLoaded,
    earliestExam,
    getCurrentPeriodInfo,
    toggleHomework,
    updateQuickNotes,
  } = useAcademics();

  const { habits, loaded: habitsLoaded, toggleCompletion } = useHabits();
  const { profile: careerProfile, loaded: careerLoaded, toggleDailyTask, getTodayLog, getJourneyStats } = useCareer();
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(0);

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const screenEntries = getScreenTime();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = screenEntries.find((e) => e.date === todayStr);
    if (todayEntry) setScreenTimeMinutes(todayEntry.totalMinutes);

    return () => clearInterval(timer);
  }, []);

  const isLoaded = academicLoaded && habitsLoaded && careerLoaded;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wide">
            Initializing Dual-Portal Command Hub...
          </p>
        </div>
      </div>
    );
  }

  const radarInfo = getCurrentPeriodInfo();
  const journeyStats = getJourneyStats();
  const todayHabits = habits.filter((h) => h.frequency === 'daily');
  const completedHabitsCount = todayHabits.filter((h) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return !!(h.completions && h.completions[todayStr]);
  }).length;

  const todayCareerLog = getTodayLog();
  const completedCareerTasks = todayCareerLog?.checklist
    ? Object.values(todayCareerLog.checklist).filter((v) => Boolean(v)).length
    : 0;

  // Tomorrow string
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const pendingHomework = academicProfile.homework.filter((h) => !h.completed);

  // Countdown helper
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

    if (diffMs <= 0) {
      return { isToday: true, isPast: false, days: 0, hours: 0, minutes: 0, text: 'Happening Today!' };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { isToday: false, isPast: false, days, hours, minutes, seconds, text: `${days}d ${hours}h ${minutes}m` };
  };

  const nextExamCountdown = earliestExam ? getExamCountdown(earliestExam.date, earliestExam.time) : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Top Welcome & IST Clock Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              jkjtools.earth • Command Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
            NexDev Mission Control
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            SCMS B.Tech CSE Scholar (S1 CSE-3) • Dual Engine Architecture
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#070914] px-4 py-2.5 rounded-2xl border border-white/[0.08] self-start md:self-auto">
          <Clock size={16} className="text-purple-400" />
          <div>
            <div className="text-xs font-mono font-bold text-white">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Exam Live Radar Ticker */}
      {earliestExam && nextExamCountdown && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#070a14] border border-purple-500/30 shadow-[0_8px_32px_rgba(168,85,247,0.15)] backdrop-blur-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/40 animate-pulse flex items-center gap-1">
                  <AlertTriangle size={11} /> URGENT EXAM RADAR
                </span>
                <span className="text-xs text-purple-300 font-mono font-bold">
                  {earliestExam.type.toUpperCase()} • {earliestExam.date}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {earliestExam.subject}
              </h3>
              <p className="text-xs text-slate-400">
                {earliestExam.batch || 'S1 CSE-3'} • {earliestExam.time} • Room: {earliestExam.room || 'SCMS Exam Hall'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-black/50 px-4 py-2.5 rounded-2xl border border-white/[0.08] text-right font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Time Remaining</span>
                <span className="text-lg sm:text-xl font-black text-purple-300">
                  {nextExamCountdown.days}d {nextExamCountdown.hours}h {nextExamCountdown.minutes}m
                </span>
              </div>

              <Link
                href="/academics"
                onClick={() => triggerHaptic('light')}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <span>Exam Hub</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* THE 2 PRIMARY DUAL-PORTAL GATEWAY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPTION 1: ACADEMIC OS */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard className="p-6 relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-[#0a0d1d] to-[#05070e] shadow-[0_12px_40px_rgba(168,85,247,0.12)] h-full flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                  <GraduationCap size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                  OPTION 1
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Academic OS
                </h2>
                <p className="text-xs sm:text-sm text-purple-200/70 font-medium mt-1">
                  SCMS Autonomous 2026 • S1 CSE-3 (Room AD 207)
                </p>
              </div>

              {/* Academic Highlights */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-purple-400" /> Class Radar:
                  </span>
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {radarInfo.statusText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-400" /> Upcoming Exams:
                  </span>
                  <span className="font-semibold text-purple-300 font-mono">
                    {academicProfile.exams.length} Exams (4 Practical + 5 Theory)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-400" /> Pending Homework:
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {pendingHomework.length} tasks due
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Utensils size={14} className="text-amber-400" /> Hostel Mess:
                  </span>
                  <span className="font-semibold text-amber-300">
                    4 Meals Active (Breakfast, Lunch, Snacks, Dinner)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button & Sub-links */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <Link
                href="/academics"
                onClick={() => triggerHaptic('medium')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Enter Academic OS</span>
                <ArrowRight size={16} />
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <Link href="/academics" className="hover:text-purple-300 transition-colors">
                  Timetable (AD 207)
                </Link>
                <span>•</span>
                <Link href="/academics" className="hover:text-purple-300 transition-colors">
                  9 Exams Schedule
                </Link>
                <span>•</span>
                <Link href="/academics" className="hover:text-purple-300 transition-colors">
                  Syllabus Tracker
                </Link>
                <span>•</span>
                <Link href="/academics" className="hover:text-purple-300 transition-colors">
                  Mess Menu
                </Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* OPTION 2: PERSONAL GROWTH & BIG TECH CAREER OS */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard className="p-6 relative overflow-hidden border-blue-500/30 bg-gradient-to-br from-blue-950/20 via-[#091024] to-[#05070e] shadow-[0_12px_40px_rgba(59,130,246,0.12)] h-full flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Flame size={24} className="fill-white" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                  OPTION 2
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Personal Growth & Career OS
                </h2>
                <p className="text-xs sm:text-sm text-blue-200/70 font-medium mt-1">
                  Big Tech Placement Mission Control & Habits Engine
                </p>
              </div>

              {/* Personal Highlights */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Briefcase size={14} className="text-purple-400" /> Placement Checklist:
                  </span>
                  <span className="font-semibold text-white">
                    {completedCareerTasks}/4 daily items completed
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Flame size={14} className="text-amber-400" /> Daily Habits:
                  </span>
                  <span className="font-semibold text-amber-300">
                    {completedHabitsCount}/{todayHabits.length} habits done today
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Smartphone size={14} className="text-cyan-400" /> Screen Time:
                  </span>
                  <span className="font-semibold text-cyan-300 font-mono">
                    {Math.floor(screenTimeMinutes / 60)}h {screenTimeMinutes % 60}m logged
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-rose-400" /> Career Journey:
                  </span>
                  <span className="font-semibold text-rose-300">
                    Day {journeyStats.journeyDay} • {journeyStats.currentStreak}d Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button & Sub-links */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <Link
                href="/personal"
                onClick={() => triggerHaptic('medium')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Enter Personal Growth OS</span>
                <ArrowRight size={16} />
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <Link href="/career" className="hover:text-blue-300 transition-colors">
                  Big Tech Roadmap
                </Link>
                <span>•</span>
                <Link href="/habits" className="hover:text-blue-300 transition-colors">
                  Habits
                </Link>
                <span>•</span>
                <Link href="/screentime" className="hover:text-blue-300 transition-colors">
                  Screen Time
                </Link>
                <span>•</span>
                <Link href="/ai" className="hover:text-blue-300 transition-colors">
                  AI Coach
                </Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* TODAY'S PENDING TASKS & UNIFIED AGENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Homework & Tasks */}
        <GlassCard className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <CheckSquare size={16} />
              </div>
              <h3 className="text-base font-bold text-white">Pending Academic Homework</h3>
            </div>
            <Link
              href="/academics"
              onClick={() => triggerHaptic('light')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              Manage Tasks <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {pendingHomework.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No pending homework or teacher tasks! You are ready for tomorrow.
              </p>
            ) : (
              pendingHomework.slice(0, 4).map((hw) => (
                <div
                  key={hw.id}
                  onClick={() => {
                    triggerHaptic('light');
                    toggleHomework(hw.id);
                  }}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md border border-slate-500 hover:border-purple-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">{hw.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {hw.subject} • Due: {hw.dueDate}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      hw.priority === 'high'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {hw.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Big Tech Placement Daily Checklist */}
        <GlassCard className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <Briefcase size={16} />
              </div>
              <h3 className="text-base font-bold text-white">Placement Daily Action Plan</h3>
            </div>
            <Link
              href="/career"
              onClick={() => triggerHaptic('light')}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              Open Roadmap <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {[
              { key: 'dsaSolved', label: 'Solve & Log 1+ DSA Problem', hint: 'Arrays, Two Pointers or Trees' },
              { key: 'coreConcept', label: 'Review 1 Core CS Topic', hint: 'OS, DBMS, Networks, or OOP' },
              { key: 'devTime', label: '1 Hour of Full Stack Project Dev', hint: 'Git commit & clean code' },
              { key: 'linkedinOrNetwork', label: 'Network or Read Engineering Blog', hint: 'Meta, Uber, or Netflix tech blog' },
            ].map(({ key, label, hint }) => {
              const isChecked = !!(todayCareerLog?.checklist && (todayCareerLog.checklist as any)[key]);

              return (
                <div
                  key={key}
                  onClick={() => {
                    triggerHaptic('light');
                    const todayStr = new Date().toISOString().split('T')[0];
                    toggleDailyTask(todayStr, key as any);
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                        isChecked ? 'bg-emerald-500 text-black' : 'border border-slate-500'
                      }`}
                    >
                      <CheckCircle2 size={12} className={isChecked ? 'block' : 'hidden'} />
                    </div>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                        {label}
                      </h4>
                      <p className="text-[10px] text-slate-400">{hint}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono ${isChecked ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {isChecked ? 'DONE' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* QUICK NOTES & DAILY SCRATCHPAD */}
      <GlassCard className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-purple-400" /> Daily Scratchpad & Quick Notes
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            Synced between Academics & Personal
          </span>
        </div>
        <textarea
          rows={3}
          value={academicProfile.quickNotes || ''}
          onChange={(e) => updateQuickNotes(e.target.value)}
          placeholder="Capture quick reminders, professor instructions, code snippets, or thoughts for today..."
          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-2xl text-white text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
        />
      </GlassCard>
    </div>
  );
}
