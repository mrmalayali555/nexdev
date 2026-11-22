'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Sparkles,
  MapPin,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { AcademicExam } from '@/lib/academicTypes';
import { triggerHaptic } from '@/lib/haptics';

interface ExamCountdownCardProps {
  exams: AcademicExam[];
  onAddExam: (exam: Omit<AcademicExam, 'id'>) => void;
  onUpdateExam: (id: string, updates: Partial<AcademicExam>) => void;
  onDeleteExam: (id: string) => void;
}

export default function ExamCountdownCard({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
}: ExamCountdownCardProps) {
  const [filter, setFilter] = useState<'all' | 'practical' | 'theory'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<AcademicExam | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'practical' | 'theory' | 'internal' | 'viva'>('theory');
  const [batch, setBatch] = useState('S1 CSE-3, Batch 1');
  const [room, setRoom] = useState('SCMS Exam Hall');
  const [notes, setNotes] = useState('');

  // Live ticking countdown timer
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openAddModal = () => {
    setEditingExam(null);
    setSubject('');
    setCourseCode('');
    setTitle('');
    setDate('');
    setTime('09:30–12:00 IST');
    setType('theory');
    setBatch('S1 CSE-3, Batch 1');
    setRoom('SCMS Exam Hall');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (exam: AcademicExam) => {
    setEditingExam(exam);
    setSubject(exam.subject);
    setCourseCode(exam.courseCode);
    setTitle(exam.title);
    setDate(exam.date);
    setTime(exam.time);
    setType(exam.type as any);
    setBatch(exam.batch || '');
    setRoom(exam.room || '');
    setNotes(exam.notes || '');
    setShowModal(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !date) return;

    if (editingExam) {
      onUpdateExam(editingExam.id, {
        subject,
        courseCode,
        title: title || `${subject} Examination`,
        date,
        time: time || '09:30–12:00 IST',
        type,
        batch: batch || undefined,
        room: room || undefined,
        notes: notes || undefined,
      });
    } else {
      onAddExam({
        subject,
        courseCode,
        title: title || `${subject} Examination`,
        date,
        time: time || '09:30–12:00 IST',
        type,
        batch: batch || undefined,
        room: room || undefined,
        notes: notes || undefined,
      });
    }

    triggerHaptic('success');
    setShowModal(false);
  };

  // Helper for countdown
  const getCountdown = (targetDateStr: string, timeStr?: string) => {
    // SCMS standard exam time: 09:30:00 IST (+05:30)
    let targetTime = '09:30:00';
    if (timeStr && timeStr.includes(':')) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        targetTime = `${match[1].padStart(2, '0')}:${match[2]}:00`;
      }
    }

    const examDateTime = new Date(`${targetDateStr}T${targetTime}+05:30`);
    const diffMs = examDateTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      // If today and within exam hours
      const sameDayDiff = now.getTime() - new Date(`${targetDateStr}T00:00:00+05:30`).getTime();
      if (sameDayDiff < 24 * 60 * 60 * 1000) {
        return { isToday: true, isPast: false, days: 0, hours: 0, minutes: 0, seconds: 0, text: 'Happening Today!' };
      }
      return { isToday: false, isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0, text: 'Completed' };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { isToday: false, isPast: false, days, hours, minutes, seconds, text: `${days}d ${hours}h ${minutes}m ${seconds}s` };
  };

  // Filtered exams
  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const filteredExams = sortedExams.filter((ex) => {
    if (filter === 'practical') return ex.type === 'practical' || ex.type === 'viva';
    if (filter === 'theory') return ex.type === 'theory' || ex.type === 'internal';
    return true;
  });

  const nextImmediateExam = sortedExams.find((ex) => {
    const cd = getCountdown(ex.date, ex.time);
    return !cd.isPast || cd.isToday;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Immediate Next Exam Radar */}
      {nextImmediateExam && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#070a14] border border-purple-500/30 shadow-[0_8px_32px_rgba(168,85,247,0.15)] backdrop-blur-2xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold animate-pulse">
                  <AlertTriangle size={12} className="text-red-400" />
                  NEXT TARGET EXAM
                </span>
                <span className="text-xs text-purple-300/70 font-semibold uppercase tracking-wider">
                  {nextImmediateExam.type.toUpperCase()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {nextImmediateExam.subject}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-purple-400" />
                  {nextImmediateExam.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-indigo-400" />
                  {nextImmediateExam.time}
                </span>
                {nextImmediateExam.batch && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Users size={13} />
                    {nextImmediateExam.batch}
                  </span>
                )}
              </div>
            </div>

            {/* Big Live Ticking Digits */}
            {(() => {
              const cd = getCountdown(nextImmediateExam.date, nextImmediateExam.time);
              if (cd.isToday) {
                return (
                  <div className="px-5 py-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 font-black text-lg text-center animate-pulse">
                    ⚡ EXAM IS TODAY!
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-2 sm:gap-3 bg-black/40 p-3 sm:p-4 rounded-2xl border border-white/[0.08]">
                  <div className="text-center px-2">
                    <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
                      {String(cd.days).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Days</div>
                  </div>
                  <span className="text-xl font-bold text-slate-600">:</span>
                  <div className="text-center px-2">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                      {String(cd.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hours</div>
                  </div>
                  <span className="text-xl font-bold text-slate-600">:</span>
                  <div className="text-center px-2">
                    <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                      {String(cd.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mins</div>
                  </div>
                  <span className="text-xl font-bold text-slate-600">:</span>
                  <div className="text-center px-2">
                    <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      {String(cd.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Secs</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="text-purple-400" size={20} />
            SCMS S1 Examination Master Schedule
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            4 Practical / Lab Exams & 5 Semester-End Theory Papers • SCMS Autonomous 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-[#070914] p-1 rounded-2xl border border-white/[0.08]">
            {(['all', 'practical', 'theory'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic('light');
                  setFilter(tab);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                  filter === tab
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All (9)' : tab === 'practical' ? 'Practicals (4)' : 'Theory (5)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              openAddModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/[0.1] active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map((exam) => {
          const cd = getCountdown(exam.date, exam.time);
          const isUrgent = !cd.isPast && cd.days <= 3;
          const isPractical = exam.type === 'practical' || exam.type === 'viva';

          return (
            <GlassCard key={exam.id} className="relative overflow-hidden group">
              <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-4">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isPractical
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                          : 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                      }`}
                    >
                      {isPractical ? <FlaskConical size={10} /> : <BookOpen size={10} />}
                      {exam.type}
                    </span>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(exam)}
                        className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-white/[0.06]"
                        title="Edit Exam"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${exam.subject} from exam list?`)) {
                            onDeleteExam(exam.id);
                          }
                        }}
                        className="p-1 hover:text-red-400 text-slate-500 rounded-lg hover:bg-white/[0.06]"
                        title="Delete Exam"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                      {exam.subject}
                    </h4>
                    {exam.courseCode && (
                      <p className="text-[11px] font-mono text-purple-300/80 mt-0.5">
                        {exam.courseCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-300/90 pt-1 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={13} className="text-purple-400" /> Date:
                    </span>
                    <span className="font-semibold text-white">{exam.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={13} className="text-indigo-400" /> Time:
                    </span>
                    <span className="font-semibold text-slate-200">{exam.time}</span>
                  </div>

                  {exam.batch && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Users size={13} className="text-emerald-400" /> Batch:
                      </span>
                      <span className="font-medium text-slate-300">{exam.batch}</span>
                    </div>
                  )}

                  {exam.room && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin size={13} className="text-amber-400" /> Venue:
                      </span>
                      <span className="font-medium text-slate-300">{exam.room}</span>
                    </div>
                  )}

                  {exam.notes && (
                    <p className="text-[11px] text-slate-400/80 italic pt-1 line-clamp-2">
                      {exam.notes}
                    </p>
                  )}
                </div>

                {/* Live Countdown Footer */}
                <div className="pt-2">
                  {cd.isPast ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 size={14} /> Completed
                    </div>
                  ) : cd.isToday ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black text-red-300 bg-red-500/20 border border-red-500/40 px-3 py-2 rounded-xl animate-pulse">
                      <AlertTriangle size={14} /> EXAM IS TODAY!
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                        isUrgent
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-purple-300'
                      }`}
                    >
                      <span className="text-[11px] font-sans text-slate-400 font-semibold">T-Minus:</span>
                      <span>{cd.days}d {cd.hours}h {cd.minutes}m {cd.seconds}s</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add / Edit Exam Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#070914] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" />
                  {editingExam ? 'Edit Examination' : 'Add Examination'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveExam} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Calculus and Optimization"
                    className="w-full mt-1 px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Course Code</label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="e.g. 26GAMAT101"
                      className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 bg-[#0d1020] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="theory">Theory Examination</option>
                      <option value="practical">Practical / Lab Exam</option>
                      <option value="internal">Series / IAT Internal</option>
                      <option value="viva">Viva Voce</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Exam Date (YYYY-MM-DD) *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Timing</label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="09:30–12:00 IST"
                      className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Batch</label>
                    <input
                      type="text"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="S1 CSE-3, Batch 1"
                      className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Room / Venue</label>
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="SCMS Exam Hall / AD 207"
                      className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Important Notes / Chapters</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key modules, instruments to bring, or exam guidelines..."
                    className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-90"
                  >
                    {editingExam ? 'Save Changes' : 'Add to Schedule'}
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
