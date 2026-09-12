# FrogiNotes API — Backend Contract v0.2

**Status:** Implementation-ready  
**Scope:** `workers/froginotes-api/**` only — backend subagent owns this tree  
**Date:** 2026-09-11

---

## 0. Risks Fixed vs Original Plan (v0.1)

| Risk in v0.1 | Fix in v0.2 |
|---|---|
| Magic-link redirects to app with JWT in URL → token leak via Referer/history | Device login challenge+poll: client polls `/api/auth/poll/:challengeId`, token never appears in URL |
| Electron `webRequest` CORS override suggested | **Forbidden.** No CORS header injection in Electron. Worker enforces CORS server-side; Electron uses `session.defaultSession` with proper `partition:persist:froginotes` |
| JWT in httpOnly cookie not accessible from Electron renderer on `localhost` | Opaque bearer token stored in Electron `safeStorage` (renderer sends `Authorization: Bearer <token>`) — no cookie needed for desktop. Web uses httpOnly cookie same-site flow |
| Dev mail sink could accidentally route to production Resend | Dev email sink only binds if `ENVIRONMENT=development` AND `DEV_MAIL_SINK=true`. No credentials, no Resend call, console.log only. Production requires `RESEND_API_KEY` or fails 503 |
| Client-clock LWW: stale client can overwrite newer server data | Server-side monotonic revision counter. Upsert requires `expectedRevision: number`. Mismatch → 409 Conflict returns server record; client must merge or discard |
| Stale resurrection: deleted note re-upserted by offline client | Tombstone wins permanently. DELETE creates tombstone with `deleted_at`. Upsert with `expectedRevision` returns 409 if tombstoned — client receives `{tombstoned: true}` |
| Tenant injection: client sends arbitrary `user_id` in batch body | `user_id` ALWAYS taken from authenticated session, never from request body |
| Token replay after logout | Session `revoked_at` stored server-side. Bearer token hash verified against active sessions on every request |
| No input size limits | Content max 64 KB, title max 1 KB, photo_url max 2 KB, checklist/bullets max 128 KB, batch max 100 items |
| No stable operation IDs for retries | `idempotency_key` header on POST/PATCH; duplicate within 10 min returns cached 200 |
| Checkout fake-purchasable | `POST /api/decor/checkout` always 503. No payment logic, no redirect, no state change |

---

## 1. Auth Flow — Device Login Challenge+Poll

### Why not magic link redirect?
A redirect URL like `/api/auth/verify?token=abc` puts a one-time token in browser history and Referer headers. Electron's in-app browser has no private history but the security surface is still wrong for a desktop app.

### Corrected flow

```
1. Client:  POST /api/auth/request-challenge  { email }
            → { challengeId: uuid, expiresAt: ISO8601 }  (15 min TTL)

2. Server:  Sends email with link:
            http://localhost:8787/api/auth/confirm-challenge?c=<challengeId>&secret=<32-byte-hex>
            (In dev: console.log only, no Resend call)
            challenge row: { id, user_id, secret_hash, expires_at, confirmed: 0, session_id: null }

3. User:    Clicks email link in any browser
            GET /api/auth/confirm-challenge?c=<id>&secret=<secret>
            → Server sets confirmed=1, creates session, stores session_id on challenge row
            → Returns 200 HTML: "Xác nhận thành công. Bạn có thể đóng tab này."

4. Client:  Polls  GET /api/auth/poll/:challengeId  (every 3s, max 5 min)
            → 202 { status: "pending" }  while waiting
            → 200 { status: "confirmed", token: "<opaque-bearer>" }  once confirmed
            → 410 { status: "expired" }  after TTL
            → 429 if polling faster than 2s

5. Client:  Stores opaque bearer in:
            - Electron: app-level encrypted store (safeStorage or keytar)
            - Web:      httpOnly cookie set by server on confirm-challenge response
                        (web client does not poll; it was the tab that clicked the link)
            
6. All subsequent requests:
            - Desktop: Authorization: Bearer <opaque-token>
            - Web:     Cookie: frogi_session=<opaque-token>  (httpOnly, SameSite=Lax)
```

