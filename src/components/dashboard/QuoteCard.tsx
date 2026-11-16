'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyQuote } from '@/lib/quotes';
import { getGreeting, getFormattedDate } from '@/lib/utils';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
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

    // Automatically generate a fresh AI quote on every page refresh / load!
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
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-purple-900/40 via-indigo-950/40 to-slate-900/50 border border-purple-500/20 backdrop-blur-2xl shadow-xl"
    >
      <div className="absolute top-3 right-3 text-purple-400/10 pointer-events-none">
        <Quote size={64} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {date || 'Today'}
          </span>

          {/* AI Refresh Button */}
          <button
            onClick={handleRefreshQuote}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-purple-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="Generate fresh AI quote"
          >
            <Sparkles size={12} className={isRefreshing ? 'animate-spin text-purple-400' : 'text-purple-400'} />
            <span className="text-[11px] font-medium">
              {isRefreshing ? 'Summoning...' : 'AI Quote'}
            </span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>{greeting}</span>
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
            <p className="text-sm sm:text-base text-gray-200 italic leading-relaxed font-serif">
              &ldquo;{quote.text}&rdquo;
            </p>

            <p className="text-xs text-purple-400 mt-2 font-sans font-semibold">
              — {quote.author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
}
