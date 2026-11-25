import type {
  Habit,
  Goal,
  JournalEntry,
  Challenge,
  TechNewsStory,
  ScreenTimeEntry,
  CareerProfile,
} from './types';
import type { AcademicProfile } from './academicTypes';

export const MAX_SYNC_BATCH_SIZE = 2000;
export const MAX_ID_LENGTH = 128;
export const MAX_SHORT_TEXT_LENGTH = 64;
export const MAX_TITLE_LENGTH = 500;
export const MAX_MEDIUM_TEXT_LENGTH = 10_000;
export const MAX_LONG_TEXT_LENGTH = 100_000;
export const MAX_NEWS_CONTENT_LENGTH = 200_000;
export const MAX_PROFILE_JSON_BYTES = 2 * 1024 * 1024; // 2 MB

const MAX_MAP_ENTRIES = 20_000;
const MAX_SUB_ARRAY_ITEMS = 500;
const textEncoder = new TextEncoder();

export interface ValidatedSyncPayload {
  pull?: boolean;
  confirmWipe?: boolean;
  habits?: Habit[];
  goals?: Goal[];
  journal?: JournalEntry[];
  challenges?: Challenge[];
  news?: TechNewsStory[];
  screentime?: ScreenTimeEntry[];
  career?: CareerProfile;
  academics?: AcademicProfile;
}

export type SyncValidationResult =
  | { ok: true; data: ValidatedSyncPayload }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

function isOptionalString(value: unknown, maxLength: number): value is string | undefined | null {
  return value === undefined || value === null || isBoundedString(value, maxLength);
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function isFiniteNumber(value: unknown, min = -Infinity, max = Infinity): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isBooleanMap(value: unknown, maxEntries = MAX_MAP_ENTRIES): value is Record<string, boolean> {
  if (!isPlainObject(value)) return false;
  const entries = Object.entries(value);
  if (entries.length > maxEntries) return false;
  for (const [k, v] of entries) {
    if (!isNonEmptyString(k, MAX_ID_LENGTH) || typeof v !== 'boolean') {
      return false;
    }
  }
  return true;
}

function isStringArray(value: unknown, maxItems: number, maxItemLen: number): value is string[] {
  if (!Array.isArray(value) || value.length > maxItems) return false;
  return value.every((item) => isBoundedString(item, maxItemLen));
}

function getJsonByteLength(value: unknown): number | null {
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized !== 'string') return null;
    return textEncoder.encode(serialized).byteLength;
  } catch {
    return null;
  }
}

function validateCollection<T>(
  raw: unknown,
  label: string,
  validateItem: (item: unknown, prefix: string) => string | null
): { ok: true; value: T[] | undefined } | { ok: false; error: string } {
  if (raw === undefined) {
    return { ok: true, value: undefined };
  }
  if (!Array.isArray(raw)) {
    return { ok: false, error: `Invalid "${label}": expected an array` };
  }
  if (raw.length > MAX_SYNC_BATCH_SIZE) {
    return {
      ok: false,
      error: `Invalid or oversized ${label} array (max ${MAX_SYNC_BATCH_SIZE})`,
    };
  }
  for (let i = 0; i < raw.length; i++) {
    const itemErr = validateItem(raw[i], `${label}[${i}]`);
    if (itemErr) {
      return { ok: false, error: itemErr };
    }
  }
  return { ok: true, value: raw as T[] };
}

