'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Utensils,
  CheckSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  Flame,
  Briefcase,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useAcademics } from '@/hooks/useAcademics';
import TimetableCard from '@/components/academics/TimetableCard';
import ExamCountdownCard from '@/components/academics/ExamCountdownCard';
import SyllabusTracker from '@/components/academics/SyllabusTracker';
import MessMenuCard from '@/components/academics/MessMenuCard';
import HomeworkCard from '@/components/academics/HomeworkCard';
import AttendanceMarksCard from '@/components/academics/AttendanceMarksCard';
import GlassCard from '@/components/ui/GlassCard';
import { triggerHaptic } from '@/lib/haptics';

type AcademicTab = 'timetable' | 'exams' | 'syllabus' | 'mess' | 'homework' | 'performance';

export default function AcademicsPage() {
  const {
    profile,
    loaded,
    timetable,
    syllabus,
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
  } = useAcademics();

  const [activeTab, setActiveTab] = useState<AcademicTab>('exams');

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wide">
            Loading SCMS S1 CSE-3 Academic Portal...
          </p>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AcademicTab; label: string; icon: any; count?: number }> = [
    { id: 'exams', label: 'Exams & Countdowns', icon: Clock, count: profile.exams.length },
    { id: 'timetable', label: 'Class Timetable (AD 207)', icon: Calendar },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: BookOpen },
    { id: 'homework', label: 'Homework & Tasks', icon: CheckSquare, count: profile.homework.filter((h) => !h.completed).length },
    { id: 'mess', label: 'Hostel Mess Menu', icon: Utensils },
    { id: 'performance', label: 'Attendance & CIE', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Top Header & Dual Portal Gateway Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
              🎓 SCMS School of Engineering & Technology
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Autonomous 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic OS
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            B.Tech Computer Science & Engineering • <strong className="text-purple-300">S1 CSE-3</strong> • Room: <strong className="text-slate-200">AD 207</strong> • Batch 1
          </p>
        </div>

        {/* Dual Portal Switcher Banner */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-bold transition-all active:scale-95"
          >
            <span>Home Hub</span>
          </Link>

          <Link
            href="/career"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/40 text-white text-xs font-bold shadow-md shadow-purple-500/10 transition-all active:scale-95"
          >
            <Briefcase size={14} className="text-purple-400" />
            <span>Big Tech Career OS</span>
            <ArrowRight size={13} />
          </Link>

          <Link
            href="/personal"
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-200 text-xs font-bold transition-all active:scale-95"
          >
            <Flame size={14} className="text-amber-400" />
            <span>Personal Habits</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/[0.06]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.id);
              }}
              className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'exams' && (
          <ExamCountdownCard
            exams={profile.exams}
            onAddExam={addExam}
            onUpdateExam={updateExam}
            onDeleteExam={deleteExam}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableCard
            timetable={timetable}
            getCurrentPeriodInfo={getCurrentPeriodInfo}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusTracker
            syllabus={syllabus}
            isTopicCompleted={isTopicCompleted}
            toggleTopic={toggleTopic}
            getSubjectReadiness={getSubjectReadiness}
            getModuleReadiness={getModuleReadiness}
          />
        )}

        {activeTab === 'homework' && (
          <HomeworkCard
            homework={profile.homework}
            onAddHomework={addHomework}
            onToggleHomework={toggleHomework}
            onDeleteHomework={deleteHomework}
          />
        )}

        {activeTab === 'mess' && (
          <MessMenuCard
            messMenu={profile.messMenu}
            onUpdateMessMeal={updateMessMeal}
          />
        )}

        {activeTab === 'performance' && (
          <AttendanceMarksCard
            syllabus={syllabus}
            attendance={profile.attendance}
            internalMarks={profile.internalMarks}
            onUpdateAttendance={updateAttendance}
            onUpdateInternalMarks={updateInternalMarks}
          />
        )}
      </div>

      {/* Academic Quick Scratchpad */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-purple-400" /> Academic Quick Notes & Reminders
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            Auto-synced to Cloud & Local
          </span>
        </div>
        <textarea
          rows={3}
          value={profile.quickNotes || ''}
          onChange={(e) => updateQuickNotes(e.target.value)}
          placeholder="Jot down lecture notes, lab requirements, professor instructions, or room changes..."
          className="w-full px-3.5 py-2.5 bg-black/30 border border-white/[0.08] rounded-xl text-white text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
        />
      </GlassCard>

      {/* Footer Reset & Verification */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/[0.06]">
        <span>SCMS S1 CSE-3 Academic Engine • Autonomous 2026</span>
        <button
          onClick={() => {
            if (confirm('Reset timetable, exams and syllabus back to SCMS official seed data?')) {
              resetToDefaults();
              triggerHaptic('success');
            }
          }}
          className="hover:text-slate-300 flex items-center gap-1 text-[11px]"
        >
          <RotateCcw size={12} />
          <span>Reset to Default Timetable & Exam Seed</span>
        </button>
      </div>
    </div>
  );
}
