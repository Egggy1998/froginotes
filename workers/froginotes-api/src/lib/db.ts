import type { D1Database } from '@cloudflare/workers-types';
import type { User, Session, Note, DiaryEntry, DecorPack } from './types.js';
import { sha256, uuidv4, now, addDays, addMinutes, isPast } from './crypto.js';

// ─── User ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const row = await db.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first<User>();
  return row ?? null;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const row = await db.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first<User>();
  return row ?? null;
}

export async function upsertUser(db: D1Database, email: string): Promise<User> {
  const existing = await getUserByEmail(db, email);
  if (existing) return existing;
  const user: User = {
    id: uuidv4(),
    email,
    name: null,
    plan: 'free',
    created_at: now(),
    updated_at: now(),
  };
  await db.prepare(
    'INSERT INTO users (id, email, name, plan, created_at, updated_at) VALUES (?1,?2,?3,?4,?5,?6)'
  ).bind(user.id, user.email, user.name, user.plan, user.created_at, user.updated_at).run();
  return user;
}

// ─── Challenge ───────────────────────────────────────────────────────────────

export async function createChallenge(
  db: D1Database, email: string, secretHash: string, pollSecretHash: string, devConfirmUrl?: string
): Promise<string> {
  const id = uuidv4();
  const expiresAt = addMinutes(15);
  await db.prepare(
    'INSERT INTO challenges (id, email, secret_hash, poll_secret_hash, confirmed, dev_confirm_url, expires_at, created_at) VALUES (?1,?2,?3,?4,0,?5,?6,?7)'
  ).bind(id, email, secretHash, pollSecretHash, devConfirmUrl ?? null, expiresAt, now()).run();
  return id;
}

export interface ChallengeRow {
  id: string;
  user_id: string | null;
  email: string;
  secret_hash: string;
  poll_secret_hash: string;
  confirmed: number;
  session_id: string | null;
  poll_token: string | null;
  dev_confirm_url: string | null;
  expires_at: string;
  created_at: string;
}

export async function getChallenge(db: D1Database, id: string): Promise<ChallengeRow | null> {
  return db.prepare('SELECT * FROM challenges WHERE id = ?1').bind(id).first<ChallengeRow>() ?? null;
}

export async function confirmChallenge(db: D1Database, challengeId: string, userId: string, sessionId: string, pollToken: string): Promise<void> {
  await db.prepare(
    'UPDATE challenges SET confirmed=1, user_id=?2, session_id=?3, poll_token=?4 WHERE id=?1'
  ).bind(challengeId, userId, sessionId, pollToken).run();
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function createSession(db: D1Database, userId: string, tokenHash: string, deviceHint: string | null): Promise<string> {
  const id = uuidv4();
  const expiresAt = addDays(30);
  const ts = now();
  await db.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, device_hint, created_at, last_used_at, expires_at, revoked_at) VALUES (?1,?2,?3,?4,?5,?5,?6,NULL)'
  ).bind(id, userId, tokenHash, deviceHint, ts, expiresAt).run();
  return id;
}

export async function getSessionByTokenHash(db: D1Database, tokenHash: string): Promise<Session | null> {
  return db.prepare('SELECT * FROM sessions WHERE token_hash = ?1').bind(tokenHash).first<Session>() ?? null;
}

export async function revokeSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('UPDATE sessions SET revoked_at=?2 WHERE id=?1').bind(sessionId, now()).run();
}

export async function touchSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('UPDATE sessions SET last_used_at=?2 WHERE id=?1').bind(sessionId, now()).run();
}

