'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { AcademicHomework } from '@/lib/academicTypes';
import { triggerHaptic } from '@/lib/haptics';

interface HomeworkCardProps {
  homework: AcademicHomework[];
  onAddHomework: (hw: Omit<AcademicHomework, 'id' | 'createdAt'>) => void;
  onToggleHomework: (id: string) => void;
  onDeleteHomework: (id: string) => void;
}

export default function HomeworkCard({
  homework,
  onAddHomework,
  onToggleHomework,
  onDeleteHomework,
}: HomeworkCardProps) {
  const [filter, setFilter] = useState<'all' | 'due-tomorrow' | 'pending' | 'completed'>('pending');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Calculus and Optimization');
  const [courseCode, setCourseCode] = useState('26GAMAT101');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [notes, setNotes] = useState('');

  // Dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const openAddModal = (isTomorrow = false) => {
    setTitle('');
    setSubject('Calculus and Optimization');
    setCourseCode('26GAMAT101');
    setDueDate(isTomorrow ? tomorrowStr : todayStr);
    setPriority('high');
    setNotes('');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onAddHomework({
      title: title.trim(),
      subject,
      courseCode,
      dueDate,
      priority,
      completed: false,
      notes: notes.trim() || undefined,
    });

    triggerHaptic('success');
    setShowModal(false);
  };

  const filteredHomework = homework.filter((hw) => {
    if (filter === 'due-tomorrow') return hw.dueDate === tomorrowStr && !hw.completed;
    if (filter === 'pending') return !hw.completed;
    if (filter === 'completed') return hw.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="text-purple-400" size={20} />
            Assignments & Faculty Tasks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track homework, lab records, tutorial sheets & submissions due for tomorrow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              openAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-red-500/20 to-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 hover:border-amber-500/50 active:scale-95 transition-all"
          >
            <Clock size={13} />
            <span>+ Due Tomorrow</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              openAddModal(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-[#070914] p-1 rounded-2xl border border-white/[0.08] w-fit">
        {(['pending', 'due-tomorrow', 'all', 'completed'] as const).map((tab) => (
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
            {tab === 'due-tomorrow' ? 'Due Tomorrow' : tab}
          </button>
        ))}
      </div>

      {/* Homework List */}
      <div className="space-y-3">
        {filteredHomework.length === 0 ? (
          <GlassCard className="p-8 text-center space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400/60" />
            <p className="text-sm font-bold text-white">No pending tasks in this view!</p>
            <p className="text-xs text-slate-400">
              You are completely caught up with your college assignments.
            </p>
          </GlassCard>
        ) : (
          filteredHomework.map((hw) => {
            const isDueTomorrow = hw.dueDate === tomorrowStr;
            const isOverdue = hw.dueDate < todayStr && !hw.completed;

            return (
              <GlassCard
                key={hw.id}
                className={`p-4 transition-all duration-200 ${
                  isDueTomorrow && !hw.completed
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : isOverdue
                    ? 'border-red-500/40 bg-red-950/10'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        onToggleHomework(hw.id);
                      }}
                      className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        hw.completed
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                          : 'border border-slate-500 hover:border-purple-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 size={14} className={hw.completed ? 'block' : 'hidden'} />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {hw.subject}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            hw.priority === 'high'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : hw.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {hw.priority} priority
                        </span>

                        {isDueTomorrow && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Clock size={10} /> Due Tomorrow
                          </span>
                        )}

                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-semibold ${
                          hw.completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {hw.title}
                      </h4>

                      {hw.notes && (
                        <p className="text-xs text-slate-400 italic">{hw.notes}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-purple-400" />
                          Due: <strong className="text-slate-300">{hw.dueDate}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onDeleteHomework(hw.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/[0.04] transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Add Homework Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#070914] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  Add Academic Task / Homework
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Task Title / Homework *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete Chemistry Lab Record Experiment 4"
                    className="w-full mt-1 px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-[#0d1020] border border-white/[0.08] rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Calculus and Optimization">Calculus (26GAMAT101)</option>
                      <option value="Chemistry for Information Science">Chemistry (26GXCYT122)</option>
                      <option value="Engineering Graphics">Engineering Graphics (26GXEST103)</option>
                      <option value="Intro to Electrical & Electronics">Electrical & Electronics (26GXEST104)</option>
                      <option value="Programming in C">Programming in C (26UCEST105)</option>
                      <option value="Electronics Workshop">Electronics Workshop (26GXESL106)</option>
                      <option value="Electrical Workshop">Electrical Workshop (26GXESL106)</option>
                      <option value="Health & Wellness">Health & Wellness (26GXEST107)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 bg-[#0d1020] border border-white/[0.08] rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                    >
                      <option value="high">High (Due Tomorrow / Urgent)</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Due Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Notes / Questions to solve</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Page numbers, exercise numbers, or submission format..."
                    className="w-full mt-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
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
                    Save Homework
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
