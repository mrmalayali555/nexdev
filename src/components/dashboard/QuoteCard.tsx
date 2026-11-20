'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyQuote } from '@/lib/quotes';
import { getGreeting, getFormattedDate } from '@/lib/utils';
import { Quote, Sparkles } from 'lucide-react';
import { generateAIQuote } from '@/lib/ai';
import { triggerHaptic } from '@/lib/haptics';

export default function QuoteCard() {
  const [quote, setQuote] = useState({
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
  });
  const [greeting, setGreeting] = useState('Welcome');
  const [date, setDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    setDate(getFormattedDate());

    // Automatically generate a fresh AI quote on every page load
    setIsRefreshing(true);
    generateAIQuote()
      .then((aiQuote) => {
        if (aiQuote && aiQuote.text) {
          setQuote(aiQuote);
          try {
            localStorage.setItem('nexdev_current_quote', JSON.stringify(aiQuote));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Auto AI quote generation fallback:', err);
        setQuote(getDailyQuote());
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, []);

  const handleRefreshQuote = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerHaptic('light');

    try {
      const newQuote = await generateAIQuote();
      setQuote(newQuote);
      localStorage.setItem('nexdev_current_quote', JSON.stringify(newQuote));
      triggerHaptic('success');
    } catch (e) {
      console.warn('Quote refresh failed:', e);
      triggerHaptic('warning');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-purple-950/40 via-[#0a0d1d]/80 to-[#05070e] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
    >
      {/* Specular top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />

      {/* Decorative quote icon silhouette */}
      <div className="absolute top-3 right-3 text-purple-400/[0.06] pointer-events-none">
        <Quote size={84} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 shadow-sm">
            {date || 'Today'}
          </span>

          {/* AI Refresh Button */}
          <button
            onClick={handleRefreshQuote}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs text-purple-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="Generate fresh AI quote"
          >
            <Sparkles size={12} className={isRefreshing ? 'animate-spin text-purple-400' : 'text-purple-400'} />
            <span className="text-[11px] font-semibold">
              {isRefreshing ? 'Summoning...' : 'AI Quote'}
            </span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white mb-2.5 flex items-center gap-2 tracking-tight">
          <span className="bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">{greeting}</span>
          <span className="wave-emoji text-2xl">👋</span>
        </h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={quote.text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed font-serif">
              &ldquo;{quote.text}&rdquo;
            </p>

            <p className="text-xs text-purple-400 mt-2 font-sans font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>{quote.author}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative subtle ambient lights */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}
