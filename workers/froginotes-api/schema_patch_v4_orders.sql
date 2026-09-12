-- Schema patch v4: add orders table for payment gating
-- Run: wrangler d1 execute froginotes-db --local --file=schema_patch_v4_orders.sql
-- This table tracks payment orders created for plan upgrades.
-- After a completed order the user's plan is updated to 'pro' in the users table.

CREATE TABLE IF NOT EXISTS orders (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL DEFAULT 'pro',
  period               TEXT NOT NULL DEFAULT 'yearly',
  amount               INTEGER NOT NULL,
  transfer_description TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'expired'
  created_at           TEXT NOT NULL,
  expires_at           TEXT NOT NULL,
  completed_at         TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, expires_at);
