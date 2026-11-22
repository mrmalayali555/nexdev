import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDatabaseUrl(): string {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function isDbConfigured(): boolean {
  return getDatabaseUrl().length > 0;
}

/**
 * Returns a pooled Postgres client instance.
 * Automatically handles SSL certificates and pooler connection strings.
 */
export function getDbPool(): Pool {
  if (pool) return pool;

  const rawUrl = getDatabaseUrl();
  if (!rawUrl) {
    throw new Error('Database connection URL not found in environment variables.');
  }

  // Strip query parameters to prevent SSL conflict on Supabase / AWS
  const cleanUrl = rawUrl.split('?')[0];

  pool = new Pool({
    connectionString: cleanUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return pool;
}

/**
 * Helper to execute parameterized SQL queries
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const p = getDbPool();
  const client = await p.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Ensures all tables exist in Supabase / Postgres
 */
export async function initDatabaseTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      category TEXT NOT NULL,
      frequency TEXT NOT NULL,
      color TEXT NOT NULL,
      challenge_mode TEXT,
      challenge_start_date TEXT,
      created_at TEXT NOT NULL,
      completions JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      target_date TEXT NOT NULL,
      progress INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in-progress',
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      milestones JSONB NOT NULL DEFAULT '[]'::jsonb
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_journal (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      mood TEXT NOT NULL,
      gratitude JSONB NOT NULL DEFAULT '[]'::jsonb,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      duration_days INT NOT NULL,
      current_day INT NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      color TEXT NOT NULL,
      emoji TEXT NOT NULL,
      target_habit_id TEXT,
      start_date TEXT NOT NULL,
      checkins JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      full_content TEXT NOT NULL,
      source_url TEXT,
      read BOOLEAN NOT NULL DEFAULT false,
      date TEXT NOT NULL,
      deep_dive TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_screentime (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      apps JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_minutes INT NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_meta (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS nexdev_career (
      id TEXT PRIMARY KEY DEFAULT 'career_profile',
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
