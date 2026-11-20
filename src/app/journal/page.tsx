'use client';

import { useState } from 'react';
import { useJournal } from '@/hooks/useJournal';
import JournalCard from '@/components/journal/JournalCard';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import { Mood, MOODS, JournalEntry } from '@/lib/types';
import { Plus, Search, BookOpen, Heart, Sparkles, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export default function JournalPage() {
  const { entries, loaded, deleteEntry, searchEntries } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const displayedEntries = (searchQuery.trim() ? searchEntries(searchQuery) : entries).filter(
    (e) => selectedMood === 'all' || e.mood === selectedMood
  );

  const moodCounts = MOODS.map((m) => ({
    ...m,
    count: entries.filter((e) => e.mood === m.emoji).length,
  }));

  return (
    <div className="space-y-5 sm:space-y-8 pb-28 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Journal</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              {entries.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Capture thoughts, track emotional wellness, and cultivate gratitude.
          </p>
        </div>

        <Link
          href="/journal/new"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </Link>
      </div>

      {/* Mood Pulse Strip */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#0b0e20]/70 via-[#070914]/80 to-[#05070e] border border-white/[0.08] backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-pink-400 fill-pink-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Emotional Pulse
            </h3>
          </div>
          {selectedMood !== 'all' && (
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedMood('all');
              }}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
            >
              <X size={12} /> Clear Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {moodCounts.map((m) => {
            const isSelected = selectedMood === m.emoji;
            return (
              <button
                key={m.emoji}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedMood(isSelected ? 'all' : (m.emoji as Mood));
                }}
                className={`flex flex-col items-center p-2 sm:p-2.5 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-purple-500/25 border border-purple-500/40 shadow-md shadow-purple-500/10'
                    : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-xl sm:text-2xl filter drop-shadow">{m.emoji}</span>
                <span className="text-[10px] font-bold text-gray-300 mt-1 hidden sm:inline">
                  {m.label}
                </span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {m.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections, gratitude, or #tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Journal Entries List */}
      {displayedEntries.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 px-4">
            <BookOpen size={36} className="text-gray-600 mx-auto mb-2.5" />
            <h3 className="text-base font-bold text-white">
              {entries.length === 0 ? 'Your journal is empty' : 'No reflections match search'}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {entries.length === 0
                ? 'Writing down thoughts clears mental fog and creates gratitude momentum.'
                : 'Try clearing your search query or mood filter.'}
            </p>
            {entries.length === 0 && (
              <Link
                href="/journal/new"
                onClick={() => triggerHaptic('light')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all hover:brightness-110"
              >
                <Plus size={14} /> Write First Reflection
              </Link>
            )}
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onDelete={deleteEntry}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