/** Validate a bearer token. Returns {userId, sessionId, user} or null. */
export async function validateToken(db: D1Database, token: string): Promise<{ userId: string; sessionId: string; user: User } | null> {
  const hash = await sha256(token);
  const session = await getSessionByTokenHash(db, hash);
  if (!session) return null;
  if (session.revoked_at !== null) return null;
  if (isPast(session.expires_at)) return null;
  const user = await getUserById(db, session.user_id);
  if (!user) return null;
  // Touch last_used_at (non-blocking intent — don't await in hot path)
  // We await here for correctness in tests; fine for Worker latency
  await touchSession(db, session.id);
  return { userId: session.user_id, sessionId: session.id, user };
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

/** Returns true if under limit, increments count. windowSeconds is the window size. */
export async function rateLimit(db: D1Database, key: string, maxCount: number, windowSeconds: number): Promise<boolean> {
  const windowEnd = new Date(Date.now() + windowSeconds * 1000).toISOString();
  const existing = await db.prepare('SELECT count, window_end FROM rate_limits WHERE key=?1').bind(key).first<{count: number; window_end: string}>();
  if (!existing || isPast(existing.window_end)) {
    // New window
    await db.prepare('INSERT OR REPLACE INTO rate_limits (key, count, window_end) VALUES (?1,1,?2)').bind(key, windowEnd).run();
    return true;
  }
  if (existing.count >= maxCount) return false;
  await db.prepare('UPDATE rate_limits SET count=count+1 WHERE key=?1').bind(key).run();
  return true;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function getNotesSince(db: D1Database, userId: string, since: string | null): Promise<{notes: Note[]; tombstones: {id: string; deletedAt: string; revision: number}[]}> {
  let notes: Note[];
  let tombstones: {id: string; deletedAt: string; revision: number}[];

  if (!since || since === '0') {
    const res = await db.prepare('SELECT * FROM notes WHERE user_id=?1 AND deleted_at IS NULL').bind(userId).all<Note>();
    notes = res.results;
    const tRes = await db.prepare('SELECT id, deleted_at, revision FROM notes WHERE user_id=?1 AND deleted_at IS NOT NULL').bind(userId).all<{id:string;deleted_at:string;revision:number}>();
    tombstones = tRes.results.map(r => ({id: r.id, deletedAt: r.deleted_at, revision: r.revision}));
  } else {
    const res = await db.prepare('SELECT * FROM notes WHERE user_id=?1 AND deleted_at IS NULL AND updated_at > ?2').bind(userId, since).all<Note>();
    notes = res.results;
    const tRes = await db.prepare('SELECT id, deleted_at, revision FROM notes WHERE user_id=?1 AND deleted_at IS NOT NULL AND updated_at > ?2').bind(userId, since).all<{id:string;deleted_at:string;revision:number}>();
    tombstones = tRes.results.map(r => ({id: r.id, deletedAt: r.deleted_at, revision: r.revision}));
  }

  return { notes, tombstones };
}

export interface UpsertConflict {
  id: string;
  reason: 'revision_mismatch' | 'tombstoned';
  serverRecord: Note | null;
  serverRevision: number;
}

export interface NoteUpsertInput {
  id: string;
  expectedRevision: number;
  title: string;
  content?: string | null;
  type?: string;
  color?: string;
  icon?: string | null;
  mascot?: string | null;
  doodle?: string | null;
  folderId?: string;
  checklistJson?: string | null;
  bulletsJson?: string | null;
  chipJson?: string | null;
  photoUrl?: string | null;
  tapeStyle?: string | null;
  tapePosition?: string | null;
  isPinned?: boolean;
  isStarred?: boolean;
  isToday?: boolean;
  hasReminder?: boolean;
  isArchived?: boolean;
  isTrash?: boolean;
  reminderAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDeleteInput {
  id: string;
  expectedRevision: number;
}

export async function batchUpsertNotes(
  db: D1Database,
  userId: string,
  upserts: NoteUpsertInput[],
  deletes: NoteDeleteInput[]
): Promise<{ applied: { upserted: string[]; deleted: string[] }; conflicts: UpsertConflict[] }> {
  const applied = { upserted: [] as string[], deleted: [] as string[] };
  const conflicts: UpsertConflict[] = [];
  const ts = new Date().toISOString();

  for (const u of upserts) {
    const existing = await db.prepare('SELECT * FROM notes WHERE id=?1 AND user_id=?2').bind(u.id, userId).first<Note>();

    if (existing) {
      // Tombstone wins permanently
      if (existing.deleted_at !== null) {
        conflicts.push({ id: u.id, reason: 'tombstoned', serverRecord: null, serverRevision: existing.revision });
        continue;
      }
      // Revision CAS check
      if (existing.revision !== u.expectedRevision) {
        conflicts.push({ id: u.id, reason: 'revision_mismatch', serverRecord: existing, serverRevision: existing.revision });
        continue;
      }
      // Update
      await db.prepare(`UPDATE notes SET
        revision=?3, title=?4, content=?5, type=?6, color=?7, icon=?8, mascot=?9, doodle=?10,
        folder_id=?11, checklist_json=?12, bullets_json=?13, chip_json=?14, photo_url=?15,
        tape_style=?16, tape_position=?17, is_pinned=?18, is_starred=?19, is_today=?20,
        has_reminder=?21, is_archived=?22, is_trash=?23, reminder_at=?24,
        updated_at=?25, deleted_at=NULL
        WHERE id=?1 AND user_id=?2
      `).bind(
        u.id, userId, existing.revision + 1,
        u.title ?? '', u.content ?? null, u.type ?? 'text', u.color ?? 'yellow',
        u.icon ?? null, u.mascot ?? null, u.doodle ?? null,
        u.folderId ?? 'personal', u.checklistJson ?? null, u.bulletsJson ?? null, u.chipJson ?? null,
        u.photoUrl ?? null, u.tapeStyle ?? null, u.tapePosition ?? null,
        u.isPinned ? 1 : 0, u.isStarred ? 1 : 0, u.isToday ? 1 : 0,
        u.hasReminder ? 1 : 0, u.isArchived ? 1 : 0, u.isTrash ? 1 : 0,
        u.reminderAt ?? null, ts
      ).run();
      applied.upserted.push(u.id);
    } else {
      // New row — expectedRevision must be 0
      if (u.expectedRevision !== 0) {
        conflicts.push({ id: u.id, reason: 'revision_mismatch', serverRecord: null, serverRevision: 0 });
        continue;
      }
      await db.prepare(`INSERT INTO notes
        (id, user_id, revision, title, content, type, color, icon, mascot, doodle, folder_id,
         checklist_json, bullets_json, chip_json, photo_url, tape_style, tape_position,
         is_pinned, is_starred, is_today, has_reminder, is_archived, is_trash, reminder_at,
         created_at, updated_at, deleted_at)
        VALUES (?1,?2,1,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,NULL)
      `).bind(
        u.id, userId,
        u.title ?? '', u.content ?? null, u.type ?? 'text', u.color ?? 'yellow',
        u.icon ?? null, u.mascot ?? null, u.doodle ?? null,
        u.folderId ?? 'personal', u.checklistJson ?? null, u.bulletsJson ?? null, u.chipJson ?? null,
        u.photoUrl ?? null, u.tapeStyle ?? null, u.tapePosition ?? null,
        u.isPinned ? 1 : 0, u.isStarred ? 1 : 0, u.isToday ? 1 : 0,
        u.hasReminder ? 1 : 0, u.isArchived ? 1 : 0, u.isTrash ? 1 : 0,
        u.reminderAt ?? null, u.createdAt, ts
      ).run();
      applied.upserted.push(u.id);
    }
  }

  for (const d of deletes) {
    const existing = await db.prepare('SELECT revision, deleted_at FROM notes WHERE id=?1 AND user_id=?2').bind(d.id, userId).first<{revision: number; deleted_at: string | null}>();
    if (!existing) {
      // Row never existed — idempotent
      applied.deleted.push(d.id);
      continue;
    }
    if (existing.deleted_at !== null) {
      // Already tombstoned — idempotent
      applied.deleted.push(d.id);
      continue;
    }
    if (existing.revision !== d.expectedRevision) {
      const full = await db.prepare('SELECT * FROM notes WHERE id=?1 AND user_id=?2').bind(d.id, userId).first<Note>();
      conflicts.push({ id: d.id, reason: 'revision_mismatch', serverRecord: full ?? null, serverRevision: existing.revision });
      continue;
    }
    await db.prepare('UPDATE notes SET deleted_at=?3, revision=revision+1, updated_at=?3 WHERE id=?1 AND user_id=?2').bind(d.id, userId, ts).run();
    applied.deleted.push(d.id);
  }

  return { applied, conflicts };
}

// ─── Diary ───────────────────────────────────────────────────────────────────

export async function getDiarySince(db: D1Database, userId: string, since: string | null): Promise<{entries: DiaryEntry[]; tombstones: {id: string; deletedAt: string; revision: number}[]}> {
  let entries: DiaryEntry[];
  let tombstones: {id: string; deletedAt: string; revision: number}[];

  if (!since || since === '0') {
    const res = await db.prepare('SELECT * FROM diary_entries WHERE user_id=?1 AND deleted_at IS NULL').bind(userId).all<DiaryEntry>();
    entries = res.results;
    const tRes = await db.prepare('SELECT id, deleted_at, revision FROM diary_entries WHERE user_id=?1 AND deleted_at IS NOT NULL').bind(userId).all<{id:string;deleted_at:string;revision:number}>();
    tombstones = tRes.results.map(r => ({id: r.id, deletedAt: r.deleted_at, revision: r.revision}));
  } else {
    const res = await db.prepare('SELECT * FROM diary_entries WHERE user_id=?1 AND deleted_at IS NULL AND updated_at > ?2').bind(userId, since).all<DiaryEntry>();
    entries = res.results;
    const tRes = await db.prepare('SELECT id, deleted_at, revision FROM diary_entries WHERE user_id=?1 AND deleted_at IS NOT NULL AND updated_at > ?2').bind(userId, since).all<{id:string;deleted_at:string;revision:number}>();
    tombstones = tRes.results.map(r => ({id: r.id, deletedAt: r.deleted_at, revision: r.revision}));
  }

  return { entries, tombstones };
}

export interface DiaryUpsertInput {
  id: string;
  expectedRevision: number;
  date: string;
  mood?: string;
  weather?: string | null;
  title?: string | null;
  content?: string;
  photoUrl?: string | null;
  tapeStyle?: string | null;
  tapePosition?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function batchUpsertDiary(
  db: D1Database,
  userId: string,
  upserts: DiaryUpsertInput[],
  deletes: NoteDeleteInput[]
): Promise<{ applied: { upserted: string[]; deleted: string[] }; conflicts: UpsertConflict[] }> {
  const applied = { upserted: [] as string[], deleted: [] as string[] };
  const conflicts: UpsertConflict[] = [];
  const ts = new Date().toISOString();

  for (const u of upserts) {
    const existing = await db.prepare('SELECT * FROM diary_entries WHERE id=?1 AND user_id=?2').bind(u.id, userId).first<DiaryEntry>();

    if (existing) {
      if (existing.deleted_at !== null) {
        conflicts.push({ id: u.id, reason: 'tombstoned', serverRecord: null, serverRevision: existing.revision });
        continue;
      }
      if (existing.revision !== u.expectedRevision) {
        conflicts.push({ id: u.id, reason: 'revision_mismatch', serverRecord: existing as unknown as Note, serverRevision: existing.revision });
        continue;
      }
      await db.prepare(`UPDATE diary_entries SET
        revision=?3, date=?4, mood=?5, weather=?6, title=?7, content=?8,
        photo_url=?9, tape_style=?10, tape_position=?11, updated_at=?12, deleted_at=NULL
        WHERE id=?1 AND user_id=?2
      `).bind(
        u.id, userId, existing.revision + 1,
        u.date, u.mood ?? 'happy', u.weather ?? null, u.title ?? null,
        u.content ?? '', u.photoUrl ?? null, u.tapeStyle ?? null, u.tapePosition ?? null, ts
      ).run();
      applied.upserted.push(u.id);
    } else {
      if (u.expectedRevision !== 0) {
        conflicts.push({ id: u.id, reason: 'revision_mismatch', serverRecord: null, serverRevision: 0 });
        continue;
      }
      await db.prepare(`INSERT INTO diary_entries
        (id, user_id, revision, date, mood, weather, title, content, photo_url, tape_style, tape_position, created_at, updated_at, deleted_at)
        VALUES (?1,?2,1,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,NULL)
      `).bind(
        u.id, userId,
        u.date, u.mood ?? 'happy', u.weather ?? null, u.title ?? null,
        u.content ?? '', u.photoUrl ?? null, u.tapeStyle ?? null, u.tapePosition ?? null,
        u.createdAt, ts
      ).run();
      applied.upserted.push(u.id);
    }
  }

  for (const d of deletes) {
    const existing = await db.prepare('SELECT revision, deleted_at FROM diary_entries WHERE id=?1 AND user_id=?2').bind(d.id, userId).first<{revision: number; deleted_at: string | null}>();
    if (!existing || existing.deleted_at !== null) {
      applied.deleted.push(d.id);
      continue;
    }
    if (existing.revision !== d.expectedRevision) {
      const full = await db.prepare('SELECT * FROM diary_entries WHERE id=?1 AND user_id=?2').bind(d.id, userId).first<DiaryEntry>();
      conflicts.push({ id: d.id, reason: 'revision_mismatch', serverRecord: full as unknown as Note ?? null, serverRevision: existing.revision });
      continue;
    }
    await db.prepare('UPDATE diary_entries SET deleted_at=?3, revision=revision+1, updated_at=?3 WHERE id=?1 AND user_id=?2').bind(d.id, userId, ts).run();
    applied.deleted.push(d.id);
  }

  return { applied, conflicts };
}

// ─── Decor ───────────────────────────────────────────────────────────────────

export async function getDecorPacksForUser(db: D1Database, userId: string): Promise<{
  id: string; name: string; description: string | null; priceUsdCents: number;
  previewAssets: string[]; fullAssets: string[] | null; owned: boolean;
}[]> {
  const packs = await db.prepare('SELECT * FROM decor_packs WHERE is_active=1').all<DecorPack>();
  const entitlements = await db.prepare('SELECT pack_id FROM entitlements WHERE user_id=?1').bind(userId).all<{pack_id: string}>();
  const ownedSet = new Set(entitlements.results.map(e => e.pack_id));

  return packs.results.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceUsdCents: p.price_usd_cents,
    previewAssets: JSON.parse(p.preview_asset_ids) as string[],
    fullAssets: ownedSet.has(p.id) ? JSON.parse(p.full_asset_ids) as string[] : null,
    owned: ownedSet.has(p.id),
  }));
}

export async function grantEntitlement(db: D1Database, userId: string, packId: string, source: string): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO entitlements (user_id, pack_id, source, granted_at) VALUES (?1,?2,?3,?4)')
    .bind(userId, packId, source, new Date().toISOString()).run();
}

// ─── Idempotency ─────────────────────────────────────────────────────────────

export async function getIdempotentResponse(db: D1Database, key: string): Promise<{status_code: number; response: string} | null> {
  // Clean expired keys (older than 10 min)
  const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  await db.prepare('DELETE FROM idempotency_keys WHERE created_at < ?1').bind(tenMinAgo).run();
  return db.prepare('SELECT status_code, response FROM idempotency_keys WHERE key=?1').bind(key).first<{status_code: number; response: string}>() ?? null;
}

export async function storeIdempotentResponse(db: D1Database, key: string, statusCode: number, body: unknown): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO idempotency_keys (key, status_code, response, created_at) VALUES (?1,?2,?3,?4)')
    .bind(key, statusCode, JSON.stringify(body), new Date().toISOString()).run();
}
