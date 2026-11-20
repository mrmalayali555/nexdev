'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScreenTimeEntry, ScreenTimeApp } from '@/lib/types';
import { getScreenTime, saveScreenTime, hydrateFromCloud } from '@/lib/storage';
import { generateId, getToday } from '@/lib/utils';

export function useScreenTime() {
  const [entries, setEntries] = useState<ScreenTimeEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getScreenTime();
    setEntries(stored);
    setLoaded(true);

    hydrateFromCloud().then((cloudData) => {
      if (cloudData && Array.isArray(cloudData.screentime)) {
        setEntries(cloudData.screentime);
      }
    });
  }, []);

  const persist = useCallback((updated: ScreenTimeEntry[]) => {
    setEntries(updated);
    saveScreenTime(updated);
  }, []);

  const getTodayEntry = useCallback((): ScreenTimeEntry | null => {
    const today = getToday();
    return entries.find((e) => e.date === today) || null;
  }, [entries]);

  const addApp = useCallback(
    (app: ScreenTimeApp, date?: string) => {
      const dateStr = date || getToday();
      const existing = entries.find((e) => e.date === dateStr);

      if (existing) {
        const updatedApps = [...existing.apps, app];
        const totalMinutes = updatedApps.reduce((sum, a) => sum + a.minutes, 0);
        const updated = entries.map((e) =>
          e.date === dateStr ? { ...e, apps: updatedApps, totalMinutes } : e
        );
        persist(updated);
      } else {
        const newEntry: ScreenTimeEntry = {
          id: generateId(),
          date: dateStr,
          apps: [app],
          totalMinutes: app.minutes,
          createdAt: new Date().toISOString(),
        };
        persist([...entries, newEntry]);
      }
    },
    [entries, persist]
  );

  const removeApp = useCallback(
    (date: string, appIndex: number) => {
      const updated = entries.map((e) => {
        if (e.date !== date) return e;
        const apps = e.apps.filter((_, i) => i !== appIndex);
        return { ...e, apps, totalMinutes: apps.reduce((sum, a) => sum + a.minutes, 0) };
      });
      persist(updated);
    },
    [entries, persist]
  );

  const getWeekData = useCallback((): { date: string; total: number }[] => {
    const result: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      result.push({ date: dateStr, total: entry?.totalMinutes || 0 });
    }
    return result;
  }, [entries]);

  return { entries, loaded, getTodayEntry, addApp, removeApp, getWeekData };
}
