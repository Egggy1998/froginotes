-- Seed decor packs catalog
-- Run after schema.sql

INSERT OR IGNORE INTO decor_packs (id, name, description, price_usd_cents, is_active, preview_asset_ids, full_asset_ids, created_at)
VALUES
  ('pack-free-sample',  'Washi Sakura Sample', 'Băng dán washi màu sakura — miễn phí cho mọi tài khoản', 0, 1,
   '["tape-sakura-preview"]', '["tape-sakura-pink","tape-sakura-white"]', datetime('now')),
  ('pack-pastel-dream', 'Pastel Dream', '3 màu tape pastel + 2 pattern — sắp ra mắt', 299, 1,
   '["tape-pastel-preview-1","tape-pastel-preview-2"]', '["tape-lavender","tape-mint","tape-peach","pattern-dots","pattern-stripe"]', datetime('now')),
  ('pack-forest-cozy',  'Forest Cozy', '3 màu tape rừng + doodles cây — sắp ra mắt', 299, 1,
   '["tape-forest-preview"]', '["tape-pine","tape-moss","tape-bark","doodle-tree","doodle-leaf","doodle-mushroom"]', datetime('now'));
