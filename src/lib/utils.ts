export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function toDateString(date: Date | string): string {
  if (typeof date === 'string') return date.split('T')[0];
  return formatDate(date);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

export function getDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateStreak(completions: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();
  const d = new Date(today);

  // Check if today is completed; if not, start from yesterday
  const todayStr = formatDate(d);
  if (!completions[todayStr]) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDate(d);
    if (completions[dateStr]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calculateBestStreak(completions: Record<string, boolean>): number {
  const dates = Object.keys(completions)
    .filter((k) => completions[k])
    .sort();
  if (dates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = getDaysBetween(dates[i - 1], dates[i]);
    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function getWeeklyCompletionRates(
  completions: Record<string, boolean>,
  weeks: number = 4
): number[] {
  const rates: number[] = [];
  const today = new Date();

  for (let w = weeks - 1; w >= 0; w--) {
    let completed = 0;
    let total = 7;
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - w * 7 - d);
      const dateStr = formatDate(date);
      if (completions[dateStr]) completed++;
    }
    rates.push(Math.round((completed / total) * 100));
  }
  return rates;
}

export function getLast52WeeksDates(): string[][] {
  const weeks: string[][] = [];
  const today = new Date();

  for (let w = 51; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - w * 7 - (6 - d));
      week.push(formatDate(date));
    }
    weeks.push(week);
  }
  return weeks;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDayName(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

export function getMonthName(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
}

