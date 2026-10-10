import { Pool } from 'pg';

export const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString, max: 10 }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'stash',
        max: 10,
      }
);

/**
 * Create tables if they don't exist. Called once on server boot.
 */
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id          SERIAL PRIMARY KEY,
      type        TEXT NOT NULL CHECK (type IN ('movie','anime','book')),
      provider_id TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'watchlist' CHECK (status IN ('watchlist','watched')),
      title       TEXT NOT NULL,
      poster      TEXT NOT NULL DEFAULT '',
      year        TEXT NOT NULL DEFAULT '',
      rating      NUMERIC NOT NULL DEFAULT 0,
      genres      JSONB NOT NULL DEFAULT '[]',
      meta        JSONB NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (type, provider_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL DEFAULT '',
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}