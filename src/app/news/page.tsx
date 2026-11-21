'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  Plus,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Clock,
  BookOpen,
  ArrowRight,
  Share2,
  Trash2,
  Search,
  Calendar,
  X,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { useNews, getStoryDateKey } from '@/hooks/useNews';
import { triggerHaptic } from '@/lib/haptics';
import GlassCard from '@/components/ui/GlassCard';

function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NewsPage() {
  const {
    stories,
    todayStories,
    isLoaded,
    markAsRead,
    toggleReadStatus,
    generateDeepDive,
    isDeepDiving,
    deleteStory,
    clearAllStories,
    dayKey,
  } = useNews();

  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  // Default to today's date instead of 'all'
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Auto-select first story on load or when filters change
  useEffect(() => {
    if (stories.length > 0 && !selectedStoryId) {
      setSelectedStoryId(stories[0].id);
    }
  }, [stories, selectedStoryId]);

  // Listen for custom event when background job extracts new stories
  useEffect(() => {
    const handleNewsUpdated = () => {
      // triggers re-render via useNews hook
    };
    window.addEventListener('nexdev-news-updated', handleNewsUpdated);
    return () => window.removeEventListener('nexdev-news-updated', handleNewsUpdated);
  }, []);

  // Listen for day change and reset the date filter to today
  useEffect(() => {
    const handleDayChanged = () => {
      setSelectedDate(getTodayDateStr());
    };
    window.addEventListener('nexdev-day-changed', handleDayChanged);
    return () => window.removeEventListener('nexdev-day-changed', handleDayChanged);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Extract unique categories and dates
  const categories = ['All', ...Array.from(new Set(stories.map((s) => s.category).filter(Boolean)))];

  // Helper to extract comparable YYYY-MM-DD or date label
  const getDateLabel = (story: { date: string; createdAt: string }) => {
    return getStoryDateKey(story as any);
  };

  const uniqueDates = Array.from(new Set(stories.map(getDateLabel).filter(Boolean)));

  const filteredStories = stories.filter((s) => {
    const matchCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchUnread = onlyUnread ? !s.read : true;
    
    // Date match
    let matchDate = true;
    if (selectedDate !== 'all') {
      const storyDateKey = getDateLabel(s);
      matchDate = storyDateKey === selectedDate || s.date.includes(selectedDate);
    }

    // Search query match (title, summary, full content, category)
    let matchSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchSearch =
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.fullContent.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
    }

    return matchCategory && matchUnread && matchDate && matchSearch;
  });

  const selectedStory = stories.find((s) => s.id === selectedStoryId) || filteredStories[0] || null;

  const handleDeepDiveClick = async () => {
    if (!selectedStory) return;
    triggerHaptic('medium');
    setDeepDiveLoading(true);
    try {
      await generateDeepDive(selectedStory.id);
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const handleDeleteStory = (storyId: string) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this story?')) {
      triggerHaptic('warning');
      deleteStory(storyId);
      if (selectedStoryId === storyId) {
        const remaining = stories.filter((s) => s.id !== storyId);
        setSelectedStoryId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const isShowingToday = selectedDate === getTodayDateStr();

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
                <Newspaper size={18} />
              </div>
              <span className="truncate">Daily Tech Briefings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 shrink-0">
                {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Curated AI summaries and grounded deep-dives from your subscribed channels.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stories.length > 0 && (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm(`Clear today's tech briefings? Historical stories will be preserved.`)) {
                    triggerHaptic('warning');
                    clearAllStories();
                    setSelectedStoryId(null);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 font-semibold text-xs transition-all shrink-0"
                title="Clear today's stories"
              >
                <Trash2 size={14} />
                <span>Clear Today</span>
              </button>
            )}

            <Link
              href="/news/add"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all shrink-0"
            >
              <Plus size={16} />
              <span>Paste Briefing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Calendar Bar */}
      {stories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search briefings..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Today chip */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedDate(getTodayDateStr());
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 transition-all shrink-0 ${
                isShowingToday
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/10'
                  : 'bg-white/[0.04] text-gray-300 border-white/10 hover:text-white'
              }`}
            >
              <Calendar size={15} className="text-purple-400" />
              <span>Today</span>
            </button>

            {/* Show All History chip */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedDate('all');
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 transition-all shrink-0 ${
                selectedDate === 'all'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-md shadow-indigo-500/10'
                  : 'bg-white/[0.04] text-gray-300 border-white/10 hover:text-white'
              }`}
            >
              <History size={15} className="text-indigo-400" />
              <span>All History</span>
            </button>

            {/* Calendar Filter Toggle */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowDatePicker(!showDatePicker);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border flex items-center gap-2 transition-all shrink-0 ${
                (selectedDate !== 'all' && !isShowingToday) || showDatePicker
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/10'
                  : 'bg-white/[0.04] text-gray-300 border-white/10 hover:text-white'
              }`}
            >
              <Calendar size={15} className="text-purple-400" />
              <span>{selectedDate !== 'all' && !isShowingToday ? selectedDate : 'Pick Date'}</span>
              {selectedDate !== 'all' && !isShowingToday && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(getTodayDateStr());
                  }}
                  className="hover:text-white"
                >
                  <X size={13} />
                </span>
              )}
            </button>

            {/* Unread Only Toggle */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setOnlyUnread(!onlyUnread);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 transition-all shrink-0 ${
                onlyUnread
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-white/[0.04] text-gray-400 border-white/5 hover:text-white'
              }`}
            >
              <span>Unread Only</span>
            </button>
          </div>

          {/* Expandable Calendar / Date Selector Drawer */}
          {showDatePicker && (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} className="text-purple-400" />
                  <span>Filter by Date:</span>
                </span>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDate('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDate === 'all'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  All Dates
                </button>

                {uniqueDates.slice(0, 6).map((dateStr) => (
                  <button
                    key={dateStr}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedDate(dateStr);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedDate === dateStr
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {dateStr}
                  </button>
                ))}
              </div>

              {/* Exact Calendar Date Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Pick date:</span>
                <input
                  type="date"
                  value={selectedDate !== 'all' ? selectedDate : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    } else {
                      setSelectedDate('all');
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Category Chips Bar */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stories.length === 0 ? (
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-white/[0.02] border border-white/5 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-lg shadow-purple-500/10">
            <Newspaper size={30} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">No Tech Briefings Yet</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
            Paste raw text from your tech newsletters, AI channels, or news digests. The AI will parse headlines, categorize stories, and give you a clean daily reader.
          </p>
          <Link
            href="/news/add"
            onClick={() => triggerHaptic('light')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Paste Your First Tech Briefing</span>
          </Link>
        </div>
      ) : (
        /* Full-Page 2-Column Responsive Layout: Master List + Dedicated Inline Reader */
        filteredStories.length === 0 ? (
          <div className="rounded-3xl p-8 sm:p-12 text-center bg-white/[0.02] border border-white/5 backdrop-blur-xl">
            <Search size={32} className="text-gray-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              {isShowingToday ? "No briefing added for today yet" : "No stories match your filter"}
            </h3>
            <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
              {isShowingToday
                ? "You haven't pasted a tech briefing for today yet. Browse previous days from your archive or paste a new briefing!"
                : `No briefings found for "${searchQuery || selectedDate}". Try selecting another date or clearing filters.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setSearchQuery('');
                  setSelectedDate('all');
                  setSelectedCategory('All');
                  setOnlyUnread(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-all"
              >
                View All History ({stories.length} stories)
              </button>
              <Link
                href="/news/add"
                onClick={() => triggerHaptic('light')}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-all"
              >
                + Paste Briefing
              </Link>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stories List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-1">
              <span>Stories ({filteredStories.length})</span>
              <span>Select to read</span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
              {filteredStories.map((story) => {
                const isSelected = selectedStory?.id === story.id;

                return (
                  <motion.div
                    key={story.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedStoryId(story.id);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all text-left ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/10'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20">
                        {story.category}
                      </span>

                      {story.read ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 size={12} /> Read
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-semibold">
                          • New
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {story.title}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {story.summary}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500">
                      <span>{story.date}</span>
                      <span className="text-purple-400 font-semibold flex items-center gap-0.5">
                        Read full story <ChevronRight size={13} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Full Story Reader (Right Column on lg+, below list on mobile) */}
          <div className="lg:col-span-7">
            {selectedStory ? (
              <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#0b0e1e]/90 via-[#070914]/90 to-[#05070e] border border-white/[0.09] backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />
                {/* Story Top Bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedStory.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {selectedStory.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic('success');
                        toggleReadStatus(selectedStory.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                        selectedStory.read
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 size={14} className={selectedStory.read ? 'text-emerald-400' : ''} />
                      <span>{selectedStory.read ? 'Marked as Read' : 'Mark as Read'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteStory(selectedStory.id)}
                      className="p-2 rounded-xl text-xs font-bold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center gap-1.5"
                      title="Delete Story"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {selectedStory.title}
                </h2>

                {/* Executive Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/20 via-indigo-900/15 to-transparent border border-purple-500/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Key Takeaway</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                    {selectedStory.summary}
                  </p>
                </div>

                {/* Full Article Content */}
                <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedStory.fullContent}
                </div>

                {/* Source Link if Available */}
                {selectedStory.sourceUrl && (
                  <div className="pt-4 border-t border-white/10">
                    <a
                      href={selectedStory.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <ExternalLink size={13} />
                      <span>Original Source Publication</span>
                    </a>
                  </div>
                )}

                {/* AI Grounded Deep Dive Section (Inline, NOT in a popup!) */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">
                        <Sparkles size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        AI Grounded Deep Dive Analysis
                      </h4>
                    </div>

                    {!selectedStory.deepDive && (
                      <button
                        onClick={handleDeepDiveClick}
                        disabled={deepDiveLoading || isDeepDiving}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles size={13} className={deepDiveLoading ? 'animate-spin' : ''} />
                        <span>{deepDiveLoading ? 'Generating Analysis...' : 'Generate Deep Dive'}</span>
                      </button>
                    )}
                  </div>

                  {selectedStory.deepDive ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-blue-950/20 border border-purple-500/30 text-xs sm:text-sm text-gray-200 leading-relaxed space-y-3 whitespace-pre-wrap">
                      {selectedStory.deepDive}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Click &apos;Generate Deep Dive&apos; to produce executive takeaways, architectural significance, market impact, and strategic outlook for this story.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl p-12 text-center bg-white/[0.02] border border-white/5">
                <BookOpen size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Select a story from the list to read in detail.</p>
              </div>
            )}
          </div>
        </div>
        )
      )}
    </div>
  );
}
