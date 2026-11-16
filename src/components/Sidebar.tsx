'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  BarChart3,
  Flame,
  CloudCheck,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border-r border-white/5 z-40">
      <div className="p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Flame size={22} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NexDev
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
              Personal Growth
            </p>
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative block"
              >
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavDesktop"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"
                      layoutId="activeIndicatorDesktop"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Motivation & Sync Status */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <p className="text-xs font-semibold text-gray-300">Keep pushing forward 💪</p>
          <p className="text-[11px] text-gray-500 mt-1">Small daily actions compound over time.</p>
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <CloudCheck size={13} />
              <span>4-Way Sync</span>
            </span>
            <span className="text-[10px] text-gray-400 font-normal">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