### Session token properties
- Opaque random 32 bytes (hex-encoded, 64 chars) — NOT a JWT
- Stored server-side as `SHA-256(token)` in `sessions` table
- Scoped to `(user_id, device_hint)` — device_hint is `User-Agent` + `IP` prefix (not enforced strictly, used for audit log only)
- Revocable: `POST /api/auth/logout` sets `revoked_at` immediately
- TTL: 30 days; sliding expiry reset on each successful request
- No JWT secret to rotate, no decode step, no alg confusion

---

## 2. D1 Schema (corrected)

```sql
-- Users
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,            -- uuid v4
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  plan       TEXT NOT NULL DEFAULT 'free', -- 'free' only for MVP; 'pro' reserved
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Login challenges (device flow)
CREATE TABLE IF NOT EXISTS challenges (
  id          TEXT PRIMARY KEY,            -- uuid
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,  -- NULL until email confirmed
  email       TEXT NOT NULL,              -- used to create/find user on confirm
  secret_hash TEXT NOT NULL,             -- SHA-256(secret) — never store secret plain
  confirmed   INTEGER NOT NULL DEFAULT 0,
  session_id  TEXT,                       -- set when confirmed
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- Sessions (opaque bearer)
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,          -- uuid
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,     -- SHA-256(opaque_token)
  device_hint  TEXT,
  created_at   TEXT NOT NULL,
  last_used_at TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  revoked_at   TEXT                       -- NULL = active
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user  ON sessions(user_id, revoked_at);

-- Notes with server revision
CREATE TABLE IF NOT EXISTS notes (
  id              TEXT NOT NULL,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision        INTEGER NOT NULL DEFAULT 1,  -- server monotonic counter
  title           TEXT NOT NULL DEFAULT '',
  content         TEXT,
  type            TEXT NOT NULL DEFAULT 'text',
  color           TEXT NOT NULL DEFAULT 'yellow',
  icon            TEXT,
  mascot          TEXT,
  doodle          TEXT,
  folder_id       TEXT NOT NULL DEFAULT 'personal',
  checklist_json  TEXT,
  bullets_json    TEXT,
  chip_json       TEXT,
  photo_url       TEXT,
  tape_style      TEXT,
  tape_position   TEXT,
  is_pinned       INTEGER NOT NULL DEFAULT 0,
  is_starred      INTEGER NOT NULL DEFAULT 0,
  is_today        INTEGER NOT NULL DEFAULT 0,
  has_reminder    INTEGER NOT NULL DEFAULT 0,
  is_archived     INTEGER NOT NULL DEFAULT 0,
  is_trash        INTEGER NOT NULL DEFAULT 0,
  reminder_at     TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  deleted_at      TEXT,                   -- NULL = active; non-NULL = tombstone
  PRIMARY KEY (id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_notes_user       ON notes(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_notes_updated    ON notes(user_id, updated_at);

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

-- Decor packs catalog (seeded, not user-editable)
CREATE TABLE IF NOT EXISTS decor_packs (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  price_usd_cents  INTEGER NOT NULL DEFAULT 0,
  is_active        INTEGER NOT NULL DEFAULT 1,
  preview_asset_ids TEXT NOT NULL DEFAULT '[]',
  full_asset_ids   TEXT NOT NULL DEFAULT '[]',
  created_at       TEXT NOT NULL
);

-- Entitlements (user owns pack)
CREATE TABLE IF NOT EXISTS entitlements (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id    TEXT NOT NULL REFERENCES decor_packs(id),
  source     TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'seed_dev'  (no 'purchase' for MVP)
  granted_at TEXT NOT NULL,
  PRIMARY KEY (user_id, pack_id)
);

-- Idempotency keys (10 min window)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         TEXT PRIMARY KEY,           -- "<userId>:<client_key>"
  status_code INTEGER NOT NULL,
  response    TEXT NOT NULL,              -- JSON string
  created_at  TEXT NOT NULL
);
```

---

## 3. API Contract

**Local dev base:** `http://localhost:8787/api`  
**Auth header (desktop):** `Authorization: Bearer <opaque-token>`  
**Auth cookie (web):** `frogi_session=<opaque-token>` httpOnly SameSite=Lax  
**Content-Type:** `application/json`

### 3.1 Auth Routes

