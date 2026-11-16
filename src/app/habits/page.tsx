'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useChallenges } from '@/hooks/useChallenges';
import HabitCard from '@/components/habits/HabitCard';
import HabitForm from '@/components/habits/HabitForm';
import HeatMap from '@/components/habits/HeatMap';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeForm from '@/components/challenges/ChallengeForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import Confetti from '@/components/ui/Confetti';
import { Habit, HabitCategory, HABIT_CATEGORIES } from '@/lib/types';
import { Plus, Sparkles, Calendar, Zap, Filter, Flame, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HabitsPage() {
  const { habits, loaded: habitsLoaded, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const { challenges, loaded: challengesLoaded, addChallenge, checkinDay, deleteChallenge } = useChallenges();

  const [activeTab, setActiveTab] = useState<'habits' | 'challenges'>('habits');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFrequency, setSelectedFrequency] = useState<'all' | 'daily' | 'weekly'>('all');
  const [selectedHeatmapHabitId, setSelectedHeatmapHabitId] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const loaded = habitsLoaded && challengesLoaded;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleOpenAddHabit = () => {
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleHabitSubmit = (data: {
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
    setIsHabitModalOpen(false);
  };

  const handleHabitToggle = (id: string) => {
    toggleCompletion(id);
    const habit = habits.find((h) => h.id === id);
    const today = new Date().toISOString().split('T')[0];
    if (habit && !habit.completions[today]) {
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 2000);
    }
  };

  const handleChallengeSubmit = (data: {
    title: string;
    description: string;
    category: HabitCategory;
    durationDays: number;
    color: string;
    emoji: string;
  }) => {
    addChallenge(data);
    setIsChallengeModalOpen(false);
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 2000);
  };

  const handleChallengeCheckin = (challengeId: string, dayNumber: number) => {
    checkinDay(challengeId, dayNumber);
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 2000);
  };

  const filteredHabits = habits.filter((habit) => {
    const matchCategory = selectedCategory === 'All' || habit.category === selectedCategory;
    const matchFrequency = selectedFrequency === 'all' || habit.frequency === selectedFrequency;
    return matchCategory && matchFrequency;
  });

  const heatmapHabit = habits.find((h) => h.id === selectedHeatmapHabitId) || habits[0];

  return (
    <div className="space-y-6 sm:space-y-10 pb-28 sm:pb-12">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Habits & Challenges</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              Live DB
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Build atomic daily routines and conquer 21/66-day transformation sprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'habits' ? (
            <Button onClick={handleOpenAddHabit} size="md" className="shrink-0 font-semibold shadow-lg shadow-purple-500/20">
              <Plus size={16} /> <span className="hidden xs:inline">New Habit</span><span className="xs:hidden">Habit</span>
            </Button>
          ) : (
            <Button onClick={() => setIsChallengeModalOpen(true)} size="md" className="shrink-0 font-semibold shadow-lg shadow-purple-500/20">
              <Zap size={16} /> <span className="hidden xs:inline">New Challenge</span><span className="xs:hidden">Challenge</span>
            </Button>
          )}
        </div>
      </div>

      {/* Segmented View Switcher: Habits vs Challenges */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'habits'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>Daily Habits</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {habits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'challenges'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={14} className="text-amber-400" />
          <span>Challenges (21/66d)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {challenges.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: DAILY HABITS */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          {/* Mobile-first Horizontal Scrollable Category Pills */}
          <div className="space-y-3">
            <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
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
                <p className="text-xs text-gray-400 mt-1">Add your own habits directly into your Supabase database.</p>
                <Button onClick={handleOpenAddHabit} className="mt-4" size="sm">
                  <Plus size={14} /> Add Habit
                </Button>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={handleHabitToggle}
                    onEdit={handleEditHabit}
                    onDelete={deleteHabit}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Habit History Heatmap Viewer */}
          {habits.length > 0 && (
            <GlassCard delay={0.2}>
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Annual Consistency Heatmap</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={heatmapHabit?.id || ''}
                      onChange={(e) => setSelectedHeatmapHabitId(e.target.value)}
                      className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
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
        </div>
      )}

      {/* VIEW 2: DATABASE-BACKED CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 border border-purple-500/20 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                  <Zap size={22} className="text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Database-Backed 21 & 66 Day Habit Challenges
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                    Every check-in is saved live to your Supabase PostgreSQL database. Tap any day number below to record your streak completion!
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsChallengeModalOpen(true)} size="sm" className="shrink-0 font-semibold shadow-md">
                <Plus size={14} /> Custom Challenge
              </Button>
            </div>
          </div>

          {challenges.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12 px-4">
                <Trophy size={36} className="text-gray-600 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-white">No active challenges</h3>
                <p className="text-xs text-gray-400 mt-1">Start a 21-day or 66-day sprint to transform your habits.</p>
                <Button onClick={() => setIsChallengeModalOpen(true)} className="mt-4" size="sm">
                  <Plus size={14} /> Start Challenge
                </Button>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onCheckinDay={handleChallengeCheckin}
                    onDelete={deleteChallenge}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Habit Modal */}
      <Modal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <HabitForm
          initial={editingHabit}
          onSubmit={handleHabitSubmit}
          onCancel={() => setIsHabitModalOpen(false)}
        />
      </Modal>

      {/* Add Challenge Modal */}
      <Modal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        title="Start New Challenge Sprint"
      >
        <ChallengeForm
          onSubmit={handleChallengeSubmit}
          onCancel={() => setIsChallengeModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
