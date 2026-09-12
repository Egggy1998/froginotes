import { Hono } from 'hono';
import type { Env } from '../lib/types.js';
import { getDiarySince, batchUpsertDiary, rateLimit, getIdempotentResponse, storeIdempotentResponse } from '../lib/db.js';
import { getAuthContext } from './auth.js';

export const diaryRouter = new Hono<{ Bindings: Env }>();

const MAX_ITEMS = 100;
const MAX_CONTENT_BYTES = 65536;
const MAX_PHOTO_URL_BYTES = 2048;

function byteLength(s: string | null | undefined): number {
  if (!s) return 0;
  return new TextEncoder().encode(s).length;
}

const PLAN_REQUIRED_RESPONSE = {
  ok: false,
  error: 'plan_required',
  message: 'Tính năng Cloud Sync yêu cầu gói Pro. Vui lòng nâng cấp để sử dụng.',
} as const;

// GET /api/diary?since=<ISO8601>
diaryRouter.get('/', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);
  if (auth.user.plan !== 'pro') return c.json(PLAN_REQUIRED_RESPONSE, 403);

  const since = c.req.query('since') ?? null;
  const data = await getDiarySince(c.env.DB, auth.userId, since === '0' ? null : since);
  return c.json(data);
});

// POST /api/diary/batch
diaryRouter.post('/batch', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);
  if (auth.user.plan !== 'pro') return c.json(PLAN_REQUIRED_RESPONSE, 403);

  const allowed = await rateLimit(c.env.DB, `diary-batch:${auth.userId}`, 10, 60);
  if (!allowed) return c.json({ error: 'rate_limited' }, 429);

  const idemKey = c.req.header('Idempotency-Key');
  if (idemKey) {
    const cached = await getIdempotentResponse(c.env.DB, `${auth.userId}:diary:${idemKey}`);
    if (cached) {
      return new Response(cached.response, { status: cached.status_code, headers: { 'Content-Type': 'application/json' } });
    }
  }

  const body = await c.req.json<{ upsert?: unknown[]; delete?: unknown[] }>().catch(() => null);
  if (!body) return c.json({ error: 'validation_error', details: 'invalid JSON' }, 400);

  const upserts = Array.isArray(body.upsert) ? body.upsert : [];
  const deletes = Array.isArray(body.delete) ? body.delete : [];

  if (upserts.length > MAX_ITEMS || deletes.length > MAX_ITEMS) {
    return c.json({ error: 'validation_error', details: `Max ${MAX_ITEMS} items per batch` }, 400);
  }

  const validatedUpserts = [];
  for (const item of upserts) {
    const u = item as Record<string, unknown>;
    if (typeof u.id !== 'string' || !u.id) return c.json({ error: 'validation_error', details: 'missing id' }, 400);
    if (typeof u.expectedRevision !== 'number') return c.json({ error: 'validation_error', details: `${u.id}: expectedRevision required` }, 400);
    if (!u.date || typeof u.date !== 'string') return c.json({ error: 'validation_error', details: `${u.id}: date required` }, 400);
    if (byteLength(u.content as string) > MAX_CONTENT_BYTES) return c.json({ error: 'validation_error', details: `${u.id}: content too large` }, 400);
    if (byteLength(u.photoUrl as string) > MAX_PHOTO_URL_BYTES) return c.json({ error: 'validation_error', details: `${u.id}: photoUrl too large` }, 400);
    validatedUpserts.push({
      id: u.id as string,
      expectedRevision: u.expectedRevision as number,
      date: u.date as string,
      mood: (u.mood as string) ?? 'happy',
      weather: (u.weather as string) ?? null,
      title: (u.title as string) ?? null,
      content: (u.content as string) ?? '',
      photoUrl: (u.photoUrl as string) ?? null,
      tapeStyle: (u.tapeStyle as string) ?? null,
      tapePosition: (u.tapePosition as string) ?? null,
      createdAt: (u.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (u.updatedAt as string) ?? new Date().toISOString(),
    });
  }

  const validatedDeletes = [];
  for (const item of deletes) {
    const d = item as Record<string, unknown>;
    if (typeof d.id !== 'string' || !d.id) return c.json({ error: 'validation_error', details: 'missing id' }, 400);
    if (typeof d.expectedRevision !== 'number') return c.json({ error: 'validation_error', details: `${d.id}: expectedRevision required` }, 400);
    validatedDeletes.push({ id: d.id as string, expectedRevision: d.expectedRevision as number });
  }

  const result = await batchUpsertDiary(c.env.DB, auth.userId, validatedUpserts, validatedDeletes);
  const response = { ok: true, applied: result.applied, conflicts: result.conflicts };

  if (idemKey) {
    await storeIdempotentResponse(c.env.DB, `${auth.userId}:diary:${idemKey}`, 200, response);
  }

  return c.json(response);
});
