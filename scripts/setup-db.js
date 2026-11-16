const { Pool } = require('pg');

const rawUrl = process.env.POSTGRES_URL || 'postgres://postgres.abhzzgpnjnnibmrgscea:mrDdScB1ekzbv0PK@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const cleanUrl = rawUrl.split('?')[0];

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  const client = await pool.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  await client.query(`
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
  console.log('✅ Created/verified table: nexdev_habits');

  await client.query(`
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
  console.log('✅ Created/verified table: nexdev_goals');

  await client.query(`
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
  console.log('✅ Created/verified table: nexdev_journal');

  await client.query(`
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
  console.log('✅ Created/verified table: nexdev_challenges');

  await client.query(`
    CREATE TABLE IF NOT EXISTS nexdev_meta (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Created/verified table: nexdev_meta');

  client.release();
  await pool.end();
  console.log('🎉 All Supabase tables successfully initialized and ready!');
}

createTables().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

