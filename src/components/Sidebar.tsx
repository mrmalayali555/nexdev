'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  Newspaper,
  Sparkles,
  BarChart3,
  Flame,
  Smartphone,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/screentime', label: 'Screen Time', icon: Smartphone },
  { href: '/news', label: 'Tech News', icon: Newspaper },
  { href: '/ai', label: 'AI Coach', icon: Sparkles },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-[#05070e]/95 backdrop-blur-2xl border-r border-white/[0.08] z-40 shadow-2xl">
      <div className="p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all duration-300">
            <Flame size={20} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              NexDev
            </h1>
            <p className="text-[10px] text-purple-300/60 uppercase tracking-widest font-bold">
              Growth Engine
            </p>
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => triggerHaptic('light')}
                className="relative block"
              >
                <motion.div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'text-white font-bold bg-gradient-to-r from-purple-500/15 to-blue-500/10 border border-purple-500/30 shadow-md shadow-purple-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium'
                  }`}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs sm:text-sm tracking-tight">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute right-3 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                      layoutId="activeIndicatorDot"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Motivation Card */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-[#070a14] border border-white/[0.08] shadow-lg backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Keep pushing forward</span>
            <span>💪</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Small daily actions compound into unstoppable growth.
          </p>
        </div>
      </div>
    </aside>
  );
}
