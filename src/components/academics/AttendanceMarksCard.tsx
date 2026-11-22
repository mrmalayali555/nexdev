'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Target,
  Edit2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { SubjectSyllabus } from '@/lib/academicTypes';
import { triggerHaptic } from '@/lib/haptics';

interface AttendanceMarksCardProps {
  syllabus: SubjectSyllabus[];
  attendance: Record<string, { total: number; attended: number }>;
  internalMarks: Record<string, { iat1?: number; iat2?: number; cta?: number; attendance?: number }>;
  onUpdateAttendance: (subjectCode: string, total: number, attended: number) => void;
  onUpdateInternalMarks: (
    subjectCode: string,
    marks: { iat1?: number; iat2?: number; cta?: number; attendance?: number }
  ) => void;
}

export default function AttendanceMarksCard({
  syllabus,
  attendance,
  internalMarks,
  onUpdateAttendance,
  onUpdateInternalMarks,
}: AttendanceMarksCardProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks'>('attendance');
  const [targetGrade, setTargetGrade] = useState<'S' | 'A+' | 'A' | 'B+'>('A+');

  const GRADE_THRESHOLDS: Record<string, number> = {
    S: 90,
    'A+': 85,
    A: 80,
    'B+': 70,
  };

  // Helper to calculate safe bunks or required classes
  const calculateAttendanceBuffer = (attended: number, total: number) => {
    if (total === 0) return { percentage: 100, safeBunks: 0, requiredClasses: 0, isSafe: true };
    const pct = Math.round((attended / total) * 100);

    if (pct >= 75) {
      // Safe bunks: floor((attended - 0.75 * total) / 0.75)
      const safeBunks = Math.floor((attended - 0.75 * total) / 0.75);
      return { percentage: pct, safeBunks: Math.max(0, safeBunks), requiredClasses: 0, isSafe: true };
    } else {
      // Required classes: ceil((0.75 * total - attended) / (1 - 0.75))
      const required = Math.ceil((0.75 * total - attended) / 0.25);
      return { percentage: pct, safeBunks: 0, requiredClasses: required, isSafe: false };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Percent className="text-purple-400" size={20} />
            Academic Performance & Attendance Forecaster
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            SCMS 75% Attendance Compliance Rule • Internal Marks (CIE) & Semester Grade Predictor
          </p>
        </div>

        <div className="flex items-center bg-[#070914] p-1 rounded-2xl border border-white/[0.08] w-fit">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('attendance');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Attendance & Safe Bunks
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('marks');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'marks'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Internal CIE & Target Predictor
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <div className="space-y-4">
          {/* Attendance Overview Info Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-[#070a14] border border-white/[0.08] text-xs text-slate-300 flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">
                SCMS Autonomous 75% Minimum Attendance Requirement
              </p>
              <p className="text-slate-400 mt-0.5">
                Students maintaining &ge; 75% are directly eligible for semester examinations without condonation fees.
              </p>
            </div>
          </div>

          {/* Subject Attendance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syllabus.map((subj) => {
              const rec = attendance[subj.code] || { total: 30, attended: 27 };
              const { percentage, safeBunks, requiredClasses, isSafe } = calculateAttendanceBuffer(
                rec.attended,
                rec.total
              );

              return (
                <GlassCard key={subj.code} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-300/80 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        {subj.code}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        {subj.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-black font-mono ${
                          isSafe ? 'text-emerald-300' : 'text-red-400'
                        }`}
                      >
                        {percentage}%
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {rec.attended}/{rec.total} classes
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={percentage} />

                  {/* Buffer / Safe Bunk status */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    {isSafe ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 size={14} />
                        <span>
                          {safeBunks > 0
                            ? `Safe to miss ${safeBunks} more class${safeBunks > 1 ? 'es' : ''}`
                            : 'Borderline 75%! Do not miss any classes.'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-400 font-bold">
                        <AlertTriangle size={14} />
                        <span>Must attend next {requiredClasses} classes without absence!</span>
                      </div>
                    )}

                    {/* Quick Attendance Sim Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          onUpdateAttendance(subj.code, rec.total + 1, rec.attended + 1);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/25"
                        title="Attended class (+1 attended, +1 total)"
                      >
                        + Attend
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          onUpdateAttendance(subj.code, rec.total + 1, rec.attended);
                        }}
                        className="px-2 py-1 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 text-[11px] font-bold hover:bg-red-500/25"
                        title="Bunked class (+0 attended, +1 total)"
                      >
                        + Miss
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Target Grade Selector */}
          <GlassCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Target size={16} className="text-purple-400" /> Target Academic Grade Goal
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculates the required score in the 60-mark Semester Theory Examination
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['S', 'A+', 'A', 'B+'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    triggerHaptic('light');
                    setTargetGrade(grade);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                    targetGrade === grade
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  Grade {grade} (&ge;{GRADE_THRESHOLDS[grade]}%)
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Subject Marks Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syllabus.map((subj) => {
              const marks = internalMarks[subj.code] || { iat1: 9, iat2: 9, cta: 14, attendance: 5 };
              const iatAvg = ((marks.iat1 || 0) + (marks.iat2 || 0)) / 2;
              const totalCIE = Math.round(iatAvg + (marks.cta || 0) + (marks.attendance || 0)); // out of 40

              const targetOverallMarks = (GRADE_THRESHOLDS[targetGrade] / 100) * 100; // out of 100
              const neededInEndSem = Math.ceil(targetOverallMarks - totalCIE);
              const maxSemMarks = 60;

              return (
                <GlassCard key={subj.code} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-300/80 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                        {subj.code}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        {subj.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-purple-300">
                        {totalCIE} / 40
                      </div>
                      <span className="text-[10px] text-slate-400">Total CIE Earned</span>
                    </div>
                  </div>

                  {/* Marks Breakdown Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block font-semibold">IAT-1</span>
                      <span className="font-mono font-bold text-white">{marks.iat1 || 0}/10</span>
                    </div>
                    <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block font-semibold">IAT-2</span>
                      <span className="font-mono font-bold text-white">{marks.iat2 || 0}/10</span>
                    </div>
                    <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block font-semibold">CTA/Assgn</span>
                      <span className="font-mono font-bold text-white">{marks.cta || 0}/15</span>
                    </div>
                    <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 block font-semibold">Att. Marks</span>
                      <span className="font-mono font-bold text-white">{marks.attendance || 0}/5</span>
                    </div>
                  </div>

                  {/* Required End-Sem Marks */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Needed in Semester Exam:
                    </span>
                    <span
                      className={`font-mono font-bold px-2.5 py-1 rounded-xl text-xs ${
                        neededInEndSem <= maxSemMarks
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {neededInEndSem <= maxSemMarks
                        ? `${neededInEndSem} / ${maxSemMarks} Marks`
                        : `Impossible (${neededInEndSem} needed)`}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
