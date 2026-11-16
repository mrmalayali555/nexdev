'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
} from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import TechNewsModal from './TechNewsModal';
import ImportBriefingModal from './ImportBriefingModal';
import { triggerHaptic } from '@/lib/haptics';

export default function TechNewsCard() {
  const {
    stories,
    currentStory,
    currentIndex,
    isLoaded,
    isImporting,
    isDeepDiving,
    readCount,
    totalCount,
    isAllRead,
    shouldShow2PMAlert,
    markAsRead,
    nextStory,
    prevStory,
    importBriefing,
    generateDeepDive,
    resetAllRead,
  } = useNews();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  if (!isLoaded || stories.length === 0) return null;

  const handleOpenReader = () => {
    triggerHaptic('light');
    setIsModalOpen(true);
  };

  const handleMarkRead = (id: string) => {
    triggerHaptic('success');
    markAsRead(id);
  };

  return (
    <>
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
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsImportModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-extrabold text-xs shrink-0 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Paste</span>
            </button>
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

          <div className="flex items-center gap-1.5">
            {/* Story Indicator badge */}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
              {currentIndex + 1} / {totalCount}
            </span>

            {/* Import / Paste briefing button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsImportModalOpen(true);
              }}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              title="Paste custom briefing"
            >
              <Plus size={14} />
            </button>
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

            {/* Big Sleek Clickable Headline */}
            <button
              onClick={handleOpenReader}
              className="text-left group block w-full my-1 transition-all"
            >
              <h2 className="text-base sm:text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
                {currentStory.title}
              </h2>
            </button>

            {/* Quick 1-sentence teaser */}
            <p className="text-xs text-gray-400 line-clamp-1 mt-1 mb-4">
              {currentStory.summary}
            </p>

            {/* Progress Bar & Actions Bar */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
              {/* Previous / Next story buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    prevStory();
                  }}
                  disabled={currentIndex === 0}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  title="Previous story"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    nextStory();
                  }}
                  disabled={currentIndex >= totalCount - 1}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  title="Next story"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Action: Read Full Story or Mark Read */}
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

                <button
                  onClick={handleOpenReader}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-purple-600/20"
                >
                  <span>Read</span>
                  <ArrowRight size={13} />
                </button>
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

      {/* Reader Modal */}
      <TechNewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        story={currentStory}
        onMarkRead={markAsRead}
        onNext={nextStory}
        onPrev={prevStory}
        hasNext={currentIndex < totalCount - 1}
        hasPrev={currentIndex > 0}
        currentIndex={currentIndex}
        totalCount={totalCount}
        onDeepDive={generateDeepDive}
        isDeepDiving={isDeepDiving}
      />

      {/* Import / Paste Newsletter Modal */}
      <ImportBriefingModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importBriefing}
        isImporting={isImporting}
      />
    </>
  );
}
