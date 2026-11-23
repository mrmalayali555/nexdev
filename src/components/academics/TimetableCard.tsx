'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Info,
  Laptop,
  Flame,
  CheckCircle2,
  AlertCircle,
  Table,
  List,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { DailyTimetable, TimetablePeriod, DayOfWeek } from '@/lib/academicTypes';
import { triggerHaptic } from '@/lib/haptics';

interface TimetableCardProps {
  timetable: DailyTimetable[];
  getCurrentPeriodInfo: () => {
    isWeekend: boolean;
    currentDay: DayOfWeek;
    activePeriod: TimetablePeriod | null;
    nextPeriod: TimetablePeriod | null;
    statusText: string;
    isBreak: boolean;
  };
}

const TEACHER_CODES: Record<string, string> = {
  CKJ: 'Dr. C. K. Joju (Electrical Engineering)',
  UKP: 'Dr. Unnikrishnan P. (Electronics & Comm.)',
  HRP: 'Prof. Haripriya (Electronics & Comm.)',
  STB: 'Prof. Sithara B. (Computer Science & Eng.)',
  SPS: 'Prof. Smitha P. S. (Computer Science & Eng.)',
  SL: 'Prof. Shiny L. (Computer Science & Eng.)',
  VKP: 'Dr. V. K. Pravitha (Chemistry)',
  AN: 'Prof. Athira N. (Chemistry)',
  LRV: 'Prof. Lakshmi R. V. (Electronics & Comm.)',
};

