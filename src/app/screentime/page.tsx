'use client';

import { useState } from 'react';
import { useScreenTime } from '@/hooks/useScreenTime';
import { ScreenTimeApp, ScreenTimeCategory, SCREENTIME_CATEGORIES } from '@/lib/types';
import { getToday, formatDate } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Plus,
  Trash2,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function ScreenTimePage() {
  const { entries, loaded, getTodayEntry, addApp, removeApp, getWeekData } = useScreenTime();
  const [selectedDate, setSelectedDate] = useState(getToday());

  // Form state
  const [appName, setAppName] = useState('');
  const [appMinutes, setAppMinutes] = useState('');
  const [appCategory, setAppCategory] = useState<ScreenTimeCategory>('Social');
  const [showForm, setShowForm] = useState(false);

  const dateEntry = entries.find((e) => e.date === selectedDate);
  const totalMinutes = dateEntry?.totalMinutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const weekData = getWeekData();
  const weekMax = Math.max(...weekData.map((d) => d.total), 60);

  // Category breakdown
  const categoryBreakdown: { category: ScreenTimeCategory; minutes: number; color: string; emoji: string }[] = [];
  if (dateEntry) {
    const catMap = new Map<ScreenTimeCategory, number>();
    for (const app of dateEntry.apps) {
      catMap.set(app.category, (catMap.get(app.category) || 0) + app.minutes);
    }
    for (const [cat, minutes] of catMap.entries()) {
      const info = SCREENTIME_CATEGORIES.find((c) => c.name === cat);
      categoryBreakdown.push({
        category: cat,
        minutes,
        color: info?.color || '#64748b',
        emoji: info?.emoji || '📱',
      });
    }
    categoryBreakdown.sort((a, b) => b.minutes - a.minutes);
  }

  const handleSubmit = () => {
    if (!appName.trim() || !appMinutes || parseInt(appMinutes) <= 0) return;
    const app: ScreenTimeApp = {
      name: appName.trim(),
      minutes: parseInt(appMinutes),
      category: appCategory,
    };
    addApp(app, selectedDate);
    setAppName('');
    setAppMinutes('');
    setShowForm(false);
    triggerHaptic('medium');
  };

  const navigateDate = (dir: -1 | 1) => {
    const [pY, pM, pD] = selectedDate.split('-').map(Number);
    const d = new Date(pY, pM - 1, pD);
    d.setDate(d.getDate() + dir);
    setSelectedDate(formatDate(d));
    triggerHaptic('light');
  };

  const isToday = selectedDate === getToday();
  const [dY, dM, dD] = selectedDate.split('-').map(Number);
  const displayDate = new Date(dY, (dM || 1) - 1, dD || 1);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 pb-28 sm:pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-blue-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/15">
            <Smartphone size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Screen Time</h1>
            <p className="text-xs text-slate-400 font-medium">Track your daily app usage</p>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-white">
            {isToday
              ? 'Today'
              : displayDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">{selectedDate}</p>
        </div>
        <button
          onClick={() => navigateDate(1)}
          disabled={isToday}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Daily Summary */}
      <GlassCard delay={0.1}>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <p className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Clock size={12} className="text-cyan-400" /> Total Screen Time
              </p>
              <p className="text-3xl font-black text-white">
                {totalMinutes === 0 ? (
                  <span className="text-lg text-slate-500">No entries</span>
                ) : (
                  <>
                    {hours > 0 && (
                      <span>
                        {hours}
                        <span className="text-lg text-cyan-400 ml-0.5">h</span>
                      </span>
                    )}{' '}
                    {mins > 0 && (
                      <span>
                        {mins}
                        <span className="text-lg text-cyan-400 ml-0.5">m</span>
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Circular indicator */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="url(#screenGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min((totalMinutes / 480) * 94.2, 94.2)} 94.2`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-cyan-400">
                  {totalMinutes > 0 ? `${Math.round((totalMinutes / 480) * 100)}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs"
                >
                  <span>{cat.emoji}</span>
                  <span className="text-slate-300 font-bold">{cat.category}</span>
                  <span className="text-slate-500 font-medium">{cat.minutes}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Weekly Overview */}
      <GlassCard delay={0.15}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">7-Day Overview</h3>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((d, i) => {
              const h = d.total > 0 ? Math.max((d.total / weekMax) * 96, 6) : 4;
              const isSel = d.date === selectedDate;
              const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d.date).getDay()];
              const dh = Math.floor(d.total / 60);
              const dm = d.total % 60;
              return (
                <button
                  key={d.date}
                  onClick={() => {
                    setSelectedDate(d.date);
                    triggerHaptic('light');
                  }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {d.total > 0 && (
                    <span className="text-[8px] text-slate-500 font-medium">
                      {dh > 0 ? `${dh}h` : ''}{dm > 0 ? `${dm}m` : ''}
                    </span>
                  )}
                  <div
                    className={`w-full max-w-8 rounded-lg transition-all duration-500 ${
                      isSel
                        ? 'bg-gradient-to-t from-cyan-500 to-blue-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                        : 'bg-white/[0.06] hover:bg-white/[0.1]'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                  <span
                    className={`text-[10px] font-bold ${
                      isSel ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {dayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Add App Button / Form */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <GlassCard delay={0}>
              <div className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus size={15} className="text-cyan-400" />
                  Log App Usage
                </h3>

                {/* App Name */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Instagram, VS Code"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Minutes */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={appMinutes}
                    onChange={(e) => setAppMinutes(e.target.value)}
                    placeholder="e.g. 45"
                    min="1"
                    max="1440"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Category Chips */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SCREENTIME_CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setAppCategory(cat.name);
                          triggerHaptic('light');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          appCategory === cat.name
                            ? 'border-2 text-white shadow-md'
                            : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                        style={
                          appCategory === cat.name
                            ? {
                                borderColor: cat.color,
                                backgroundColor: `${cat.color}15`,
                                boxShadow: `0 0 12px ${cat.color}30`,
                              }
                            : undefined
                        }
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 font-bold hover:bg-white/[0.06] active:scale-98 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!appName.trim() || !appMinutes || parseInt(appMinutes) <= 0}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-xs text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-98 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowForm(true);
              triggerHaptic('light');
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-sm text-cyan-400 font-bold flex items-center justify-center gap-2 hover:from-cyan-500/15 hover:to-blue-500/15 active:scale-[0.98] transition-all"
          >
            <Plus size={16} />
            Log App Usage
          </motion.button>
        )}
      </AnimatePresence>

      {/* App List for Selected Date */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Smartphone size={14} className="text-cyan-400" />
          {isToday ? "Today's Apps" : 'Apps'}
          {dateEntry && (
            <span className="text-[10px] text-slate-500 font-medium ml-auto">
              {dateEntry.apps.length} {dateEntry.apps.length === 1 ? 'app' : 'apps'}
            </span>
          )}
        </h3>

        {!dateEntry || dateEntry.apps.length === 0 ? (
          <GlassCard delay={0.2}>
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <Smartphone size={24} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium mb-1">No apps logged</p>
              <p className="text-[11px] text-slate-500">Tap &quot;Log App Usage&quot; to track your screen time</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {dateEntry.apps.map((app, i) => {
              const cat = SCREENTIME_CATEGORIES.find((c) => c.name === app.category);
              const pct = totalMinutes > 0 ? Math.round((app.minutes / totalMinutes) * 100) : 0;
              return (
                <GlassCard key={i} delay={0.1 + i * 0.05}>
                  <div className="p-3.5 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#64748b'}15` }}
                    >
                      {cat?.emoji || '📱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white truncate">{app.name}</span>
                        <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                          {app.minutes >= 60
                            ? `${Math.floor(app.minutes / 60)}h ${app.minutes % 60}m`
                            : `${app.minutes}m`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: cat?.color || '#22d3ee',
                              boxShadow: `0 0 6px ${cat?.color || '#22d3ee'}40`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium shrink-0">{pct}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeApp(selectedDate, i);
                        triggerHaptic('light');
                      }}
                      className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-90 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
