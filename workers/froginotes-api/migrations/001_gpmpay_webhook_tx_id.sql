-- Migration 001: Add webhook_tx_id to orders for GPM Pay idempotency
-- Run: wrangler d1 execute froginotes-db --local --file=migrations/001_gpmpay_webhook_tx_id.sql

ALTER TABLE orders ADD COLUMN webhook_tx_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_webhook_tx_id ON orders(webhook_tx_id) WHERE webhook_tx_id IS NOT NULL;
