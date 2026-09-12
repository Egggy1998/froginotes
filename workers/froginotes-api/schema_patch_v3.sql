-- Schema patch v3: add poll_secret_hash to challenges
-- Run: wrangler d1 execute froginotes-db --local --file=schema_patch_v3.sql
-- This column holds sha256(poll_secret) — poll_secret returned only to the initiating client.
-- poll endpoint must verify: sha256(provided_ps) == poll_secret_hash before returning token.
ALTER TABLE challenges ADD COLUMN poll_secret_hash TEXT NOT NULL DEFAULT '';
