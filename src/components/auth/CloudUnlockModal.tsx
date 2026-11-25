'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { hydrateFromCloud } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptics';

export interface CloudAuthContextValue {
  isCloudLocked: boolean;
  authChecked: boolean;
  openUnlockModal: () => void;
}

export const CloudAuthContext = createContext<CloudAuthContextValue>({
  isCloudLocked: false,
  authChecked: false,
  openUnlockModal: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexdev-open-unlock'));
    }
  },
});

export function useCloudAuth() {
  return useContext(CloudAuthContext);
}

interface CloudUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked: boolean;
  onUnlocked: () => void;
  onLockChanged?: (locked: boolean) => void;
}

export default function CloudUnlockModal({
  isOpen,
  onClose,
  isLocked,
  onUnlocked,
  onLockChanged,
}: CloudUnlockModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setPassphrase('');
    setShowPassphrase(false);
    setError(null);
    setStatusMessage(null);
    setUnlockedSuccess(false);
    onClose();
  }, [submitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    if (isLocked) {
      focusTimerRef.current = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLocked, handleClose]);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const secret = passphrase.trim();
    if (!secret || submitting) return;

    setSubmitting(true);
    setError(null);
    setStatusMessage(null);
    triggerHaptic('light');

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
      const res = await fetch(`${apiBase}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: apiBase ? 'include' : 'same-origin',
        body: JSON.stringify({ secret }),
        signal: controller.signal,
      });

      const payload = (await res.json().catch(() => null)) as {
        authenticated?: boolean;
        error?: string;
      } | null;

      if (res.ok && payload?.authenticated) {
        setPassphrase('');
        setUnlockedSuccess(true);
        setStatusMessage('Cloud Sync Unlocked — Re-hydrating your cloud data...');
        triggerHaptic('success');

        await hydrateFromCloud().catch(() => null);
        onUnlocked();

        reloadTimerRef.current = setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }

      if (res.status === 401) {
        setError('Invalid access passphrase. Please check and try again.');
      } else if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else if (res.status === 503) {
        setError(payload?.error || 'Server passphrase authentication is not configured.');
      } else {
        setError(payload?.error || 'Unable to verify passphrase. Please try again.');
      }
      triggerHaptic('warning');
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setError('Network error while contacting authentication service.');
      } else {
        setError('Request timed out. Please try again.');
      }
      triggerHaptic('warning');
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  const handleLockSession = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setStatusMessage(null);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
      await fetch(`${apiBase}/api/auth`, {
        method: 'DELETE',
        credentials: apiBase ? 'include' : 'same-origin',
        signal: controller.signal,
      });

      const verifyRes = await fetch(`${apiBase}/api/auth`, {
        cache: 'no-store',
        credentials: apiBase ? 'include' : 'same-origin',
        signal: controller.signal,
      });
      const verifyData = (await verifyRes.json().catch(() => null)) as {
        authenticated?: boolean;
      } | null;

      if (verifyData?.authenticated === false) {
        onLockChanged?.(true);
        setStatusMessage('Cloud session locked.');
        triggerHaptic('success');
      } else {
        onLockChanged?.(false);
        setStatusMessage('Server is running in open local dev mode (no API_AUTH_SECRET set).');
      }
    } catch {
      setError('Unable to update cloud session state.');
      triggerHaptic('warning');
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] overflow-hidden flex flex-col justify-end sm:justify-center items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cloud-unlock-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            onClick={handleClose}
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative z-10 w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-[#090d16] border-t sm:border border-white/10 shadow-2xl shadow-black/95 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                    isLocked && !unlockedSuccess
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {isLocked && !unlockedSuccess ? <Lock size={18} /> : <ShieldCheck size={18} />}
                </div>
                <div>
                  <h2 id="cloud-unlock-title" className="text-base font-extrabold text-white leading-tight">
                    {isLocked && !unlockedSuccess ? 'Cloud Sync Locked' : 'Cloud Sync Active'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isLocked && !unlockedSuccess
                      ? 'Enter Access Passphrase'
                      : 'Authenticated HttpOnly session'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-40"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
              {isLocked || unlockedSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your local workspace remains available offline. Enter your server access passphrase to unlock encrypted cloud sync and AI proxy requests via an <code className="text-purple-300">HttpOnly</code> cookie.
                  </p>

                  <div>
                    <label
                      htmlFor="cloud-access-passphrase"
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5"
                    >
                      Access Passphrase
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                      <input
                        ref={inputRef}
                        id="cloud-access-passphrase"
                        name="passphrase"
                        type={showPassphrase ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        disabled={submitting || unlockedSuccess}
                        placeholder="Enter server passphrase..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassphrase((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                      >
                        {showPassphrase ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {statusMessage && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                    >
                      Later
                    </button>
                    <button
                      type="submit"
                      disabled={!passphrase.trim() || submitting || unlockedSuccess}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : unlockedSuccess ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Unlocked</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={14} />
                          <span>Unlock Cloud Sync</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your browser session is authorized to synchronize with your cloud database and use the server-side AI proxy.
                  </p>

                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {statusMessage && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleLockSession}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
                    >
                      {submitting ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                      <span>Lock Session</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