const SUBJECT_DETAILS: Record<string, { full: string; code: string; color: string; badge: string }> = {
  CAO: { full: 'Calculus and Optimization', code: '26GAMAT101', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', badge: 'bg-purple-500/15 text-purple-300' },
  CIS: { full: 'Chemistry for Information Science', code: '26GXCYT122', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', badge: 'bg-emerald-500/15 text-emerald-300' },
  EGR: { full: 'Engineering Graphics', code: '26GXEST103', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', badge: 'bg-amber-500/15 text-amber-300' },
  IEE: { full: 'Intro to Electrical Engineering', code: '26GXEST104', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', badge: 'bg-blue-500/15 text-blue-300' },
  IEC: { full: 'Intro to Electronics Engineering', code: '26GXEST104', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', badge: 'bg-cyan-500/15 text-cyan-300' },
  PC: { full: 'Programming in C', code: '26UCEST105', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', badge: 'bg-rose-500/15 text-rose-300' },
  HW: { full: 'Health and Wellness / Hour Work', code: '26UCHWT127', color: 'text-lime-400 bg-lime-500/10 border-lime-500/20', badge: 'bg-lime-500/15 text-lime-300' },
  'PC Lab': { full: 'Programming in C Lab', code: '26UCEST105', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', badge: 'bg-pink-500/15 text-pink-300' },
  'EE/EC Lab': { full: 'Electrical & Electronics Workshop', code: '26GXESL106', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', badge: 'bg-indigo-500/15 text-indigo-300' },
  CHEM: { full: 'Chemistry Laboratory', code: '26GXCYL122', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', badge: 'bg-teal-500/15 text-teal-300' },
};

interface CellDetail {
  day: string;
  period: string;
  subject: string;
  fullTitle: string;
  code: string;
  faculty?: string;
  room: string;
  timing: string;
  isLab?: boolean;
}

export default function TimetableCard({ timetable, getCurrentPeriodInfo }: TimetableCardProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'masterGrid'>('masterGrid');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [radarInfo, setRadarInfo] = useState(getCurrentPeriodInfo());
  const [activeCellModal, setActiveCellModal] = useState<CellDetail | null>(null);

  useEffect(() => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(today)) {
      setSelectedDay(today as any);
    }

    const interval = setInterval(() => {
      setRadarInfo(getCurrentPeriodInfo());
    }, 15000);
    return () => clearInterval(interval);
  }, [getCurrentPeriodInfo]);

  const activeDaySchedule = timetable.find((t) => t.day === selectedDay) || timetable[0];

  const handleOpenCell = (cell: CellDetail) => {
    triggerHaptic('medium');
    setActiveCellModal(cell);
  };

  return (
    <div className="space-y-6">
      {/* Live Class Radar Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#070a14] border border-white/[0.08] border-t-white/[0.18] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-500/20">
              <Clock size={20} />
            </div>
            {radarInfo.activePeriod && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Live Classroom Radar
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                AD 207 • Batch 1
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">
              {radarInfo.statusText}
            </p>
          </div>
        </div>

        {radarInfo.activePeriod && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 border-t-emerald-400/30 flex items-center gap-3 shadow-lg shadow-emerald-500/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Ongoing Session</span>
              <span className="text-xs font-bold text-white">{radarInfo.activePeriod.subject}</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              {radarInfo.activePeriod.room}
            </span>
          </div>
        )}
      </div>

      {/* Classroom Info & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/30">
              Official Schedule
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded-lg border border-white/[0.08]">
              Room AD 207 • Group-A, S1
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight mt-1">
            <Calendar className="text-purple-400" size={20} />
            COMPUTER SCIENCE &amp; ENGINEERING -3
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            College Timing: <strong className="text-slate-200">08:45 AM – 03:45 PM IST</strong> • Batch 1 Practical
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#070914] p-1 rounded-2xl border border-white/[0.08] shadow-inner">
          <button
            onClick={() => {
              triggerHaptic('light');
              setViewMode('masterGrid');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-[0.97] ${
              viewMode === 'masterGrid'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Table size={14} />
            <span>Master Grid (AD 207)</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setViewMode('timeline');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-[0.97] ${
              viewMode === 'timeline'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <List size={14} />
            <span>Day Timeline</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MASTER GRID VIEW (Matching official SCMS Timetable image) */}
      {viewMode === 'masterGrid' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.1] border-t-white/[0.18] bg-[#070914]/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Table Header Banner */}
            <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 p-3.5 sm:p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  Class Room: AD 207 • S1 CSE-3 (Group-A)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-purple-300">Tap any cell for faculty &amp; details</span>
            </div>

            {/* Scrollable Master Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[760px] text-xs">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.08] text-[11px] font-mono text-slate-300">
                    <th className="p-3 border-r border-white/[0.08] w-20 font-bold text-purple-300 uppercase">Day</th>
                    <th className="p-3 border-r border-white/[0.08]">
                      <span className="font-bold block text-white">1</span>
                      <span className="text-[10px] text-slate-400">8.45 - 9.35</span>
                    </th>
                    <th className="p-3 border-r border-white/[0.08]">
                      <span className="font-bold block text-white">2</span>
                      <span className="text-[10px] text-slate-400">9.35 - 10.25</span>
                    </th>
                    <th className="p-3 border-r border-white/[0.08]">
                      <span className="font-bold block text-white">3</span>
                      <span className="text-[10px] text-slate-400">10.35 - 11.30</span>
                    </th>
                    <th className="p-3 border-r border-white/[0.08] bg-amber-500/[0.03] text-amber-300/80 w-24">
                      <span className="font-bold block text-[10px] uppercase tracking-wider">Lunch Break</span>
                      <span className="text-[9px] text-amber-400/60">11.30 - 12.15</span>
                    </th>
                    <th className="p-3 border-r border-white/[0.08]">
                      <span className="font-bold block text-white">4</span>
                      <span className="text-[10px] text-slate-400">12.15 - 1.05pm</span>
                    </th>
                    <th className="p-3 border-r border-white/[0.08]">
                      <span className="font-bold block text-white">5</span>
                      <span className="text-[10px] text-slate-400">1.05 - 1.55</span>
                    </th>
                    <th className="p-3 border-r border-white/[0.08]">
                      <span className="font-bold block text-white">6</span>
                      <span className="text-[10px] text-slate-400">2.05 - 2.55</span>
                    </th>
                    <th className="p-3">
                      <span className="font-bold block text-white">7</span>
                      <span className="text-[10px] text-slate-400">2.55 - 3.45</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-medium">
                  {/* MONDAY */}
                  <tr className={`hover:bg-white/[0.02] transition-colors ${radarInfo.currentDay === 'Monday' ? 'bg-purple-950/20' : ''}`}>
                    <td className="p-3 font-bold text-slate-200 border-r border-white/[0.08] flex items-center justify-center gap-1.5">
                      <span>Mon.</span>
                      {radarInfo.currentDay === 'Monday' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Monday', period: 'P1', subject: 'CAO', fullTitle: 'Calculus and Optimization', code: '26GAMAT101', room: 'AD 207', timing: '08:45 - 09:35' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-purple-500/10 text-purple-300 font-bold"
                    >
                      CAO
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Monday', period: 'P2', subject: 'EGR', fullTitle: 'Engineering Graphics', code: '26GXEST103', room: 'AD 207', timing: '09:35 - 10:25' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-amber-500/10 text-amber-300 font-bold"
                    >
                      EGR
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Monday', period: 'P3', subject: 'EGR', fullTitle: 'Engineering Graphics', code: '26GXEST103', room: 'AD 207', timing: '10:35 - 11:30' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-amber-500/10 text-amber-300 font-bold"
                    >
                      EGR
                    </td>
                    <td className="p-3 border-r border-white/[0.08] bg-amber-500/[0.02] text-amber-400/60 font-mono text-[10px]">
                      Break
                    </td>
                    {/* Period 4 & 5 (Spanning practical) */}
                    <td
                      colSpan={2}
                      onClick={() => handleOpenCell({ day: 'Monday', period: 'P4 & P5', subject: 'EE / EC Lab', fullTitle: 'Electrical & Electronics Workshop', code: '26GXESL106', faculty: 'CKJ*, UKP*, HRP', room: 'Workshop Lab', timing: '12:15 - 01:55 PM', isLab: true })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer bg-indigo-500/[0.08] hover:bg-indigo-500/[0.15] text-indigo-300 font-bold border-l-2 border-l-indigo-500/40"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">EE(CKJ*) / EC (UKP*, HRP)</span>
                        <span className="text-[10px] text-indigo-300/80 font-normal">Workshop Lab (Batch 1)</span>
                      </div>
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Monday', period: 'P6', subject: 'IEE', fullTitle: 'Intro to Electrical Engineering', code: '26GXEST104', room: 'AD 207', timing: '02:05 - 02:55 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-blue-500/10 text-blue-300 font-bold"
                    >
                      IEE
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Monday', period: 'P7', subject: 'CIS', fullTitle: 'Chemistry for Information Science', code: '26GXCYT122', room: 'AD 207', timing: '02:55 - 03:45 PM' })}
                      className="p-3 cursor-pointer hover:bg-emerald-500/10 text-emerald-300 font-bold"
                    >
                      CIS
                    </td>
                  </tr>

                  {/* TUESDAY */}
                  <tr className={`hover:bg-white/[0.02] transition-colors ${radarInfo.currentDay === 'Tuesday' ? 'bg-purple-950/20' : ''}`}>
                    <td className="p-3 font-bold text-slate-200 border-r border-white/[0.08] flex items-center justify-center gap-1.5">
                      <span>Tue.</span>
                      {radarInfo.currentDay === 'Tuesday' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Tuesday', period: 'P1', subject: 'CIS', fullTitle: 'Chemistry for Information Science', code: '26GXCYT122', room: 'AD 207', timing: '08:45 - 09:35' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-emerald-500/10 text-emerald-300 font-bold"
                    >
                      CIS
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Tuesday', period: 'P2', subject: 'PC', fullTitle: 'Programming in C', code: '26UCEST105', room: 'AD 207', timing: '09:35 - 10:25' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-rose-500/10 text-rose-300 font-bold"
                    >
                      PC
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Tuesday', period: 'P3', subject: 'CAO', fullTitle: 'Calculus and Optimization', code: '26GAMAT101', room: 'AD 207', timing: '10:35 - 11:30' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-purple-500/10 text-purple-300 font-bold"
                    >
                      CAO
                    </td>
                    <td className="p-3 border-r border-white/[0.08] bg-amber-500/[0.02] text-amber-400/60 font-mono text-[10px]">
                      Break
                    </td>
                    {/* Period 4 & 5 (PC Lab) */}
                    <td
                      colSpan={2}
                      onClick={() => handleOpenCell({ day: 'Tuesday', period: 'P4 & P5', subject: 'PC Lab', fullTitle: 'Programming in C Lab', code: '26UCEST105', faculty: 'STB*, SPS, SL', room: 'Computing Lab', timing: '12:15 - 01:55 PM', isLab: true })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer bg-pink-500/[0.08] hover:bg-pink-500/[0.15] text-pink-300 font-bold border-l-2 border-l-pink-500/40"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">PC Lab(STB*, SPS, SL)</span>
                        <span className="text-[10px] text-pink-300/80 font-normal">Computing Lab</span>
                      </div>
                    </td>
                    {/* Period 6 & 7 (EGR) */}
                    <td
                      colSpan={2}
                      onClick={() => handleOpenCell({ day: 'Tuesday', period: 'P6 & P7', subject: 'EGR', fullTitle: 'Engineering Graphics', code: '26GXEST103', room: 'AD 207', timing: '02:05 - 03:45 PM' })}
                      className="p-3 cursor-pointer bg-amber-500/[0.06] hover:bg-amber-500/[0.12] text-amber-300 font-bold border-l-2 border-l-amber-500/30"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">EGR</span>
                        <span className="text-[10px] text-amber-300/80 font-normal">Engineering Graphics (Double Period)</span>
                      </div>
                    </td>
                  </tr>

                  {/* WEDNESDAY */}
                  <tr className={`hover:bg-white/[0.02] transition-colors ${radarInfo.currentDay === 'Wednesday' ? 'bg-purple-950/20' : ''}`}>
                    <td className="p-3 font-bold text-slate-200 border-r border-white/[0.08] flex items-center justify-center gap-1.5">
                      <span>Wed.</span>
                      {radarInfo.currentDay === 'Wednesday' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P1', subject: 'IEE', fullTitle: 'Intro to Electrical Engineering', code: '26GXEST104', room: 'AD 207', timing: '08:45 - 09:35' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-blue-500/10 text-blue-300 font-bold"
                    >
                      IEE
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P2', subject: 'IEC', fullTitle: 'Intro to Electronics Engineering', code: '26GXEST104', room: 'AD 207', timing: '09:35 - 10:25' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-cyan-500/10 text-cyan-300 font-bold"
                    >
                      IEC
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P3', subject: 'CIS', fullTitle: 'Chemistry for Information Science', code: '26GXCYT122', room: 'AD 207', timing: '10:35 - 11:30' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-emerald-500/10 text-emerald-300 font-bold"
                    >
                      CIS
                    </td>
                    <td className="p-3 border-r border-white/[0.08] bg-amber-500/[0.02] text-amber-400/60 font-mono text-[10px]">
                      Break
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P4', subject: 'CAO', fullTitle: 'Calculus and Optimization', code: '26GAMAT101', room: 'AD 207', timing: '12:15 - 01:05 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-purple-500/10 text-purple-300 font-bold"
                    >
                      CAO
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P5', subject: 'HW', fullTitle: 'Health & Wellness / Hour Work', code: '26UCHWT127', room: 'AD 207', timing: '01:05 - 01:55 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-lime-500/10 text-lime-300 font-bold"
                    >
                      HW
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P6', subject: 'EGR', fullTitle: 'Engineering Graphics', code: '26GXEST103', room: 'AD 207', timing: '02:05 - 02:55 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-amber-500/10 text-amber-300 font-bold"
                    >
                      EGR
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Wednesday', period: 'P7', subject: 'PC', fullTitle: 'Programming in C', code: '26UCEST105', room: 'AD 207', timing: '02:55 - 03:45 PM' })}
                      className="p-3 cursor-pointer hover:bg-rose-500/10 text-rose-300 font-bold"
                    >
                      PC
                    </td>
                  </tr>

                  {/* THURSDAY */}
                  <tr className={`hover:bg-white/[0.02] transition-colors ${radarInfo.currentDay === 'Thursday' ? 'bg-purple-950/20' : ''}`}>
                    <td className="p-3 font-bold text-slate-200 border-r border-white/[0.08] flex items-center justify-center gap-1.5">
                      <span>Thu.</span>
                      {radarInfo.currentDay === 'Thursday' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P1', subject: 'IEC', fullTitle: 'Intro to Electronics Engineering', code: '26GXEST104', room: 'AD 207', timing: '08:45 - 09:35' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-cyan-500/10 text-cyan-300 font-bold"
                    >
                      IEC
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P2', subject: 'IEE', fullTitle: 'Intro to Electrical Engineering', code: '26GXEST104', room: 'AD 207', timing: '09:35 - 10:25' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-blue-500/10 text-blue-300 font-bold"
                    >
                      IEE
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P3', subject: 'EGR', fullTitle: 'Engineering Graphics', code: '26GXEST103', room: 'AD 207', timing: '10:35 - 11:30' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-amber-500/10 text-amber-300 font-bold"
                    >
                      EGR
                    </td>
                    <td className="p-3 border-r border-white/[0.08] bg-amber-500/[0.02] text-amber-400/60 font-mono text-[10px]">
                      Break
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P4', subject: 'CIS', fullTitle: 'Chemistry for Information Science', code: '26GXCYT122', room: 'AD 207', timing: '12:15 - 01:05 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-emerald-500/10 text-emerald-300 font-bold"
                    >
                      CIS
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P5', subject: 'IEC', fullTitle: 'Intro to Electronics Engineering', code: '26GXEST104', room: 'AD 207', timing: '01:05 - 01:55 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-cyan-500/10 text-cyan-300 font-bold"
                    >
                      IEC
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P6', subject: 'CAO', fullTitle: 'Calculus and Optimization', code: '26GAMAT101', room: 'AD 207', timing: '02:05 - 02:55 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-purple-500/10 text-purple-300 font-bold"
                    >
                      CAO
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Thursday', period: 'P7', subject: 'IEE', fullTitle: 'Intro to Electrical Engineering', code: '26GXEST104', room: 'AD 207', timing: '02:55 - 03:45 PM' })}
                      className="p-3 cursor-pointer hover:bg-blue-500/10 text-blue-300 font-bold"
                    >
                      IEE
                    </td>
                  </tr>

                  {/* FRIDAY */}
                  <tr className={`hover:bg-white/[0.02] transition-colors ${radarInfo.currentDay === 'Friday' ? 'bg-purple-950/20' : ''}`}>
                    <td className="p-3 font-bold text-slate-200 border-r border-white/[0.08] flex items-center justify-center gap-1.5">
                      <span>Fri.</span>
                      {radarInfo.currentDay === 'Friday' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </td>
                    {/* Period 1 & 2 (CHEM / EE / EC Lab) */}
                    <td
                      colSpan={2}
                      onClick={() => handleOpenCell({ day: 'Friday', period: 'P1 & P2', subject: 'CHEM / EE / EC Lab', fullTitle: 'Chemistry Lab & EE/EC Workshop', code: '26GXESL106', faculty: 'VKP, AN* / CKJ* / UKP*, LRV', room: 'Chemistry & Workshop Labs', timing: '08:45 - 10:25 AM', isLab: true })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer bg-teal-500/[0.08] hover:bg-teal-500/[0.15] text-teal-300 font-bold border-l-2 border-l-teal-500/40"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] leading-snug">CHEM(VKP, AN*) / (EE(CKJ*) / EC(UKP*, LRV))</span>
                        <span className="text-[9px] text-teal-300/80 font-normal">Practical Lab Session</span>
                      </div>
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Friday', period: 'P3', subject: 'CAO', fullTitle: 'Calculus and Optimization', code: '26GAMAT101', room: 'AD 207', timing: '10:35 - 11:30' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-purple-500/10 text-purple-300 font-bold"
                    >
                      CAO
                    </td>
                    {/* Special Slot: 11.30 - 12.15 HW */}
                    <td
                      onClick={() => handleOpenCell({ day: 'Friday', period: 'Slot 4', subject: 'HW', fullTitle: 'Health & Wellness / Hour Work', code: '26UCHWT127', room: 'AD 207', timing: '11:30 - 12:15 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer bg-lime-500/[0.08] text-lime-300 font-bold"
                    >
                      <span className="block text-[10px] text-lime-300/70">11.30 - 12.15</span>
                      <span>HW</span>
                    </td>
                    {/* Extended Friday Lunch: 12.15 - 2.15pm */}
                    <td
                      colSpan={2}
                      className="p-3 border-r border-white/[0.08] bg-amber-500/[0.04] text-amber-300/90 font-mono text-[10px]"
                    >
                      <span className="block font-bold">12:15 - 2:15pm</span>
                      <span className="text-[9px] text-amber-400/70">Friday Lunch / Jumu&apos;ah</span>
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Friday', period: 'P6', subject: 'CIS', fullTitle: 'Chemistry for Information Science', code: '26GXCYT122', room: 'AD 207', timing: '02:15 - 03:00 PM' })}
                      className="p-3 border-r border-white/[0.08] cursor-pointer hover:bg-emerald-500/10 text-emerald-300 font-bold"
                    >
                      CIS
                    </td>
                    <td
                      onClick={() => handleOpenCell({ day: 'Friday', period: 'P7', subject: 'PC', fullTitle: 'Programming in C', code: '26UCEST105', room: 'AD 207', timing: '03:00 - 03:45 PM' })}
                      className="p-3 cursor-pointer hover:bg-rose-500/10 text-rose-300 font-bold"
                    >
                      PC
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-3 bg-black/40 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
              <span>* Autonomous Syllabus Scheme 2026 • SCMS CSE-3 (Group-A, Batch 1)</span>
              <span>Room: AD 207 (Main Lecture Hall)</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAY TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex items-center bg-[#070914] p-1.5 rounded-2xl border border-white/[0.08] overflow-x-auto shadow-inner">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => {
              const isToday = radarInfo.currentDay === day;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDay(day);
                  }}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-[0.97] ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Period Timeline List */}
          <div className="space-y-3">
            {activeDaySchedule.periods.map((period, idx) => {
              const isOngoing =
                radarInfo.currentDay === selectedDay &&
                radarInfo.activePeriod?.periodNumber === period.periodNumber;

              let subjectKey = '';
              if (period.subject.includes('CAO')) subjectKey = 'CAO';
              else if (period.subject.includes('CIS') || period.subject.includes('CHEM')) subjectKey = 'CIS';
              else if (period.subject.includes('EGR')) subjectKey = 'EGR';
              else if (period.subject.includes('IEE')) subjectKey = 'IEE';
              else if (period.subject.includes('IEC')) subjectKey = 'IEC';
              else if (period.subject.includes('PC Lab')) subjectKey = 'PC Lab';
              else if (period.subject.includes('PC')) subjectKey = 'PC';
              else if (period.subject.includes('HW')) subjectKey = 'HW';
              else if (period.subject.includes('EE') || period.subject.includes('EC')) subjectKey = 'EE/EC Lab';

              const details = SUBJECT_DETAILS[subjectKey] || {
                full: period.subject,
                code: period.courseCode || '',
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                badge: 'bg-purple-500/15 text-purple-300',
              };

              return (
                <motion.div
                  key={period.periodNumber}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlassCard
                    className={`p-4 transition-all duration-200 border-t-white/[0.18] ${
                      isOngoing
                        ? 'border-emerald-500/50 border-t-emerald-400/50 bg-gradient-to-r from-emerald-950/30 via-[#0a121d] to-[#070a14] shadow-[0_0_28px_rgba(16,185,129,0.2),inset_0_1px_0_0_rgba(52,211,153,0.2)]'
                        : 'hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Period # & Timing */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold font-mono transition-transform ${
                            isOngoing
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/20'
                              : 'bg-white/[0.04] text-slate-300 border border-white/[0.08]'
                          }`}
                        >
                          <span className="text-[10px] text-slate-400 font-sans uppercase">P</span>
                          <span className="text-base leading-none tabular-nums">{period.periodNumber}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-300 tabular-nums">
                              {period.timeRange}
                            </span>
                            {isOngoing && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                                Active Now
                              </span>
                            )}
                            {period.isLab && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                                <Laptop size={10} /> Practical Lab
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white mt-0.5 tracking-tight">
                            {details.full}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-slate-300">{period.subject}</span>
                            {details.code && <span className="font-mono text-purple-300/80">({details.code})</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Room & Faculty Code */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {period.teacherCode && (
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300 shadow-sm"
                            title={TEACHER_CODES[period.teacherCode] || period.teacherCode}
                          >
                            Faculty: <strong>{period.teacherCode}</strong>
                          </span>
                        )}

                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1 shadow-sm">
                          <MapPin size={12} />
                          {period.room}
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Show Lunch Break after period 3 (or period 4 on Friday) */}
                  {selectedDay !== 'Friday' && period.periodNumber === 3 && (
                    <div className="my-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-amber-900/10 border border-amber-500/25 border-t-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>🍛 Lunch Break (11:30 AM – 12:15 PM)</span>
                      </span>
                      <span className="text-[11px] font-mono text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        Hostel Mess Open
                      </span>
                    </div>
                  )}

                  {selectedDay === 'Friday' && period.periodNumber === 4 && (
                    <div className="my-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-amber-900/10 border border-amber-500/25 border-t-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>🍛 Extended Friday Lunch Break (12:15 PM – 02:15 PM)</span>
                      </span>
                      <span className="text-[11px] font-mono text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        Jumu&apos;ah &amp; Mess Lunch
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend & Teacher Reference */}
      <GlassCard className="p-4 sm:p-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info size={14} className="text-purple-400" /> Faculty &amp; Subject Directory
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-400">
          <div><strong className="text-slate-200">CKJ:</strong> Dr. C. K. Joju (EE)</div>
          <div><strong className="text-slate-200">UKP:</strong> Dr. Unnikrishnan P. (EC)</div>
          <div><strong className="text-slate-200">HRP:</strong> Prof. Haripriya (EC)</div>
          <div><strong className="text-slate-200">STB:</strong> Prof. Sithara B. (PC/CSE)</div>
          <div><strong className="text-slate-200">SPS:</strong> Prof. Smitha P. S. (PC/CSE)</div>
          <div><strong className="text-slate-200">SL:</strong> Prof. Shiny L. (PC/CSE)</div>
          <div><strong className="text-slate-200">VKP:</strong> Dr. V. K. Pravitha (Chemistry)</div>
          <div><strong className="text-slate-200">AN:</strong> Prof. Athira N. (Chemistry)</div>
          <div><strong className="text-slate-200">LRV:</strong> Prof. Lakshmi R. V. (EC)</div>
        </div>
      </GlassCard>

      {/* Interactive Cell Modal Popover */}
      <AnimatePresence>
        {activeCellModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveCellModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0b0f19] border border-white/[0.12] border-t-white/[0.25] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setActiveCellModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {activeCellModal.day} • {activeCellModal.period}
                </span>
                {activeCellModal.isLab && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Practical Lab
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight">
                {activeCellModal.fullTitle}
              </h3>
              <p className="text-xs text-purple-300 font-mono mt-0.5">
                Course Code: {activeCellModal.code}
              </p>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-slate-400">Classroom / Location:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <MapPin size={12} className="text-purple-400" />
                    {activeCellModal.room}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-bold font-mono text-slate-200">{activeCellModal.timing}</span>
                </div>
                {activeCellModal.faculty && (
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-400">Faculty In-Charge:</span>
                    <span className="font-bold text-purple-300">{activeCellModal.faculty}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveCellModal(null)}
                className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-[0.98] shadow-lg shadow-purple-600/30"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