#### `POST /api/auth/request-challenge`
```
Body:    { email: string }                  // max 254 chars, valid email regex
200:     { challengeId: string, expiresAt: string }
400:     { error: "invalid_email" }
429:     { error: "rate_limited", retryAfterSeconds: number }  // 3 req/5min/IP
```

#### `GET /api/auth/confirm-challenge?c=<id>&secret=<hex>`
```
200:     HTML page "Xác nhận thành công. Bạn có thể đóng tab này."
         Sets cookie frogi_session=<token> for web clients (HttpOnly, SameSite=Lax, 30d)
400:     { error: "invalid_or_expired" }
400:     { error: "already_confirmed" }
```

#### `GET /api/auth/poll/:challengeId`
```
202:     { status: "pending" }
200:     { status: "confirmed", token: string }   // desktop: store this token
410:     { status: "expired" }
404:     { error: "not_found" }
429:     { error: "rate_limited" }               // < 2s between polls
```

#### `POST /api/auth/logout`
```
Requires: auth (bearer or cookie)
200:     { ok: true }
         Sets cookie frogi_session= (empty, expired) for web
         Sets session.revoked_at = now in D1
401:     { error: "unauthenticated" }
```

#### `GET /api/auth/me`
```
Requires: auth
200:     { id, email, name, plan, createdAt }
401:     { error: "unauthenticated" }
```

### 3.2 Notes Sync

#### `GET /api/notes?since=<ISO8601>`
```
Requires: auth
Query:    since — ISO8601 string; omit or "0" for full sync
200:     {
           notes: Note[],        // active notes (deleted_at IS NULL), updated_at > since
           tombstones: { id: string, deletedAt: string, revision: number }[]
         }
Note type returned:
{
  id, revision, title, content, type, color, icon, mascot, doodle,
  folderId, checklistJson, bulletsJson, chipJson, photoUrl,
  tapeStyle, tapePosition, isPinned, isStarred, isToday,
  hasReminder, isArchived, isTrash, reminderAt, createdAt, updatedAt
}
```

#### `POST /api/notes/batch`
```
Requires: auth
Header:   Idempotency-Key: <client-generated uuid>  (recommended; 10 min dedup)
Body: {
  upsert: [{
    id: string,
    expectedRevision: number,   // 0 = "I believe this is new"
    title, content, type, color, icon, mascot, doodle,
    folderId, checklistJson, bulletsJson, chipJson, photoUrl,
    tapeStyle, tapePosition, isPinned, isStarred, isToday,
    hasReminder, isArchived, isTrash, reminderAt, createdAt, updatedAt
  }],
  delete: [{
    id: string,
    expectedRevision: number    // must match current revision or 409
  }]
}
Limits:   upsert max 100 items; delete max 100 items
          title ≤ 1024 bytes; content ≤ 65536 bytes; photo_url ≤ 2048 bytes
          checklistJson/bulletsJson ≤ 131072 bytes each

200:  {
  ok: true,
  applied: { upserted: string[], deleted: string[] },
  conflicts: [{
    id: string,
    reason: "revision_mismatch" | "tombstoned",
    serverRecord: Note | null,   // null if tombstoned
    serverRevision: number
  }]
}
400:  { error: "validation_error", details: string }
401:  { error: "unauthenticated" }
429:  { error: "rate_limited" }

Semantics:
- user_id ALWAYS from session, never from body (tenant isolation)
- expectedRevision = 0 + row does not exist → INSERT with revision=1
- expectedRevision = 0 + row exists (any state) → 409 conflict
- expectedRevision = N + server revision = N → UPDATE, set revision=N+1
- expectedRevision = N + server revision ≠ N → 409 conflict (returns server record)
- delete: if deleted_at already set → 200 applied (idempotent tombstone)
- delete: if expectedRevision mismatch → 409 conflict
- Tombstone wins: upsert against a tombstoned row → 409 {reason:"tombstoned"}
```

### 3.3 Diary Sync

Same pattern as Notes. Endpoints: `GET /api/diary?since=`, `POST /api/diary/batch`  
DiaryEntry type adds: `date, mood, weather` — removes `type, folderId, chip_json, checklist_json, bullets_json, is_pinned, is_starred, is_today, has_reminder, is_archived, is_trash, reminder_at`

