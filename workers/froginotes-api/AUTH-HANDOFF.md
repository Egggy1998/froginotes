# FrogiNotes Auth API — Frontend Integration Handoff

Generated: 2026-09-11 by audit subagent. Read from: src/routes/auth.ts, tests/auth-runtime.py, delegation log deleg_4efc5019/task-0.log.

---

## Test Execution Results (All 13 PASSED)

Worker: `http://localhost:8787` (Cloudflare Workers via `npx wrangler dev --port 8787`)  
Database: local D1 (`froginotes-db`)  
Test file: `tests/auth-runtime.py`

```
=== auth-runtime tests (local dev) ===

[1]  POST /api/auth/request-challenge       OK  challengeId=bd011e20... pollSecret present=True
[2]  GET  /api/auth/poll/:id?ps=...         OK  status=pending before confirm
[3]  GET  /api/auth/poll/:id (no ps)        OK  rejected without poll_secret (400)
[4]  GET  /api/auth/poll/:id (wrong ps)     OK  403 invalid_poll_secret with wrong secret
[5]  D1 direct read dev_confirm_url         OK  dev_confirm_url retrieved from D1 (len=...)
[6]  GET  confirm-challenge URL             OK  confirm-challenge returned 200 with success page
[7]  Replay confirm URL                     OK  replay confirm shows already-confirmed (single-use enforced)
[8]  GET  /api/auth/poll/:id?ps=... after   OK  poll returned status=confirmed with token
[9]  Second poll                            OK  second poll returns 410 already_retrieved
[10] GET  /api/auth/me (with token)         OK  me returned email=test-auth-flow@froginotes.local
[11] POST /api/auth/logout                  OK  logout ok
[12] GET  /api/auth/me after logout         OK  401 after logout (session revoked)
[13] POST /api/dev/create-test-session      OK  create-test-session returns 404 (removed)

=== ALL TESTS PASSED ===
```

---

## Complete API Contract

Base path: `/api/auth`  
All JSON bodies use `Content-Type: application/json`.

---

### 1. POST /api/auth/request-challenge

Initiates magic-link login. Sends confirmation email (in dev: stores confirm URL in D1 instead).

**Request:**
```json
{ "email": "user@example.com" }
```

**Success 200:**
```json
{
  "challengeId": "<uuid-v4>",
  "pollSecret":  "<64-char hex — hold this, needed for /poll>",
  "expiresAt":   "2026-09-11T09:00:00.000Z"
}
```

**Error responses:**
| Status | Body | Meaning |
|--------|------|---------|
| 400 | `{ "error": "invalid_email" }` | Email failed validation |
| 429 | `{ "error": "rate_limited", "retryAfterSeconds": 300 }` | 3 req / 5 min / IP |
| 503 | `{ "error": "email_unavailable", "message": "..." }` | No RESEND_API_KEY in prod |

**Security note:** `pollSecret` is a 64-char hex (32 random bytes). It is returned **only here, only once**. The server stores only its SHA-256 hash. Never log or expose this value.

---

### 2. GET /api/auth/confirm-challenge?c=\<id\>&secret=\<hex\>

This is the magic-link URL delivered via email. The user clicks it in their email client. Frontend does **not** call this directly — it is opened in a browser tab by the user.

**Success 200:** Returns HTML page:
- First click: `🐸 Xác nhận thành công!` — "Đã đăng nhập vào FrogiNotes. Tab này có thể đóng."
- Sets `Set-Cookie: frogi_session=<token>; HttpOnly; SameSite=Lax; Max-Age=2592000; Path=/` (+ `Secure` flag on non-localhost)
- Replay: Shows "Đã xác nhận rồi!" (already-confirmed, no new token issued)

**Error responses:**
| Status | Body | Meaning |
|--------|------|---------|
| 400 | `{ "error": "invalid_or_expired" }` | Bad ID, wrong secret, or expired (15 min TTL) |

---

### 3. GET /api/auth/poll/\<challengeId\>?ps=\<pollSecret\>

Frontend polls this after calling /request-challenge, until it gets `confirmed` (or times out).  
**Requires the `pollSecret` from step 1** — pass as query param `ps`.

Poll interval recommendation: 2 s (server rate-limits at 1 req/2 s per challengeId+IP).

**Path param:** `challengeId` — the UUID returned from /request-challenge  
**Query param:** `ps` — the full 64-char `pollSecret` from /request-challenge

