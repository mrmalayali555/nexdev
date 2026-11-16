'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDailyQuote } from '@/lib/quotes';
import { getGreeting, getFormattedDate } from '@/lib/utils';
import { Quote, Sparkles } from 'lucide-react';

export default function QuoteCard() {
  const [quote, setQuote] = useState({
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
  });
  const [greeting, setGreeting] = useState('Welcome');
  const [date, setDate] = useState('');

  useEffect(() => {
    setQuote(getDailyQuote());
    setGreeting(getGreeting());
    setDate(getFormattedDate());
  }, []);

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
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {date || 'Today'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>{greeting}</span>
          <span className="wave-emoji text-2xl">👋</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-200 italic leading-relaxed font-serif">
          &ldquo;{quote.text}&rdquo;
        </p>

        <p className="text-xs text-purple-400 mt-2 font-sans font-semibold">
          — {quote.author}
        </p>
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
}