function validateHabitItem(item: unknown, prefix: string): string | null {
  if (!isPlainObject(item)) return `${prefix} must be an object`;
  if (!isNonEmptyString(item.id, MAX_ID_LENGTH)) {
    return `${prefix}.id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.name, MAX_TITLE_LENGTH)) {
    return `${prefix}.name must be a non-empty string (max ${MAX_TITLE_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.emoji, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.emoji must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.category, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.category must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (item.frequency !== 'daily' && item.frequency !== 'weekly') {
    return `${prefix}.frequency must be "daily" or "weekly"`;
  }
  if (!isNonEmptyString(item.color, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.color must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.createdAt, MAX_ID_LENGTH)) {
    return `${prefix}.createdAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isBooleanMap(item.completions)) {
    return `${prefix}.completions must be a map of date strings to booleans`;
  }
  if (
    item.challengeMode !== undefined &&
    item.challengeMode !== null &&
    item.challengeMode !== '21-day' &&
    item.challengeMode !== '66-day'
  ) {
    return `${prefix}.challengeMode must be "21-day", "66-day", or null`;
  }
  if (!isOptionalString(item.challengeStartDate, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.challengeStartDate must be a string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  return null;
}

function validateGoalItem(item: unknown, prefix: string): string | null {
  if (!isPlainObject(item)) return `${prefix} must be an object`;
  if (!isNonEmptyString(item.id, MAX_ID_LENGTH)) {
    return `${prefix}.id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.title, MAX_TITLE_LENGTH)) {
    return `${prefix}.title must be a non-empty string (max ${MAX_TITLE_LENGTH} chars)`;
  }
  if (!isOptionalString(item.description, MAX_MEDIUM_TEXT_LENGTH)) {
    return `${prefix}.description must be a string (max ${MAX_MEDIUM_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.category, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.category must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.targetDate, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.targetDate must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isIntInRange(item.progress, 0, 100)) {
    return `${prefix}.progress must be an integer between 0 and 100`;
  }
  if (item.status !== 'in-progress' && item.status !== 'completed' && item.status !== 'paused') {
    return `${prefix}.status must be "in-progress", "completed", or "paused"`;
  }
  if (!isNonEmptyString(item.color, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.color must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.createdAt, MAX_ID_LENGTH)) {
    return `${prefix}.createdAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!Array.isArray(item.milestones) || item.milestones.length > MAX_SUB_ARRAY_ITEMS) {
    return `${prefix}.milestones must be an array (max ${MAX_SUB_ARRAY_ITEMS} items)`;
  }
  for (let i = 0; i < item.milestones.length; i++) {
    const m = item.milestones[i];
    if (!isPlainObject(m)) return `${prefix}.milestones[${i}] must be an object`;
    if (!isNonEmptyString(m.id, MAX_ID_LENGTH)) {
      return `${prefix}.milestones[${i}].id must be a non-empty string`;
    }
    if (!isNonEmptyString(m.title, MAX_TITLE_LENGTH)) {
      return `${prefix}.milestones[${i}].title must be a non-empty string`;
    }
    if (typeof m.completed !== 'boolean') {
      return `${prefix}.milestones[${i}].completed must be a boolean`;
    }
    if (!isOptionalString(m.completedAt, MAX_ID_LENGTH)) {
      return `${prefix}.milestones[${i}].completedAt must be a string`;
    }
  }
  return null;
}

function validateJournalItem(item: unknown, prefix: string): string | null {
  if (!isPlainObject(item)) return `${prefix} must be an object`;
  if (!isNonEmptyString(item.id, MAX_ID_LENGTH)) {
    return `${prefix}.id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.date, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.date must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isBoundedString(item.content, MAX_LONG_TEXT_LENGTH)) {
    return `${prefix}.content must be a string (max ${MAX_LONG_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.mood, 32)) {
    return `${prefix}.mood must be a non-empty string (max 32 chars)`;
  }
  if (!isStringArray(item.gratitude, 100, 1000)) {
    return `${prefix}.gratitude must be an array of bounded strings`;
  }
  if (!isStringArray(item.tags, 100, MAX_ID_LENGTH)) {
    return `${prefix}.tags must be an array of bounded strings`;
  }
  if (!isNonEmptyString(item.createdAt, MAX_ID_LENGTH)) {
    return `${prefix}.createdAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.updatedAt, MAX_ID_LENGTH)) {
    return `${prefix}.updatedAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  return null;
}

function validateChallengeItem(item: unknown, prefix: string): string | null {
  if (!isPlainObject(item)) return `${prefix} must be an object`;
  if (!isNonEmptyString(item.id, MAX_ID_LENGTH)) {
    return `${prefix}.id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.title, MAX_TITLE_LENGTH)) {
    return `${prefix}.title must be a non-empty string (max ${MAX_TITLE_LENGTH} chars)`;
  }
  if (!isOptionalString(item.description, MAX_MEDIUM_TEXT_LENGTH)) {
    return `${prefix}.description must be a string (max ${MAX_MEDIUM_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.category, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.category must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isIntInRange(item.durationDays, 1, 10_000)) {
    return `${prefix}.durationDays must be an integer between 1 and 10000`;
  }
  if (!isIntInRange(item.currentDay, 0, 10_000)) {
    return `${prefix}.currentDay must be an integer between 0 and 10000`;
  }
  if (item.status !== 'active' && item.status !== 'completed' && item.status !== 'abandoned') {
    return `${prefix}.status must be "active", "completed", or "abandoned"`;
  }
  if (!isNonEmptyString(item.color, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.color must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.emoji, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.emoji must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isOptionalString(item.targetHabitId, MAX_ID_LENGTH)) {
    return `${prefix}.targetHabitId must be a string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.startDate, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.startDate must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isBooleanMap(item.checkins)) {
    return `${prefix}.checkins must be a map of strings to booleans`;
  }
  if (!isNonEmptyString(item.createdAt, MAX_ID_LENGTH)) {
    return `${prefix}.createdAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  return null;
}

function validateNewsItem(item: unknown, prefix: string): string | null {
  if (!isPlainObject(item)) return `${prefix} must be an object`;
  if (!isNonEmptyString(item.id, MAX_ID_LENGTH)) {
    return `${prefix}.id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.title, MAX_TITLE_LENGTH)) {
    return `${prefix}.title must be a non-empty string (max ${MAX_TITLE_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.category, MAX_ID_LENGTH)) {
    return `${prefix}.category must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isBoundedString(item.summary, 5_000)) {
    return `${prefix}.summary must be a string (max 5000 chars)`;
  }
  if (!isBoundedString(item.fullContent, MAX_NEWS_CONTENT_LENGTH)) {
    return `${prefix}.fullContent must be a string (max ${MAX_NEWS_CONTENT_LENGTH} chars)`;
  }
  if (!isOptionalString(item.sourceUrl, 2048)) {
    return `${prefix}.sourceUrl must be a string (max 2048 chars)`;
  }
  if (typeof item.read !== 'boolean') {
    return `${prefix}.read must be a boolean`;
  }
  if (!isNonEmptyString(item.date, MAX_ID_LENGTH)) {
    return `${prefix}.date must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isOptionalString(item.deepDive, MAX_LONG_TEXT_LENGTH)) {
    return `${prefix}.deepDive must be a string (max ${MAX_LONG_TEXT_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.createdAt, MAX_ID_LENGTH)) {
    return `${prefix}.createdAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  return null;
}

function validateScreenTimeItem(item: unknown, prefix: string): string | null {
  if (!isPlainObject(item)) return `${prefix} must be an object`;
  if (!isNonEmptyString(item.id, MAX_ID_LENGTH)) {
    return `${prefix}.id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!isNonEmptyString(item.date, MAX_SHORT_TEXT_LENGTH)) {
    return `${prefix}.date must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
  }
  if (!isIntInRange(item.totalMinutes, 0, 1_000_000)) {
    return `${prefix}.totalMinutes must be an integer between 0 and 1000000`;
  }
  if (!isNonEmptyString(item.createdAt, MAX_ID_LENGTH)) {
    return `${prefix}.createdAt must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
  }
  if (!Array.isArray(item.apps) || item.apps.length > MAX_SUB_ARRAY_ITEMS) {
    return `${prefix}.apps must be an array (max ${MAX_SUB_ARRAY_ITEMS} items)`;
  }
  for (let i = 0; i < item.apps.length; i++) {
    const app = item.apps[i];
    if (!isPlainObject(app)) return `${prefix}.apps[${i}] must be an object`;
    if (!isNonEmptyString(app.name, MAX_TITLE_LENGTH)) {
      return `${prefix}.apps[${i}].name must be a non-empty string (max ${MAX_TITLE_LENGTH} chars)`;
    }
    if (!isIntInRange(app.minutes, 0, 100_000)) {
      return `${prefix}.apps[${i}].minutes must be an integer between 0 and 100000`;
    }
    if (!isNonEmptyString(app.category, MAX_SHORT_TEXT_LENGTH)) {
      return `${prefix}.apps[${i}].category must be a non-empty string (max ${MAX_SHORT_TEXT_LENGTH} chars)`;
    }
  }
  return null;
}

function validateIdObjectArray(value: unknown, fieldPath: string, maxLen = MAX_SYNC_BATCH_SIZE): string | null {
  if (!Array.isArray(value) || value.length > maxLen) {
    return `${fieldPath} must be an array (max ${maxLen} items)`;
  }
  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (!isPlainObject(entry)) return `${fieldPath}[${i}] must be an object`;
    if (!isNonEmptyString(entry.id, MAX_ID_LENGTH)) {
      return `${fieldPath}[${i}].id must be a non-empty string (max ${MAX_ID_LENGTH} chars)`;
    }
  }
  return null;
}

function validateProfilePayload<T>(
  raw: unknown,
  name: string,
  checkFields: (obj: Record<string, unknown>) => string | null
): { ok: true; value: T | undefined } | { ok: false; error: string } {
  if (raw === undefined) {
    return { ok: true, value: undefined };
  }
  if (!isPlainObject(raw)) {
    return { ok: false, error: `Invalid "${name}": expected a JSON object` };
  }
  const byteSize = getJsonByteLength(raw);
  if (byteSize === null || byteSize > MAX_PROFILE_JSON_BYTES) {
    return {
      ok: false,
      error: `Oversized "${name}" profile (max ${MAX_PROFILE_JSON_BYTES} bytes)`,
    };
  }
  const fieldErr = checkFields(raw);
  if (fieldErr) {
    return { ok: false, error: fieldErr };
  }
  return { ok: true, value: raw as T };
}

function validateCareerFields(obj: Record<string, unknown>): string | null {
  if (obj.totalProblems !== undefined && !isFiniteNumber(obj.totalProblems, 0)) {
    return 'career.totalProblems must be a non-negative finite number';
  }
  if (obj.currentRating !== undefined) {
    if (!isPlainObject(obj.currentRating)) return 'career.currentRating must be an object';
    for (const [k, v] of Object.entries(obj.currentRating)) {
      if (!isNonEmptyString(k, MAX_SHORT_TEXT_LENGTH) || !isFiniteNumber(v)) {
        return `career.currentRating["${k}"] must be a finite number`;
      }
    }
  }
  for (const key of ['projects', 'contests', 'applications'] as const) {
    if (obj[key] !== undefined) {
      const err = validateIdObjectArray(obj[key], `career.${key}`);
      if (err) return err;
    }
  }
  if (obj.dailyLogs !== undefined) {
    const err = validateIdObjectArray(obj.dailyLogs, 'career.dailyLogs', 5000);
    if (err) return err;
  }
  if (obj.coreSubjects !== undefined) {
    if (!isPlainObject(obj.coreSubjects)) return 'career.coreSubjects must be an object';
    for (const [k, v] of Object.entries(obj.coreSubjects)) {
      if (!isFiniteNumber(v, 0, 100)) {
        return `career.coreSubjects.${k} must be a number between 0 and 100`;
      }
    }
  }
  if (!isOptionalString(obj.journeyStartDate, MAX_SHORT_TEXT_LENGTH)) {
    return 'career.journeyStartDate must be a string';
  }
  if (!isOptionalString(obj.targetPlacementDate, MAX_SHORT_TEXT_LENGTH)) {
    return 'career.targetPlacementDate must be a string';
  }
  if (obj.isExamMode !== undefined && typeof obj.isExamMode !== 'boolean') {
    return 'career.isExamMode must be a boolean';
  }
  return null;
}

function validateAcademicFields(obj: Record<string, unknown>): string | null {
  if (obj.studentInfo !== undefined) {
    if (!isPlainObject(obj.studentInfo)) return 'academics.studentInfo must be an object';
    for (const [k, v] of Object.entries(obj.studentInfo)) {
      if (!isBoundedString(v, MAX_TITLE_LENGTH)) {
        return `academics.studentInfo.${k} must be a string (max ${MAX_TITLE_LENGTH} chars)`;
      }
    }
  }
  for (const key of ['exams', 'homework'] as const) {
    if (obj[key] !== undefined) {
      const err = validateIdObjectArray(obj[key], `academics.${key}`);
      if (err) return err;
    }
  }
  if (obj.syllabusProgress !== undefined && !isBooleanMap(obj.syllabusProgress, 10_000)) {
    return 'academics.syllabusProgress must be a map of topic IDs to booleans';
  }
  if (obj.messMenu !== undefined) {
    if (!Array.isArray(obj.messMenu) || obj.messMenu.length > 100 || !obj.messMenu.every(isPlainObject)) {
      return 'academics.messMenu must be an array of objects';
    }
  }
  if (obj.attendance !== undefined) {
    if (!isPlainObject(obj.attendance)) return 'academics.attendance must be an object';
    for (const [k, v] of Object.entries(obj.attendance)) {
      if (!isPlainObject(v) || !isFiniteNumber(v.total, 0) || !isFiniteNumber(v.attended, 0)) {
        return `academics.attendance["${k}"] must have non-negative finite total and attended counts`;
      }
    }
  }
  if (obj.internalMarks !== undefined) {
    if (!isPlainObject(obj.internalMarks)) return 'academics.internalMarks must be an object';
    for (const [k, v] of Object.entries(obj.internalMarks)) {
      if (!isPlainObject(v)) return `academics.internalMarks["${k}"] must be an object`;
      for (const [markKey, markVal] of Object.entries(v)) {
        if (markVal !== undefined && !isFiniteNumber(markVal, 0)) {
          return `academics.internalMarks["${k}"].${markKey} must be a non-negative finite number`;
        }
      }
    }
  }
  if (obj.quickNotes !== undefined && !isBoundedString(obj.quickNotes, MAX_LONG_TEXT_LENGTH)) {
    return `academics.quickNotes must be a string (max ${MAX_LONG_TEXT_LENGTH} chars)`;
  }
  return null;
}

/**
 * Runtime schema validator for POST /api/sync payloads.
 */
export function validateSyncPayload(body: unknown): SyncValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Invalid JSON payload' };
  }

  if (body.pull !== undefined && typeof body.pull !== 'boolean') {
    return { ok: false, error: 'Invalid "pull" flag: expected boolean' };
  }
  if (body.confirmWipe !== undefined && typeof body.confirmWipe !== 'boolean') {
    return { ok: false, error: 'Invalid "confirmWipe" flag: expected boolean' };
  }

  const habits = validateCollection<Habit>(body.habits, 'habits', validateHabitItem);
  if (!habits.ok) return { ok: false, error: habits.error };

  const goals = validateCollection<Goal>(body.goals, 'goals', validateGoalItem);
  if (!goals.ok) return { ok: false, error: goals.error };

  const journal = validateCollection<JournalEntry>(body.journal, 'journal', validateJournalItem);
  if (!journal.ok) return { ok: false, error: journal.error };

  const challenges = validateCollection<Challenge>(body.challenges, 'challenges', validateChallengeItem);
  if (!challenges.ok) return { ok: false, error: challenges.error };

  const news = validateCollection<TechNewsStory>(body.news, 'news', validateNewsItem);
  if (!news.ok) return { ok: false, error: news.error };

  const screentime = validateCollection<ScreenTimeEntry>(body.screentime, 'screentime', validateScreenTimeItem);
  if (!screentime.ok) return { ok: false, error: screentime.error };

  const career = validateProfilePayload<CareerProfile>(body.career, 'career', validateCareerFields);
  if (!career.ok) return { ok: false, error: career.error };

  const academics = validateProfilePayload<AcademicProfile>(body.academics, 'academics', validateAcademicFields);
  if (!academics.ok) return { ok: false, error: academics.error };

  return {
    ok: true,
    data: {
      pull: body.pull as boolean | undefined,
      confirmWipe: body.confirmWipe as boolean | undefined,
      habits: habits.value,
      goals: goals.value,
      journal: journal.value,
      challenges: challenges.value,
      news: news.value,
      screentime: screentime.value,
      career: career.value,
      academics: academics.value,
    },
  };
}
