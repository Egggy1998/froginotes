import { Hono } from 'hono';
import type { Env } from '../lib/types.js';
import { getDecorPacksForUser } from '../lib/db.js';
import { getAuthContext } from './auth.js';

export const decorRouter = new Hono<{ Bindings: Env }>();

// GET /api/decor/packs
decorRouter.get('/packs', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);

  const packs = await getDecorPacksForUser(c.env.DB, auth.userId);
  return c.json({ packs });
});

// POST /api/decor/checkout — always 503, fail-closed
decorRouter.post('/checkout', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);

  return c.json(
    { ok: false, error: 'Thanh toán chưa khả dụng. Vui lòng thử lại sau.' },
    503
  );
});
