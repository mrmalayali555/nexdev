'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Share2,
  BookOpen,
} from 'lucide-react';
import { TechNewsStory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';
import { sanitizeExternalUrl } from '@/lib/utils';
import { renderInlineMarkdown } from '@/components/ui/SafeMarkdown';

interface TechNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: TechNewsStory | null;
  onMarkRead: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  currentIndex: number;
  totalCount: number;
  onDeepDive: (id: string) => Promise<string | undefined>;
  isDeepDiving: boolean;
}

export default function TechNewsModal({
  isOpen,
  onClose,
  story,
  onMarkRead,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  currentIndex,
  totalCount,
  onDeepDive,
  isDeepDiving,
}: TechNewsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!isOpen || !story) return null;

  const safeSourceUrl = sanitizeExternalUrl(story.sourceUrl);

  const handleShare = () => {
    triggerHaptic('light');
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${story.title}\n\n${story.summary}`);
      setCopiedLink(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDeepDiveClick = async () => {
    triggerHaptic('medium');
    await onDeepDive(story.id);
  };

  const handleMarkAndNext = () => {
    triggerHaptic('success');
    onMarkRead(story.id);
  };

  const inlineClasses = {
    bold: 'text-white font-semibold',
    italic: 'text-purple-200',
    code: 'px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs',
    link: 'text-blue-400 hover:text-blue-300 underline underline-offset-2',
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-sm leading-relaxed text-gray-200">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // H3 header
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-white mt-4 mb-1">
                {renderInlineMarkdown(line.replace('### ', ''), inlineClasses)}
              </h3>
            );
          }
          // H4 header
          if (line.startsWith('#### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-purple-300 mt-3 mb-1">
                {renderInlineMarkdown(line.replace('#### ', ''), inlineClasses)}
              </h4>
            );
          }
          // Bullet point
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <span>{renderInlineMarkdown(content, inlineClasses)}</span>
              </div>
            );
          }
          // Blockquote
          if (line.trim().startsWith('>')) {
            return (
              <blockquote
                key={idx}
                className="pl-3 py-1 border-l-2 border-purple-500/50 italic text-purple-200/90 bg-purple-500/5 rounded-r-lg my-2"
              >
                {renderInlineMarkdown(line.replace(/^>\s*/, ''), inlineClasses)}
              </blockquote>
            );
          }

          return <p key={idx}>{renderInlineMarkdown(line, inlineClasses)}</p>;
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

        {/* Modal / Drawer Panel */}
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full sm:max-w-2xl h-[88dvh] sm:h-[720px] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-[#090d16] border-t sm:border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {story.category}
              </span>
              <span className="text-xs text-gray-500">
                {currentIndex + 1} of {totalCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                title="Share story"
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Scrollable Story Content */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto no-scrollbar space-y-5">
            {/* Title & Metadata */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>{story.date}</span>
                {story.read && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 size={13} /> Read
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {story.title}
              </h1>
            </div>

            {/* Executive Summary Callout */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-purple-100 text-sm leading-relaxed font-medium">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
                <BookOpen size={13} />
                Executive Summary
              </div>
              {story.summary}
            </div>

            {/* Story Full Body */}
            <div className="prose prose-invert max-w-none pt-2">
              {renderMarkdown(story.fullContent)}
            </div>

            {/* External Source Link */}
            {safeSourceUrl && (
              <div className="pt-2">
                <a
                  href={safeSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-purple-300 font-medium transition-colors"
                >
                  <Globe size={13} />
                  <span>View Original Source</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* AI Deep Dive / Know More Grounding Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      AI Deep Dive & Grounding
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Grounded analysis, architectural significance & market impact
                    </p>
                  </div>
                </div>

                {!story.deepDive && (
                  <button
                    onClick={handleDeepDiveClick}
                    disabled={isDeepDiving}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-50"
                  >
                    <Sparkles size={13} className={isDeepDiving ? 'animate-spin' : ''} />
                    <span>{isDeepDiving ? 'Analyzing...' : 'Know More'}</span>
                  </button>
                )}
              </div>

              {/* Deep Dive Render Container */}
              {story.deepDive ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-black/40 border border-purple-500/30 text-xs sm:text-sm text-gray-200 leading-relaxed shadow-lg">
                  {renderMarkdown(story.deepDive)}
                </div>
              ) : isDeepDiving ? (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center gap-3 text-purple-300 text-xs">
                  <Sparkles size={16} className="animate-spin text-purple-400" />
                  <span>Synthesizing real-time market impact and technical analysis...</span>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Tap &ldquo;Know More&rdquo; to unlock AI-synthesized architectural breakdowns, ecosystem ripples, and future forecasts.
                </p>
              )}
            </div>
          </div>

          {/* Sticky Reader Navigation Bar */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-white/10 bg-[#090d16]/95 backdrop-blur-xl flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Prev / Next controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onPrev();
                }}
                disabled={!hasPrev}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous story"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onNext();
                }}
                disabled={!hasNext}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next story"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Mark as Read & Advance */}
            <button
              onClick={handleMarkAndNext}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                story.read
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              }`}
            >
              <CheckCircle2 size={15} />
              <span>{story.read ? 'Completed (Next)' : 'Mark as Read & Next'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
