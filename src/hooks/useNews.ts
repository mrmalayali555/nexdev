'use client';

import { useState, useEffect, useCallback } from 'react';
import { TechNewsStory } from '@/lib/types';
import { getNews, saveNews, hydrateFromCloud } from '@/lib/storage';
import { parseNewsBriefing, deepDiveStory } from '@/lib/ai';

export function useNews() {
  const [stories, setStories] = useState<TechNewsStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeepDiving, setIsDeepDiving] = useState(false);

  // Initialize and load stories from storage & cloud (No hardcoded data)
  useEffect(() => {
    const local = getNews();
    setStories(local || []);
    setIsLoaded(true);

    // Sync from Supabase in background
    hydrateFromCloud().then((cloudData) => {
      if (cloudData?.news && Array.isArray(cloudData.news) && cloudData.news.length > 0) {
        setStories(cloudData.news);
      } else if (local && local.length > 0) {
        // If cloud was empty but local has news, push local to Supabase
        saveNews(local);
      }
    });
  }, []);

  const saveAndSync = useCallback((newStories: TechNewsStory[]) => {
    setStories(newStories);
    saveNews(newStories);
  }, []);

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

  // Clear all stories
  const clearAllStories = useCallback(() => {
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

  // 2:00 PM Reminder Checker
  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);
  const formattedToday = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fullToday = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  const hasTodayBriefing = stories.some((s) => {
    if (s.createdAt && s.createdAt.startsWith(todayDateStr)) return true;
    if (s.date && (s.date.includes(formattedToday) || s.date.includes(fullToday))) return true;
    return false;
  });

  const isPast2PM = now.getHours() >= 14;
  const shouldShow2PMAlert = isPast2PM && !hasTodayBriefing;

  return {
    stories,
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
  };
}
