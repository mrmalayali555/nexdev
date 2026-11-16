'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, MOODS } from '@/lib/types';
import { Calendar, Hash, Heart, Trash2, Edit3, X, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface JournalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function JournalDetailModal({
  isOpen,
  onClose,
  entry,
  onEdit,
  onDelete,
}: JournalDetailModalProps) {
  if (!isOpen || !entry) return null;

  const moodData = MOODS.find((m) => m.emoji === entry.mood);

  const handleEditClick = () => {
    triggerHaptic('light');
    onEdit(entry);
  };

  const handleDeleteClick = () => {
    triggerHaptic('medium');
    if (confirm('Are you sure you want to delete this reflection?')) {
      onDelete(entry.id);
      onClose();
    }
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-sm leading-relaxed text-gray-200">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />;

          if (line.startsWith('### ')) {
            return (
              <h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">
                {line.slice(4)}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={i} className="text-base font-bold text-white mt-4 mb-1">
                {line.slice(3)}
              </h3>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={i}
                className="border-l-2 border-purple-500/60 pl-3 my-2 text-purple-200 italic text-sm bg-purple-500/5 py-1.5 rounded-r-xl"
              >
                {line.slice(2)}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={i} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <span>{line.slice(2)}</span>
              </div>
            );
          }
          return <p key={i}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col justify-end sm:justify-center items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.96 }}
          transition={{ type: 'spring', damping: 30, stiffness: 360 }}
          className="relative z-10 w-full sm:max-w-xl h-[88dvh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-[#090d16] border-t sm:border border-white/10 shadow-2xl shadow-black/95 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/5 bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl filter drop-shadow">{entry.mood}</span>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={12} className="text-purple-400" />
                  <span>
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: moodData?.color || '#a855f7' }}
                >
                  Feeling {moodData?.label || 'Reflective'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Entry Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
            {/* Reflection Content */}
            <div className="prose prose-invert max-w-none">
              {renderContent(entry.content)}
            </div>

            {/* Gratitude Section */}
            {entry.gratitude && entry.gratitude.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Heart size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Grateful For
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {entry.gratitude.map((g, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-gray-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-medium border border-purple-500/20"
                    >
                      <Hash size={11} className="text-purple-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="shrink-0 px-5 py-3 sm:py-3.5 border-t border-white/10 bg-[#0c101d] flex items-center justify-between gap-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
            <button
              onClick={handleDeleteClick}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleEditClick}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Edit3 size={13} />
                <span>Edit Reflection</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
