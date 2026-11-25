'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TechNewsStory } from '@/lib/types';
import { getNews, saveNews, hydrateFromCloud } from '@/lib/storage';
import { parseNewsBriefing, deepDiveStory } from '@/lib/ai';

const LAST_RESET_KEY = 'nexdev_last_news_reset_date';

export function getStoryDateKey(story: TechNewsStory): string {
  if (story.createdAt) {
    try {
      const d = new Date(story.createdAt);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {}
    return story.createdAt.split('T')[0];
  }
  return story.date || '';
}

function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function useNews() {
  const [stories, setStories] = useState<TechNewsStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [dayKey, setDayKey] = useState(getTodayDateStr());

  // Initialize and load stories from storage & cloud (No hardcoded data)
  useEffect(() => {
    let isMounted = true;
    const local = getNews();
    queueMicrotask(() => {
      if (!isMounted) return;
      setStories(local || []);
      setIsLoaded(true);
    });

    // Sync from Supabase in background
    hydrateFromCloud().then((cloudData) => {
      if (!isMounted) return;
      if (cloudData?.news && Array.isArray(cloudData.news) && cloudData.news.length > 0) {
        setStories(cloudData.news);
      } else if (local && local.length > 0) {
        // If cloud was empty but local has news, push local to Supabase
        saveNews(local);
      }
    });

    const handleNewsUpdated = () => {
      if (isMounted) setStories(getNews());
    };
    window.addEventListener('nexdev-news-updated', handleNewsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('nexdev-news-updated', handleNewsUpdated);
    };
  }, []);

  // Midnight auto-reset timer + missed-reset catch-up
  useEffect(() => {
    let isMounted = true;
    // Check for missed reset on mount
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const today = getTodayDateStr();
    if (lastReset !== today) {
      localStorage.setItem(LAST_RESET_KEY, today);
      queueMicrotask(() => {
        if (isMounted) setDayKey(today);
      });
    }

    // Check periodically & on tab focus/visibility
    const checkDay = () => {
      const current = getTodayDateStr();
      if (current !== dayKey) {
        setDayKey(current);
        localStorage.setItem(LAST_RESET_KEY, current);
        window.dispatchEvent(new CustomEvent('nexdev-day-changed'));
      }
    };

    window.addEventListener('visibilitychange', checkDay);
    window.addEventListener('focus', checkDay);
    const intervalId = setInterval(checkDay, 10000);

    // Set a timeout for the next midnight
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleMidnightReset = () => {
      const ms = msUntilMidnight();
      timeoutId = setTimeout(() => {
        const newDay = getTodayDateStr();
        localStorage.setItem(LAST_RESET_KEY, newDay);
        setDayKey(newDay);

        // Dispatch custom event so other components can react
        window.dispatchEvent(new CustomEvent('nexdev-day-changed'));

        // Schedule the next midnight
        scheduleMidnightReset();
      }, ms);
    };

    scheduleMidnightReset();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', checkDay);
      window.removeEventListener('focus', checkDay);
    };
  }, [dayKey]);

  const saveAndSync = useCallback((newStories: TechNewsStory[]) => {
    setStories(newStories);
    saveNews(newStories);
  }, []);

  // Computed: today's stories only
  const todayStories = useMemo(() => {
    return stories.filter((s) => getStoryDateKey(s) === dayKey);
  }, [stories, dayKey]);

  // Mark story as read
  const markAsRead = useCallback(
    (storyId: string) => {
      const updated = stories.map((s) => (s.id === storyId ? { ...s, read: true } : s));
      saveAndSync(updated);

      // Advance to next unread if possible
      const nextUnreadIndex = updated.findIndex((s, idx) => idx > currentIndex && !s.read);
      if (nextUnreadIndex !== -1) {
        setCurrentIndex(nextUnreadIndex);
      } else {
        const anyUnread = updated.findIndex((s) => !s.read);
        if (anyUnread !== -1) {
          setCurrentIndex(anyUnread);
        } else if (currentIndex < updated.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    },
    [stories, currentIndex, saveAndSync]
  );

  // Mark story as unread
  const toggleReadStatus = useCallback(
    (storyId: string) => {
      const updated = stories.map((s) => (s.id === storyId ? { ...s, read: !s.read } : s));
      saveAndSync(updated);
    },
    [stories, saveAndSync]
  );

  // Mark all as unread / reset
  const resetAllRead = useCallback(() => {
    const updated = stories.map((s) => ({ ...s, read: false }));
    saveAndSync(updated);
    setCurrentIndex(0);
  }, [stories, saveAndSync]);

  // Next / Previous navigation
  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, stories.length]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToStory = useCallback(
    (index: number) => {
      if (index >= 0 && index < stories.length) {
        setCurrentIndex(index);
      }
    },
    [stories.length]
  );

  // Delete a specific story
  const deleteStory = useCallback(
    (storyId: string) => {
      const updated = stories.filter((s) => s.id !== storyId);
      saveAndSync(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
    },
    [stories, currentIndex, saveAndSync]
  );

  // Clear only today's stories (preserves history)
  const clearAllStories = useCallback(() => {
    const today = getTodayDateStr();
    const updated = stories.filter((s) => !(s.createdAt && s.createdAt.startsWith(today)));
    saveAndSync(updated);
    setCurrentIndex(0);
  }, [stories, saveAndSync]);

  // Clear ALL stories forever (not exposed in UI)
  const clearAllStoriesForever = useCallback(() => {
    saveAndSync([]);
    setCurrentIndex(0);
  }, [saveAndSync]);

  // Import raw newsletter text
  const importBriefing = useCallback(
    async (rawText: string) => {
      if (!rawText.trim()) return;
      setIsImporting(true);
      try {
        const parsed = await parseNewsBriefing(rawText);
        const newStories: TechNewsStory[] = parsed.map((item, index) => ({
          ...item,
          id: `news-${Date.now()}-${index}`,
          read: false,
          createdAt: new Date().toISOString(),
        }));

        const updated = [...newStories, ...stories];
        saveAndSync(updated);
        setCurrentIndex(0);
        return newStories;
      } finally {
        setIsImporting(false);
      }
    },
    [stories, saveAndSync]
  );

  // AI Deep Dive Grounding
  const generateDeepDive = useCallback(
    async (storyId: string) => {
      const story = stories.find((s) => s.id === storyId);
      if (!story) return;

      if (story.deepDive) {
        return story.deepDive;
      }

      setIsDeepDiving(true);
      try {
        const analysis = await deepDiveStory(story.title, story.summary, story.fullContent);
        const updated = stories.map((s) => (s.id === storyId ? { ...s, deepDive: analysis } : s));
        saveAndSync(updated);
        return analysis;
      } finally {
        setIsDeepDiving(false);
      }
    },
    [stories, saveAndSync]
  );

  const currentStory = stories[currentIndex] || null;
  const readCount = stories.filter((s) => s.read).length;
  const totalCount = stories.length;
  const isAllRead = totalCount > 0 && readCount === totalCount;

  // 2:00 PM Reminder Checker — uses todayStories instead of all stories
  const now = new Date();
  const todayDateStr = dayKey;
  const formattedToday = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fullToday = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  const hasTodayBriefing = todayStories.length > 0 || stories.some((s) => {
    if (s.createdAt && s.createdAt.startsWith(todayDateStr)) return true;
    if (s.date && (s.date.includes(formattedToday) || s.date.includes(fullToday))) return true;
    return false;
  });

  const isPast2PM = now.getHours() >= 14;
  const shouldShow2PMAlert = isPast2PM && !hasTodayBriefing;

  return {
    stories,
    allStories: stories,
    todayStories,
    currentStory,
    currentIndex,
    isLoaded,
    isImporting,
    isDeepDiving,
    readCount,
    totalCount,
    isAllRead,
    hasTodayBriefing,
    isPast2PM,
    shouldShow2PMAlert,
    dayKey,
    markAsRead,
    toggleReadStatus,
    resetAllRead,
    nextStory,
    prevStory,
    goToStory,
    importBriefing,
    generateDeepDive,
    deleteStory,
    clearAllStories,
    clearAllStoriesForever,
  };
}
