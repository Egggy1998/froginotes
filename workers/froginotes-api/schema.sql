-- FrogiNotes D1 Schema v0.2
-- Run: wrangler d1 execute froginotes-db --local --file=schema.sql
-- Note: PRAGMA statements removed — D1 local does not permit them

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  plan       TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Login challenges (device-flow)
CREATE TABLE IF NOT EXISTS challenges (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  confirmed   INTEGER NOT NULL DEFAULT 0,
  session_id  TEXT,
  poll_token      TEXT,   -- raw token stored briefly for poll pickup; cleared after one retrieval
  poll_secret_hash TEXT NOT NULL DEFAULT '',  -- sha256(poll_secret); poll_secret returned only to initiating client
  dev_confirm_url TEXT,   -- DEVELOPMENT ONLY: full confirm URL for test harness, NULL in production
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_challenges_email ON challenges(email, confirmed);

-- Sessions (opaque bearer)
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
  device_hint  TEXT,
  created_at   TEXT NOT NULL,
  last_used_at TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  revoked_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user  ON sessions(user_id, revoked_at);

-- Notes with server revision
CREATE TABLE IF NOT EXISTS notes (
  id             TEXT NOT NULL,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision       INTEGER NOT NULL DEFAULT 1,
  title          TEXT NOT NULL DEFAULT '',
  content        TEXT,
  type           TEXT NOT NULL DEFAULT 'text',
  color          TEXT NOT NULL DEFAULT 'yellow',
  icon           TEXT,
  mascot         TEXT,
  doodle         TEXT,
  folder_id      TEXT NOT NULL DEFAULT 'personal',
  checklist_json TEXT,
  bullets_json   TEXT,
  chip_json      TEXT,
  photo_url      TEXT,
  tape_style     TEXT,
  tape_position  TEXT,
  is_pinned      INTEGER NOT NULL DEFAULT 0,
  is_starred     INTEGER NOT NULL DEFAULT 0,
  is_today       INTEGER NOT NULL DEFAULT 0,
  has_reminder   INTEGER NOT NULL DEFAULT 0,
  is_archived    INTEGER NOT NULL DEFAULT 0,
  is_trash       INTEGER NOT NULL DEFAULT 0,
  reminder_at    TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  deleted_at     TEXT,
  PRIMARY KEY (id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_notes_user    ON notes(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(user_id, updated_at);

-- Diary entries with server revision
CREATE TABLE IF NOT EXISTS diary_entries (
  id            TEXT NOT NULL,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision      INTEGER NOT NULL DEFAULT 1,
  date          TEXT NOT NULL,
  mood          TEXT NOT NULL DEFAULT 'happy',
  weather       TEXT,
  title         TEXT,
  content       TEXT NOT NULL DEFAULT '',
  photo_url     TEXT,
  tape_style    TEXT,
  tape_position TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  deleted_at    TEXT,
  PRIMARY KEY (id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_diary_user    ON diary_entries(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_diary_updated ON diary_entries(user_id, updated_at);

-- Decor packs catalog
CREATE TABLE IF NOT EXISTS decor_packs (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  description       TEXT,
  price_usd_cents   INTEGER NOT NULL DEFAULT 0,
  is_active         INTEGER NOT NULL DEFAULT 1,
  preview_asset_ids TEXT NOT NULL DEFAULT '[]',
  full_asset_ids    TEXT NOT NULL DEFAULT '[]',
  created_at        TEXT NOT NULL
);

-- Entitlements
CREATE TABLE IF NOT EXISTS entitlements (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id    TEXT NOT NULL REFERENCES decor_packs(id),
  source     TEXT NOT NULL DEFAULT 'free',
  granted_at TEXT NOT NULL,
  PRIMARY KEY (user_id, pack_id)
);

-- Rate limit buckets (simple counter per key)
CREATE TABLE IF NOT EXISTS rate_limits (
  key        TEXT NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  window_end TEXT NOT NULL,
  PRIMARY KEY (key)
);

-- Idempotency keys (10 min TTL)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         TEXT PRIMARY KEY,
  status_code INTEGER NOT NULL,
  response    TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- Payment orders
CREATE TABLE IF NOT EXISTS orders (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL DEFAULT 'pro',
  period               TEXT NOT NULL DEFAULT 'yearly',
  amount               INTEGER NOT NULL,
  transfer_description TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'expired'
  webhook_tx_id        TEXT,   -- GPM Pay transaction id; used for idempotency de-dup
  created_at           TEXT NOT NULL,
  expires_at           TEXT NOT NULL,
  completed_at         TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, expires_at);
