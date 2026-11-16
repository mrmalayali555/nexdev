'use client';

import { useState } from 'react';
import { useJournal } from '@/hooks/useJournal';
import JournalCard from '@/components/journal/JournalCard';
import JournalEditor from '@/components/journal/JournalEditor';
import JournalDetailModal from '@/components/journal/JournalDetailModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import Confetti from '@/components/ui/Confetti';
import { Mood, MOODS, JournalEntry } from '@/lib/types';
import { Plus, Search, BookOpen, Heart, Sparkles, Filter, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function JournalPage() {
  const { entries, loaded, addEntry, updateEntry, deleteEntry, searchEntries } = useJournal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleFormSubmit = (data: {
    content: string;
    mood: Mood;
    gratitude: string[];
    tags: string[];
    date?: string;
  }) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, data);
      setEditingEntry(null);
    } else {
      addEntry(data);
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 2000);
    }
    setIsModalOpen(false);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setViewingEntry(null);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const displayedEntries = (searchQuery.trim() ? searchEntries(searchQuery) : entries).filter(
    (e) => selectedMood === 'all' || e.mood === selectedMood
  );

  const moodCounts = MOODS.map((m) => ({
    ...m,
    count: entries.filter((e) => e.mood === m.emoji).length,
  }));

  return (
    <div className="space-y-5 sm:space-y-8 pb-12">
      <Confetti trigger={confettiTrigger} />

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
        <Button onClick={handleOpenNew} size="md" className="shrink-0 font-semibold">
          <Plus size={16} /> <span className="hidden xs:inline">New Entry</span><span className="xs:hidden">Write</span>
        </Button>
      </div>

      {/* Mood Pulse Strip */}
      <div className="rounded-3xl p-4 sm:p-5 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-pink-400 fill-pink-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Emotional Pulse
            </h3>
          </div>
          {selectedMood !== 'all' && (
            <button
              onClick={() => setSelectedMood('all')}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              Reset filter ({selectedMood})
            </button>
          )}
        </div>

        {/* Horizontal scrollable on mobile */}
        <div className="overflow-x-auto no-scrollbar flex items-center gap-2 -mx-2 px-2 sm:mx-0 sm:px-0 touch-pan-x">
          {moodCounts.map((m) => (
            <button
              key={m.emoji}
              onClick={() => setSelectedMood(selectedMood === m.emoji ? 'all' : m.emoji)}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 w-16 transition-all ${
                selectedMood === m.emoji
                  ? 'bg-purple-500/25 border border-purple-500/50 scale-105 shadow-md shadow-purple-500/20'
                  : 'bg-white/[0.03] border border-white/5 active:bg-white/[0.08] hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-xl mb-0.5 filter drop-shadow">{m.emoji}</span>
              <span className="text-[10px] text-gray-300 font-medium truncate w-full text-center">{m.label}</span>
              <span className="text-[10px] font-bold text-purple-300 mt-0.5">{m.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search thoughts, tags, or gratitude..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Entries Feed */}
      {displayedEntries.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 px-4">
            <BookOpen size={32} className="text-gray-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">No reflections found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Try another search query.' : 'Document your journey and write today.'}
            </p>
            <Button onClick={handleOpenNew} className="mt-4" size="sm">
              <Plus size={14} /> Write First Entry
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onDelete={deleteEntry}
                onEdit={handleStartEdit}
                onSelect={setViewingEntry}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Journal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        title={editingEntry ? 'Edit Reflection' : "Today's Reflection"}
      >
        <JournalEditor
          initial={editingEntry}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
          }}
        />
      </Modal>

      {/* Full View Journal Detail Modal */}
      <JournalDetailModal
        isOpen={Boolean(viewingEntry)}
        onClose={() => setViewingEntry(null)}
        entry={viewingEntry}
        onEdit={handleStartEdit}
        onDelete={deleteEntry}
      />
    </div>
  );
}
