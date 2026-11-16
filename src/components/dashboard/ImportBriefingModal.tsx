'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Newspaper, Clipboard, Check } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface ImportBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => Promise<any>;
  isImporting: boolean;
}

export default function ImportBriefingModal({
  isOpen,
  onClose,
  onImport,
  isImporting,
}: ImportBriefingModalProps) {
  const [text, setText] = useState('');
  const [pasted, setPasted] = useState(false);

  if (!isOpen) return null;

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
      // ignore
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isImporting) return;
    triggerHaptic('medium');
    await onImport(text.trim());
    setText('');
    onClose();
    triggerHaptic('success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[88] overflow-hidden flex flex-col justify-end sm:justify-center items-center">
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
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full sm:max-w-xl h-[85dvh] sm:h-[580px] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-[#090d16] border-t sm:border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Newspaper size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Import Tech Briefing
                </h3>
                <p className="text-[11px] text-gray-400">
                  Paste long newsletters; AI automatically splits stories
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleImport} className="flex-1 flex flex-col p-5 sm:p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Paste your raw newsletter or channel text:</span>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium active:scale-95"
              >
                {pasted ? <Check size={13} className="text-emerald-400" /> : <Clipboard size={13} />}
                <span>{pasted ? 'Pasted!' : 'Paste from Clipboard'}</span>
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste daily tech briefing, e.g.:&#10;📰 Daily Tech & News Briefing&#10;Monday, 16 November 2026...&#10;1. Anthropic prepares for $1.4T IPO...&#10;2. DeepMind AlphaProof 2.0..."
              className="flex-1 w-full p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
            />

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim() || isImporting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-40"
              >
                <Sparkles size={14} className={isImporting ? 'animate-spin' : ''} />
                <span>{isImporting ? 'Parsing Stories with AI...' : 'Parse & Add Stories'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}