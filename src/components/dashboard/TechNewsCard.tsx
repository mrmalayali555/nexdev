'use client';

import { motion } from 'framer-motion';
import {
  Newspaper,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  RotateCcw,
  BookOpen,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useNews } from '@/hooks/useNews';
import { triggerHaptic } from '@/lib/haptics';

export default function TechNewsCard() {
  const {
    stories,
    currentStory,
    currentIndex,
    isLoaded,
    readCount,
    totalCount,
    isAllRead,
    shouldShow2PMAlert,
    markAsRead,
    nextStory,
    prevStory,
    resetAllRead,
  } = useNews();

  if (!isLoaded) return null;

  // Empty State: Prominent button to enter daily tech news with AI analysis
  if (stories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-950/40 via-[#0d121f] to-[#090d16] border border-white/10 backdrop-blur-2xl shadow-xl"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 2:00 PM Reminder Alert Banner */}
        {shouldShow2PMAlert && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-purple-500/10 border border-amber-500/30 flex items-center justify-between gap-3 relative z-10 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-200">
                  Daily Briefing Reminder (Past 2:00 PM)
                </p>
                <p className="text-[11px] text-gray-300 truncate">
                  No briefing added for today yet. Paste your news to curate!
                </p>
              </div>
            </div>
            <Link
              href="/news/add"
              onClick={() => triggerHaptic('light')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-extrabold text-xs shrink-0 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Paste</span>
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-600/30">
              <Newspaper size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Daily Tech Briefing
            </span>
          </div>

          <Link
            href="/news"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <span>All Stories</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="relative z-10 text-center py-6 sm:py-7 px-3">
          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            Enter Today&apos;s Tech Briefing
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-5 leading-relaxed">
            Paste long text from your tech newsletters or channels. AI will automatically extract the headlines, categorize the stories, and generate your interactive daily reader!
          </p>
          <Link
            href="/news/add"
            onClick={() => triggerHaptic('light')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus size={16} />
            <span>Paste Briefing to Analyze</span>
          </Link>
        </div>
      </motion.div>
    );
  }

  const handleMarkRead = (id: string) => {
    triggerHaptic('success');
    markAsRead(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-950/40 via-[#0d121f] to-[#090d16] border border-white/10 backdrop-blur-2xl shadow-xl"
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2:00 PM Reminder Alert Banner */}
      {shouldShow2PMAlert && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-purple-500/10 border border-amber-500/30 flex items-center justify-between gap-3 relative z-10 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
              <Clock size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-200">
                Daily Briefing Reminder (Past 2:00 PM)
              </p>
              <p className="text-[11px] text-gray-300 truncate">
                No briefing added for today yet. Paste your news to curate!
              </p>
            </div>
          </div>
          <Link
            href="/news/add"
            onClick={() => triggerHaptic('light')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-extrabold text-xs shrink-0 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Paste</span>
          </Link>
        </div>
      )}

      {/* Card Header: Category & Counter */}
      <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-600/30">
            <Newspaper size={14} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Daily Tech Briefing
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Story Indicator badge */}
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
            {currentIndex + 1} / {totalCount}
          </span>

          {/* Add News dedicated button */}
          <Link
            href="/news/add"
            onClick={() => triggerHaptic('light')}
            className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Paste custom briefing"
          >
            <Plus size={13} />
            <span>Add News</span>
          </Link>
        </div>
      </div>

      {/* Story Heading Section (One at a time) */}
      {currentStory && (
        <div className="relative z-10">
          {/* Category tag & Read status */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20">
              {currentStory.category}
            </span>
            {currentStory.read ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 size={12} /> Completed
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">
                • Unread
              </span>
            )}
          </div>

          {/* Story Title */}
          <h4 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug tracking-tight">
            {currentStory.title}
          </h4>

          {/* 1-Sentence Summary Teaser */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 line-clamp-2">
            {currentStory.summary}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
            {/* Carousel navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  prevStory();
                }}
                disabled={currentIndex === 0}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Previous story"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  nextStory();
                }}
                disabled={currentIndex >= totalCount - 1}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Next story"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Read & Mark Done Controls */}
            <div className="flex items-center gap-2">
              {!currentStory.read && (
                <button
                  onClick={() => handleMarkRead(currentStory.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Done</span>
                </button>
              )}

              <Link
                href="/news"
                onClick={() => triggerHaptic('light')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-purple-600/20"
              >
                <span>Read Full Story</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* All Stories Read Milestone Card */}
      {isAllRead && (
        <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span>🎉</span> All {totalCount} daily stories read!
          </span>
          <button
            onClick={() => {
              triggerHaptic('medium');
              resetAllRead();
            }}
            className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] underline"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      )}
    </motion.div>
  );
}
