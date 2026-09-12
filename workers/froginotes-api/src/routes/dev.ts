import { Hono } from 'hono';
import type { Env } from '../lib/types.js';
import { grantEntitlement, upsertUser } from '../lib/db.js';
import { getAuthContext } from './auth.js';

export const devRouter = new Hono<{ Bindings: Env }>();

// POST /api/dev/seed-entitlement
// GUARD: returns 404 unless ENVIRONMENT === 'development' exactly
devRouter.post('/seed-entitlement', async (c) => {
  // Hard guard — 404 to avoid discoverability in production
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'not_found' }, 404);
  }

  const devSeedHeader = c.req.header('X-Dev-Seed');
  const expectedSecret = c.env.DEV_SEED_SECRET;

  if (!devSeedHeader || !expectedSecret || devSeedHeader !== expectedSecret) {
    return c.json({ error: 'forbidden' }, 403);
  }

  const body = await c.req.json<{ email?: string; packId?: string }>().catch(() => ({}));
  if (!body.email || !body.packId) {
    return c.json({ error: 'email and packId required' }, 400);
  }

  // Find or create user
  const user = await upsertUser(c.env.DB, body.email.trim().toLowerCase());

  // Grant entitlement
  await grantEntitlement(c.env.DB, user.id, body.packId, 'seed_dev');

  return c.json({ ok: true, userId: user.id, packId: body.packId });
});

// POST /api/dev/seed-packs — seed decor catalog from seed.sql content
devRouter.post('/seed-packs', async (c) => {
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'not_found' }, 404);
  }

  const devSeedHeader = c.req.header('X-Dev-Seed');
  if (!devSeedHeader || devSeedHeader !== c.env.DEV_SEED_SECRET) {
    return c.json({ error: 'forbidden' }, 403);
  }

  const ts = new Date().toISOString();
  const packs = [
    { id: 'pack-free-sample', name: 'Washi Sakura Sample', description: 'Băng dán washi màu sakura — miễn phí cho mọi tài khoản', price: 0, preview: '["tape-sakura-preview"]', full: '["tape-sakura-pink","tape-sakura-white"]' },
    { id: 'pack-pastel-dream', name: 'Pastel Dream', description: '3 màu tape pastel + 2 pattern — sắp ra mắt', price: 299, preview: '["tape-pastel-preview-1","tape-pastel-preview-2"]', full: '["tape-lavender","tape-mint","tape-peach","pattern-dots","pattern-stripe"]' },
    { id: 'pack-forest-cozy', name: 'Forest Cozy', description: '3 màu tape rừng + doodles cây — sắp ra mắt', price: 299, preview: '["tape-forest-preview"]', full: '["tape-pine","tape-moss","tape-bark","doodle-tree","doodle-leaf","doodle-mushroom"]' },
  ];

  for (const p of packs) {
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO decor_packs (id, name, description, price_usd_cents, is_active, preview_asset_ids, full_asset_ids, created_at) VALUES (?1,?2,?3,?4,1,?5,?6,?7)'
    ).bind(p.id, p.name, p.description, p.price, p.preview, p.full, ts).run();
  }

  return c.json({ ok: true, seeded: packs.length });
});

// POST /api/dev/simulate-payment { orderId }
// DEVELOPMENT ONLY: instantly complete a payment order (no auth check, no signature verification)
devRouter.post('/simulate-payment', async (c) => {
  if (c.env.ENVIRONMENT !== 'development') {
    return c.json({ error: 'not_found' }, 404);
  }

  const body = await c.req.json<{ orderId?: string }>().catch(() => ({}));
  if (!body.orderId) {
    return c.json({ ok: false, error: 'orderId required' }, 400);
  }

  const row = await c.env.DB.prepare(
    'SELECT id, user_id, plan, status, expires_at FROM orders WHERE id=?1'
  ).bind(body.orderId).first<{ id: string; user_id: string; plan: string; status: string; expires_at: string }>();

  if (!row) return c.json({ ok: false, error: 'order_not_found' }, 404);
  if (row.status === 'completed') return c.json({ ok: true, message: 'already_completed', orderId: row.id });

  const completedAt = new Date().toISOString();
  await c.env.DB.prepare(
    "UPDATE orders SET status='completed', completed_at=?2 WHERE id=?1"
  ).bind(body.orderId, completedAt).run();

  await c.env.DB.prepare(
    "UPDATE users SET plan=?2, updated_at=?3 WHERE id=?1"
  ).bind(row.user_id, row.plan, completedAt).run();

  return c.json({ ok: true, orderId: row.id, status: 'completed', plan: row.plan });
});
