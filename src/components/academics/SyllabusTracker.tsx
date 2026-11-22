'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  Layers,
  BookMarked,
  Flame,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { SubjectSyllabus } from '@/lib/academicTypes';
import { triggerHaptic } from '@/lib/haptics';

interface SyllabusTrackerProps {
  syllabus: SubjectSyllabus[];
  isTopicCompleted: (topicId: string) => boolean;
  toggleTopic: (topicId: string) => void;
  getSubjectReadiness: (subjectCode: string) => { totalTopics: number; completedTopics: number; percentage: number };
  getModuleReadiness: (subjectCode: string, moduleNumber: number) => { totalTopics: number; completedTopics: number; percentage: number };
}

export default function SyllabusTracker({
  syllabus,
  isTopicCompleted,
  toggleTopic,
  getSubjectReadiness,
  getModuleReadiness,
}: SyllabusTrackerProps) {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(syllabus[0]?.code || '26GAMAT101');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
  });

  const selectedSubject = syllabus.find((s) => s.code === selectedSubjectCode) || syllabus[0];
  const overallReadiness = getSubjectReadiness(selectedSubject.code);

  const toggleModuleAccordion = (moduleNum: number) => {
    triggerHaptic('light');
    setExpandedModules((prev) => ({
      ...prev,
      [moduleNum]: !prev[moduleNum],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Subject Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {syllabus.map((subj) => {
          const isSelected = subj.code === selectedSubjectCode;
          const stat = getSubjectReadiness(subj.code);

          return (
            <button
              key={subj.code}
              onClick={() => {
                triggerHaptic('light');
                setSelectedSubjectCode(subj.code);
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-white block">
                  {subj.shortName}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    stat.percentage >= 80
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : stat.percentage >= 40
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {stat.percentage}%
                </span>
              </div>
              <p className="text-[10px] font-mono text-purple-300/70 mt-0.5">
                {subj.code}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Overview Hero */}
      <GlassCard className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                {selectedSubject.code}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Credits: {selectedSubject.credits} • {selectedSubject.type}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {selectedSubject.name}
            </h2>
            {selectedSubject.examDate && (
              <p className="text-xs text-amber-300/90 font-semibold flex items-center gap-1.5 pt-0.5">
                <Clock size={13} /> Semester Theory Exam: <strong>{selectedSubject.examDate}</strong> (09:30 AM IST)
              </p>
            )}
          </div>

          {/* Overall Progress Gauge */}
          <div className="md:w-64 space-y-2 bg-black/40 p-4 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Award size={14} className="text-purple-400" /> Exam Mastery
              </span>
              <span className="font-mono font-bold text-purple-300">
                {overallReadiness.completedTopics} / {overallReadiness.totalTopics} topics ({overallReadiness.percentage}%)
              </span>
            </div>
            <ProgressBar value={overallReadiness.percentage} />
            <p className="text-[10px] text-slate-400 text-right">
              {overallReadiness.percentage === 100
                ? '🏆 Full syllabus mastered!'
                : overallReadiness.percentage >= 70
                ? '⚡ Strong exam readiness'
                : '📖 Keep studying topics'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Modules List Accordion */}
      <div className="space-y-4">
        {selectedSubject.modules.map((module) => {
          const modStat = getModuleReadiness(selectedSubject.code, module.moduleNumber);
          const isExpanded = !!expandedModules[module.moduleNumber];

          return (
            <GlassCard key={module.moduleNumber} className="overflow-hidden">
              {/* Module Header / Accordion Trigger */}
              <button
                onClick={() => toggleModuleAccordion(module.moduleNumber)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      modStat.percentage === 100
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/[0.04] text-purple-300 border border-white/[0.08]'
                    }`}
                  >
                    M{module.moduleNumber}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Module {module.moduleNumber}: {module.title}</span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{module.contactHours} Contact Hours</span>
                      <span>•</span>
                      <span>
                        {modStat.completedTopics}/{modStat.totalTopics} completed ({modStat.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24">
                    <ProgressBar value={modStat.percentage} />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </button>

              {/* Topics Sub-checklist */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/[0.06] p-4 sm:p-5 space-y-2 bg-black/20"
                  >
                    <div className="grid grid-cols-1 gap-2">
                      {module.topics.map((topic) => {
                        const isDone = isTopicCompleted(topic.id);

                        return (
                          <div
                            key={topic.id}
                            onClick={() => {
                              triggerHaptic('light');
                              toggleTopic(topic.id);
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                                    : 'border border-slate-500 text-transparent'
                                }`}
                              >
                                <CheckCircle2 size={14} className={isDone ? 'block' : 'hidden'} />
                              </div>
                              <span className={`text-xs sm:text-sm font-medium ${isDone ? 'line-through text-slate-400' : ''}`}>
                                {topic.name}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isDone
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/[0.04] text-slate-500'
                              }`}
                            >
                              {isDone ? 'Studied' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>

      {/* Recommended Textbooks */}
      {selectedSubject.textBooks && selectedSubject.textBooks.length > 0 && (
        <GlassCard className="p-4 sm:p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookMarked size={14} className="text-purple-400" /> Prescribed Textbooks & Syllabus References
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            {selectedSubject.textBooks.map((book, idx) => (
              <li key={idx} className="text-slate-300 font-medium">
                {book}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