**Responses:**
| Status | Body | Meaning |
|--------|------|---------|
| 202 | `{ "status": "pending" }` | Not yet confirmed — keep polling |
| 200 | `{ "status": "confirmed", "token": "<64-char bearer token>" }` | Confirmed; token is **one-time pickup** (cleared immediately after) |
| 400 | `{ "error": "poll_secret_required" }` | `ps` missing or < 60 chars |
| 403 | `{ "error": "invalid_poll_secret" }` | Wrong `ps` value |
| 404 | `{ "error": "not_found" }` | Unknown challengeId |
| 410 | `{ "status": "expired" }` | Challenge TTL expired (15 min) |
| 410 | `{ "status": "already_retrieved" }` | Token already picked up (second poll after confirmed) |
| 429 | `{ "error": "rate_limited" }` | > 1 poll/2 s for this challengeId+IP |

**Important:** Store the `token` from the `confirmed` response immediately. It is cleared server-side after first retrieval and cannot be re-fetched.

---

### 4. GET /api/auth/me

Returns the authenticated user's profile.

**Auth:** `Authorization: Bearer <64-char token>` (desktop/API) OR `Cookie: frogi_session=<64-char token>` (web)

**Success 200:**
```json
{
  "id":        "<uuid>",
  "email":     "user@example.com",
  "name":      null,
  "plan":      "free",
  "createdAt": "2026-09-11T08:00:00.000Z"
}
```

**Error 401:**
```json
{ "error": "unauthenticated" }
```

**Confirmed exists:** Yes — `/api/auth/me` is implemented and tested (test [10] passed).

---

### 5. POST /api/auth/logout

Revokes the current session.

**Auth:** `Authorization: Bearer <token>` OR cookie (same as /me)

**Success 200:**
```json
{ "ok": true }
```
Also sets `Set-Cookie: frogi_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/` to clear web cookie.

**Error 401:**
```json
{ "error": "unauthenticated" }
```

---

## Auth Token Format

- **Length:** exactly 64 hex chars (32 random bytes)
- **Storage:** server stores SHA-256 hash only; raw token is never persisted beyond the one-time poll pickup window
- **Transport (desktop/API):** `Authorization: Bearer <token>` header
- **Transport (web):** `frogi_session` cookie (HttpOnly, SameSite=Lax, 30-day Max-Age)
- **Validation (both paths):** `getAuthContext()` in auth.ts tries Bearer header first, then cookie

---

## Security Changes Made (by prior subagent)

1. **`/poll` now requires `pollSecret`** — previously anyone knowing `challengeId` (publicly returned) could pick up the bearer token after email confirmation. Fixed by generating a separate `pollSecret` at challenge creation, returning it only to the initiating client, storing only its hash.
2. **`/api/dev/create-test-session` removed** — this endpoint issued real sessions without email flow. Confirmed 404 in test [13].
3. **Schema change:** `challenges` table gained `poll_secret_hash TEXT NOT NULL DEFAULT ''` column. Applied via `schema_patch_v3.sql` migration (already run on local D1).

---

## Dev-Only Behaviour

When `ENVIRONMENT=development` (`wrangler.toml` default):
- Email is NOT required (`RESEND_API_KEY` check skipped)
- `dev_confirm_url` is stored in the `challenges` D1 table row — test harness reads it directly via `wrangler d1 execute --local`
- `dev_confirm_url` is cleared on first poll pickup (same as `poll_token`)

---

## Remaining Blockers for Production

| Blocker | Detail |
|---------|--------|
| **RESEND_API_KEY not set** | Required in production. Without it, /request-challenge returns 503. Set via `wrangler secret put RESEND_API_KEY`. |
| **Email template** | Currently sends minimal inline HTML with a raw confirm link. No branded template. |
| **`users.name` always null** | `upsertUser` does not collect a name. /me always returns `name: null`. |
| **No token refresh / sliding expiry** | Sessions have a fixed TTL (set at creation in `createSession`). No refresh endpoint exists. |
| **`/api/dev/*` routes still present in production** | `devRouter` guards itself with `ENVIRONMENT===development` check, but the routes are mounted unconditionally. Should be excluded from prod bundle or double-checked. |
| **Rate limit table growth** | `rate_limits` table is not purged. Needs a cron or TTL cleanup. |
| **Poll secret TTL is challenge TTL (15 min)** | If user doesn't confirm within 15 min, challenge expires and frontend gets 410. Recommend clear UX for retry. |

---

## Frontend Integration Checklist

- [ ] Call `POST /api/auth/request-challenge` with email → store `challengeId` + `pollSecret` in memory (not localStorage for security)
- [ ] Start polling `GET /api/auth/poll/<challengeId>?ps=<pollSecret>` every 2 s
- [ ] On `{ "status": "confirmed", "token": "..." }` → store token securely, stop polling
- [ ] Show "check your email" UI during polling; handle 410/expired with retry flow
- [ ] Send `Authorization: Bearer <token>` on all authenticated API calls
- [ ] Call `POST /api/auth/logout` on sign-out
- [ ] Verify `/api/auth/me` after token pickup to confirm session is valid