### 3.4 Decor Packs

#### `GET /api/decor/packs`
```
Requires: auth
200:  {
  packs: [{
    id, name, description, priceUsdCents,
    previewAssets: string[],      // always returned
    fullAssets: string[] | null,  // null if not entitled
    owned: boolean
  }]
}
```

#### `POST /api/decor/checkout`
```
Requires: auth
Body:     { packId: string }
503:      { ok: false, error: "Thanh toán chưa khả dụng. Vui lòng thử lại sau." }
NOTE:     Always 503. No purchase logic. No state change. No redirect.
```

### 3.5 Dev-only

#### `POST /api/dev/seed-entitlement`
```
Guard:    ENVIRONMENT must equal "development" exactly (checked in Worker code)
          Missing or wrong → 404 (not even 403, to avoid discoverability)
Header:   X-Dev-Seed: <DEV_SEED_SECRET env var>
Body:     { email: string, packId: string }
200:      { ok: true }
```

---

## 4. Security Constraints

### CORS
```
Allowed origins (hardcoded in Worker, NOT configurable from env):
  - http://localhost:5173  (Vite dev)
  - http://localhost:8787  (wrangler dev self)
  - https://froginotes.pages.dev  (future prod — add when deploying)

Electron desktop: sends requests from app:// or file:// origin.
  Worker responds with Access-Control-Allow-Origin: <matched origin or app://>
  NO wildcard (*) EVER.
  NO Electron webRequest header override.

Preflight (OPTIONS): handled before auth middleware.
```

### No credential logging
```
- Challenge secret: never logged (only SHA-256 hash stored)
- Bearer token: never logged (only hash stored/checked)
- DEV_SEED_SECRET: never logged
- Email address: may appear in dev console.log only when ENVIRONMENT=development
```

### Dev mail sink binding
```
- Resend is called ONLY IF: ENVIRONMENT !== "development" AND RESEND_API_KEY is set
- If ENVIRONMENT = "development": email content logged to console, NO network call
- If ENVIRONMENT = "production" AND RESEND_API_KEY missing: POST /api/auth/request-challenge → 503
- DEV_MAIL_SINK env var NOT used (simplification: dev is gated on ENVIRONMENT string only)
- No production route bypass under any circumstances
```

### Quota / Rate limits
```
- Challenge requests: 3 per 5 minutes per IP (tracked in D1 with TTL cleanup)
- Poll requests: max 1 per 2 seconds per challengeId
- Auth routes (me, logout): 60 per minute per session
- Sync batch: 10 per minute per user
- Input size: enforced in middleware before D1 query
```

---

## 5. Local Dev Setup

```bash
cd workers/froginotes-api
bun install
# Create local D1:
bunx wrangler d1 create froginotes-db --local  # or let wrangler.toml handle it
bunx wrangler dev --local

# Dev env vars (.dev.vars — gitignored):
ENVIRONMENT=development
DEV_SEED_SECRET=local-dev-seed-secret-change-me

# To seed free pack for test user:
curl -X POST http://localhost:8787/api/dev/seed-entitlement \
  -H "Content-Type: application/json" \
  -H "X-Dev-Seed: local-dev-seed-secret-change-me" \
  -d '{"email":"test@example.com","packId":"pack-free-sample"}'
```

---

## 6. Test Coverage Required

```
tests/
  auth.test.ts         — challenge/poll/confirm, token replay, logout revoke, me
  notes-sync.test.ts   — two-user isolation, upsert/delete CAS, tombstone wins, delta sync
  diary-sync.test.ts   — same pattern
  decor.test.ts        — pack list, entitlement gate, checkout 503
  security.test.ts     — unauth rejection, tenant injection, stale resurrection, rate limit
```

All tests run against real wrangler `--local` D1 (`:memory:` or temp file via `--persist-to`).  
**No mocked D1** — integration tests only.

---

## 7. What This Contract Does NOT Cover

- Deploy to Cloudflare (no production resources in this phase)  
- Payment processing (checkout always 503)  
- Email delivery verification (dev uses console.log)  
- Frontend client code (owned by frontend subagent)  
- Rotation of any secrets (no live secrets exist in this phase)
