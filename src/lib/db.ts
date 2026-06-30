import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const pool =
  global.__pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

let initialized = false;

export async function ensureSchema() {
  if (initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scouts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      dob TEXT,
      guardian_name TEXT,
      guardian_contact TEXT,
      address TEXT,
      join_date TEXT,
      photo_url TEXT,
      notes TEXT,
      group_name TEXT,
      points_total INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      label TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id SERIAL PRIMARY KEY,
      scout_id INTEGER NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      early INTEGER DEFAULT 0,
      copybook INTEGER DEFAULT 0,
      uniform INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(scout_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      scout_id INTEGER NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
      session_id INTEGER,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(scout_id, session_id)
    );
  `);
  initialized = true;
}

export default pool;
