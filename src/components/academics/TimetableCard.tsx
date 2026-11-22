'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  CKJ: 'Dr. C. K. Joju (EE)',
  UKP: 'Dr. Unnikrishnan P. (EC)',
  HRP: 'Prof. Haripriya (EC)',
  STB: 'Prof. Sithara B. (PC/CSE)',
  SPS: 'Prof. Smitha P. S. (PC/CSE)',
  SL: 'Prof. Shiny L. (PC/CSE)',
  VKP: 'Dr. V. K. Pravitha (Chemistry)',
  AN: 'Prof. Athira N. (Chemistry)',
  LRV: 'Prof. Lakshmi R. V. (EC)',
};

const SUBJECT_DETAILS: Record<string, { full: string; code: string; color: string }> = {
  CAO: { full: 'Calculus and Optimization', code: '26GAMAT101', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  CIS: { full: 'Chemistry for Information Science', code: '26GXCYT122', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  EGR: { full: 'Engineering Graphics', code: '26GXEST103', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  IEE: { full: 'Intro to Electrical Engineering', code: '26GXEST104', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  IEC: { full: 'Intro to Electronics Engineering', code: '26GXEST104', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  PC: { full: 'Programming in C', code: '26UCEST105', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  HW: { full: 'Health & Wellness / Life Skills', code: '26GXEST107', color: 'text-lime-400 bg-lime-500/10 border-lime-500/20' },
  'PC Lab': { full: 'Programming in C Lab', code: '26UCEST105', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  'EE/EC Lab': { full: 'Electrical & Electronics Workshop', code: '26GXESL106', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
};

export default function TimetableCard({ timetable, getCurrentPeriodInfo }: TimetableCardProps) {
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [radarInfo, setRadarInfo] = useState(getCurrentPeriodInfo());

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

  return (
    <div className="space-y-6">
      {/* Live Class Radar Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#070a14] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Clock size={20} />
            </div>
            {radarInfo.activePeriod && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
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
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Ongoing Session</span>
              <span className="text-xs font-bold text-white">{radarInfo.activePeriod.subject}</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg">
              {radarInfo.activePeriod.room}
            </span>
          </div>
        )}
      </div>

      {/* Classroom Info & Day Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            Weekly Class Schedule (S1 CSE-3)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Class Room: <strong className="text-slate-200">AD 207</strong> • Group A • Timing: 08:45 AM – 03:45 PM IST
          </p>
        </div>

        {/* Day Pills */}
        <div className="flex items-center bg-[#070914] p-1 rounded-2xl border border-white/[0.08] overflow-x-auto">
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
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{day.substring(0, 3)}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Timeline List */}
      <div className="space-y-3">
        {activeDaySchedule.periods.map((period, idx) => {
          const isOngoing =
            radarInfo.currentDay === selectedDay &&
            radarInfo.activePeriod?.periodNumber === period.periodNumber;

          // Match subject code key
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
          };

          return (
            <motion.div
              key={period.periodNumber}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <GlassCard
                className={`p-4 transition-all duration-200 ${
                  isOngoing
                    ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-[#0a121d] to-[#070a14] shadow-[0_0_24px_rgba(16,185,129,0.15)]'
                    : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Period # & Timing */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-bold font-mono ${
                        isOngoing
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/[0.04] text-slate-300 border border-white/[0.08]'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-sans uppercase">P</span>
                      <span className="text-base leading-none">{period.periodNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300">
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
                      <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {details.full}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{period.subject}</span>
                        {details.code && <span className="font-mono text-purple-300/70">({details.code})</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Room & Faculty Code */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {period.teacherCode && (
                      <span
                        className="px-2.5 py-1 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300"
                        title={TEACHER_CODES[period.teacherCode] || period.teacherCode}
                      >
                        Faculty: <strong>{period.teacherCode}</strong>
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                      <MapPin size={12} />
                      {period.room}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Show Lunch Break after period 3 (or period 4 on Friday) */}
              {selectedDay !== 'Friday' && period.periodNumber === 3 && (
                <div className="my-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-between">
                  <span>🍛 Lunch Break (11:30 AM – 12:15 PM)</span>
                  <span className="text-[11px] text-amber-400/80">Hostel Mess Open</span>
                </div>
              )}

              {selectedDay === 'Friday' && period.periodNumber === 4 && (
                <div className="my-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-between">
                  <span>🍛 Extended Friday Lunch Break (12:15 PM – 02:15 PM)</span>
                  <span className="text-[11px] text-amber-400/80">Jumu&apos;ah & Mess Lunch</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend & Teacher Reference */}
      <GlassCard className="p-4 sm:p-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info size={14} className="text-purple-400" /> Faculty & Lab Code Directory
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400">
          <div><strong className="text-slate-200">CKJ:</strong> Dr. C. K. Joju (EE)</div>
          <div><strong className="text-slate-200">UKP:</strong> Dr. Unnikrishnan P. (EC)</div>
          <div><strong className="text-slate-200">HRP:</strong> Prof. Haripriya (EC)</div>
          <div><strong className="text-slate-200">STB:</strong> Prof. Sithara B. (PC)</div>
          <div><strong className="text-slate-200">SPS:</strong> Prof. Smitha P. S. (PC)</div>
          <div><strong className="text-slate-200">SL:</strong> Prof. Shiny L. (PC)</div>
          <div><strong className="text-slate-200">VKP:</strong> Dr. V. K. Pravitha (Chem)</div>
          <div><strong className="text-slate-200">AN:</strong> Prof. Athira N. (Chem)</div>
          <div><strong className="text-slate-200">LRV:</strong> Prof. Lakshmi R. V. (EC)</div>
        </div>
      </GlassCard>
    </div>
  );
}
