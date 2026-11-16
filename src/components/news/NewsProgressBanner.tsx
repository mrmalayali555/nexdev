'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useNewsJob } from '@/context/NewsJobContext';
import { triggerHaptic } from '@/lib/haptics';

export default function NewsProgressBanner() {
  const { job, dismissJob } = useNewsJob();

  if (job.status === 'idle') return null;

  const isCompleted = job.status === 'completed';
  const isError = job.status === 'error';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[410px] z-40"
      >
        <div
          className={`rounded-2xl p-3.5 backdrop-blur-2xl shadow-2xl border transition-all duration-300 ${
            isCompleted
              ? 'bg-gradient-to-r from-emerald-950/90 via-[#0a1813]/90 to-[#091512]/95 border-emerald-500/40 shadow-emerald-500/10'
              : isError
              ? 'bg-gradient-to-r from-rose-950/90 via-[#1c0a0e]/90 to-[#12080a]/95 border-rose-500/40 shadow-rose-500/10'
              : 'bg-gradient-to-r from-purple-950/90 via-[#0d1222]/90 to-[#090d16]/95 border-purple-500/40 shadow-purple-500/10'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Status Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isError
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : isError ? (
                  <AlertCircle size={16} />
                ) : (
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                )}
              </div>

              {/* Title & Message */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-white truncate">
                    {isCompleted
                      ? 'Briefing Ready!'
                      : isError
                      ? 'Briefing Parsing Failed'
                      : 'Analyzing Tech Briefing'}
                  </p>
                  <span
                    className={`text-xs font-mono font-bold shrink-0 ${
                      isCompleted
                        ? 'text-emerald-400'
                        : isError
                        ? 'text-rose-400'
                        : 'text-purple-300'
                    }`}
                  >
                    {job.progress}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 truncate mt-0.5">
                  {job.message}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {isCompleted && (
                <Link
                  href="/news"
                  onClick={() => {
                    triggerHaptic('light');
                    dismissJob();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span>View</span>
                  <ArrowRight size={12} />
                </Link>
              )}

              <button
                onClick={() => {
                  triggerHaptic('light');
                  dismissJob();
                }}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Animated Progress Bar */}
          {!isCompleted && !isError && (
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${job.progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

