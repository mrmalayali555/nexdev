import { neon, Pool } from '@neondatabase/serverless';

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
 * Returns a Neon SQL execution function if a database connection URL is available.
 */
export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      'Database connection string not found. Please connect Vercel Postgres / Neon in your Vercel Dashboard.'
    );
  }
  return neon(url);
}

/**
 * Ensures all tables exist in Vercel Postgres
 */
export async function initDatabaseTables() {
  const sql = getDb();

  await sql`
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
  `;

  await sql`
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
  `;

  await sql`
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
  `;
}
