'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import HabitCard from '@/components/habits/HabitCard';
import HabitForm from '@/components/habits/HabitForm';
import HeatMap from '@/components/habits/HeatMap';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import Confetti from '@/components/ui/Confetti';
import { Habit, HabitCategory, HABIT_CATEGORIES } from '@/lib/types';
import { Plus, Sparkles, Calendar, Zap, Filter, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HabitsPage() {
  const { habits, loaded, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFrequency, setSelectedFrequency] = useState<'all' | 'daily' | 'weekly'>('all');
  const [selectedHeatmapHabitId, setSelectedHeatmapHabitId] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: {
    name: string;
    emoji: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekly';
    color: string;
    challengeMode?: '21-day' | '66-day' | null;
  }) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, {
        ...data,
        challengeStartDate: data.challengeMode ? (editingHabit.challengeStartDate || new Date().toISOString()) : undefined,
      });
    } else {
      addHabit({
        ...data,
        challengeStartDate: data.challengeMode ? new Date().toISOString() : undefined,
      });
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 2000);
    }
    setIsModalOpen(false);
  };

  const handleToggle = (id: string) => {
    toggleCompletion(id);
    const habit = habits.find((h) => h.id === id);
    const today = new Date().toISOString().split('T')[0];
    if (habit && !habit.completions[today]) {
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 2000);
    }
  };

  const filteredHabits = habits.filter((habit) => {
    const matchCategory = selectedCategory === 'All' || habit.category === selectedCategory;
    const matchFrequency = selectedFrequency === 'all' || habit.frequency === selectedFrequency;
    return matchCategory && matchFrequency;
  });

  const heatmapHabit = habits.find((h) => h.id === selectedHeatmapHabitId) || habits[0];

  return (
    <div className="space-y-5 sm:space-y-8 pb-12">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Habits</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              {habits.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Daily consistency shapes your future self.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="md" className="shrink-0 font-semibold">
          <Plus size={16} /> <span className="hidden xs:inline">New Habit</span><span className="xs:hidden">Add</span>
        </Button>
      </div>

      {/* "Build a Habit" Science & Challenge Banner */}
      <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 border border-purple-500/20 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">
                  Habit Science: 21 & 66 Rule
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Neuroscience
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                21 days breaks mental friction; 66 days automates neural pathways. Lock in your next challenge!
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto text-xs font-semibold py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles size={13} className="text-amber-400" /> Start Challenge
          </button>
        </div>
      </div>

      {/* Mobile-first Horizontal Scrollable Category Pills */}
      <div className="space-y-3">
        {/* Category Carousel */}
        <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 touch-pan-x">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md shadow-purple-500/25'
                : 'bg-white/[0.05] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>
          {HABIT_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-white/20 text-white border border-white/30 font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Frequency Toggles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            {(['all', 'daily', 'weekly'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setSelectedFrequency(freq)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedFrequency === freq
                    ? 'bg-purple-500/30 text-purple-200 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {filteredHabits.length} {filteredHabits.length === 1 ? 'habit' : 'habits'}
          </span>
        </div>
      </div>

      {/* Habit Cards List */}
      {filteredHabits.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 px-4">
            <Filter size={32} className="text-gray-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">No habits found</h3>
            <p className="text-xs text-gray-400 mt-1">Try switching categories or add your first habit.</p>
            <Button onClick={handleOpenAdd} className="mt-4" size="sm">
              <Plus size={14} /> Add Habit
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={deleteHabit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Habit History Heatmap Viewer */}
      {habits.length > 0 && (
        <GlassCard delay={0.2}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={17} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white">Consistency Heatmap</h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={heatmapHabit?.id || ''}
                  onChange={(e) => setSelectedHeatmapHabitId(e.target.value)}
                  className="bg-white/10 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {habits.map((h) => (
                    <option key={h.id} value={h.id} className="bg-gray-950 text-white">
                      {h.emoji} {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {heatmapHabit && <HeatMap habit={heatmapHabit} />}
          </div>
        </GlassCard>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <HabitForm
          initial={editingHabit}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
