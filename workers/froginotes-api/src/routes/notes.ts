import { Hono } from 'hono';
import type { Env } from '../lib/types.js';
import { getNotesSince, batchUpsertNotes, rateLimit, getIdempotentResponse, storeIdempotentResponse } from '../lib/db.js';
import { getAuthContext } from './auth.js';

export const notesRouter = new Hono<{ Bindings: Env }>();

const MAX_ITEMS = 100;
const MAX_TITLE_BYTES = 1024;
const MAX_CONTENT_BYTES = 65536;
const MAX_PHOTO_URL_BYTES = 2048;
const MAX_JSON_BYTES = 131072;

function byteLength(s: string | null | undefined): number {
  if (!s) return 0;
  return new TextEncoder().encode(s).length;
}

const PLAN_REQUIRED_RESPONSE = {
  ok: false,
  error: 'plan_required',
  message: 'Tính năng Cloud Sync yêu cầu gói Pro. Vui lòng nâng cấp để sử dụng.',
} as const;

// GET /api/notes?since=<ISO8601>
notesRouter.get('/', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);
  if (auth.user.plan !== 'pro') return c.json(PLAN_REQUIRED_RESPONSE, 403);

  const since = c.req.query('since') ?? null;
  const data = await getNotesSince(c.env.DB, auth.userId, since === '0' ? null : since);
  return c.json(data);
});

// POST /api/notes/batch
notesRouter.post('/batch', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);
  if (auth.user.plan !== 'pro') return c.json(PLAN_REQUIRED_RESPONSE, 403);

  // Rate limit: 10 batch requests per minute per user
  const allowed = await rateLimit(c.env.DB, `notes-batch:${auth.userId}`, 10, 60);
  if (!allowed) return c.json({ error: 'rate_limited' }, 429);

  // Idempotency
  const idemKey = c.req.header('Idempotency-Key');
  if (idemKey) {
    const cached = await getIdempotentResponse(c.env.DB, `${auth.userId}:${idemKey}`);
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

  // Validate upsert inputs
  const validatedUpserts = [];
  for (const item of upserts) {
    const u = item as Record<string, unknown>;
    if (typeof u.id !== 'string' || !u.id) {
      return c.json({ error: 'validation_error', details: 'upsert item missing id' }, 400);
    }
    if (typeof u.expectedRevision !== 'number') {
      return c.json({ error: 'validation_error', details: `upsert ${u.id}: expectedRevision required` }, 400);
    }
    if (byteLength(u.title as string) > MAX_TITLE_BYTES) {
      return c.json({ error: 'validation_error', details: `note ${u.id}: title exceeds ${MAX_TITLE_BYTES} bytes` }, 400);
    }
    if (byteLength(u.content as string) > MAX_CONTENT_BYTES) {
      return c.json({ error: 'validation_error', details: `note ${u.id}: content exceeds ${MAX_CONTENT_BYTES} bytes` }, 400);
    }
    if (byteLength(u.photoUrl as string) > MAX_PHOTO_URL_BYTES) {
      return c.json({ error: 'validation_error', details: `note ${u.id}: photoUrl exceeds ${MAX_PHOTO_URL_BYTES} bytes` }, 400);
    }
    if (byteLength(u.checklistJson as string) > MAX_JSON_BYTES || byteLength(u.bulletsJson as string) > MAX_JSON_BYTES) {
      return c.json({ error: 'validation_error', details: `note ${u.id}: json field too large` }, 400);
    }
    // user_id is ALWAYS from session — never from body
    validatedUpserts.push({
      id: u.id as string,
      expectedRevision: u.expectedRevision as number,
      title: (u.title as string) ?? '',
      content: (u.content as string) ?? null,
      type: (u.type as string) ?? 'text',
      color: (u.color as string) ?? 'yellow',
      icon: (u.icon as string) ?? null,
      mascot: (u.mascot as string) ?? null,
      doodle: (u.doodle as string) ?? null,
      folderId: (u.folderId as string) ?? 'personal',
      checklistJson: (u.checklistJson as string) ?? null,
      bulletsJson: (u.bulletsJson as string) ?? null,
      chipJson: (u.chipJson as string) ?? null,
      photoUrl: (u.photoUrl as string) ?? null,
      tapeStyle: (u.tapeStyle as string) ?? null,
      tapePosition: (u.tapePosition as string) ?? null,
      isPinned: Boolean(u.isPinned),
      isStarred: Boolean(u.isStarred),
      isToday: Boolean(u.isToday),
      hasReminder: Boolean(u.hasReminder),
      isArchived: Boolean(u.isArchived),
      isTrash: Boolean(u.isTrash),
      reminderAt: (u.reminderAt as string) ?? null,
      createdAt: (u.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (u.updatedAt as string) ?? new Date().toISOString(),
    });
  }

  // Validate delete inputs
  const validatedDeletes = [];
  for (const item of deletes) {
    const d = item as Record<string, unknown>;
    if (typeof d.id !== 'string' || !d.id) {
      return c.json({ error: 'validation_error', details: 'delete item missing id' }, 400);
    }
    if (typeof d.expectedRevision !== 'number') {
      return c.json({ error: 'validation_error', details: `delete ${d.id}: expectedRevision required` }, 400);
    }
    validatedDeletes.push({ id: d.id as string, expectedRevision: d.expectedRevision as number });
  }

  const result = await batchUpsertNotes(c.env.DB, auth.userId, validatedUpserts, validatedDeletes);
  const response = { ok: true, applied: result.applied, conflicts: result.conflicts };

  if (idemKey) {
    await storeIdempotentResponse(c.env.DB, `${auth.userId}:${idemKey}`, 200, response);
  }

  return c.json(response);
});
