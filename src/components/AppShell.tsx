'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Unlock, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import MobileHeader from '@/components/MobileHeader';
import AICoachButton from '@/components/ai/AICoachButton';
import NewsProgressBanner from '@/components/news/NewsProgressBanner';
import CloudUnlockModal, { CloudAuthContext } from '@/components/auth/CloudUnlockModal';
import { triggerHaptic } from '@/lib/haptics';

function isOfflineOrCapacitorStatic(): boolean {
  if (typeof window === 'undefined') return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    if (Capacitor.isNativePlatform() && !apiBase) return true;
  } catch {
    // Ignore when Capacitor bridge is absent in web browsers
  }
  return false;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAcademics = pathname.startsWith('/academics');

  const [isCloudLocked, setIsCloudLocked] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const handleAuthRequired = () => {
      setAuthChecked(true);
      setIsCloudLocked(true);
    };

    const handleOpenUnlock = () => {
      setShowUnlockModal(true);
    };

    window.addEventListener('nexdev-auth-required', handleAuthRequired);
    window.addEventListener('nexdev-open-unlock', handleOpenUnlock);

    let isMounted = true;

    if (isOfflineOrCapacitorStatic()) {
      queueMicrotask(() => {
        if (isMounted) setAuthChecked(true);
      });
      return () => {
        isMounted = false;
        window.removeEventListener('nexdev-auth-required', handleAuthRequired);
        window.removeEventListener('nexdev-open-unlock', handleOpenUnlock);
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const apiBase = process.env.NEXT_PUBLIC_APP_URL || '';

    fetch(`${apiBase}/api/auth`, {
      cache: 'no-store',
      credentials: apiBase ? 'include' : 'same-origin',
      signal: controller.signal,
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) return null;
        return (await res.json()) as { authenticated?: boolean };
      })
      .then((data) => {
        if (!isMounted || !data) return;
        setAuthChecked(true);
        if (data.authenticated === false) {
          setIsCloudLocked(true);
        } else if (data.authenticated === true) {
          setIsCloudLocked(false);
        }
      })
      .catch(() => {
        if (isMounted) setAuthChecked(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
      window.removeEventListener('nexdev-auth-required', handleAuthRequired);
      window.removeEventListener('nexdev-open-unlock', handleOpenUnlock);
    };
  }, []);

  const openUnlockModal = useCallback(() => {
    setShowUnlockModal(true);
  }, []);

  const handleCloseUnlockModal = useCallback(() => {
    setShowUnlockModal(false);
  }, []);

  const handleUnlocked = useCallback(() => {
    setIsCloudLocked(false);
    setBannerDismissed(false);
    setAuthChecked(true);
  }, []);

  const handleLockChanged = useCallback((locked: boolean) => {
    setIsCloudLocked(locked);
    if (locked) {
      setBannerDismissed(false);
    }
  }, []);

  const authContextValue = useMemo(
    () => ({ isCloudLocked, authChecked, openUnlockModal }),
    [isCloudLocked, authChecked, openUnlockModal]
  );

  return (
    <CloudAuthContext.Provider value={authContextValue}>
      {/* Desktop Sidebar (Renders Personal or Academic menu, null on Home) */}
      {!isHome && <Sidebar />}

      {/* Mobile Header (null on Home) */}
      {!isHome && <MobileHeader />}

      {/* Main Content Area (Full width on Home, indented on portal pages) */}
      <div
        className={`relative z-10 flex flex-col min-h-screen transition-all duration-300 ${
          isHome ? 'w-full' : 'md:pl-64'
        }`}
      >
        <main
          className={`flex-1 w-full ${
            isHome ? 'p-0 max-w-full' : 'p-4 sm:p-7 md:p-10 max-w-6xl mx-auto pb-36 md:pb-16'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Dismissible Cloud Sync Locked Banner */}
      <AnimatePresence>
        {isCloudLocked && !bannerDismissed && !showUnlockModal && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className={`fixed bottom-24 lg:bottom-6 z-[60] left-3 right-3 sm:right-auto sm:w-[410px] ${
              isHome ? 'sm:left-6' : 'md:left-[17rem] sm:left-6'
            }`}
          >
            <div className="rounded-2xl p-3.5 bg-gradient-to-r from-[#171226]/95 via-[#0d1122]/95 to-[#090d16]/95 border border-amber-500/35 backdrop-blur-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                  <Lock size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">
                    Cloud Sync Locked — Enter Access Passphrase
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Local storage active. Unlock to sync across devices.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowUnlockModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-purple-600/25 transition-all"
                >
                  <Unlock size={12} />
                  <span>Unlock</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setBannerDismissed(true);
                  }}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Dismiss cloud sync lock banner"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Auth Unlock Modal */}
      <CloudUnlockModal
        isOpen={showUnlockModal}
        onClose={handleCloseUnlockModal}
        isLocked={isCloudLocked}
        onUnlocked={handleUnlocked}
        onLockChanged={handleLockChanged}
      />

      {/* Background News Analysis Progress Banner (only when in personal/news) */}
      {!isAcademics && !isHome && <NewsProgressBanner />}

      {/* Floating AI Coach Button (only in Personal Growth OS) */}
      {!isAcademics && !isHome && <AICoachButton />}

      {/* Mobile Bottom Navigation (null on Home) */}
      {!isHome && <BottomNav />}
    </CloudAuthContext.Provider>
  );
}
