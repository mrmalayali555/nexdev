'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Newspaper, Clipboard, Sparkles, ArrowLeft, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useNewsJob } from '@/context/NewsJobContext';
import { triggerHaptic } from '@/lib/haptics';

export default function AddNewsPage() {
  const router = useRouter();
  const { startJob, job } = useNewsJob();
  const [text, setText] = useState('');
  const [pasted, setPasted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setPasted(true);
        triggerHaptic('light');
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      // Clipboard access might be blocked in some browsers
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    triggerHaptic('medium');

    // Kick off background job (non-blocking!)
    startJob(text.trim());

    // Redirect to /news immediately so user is never blocked or stuck!
    router.push('/news');
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/news"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to News</span>
        </Link>

        <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Non-Blocking AI Analysis
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Newspaper size={18} />
          </div>
          <span>Add Tech News Briefing</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
          Paste your raw newsletters, WhatsApp digests, or articles. AI will extract each story, generate executive summaries, and prepare interactive readers.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Newsletter Text</span>
              <span className="text-[10px] text-gray-500 lowercase font-normal">
                ({text.length.toLocaleString()} characters)
              </span>
            </label>

            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {pasted ? <Check size={13} className="text-emerald-400" /> : <Clipboard size={13} />}
              <span>{pasted ? 'Pasted!' : 'Paste from Clipboard'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste raw text here, e.g.:&#10;&#10;📰 Daily Tech Briefing&#10;1. Anthropic prepares for a potential $1.4 trillion IPO...&#10;2. Google DeepMind unveils AlphaProof 2.0...&#10;3. China mandates nationwide AI curriculum..."
              rows={12}
              className="w-full bg-[#0d121f] border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 font-mono leading-relaxed transition-all resize-y"
              required
            />
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={14} />
            </div>
            <div className="text-[11px] text-gray-300 leading-relaxed">
              <p className="font-bold text-purple-200 mb-0.5">Dual-Engine Asynchronous Analysis</p>
              <p className="text-gray-400">
                You do not have to wait on this screen! Once you submit, you can navigate freely. A progress tracker at the bottom will notify you as each story is extracted and saved.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <Link
              href="/news"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles size={15} />
              <span>Start Background AI Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

