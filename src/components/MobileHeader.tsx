'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, GraduationCap, Home, Lock, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { useCloudAuth } from '@/components/auth/CloudUnlockModal';

export default function MobileHeader() {
  const pathname = usePathname();
  const { isCloudLocked, authChecked, openUnlockModal } = useCloudAuth();

  // If on Home Page, header is embedded cleanly inside the page
  if (pathname === '/') return null;

  const isAcademics = pathname.startsWith('/academics');

  return (
    <header className="sticky top-0 z-30 md:hidden bg-[#05070e]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Left: Back to Home Hub button */}
        <Link
          href="/"
          onClick={() => triggerHaptic('light')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 active:scale-95 text-xs font-bold transition-all"
        >
          <Home size={14} className="text-purple-400" />
          <span>Home Hub</span>
        </Link>

        {/* Center: Portal Label */}
        <div className="text-center">
          <h2 className="text-sm font-black text-white">
            {isAcademics ? 'Academic OS' : 'Personal OS'}
          </h2>
          <p className="text-[9px] font-semibold text-slate-400">
            {isAcademics ? 'SCMS S1 CSE-3' : 'Growth Engine'}
          </p>
        </div>

        {/* Right: Cloud Sync Lock Trigger + Switch Portal */}
        <div className="flex items-center gap-1.5">
          {authChecked && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                openUnlockModal();
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
                isCloudLocked
                  ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-emerald-400/80 hover:text-emerald-300'
              }`}
              title={isCloudLocked ? 'Cloud Sync Locked — Unlock' : 'Cloud Sync Status'}
              aria-label={isCloudLocked ? 'Unlock Cloud Sync' : 'Cloud Sync Status'}
            >
              {isCloudLocked ? <Lock size={13} /> : <ShieldCheck size={13} />}
            </button>
          )}

          {isAcademics ? (
            <Link
              href="/personal"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold active:scale-95"
            >
              <Flame size={13} className="text-blue-400" />
              <span>Personal</span>
            </Link>
          ) : (
            <Link
              href="/academics"
              onClick={() => triggerHaptic('light')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold active:scale-95"
            >
              <GraduationCap size={13} className="text-purple-400" />
              <span>Academics</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
