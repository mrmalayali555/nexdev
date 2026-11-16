'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, Mood } from '@/lib/types';
import { getJournalEntries, saveJournalEntries } from '@/lib/storage';
import { getSeedJournal } from '@/lib/seed';
import { generateId, getToday } from '@/lib/utils';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getJournalEntries();
    if (stored.length > 0) {
      setEntries(stored);
    } else {
      const seed = getSeedJournal();
      setEntries(seed);
      saveJournalEntries(seed);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((updated: JournalEntry[]) => {
    setEntries(updated);
    saveJournalEntries(updated);
  }, []);

  const addEntry = useCallback(
    (entry: { content: string; mood: Mood; gratitude: string[]; tags: string[]; date?: string }) => {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        id: generateId(),
        date: entry.date || getToday(),
        content: entry.content,
        mood: entry.mood,
        gratitude: entry.gratitude,
        tags: entry.tags,
        createdAt: now,
        updatedAt: now,
      };
      persist([newEntry, ...entries]);
    },
    [entries, persist]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<JournalEntry>) => {
      persist(
        entries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        )
      );
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  const getEntryByDate = useCallback(
    (date: string) => {
      return entries.find((e) => e.date === date) || null;
    },
    [entries]
  );

  const searchEntries = useCallback(
    (query: string) => {
      const lower = query.toLowerCase();
      return entries.filter(
        (e) =>
          e.content.toLowerCase().includes(lower) ||
          e.tags.some((t) => t.toLowerCase().includes(lower)) ||
          e.gratitude.some((g) => g.toLowerCase().includes(lower))
      );
    },
    [entries]
  );

  return { entries, loaded, addEntry, updateEntry, deleteEntry, getEntryByDate, searchEntries };
}

