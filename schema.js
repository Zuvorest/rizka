const pool = require('./db');

const statements = [
  `CREATE TABLE IF NOT EXISTS ads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    placement VARCHAR(50),
    format VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,

  `CREATE TABLE IF NOT EXISTS shortlinks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    short_code VARCHAR(16) UNIQUE NOT NULL,
    title VARCHAR(160) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'inactive')),
    clicks BIGINT NOT NULL DEFAULT 0,
    last_visited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_shortlinks_user
    ON shortlinks (user_id, created_at DESC)`,

  `CREATE INDEX IF NOT EXISTS idx_shortlinks_code
    ON shortlinks (short_code)`
];

async function ensureSchema() {
  for (const sql of statements) {
    await pool.query(sql);
  }
}

module.exports = { ensureSchema };
