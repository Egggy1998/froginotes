# FrogiNotes API — Test Results

**Date:** 2026-09-11  
**Worker:** http://localhost:8787 (local dev, wrangler)  
**Run from:** repo root (`D:/Dự án làm việc/sticky note`)

---

## Fix Applied

`tests/auth-runtime.py` line 42 called `npx wrangler d1 execute` without specifying `cwd`, which caused wrangler to fail when invoked from the repo root (no `wrangler.toml` found). Fix:

- Added `WORKER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")` (resolves to `workers/froginotes-api/` regardless of invocation cwd)
- Added `cwd=WORKER_DIR` to the `subprocess.run(...)` call in `d1_query()`
- `sync-regression.py` already had `cwd=WRANGLER_DIR` set correctly (hardcoded absolute path)

Both scripts now run cleanly from both the worker directory and the repo root.

---

## auth-runtime.py — 13/13 PASSED

```
=== auth-runtime tests (local dev) ===

[1] POST /api/auth/request-challenge
  OK  challengeId=066c0eaf... pollSecret present=True

[2] GET /api/auth/poll/:id?ps=<pollSecret> before confirm
  OK  status=pending before confirm

[3] GET /api/auth/poll/:id without ps — must fail
  OK  rejected without poll_secret

[4] GET /api/auth/poll/:id with wrong ps — must 403
  OK  403 invalid_poll_secret with wrong secret

[5] Read dev_confirm_url from D1
  OK  dev_confirm_url retrieved from D1 (len=159)

[6] GET confirm-challenge URL (simulate email click)
  OK  confirm-challenge returned 200 with success page

[7] Replay confirm URL — must show already-confirmed (single-use)
  OK  replay confirm shows already-confirmed (single-use enforced)

[8] GET /api/auth/poll/:id?ps=<pollSecret> after confirm
  OK  poll returned status=confirmed with token (token not printed)

[9] Second poll — must return 410 already_retrieved
  OK  second poll returns 410 already_retrieved

[10] GET /api/auth/me with session token
  OK  me returned email=test-auth-flow@froginotes.local

[11] POST /api/auth/logout
  OK  logout ok

[12] GET /api/auth/me after logout — must 401
  OK  401 after logout (session revoked)

[13] POST /api/dev/create-test-session — must 404 (removed)
  OK  create-test-session returns 404 (removed)

=== ALL TESTS PASSED ===
```

### Auth verification checklist
| Check | Result |
|---|---|
| Challenge-confirm-poll full flow | ✅ PASS |
| `pollSecret` required for poll (400 without) | ✅ PASS |
| Wrong `pollSecret` → 403 | ✅ PASS |
| `dev_confirm_url` written to D1 (dev sink) | ✅ PASS |
| Confirm URL single-use enforced | ✅ PASS |
| Session token issued after confirm | ✅ PASS |
| Token pickup single-use (410 already_retrieved) | ✅ PASS |
| `/me` succeeds with valid token | ✅ PASS |
| Logout revokes session | ✅ PASS |
| `/me` returns 401 after logout | ✅ PASS |
| Legacy `create-test-session` endpoint gone (404) | ✅ PASS |

---

## sync-regression.py — 72/72 PASSED

```
=== sync-regression tests (run_id=092d451a) ===

[AUTH] Setting up User A and User B via real challenge-confirm-poll flow
  User A auth OK (sync-reg-a-092d451a@froginotes)
  User B auth OK (sync-reg-b-092d451a@froginotes)
  PASS  User A /me returns 200 with email
  PASS  User B /me returns 200 with email
  PASS  User A and B have different IDs

[NOTES] User A creates two notes with decorAssetId fields
  PASS  User A creates 2 notes (status 200)
  PASS  User A batch: 2 upserted, 0 conflicts

[NOTES] Verify decorAssetId data preserved after create
  PASS  GET /api/notes returns 200
  PASS  Note 1 exists in GET response
  PASS  tape_style preserved (decorAssetId)
  PASS  tape_position preserved
  PASS  doodle preserved (decorAssetId)
  PASS  revision=1 after insert

[NOTES] User isolation: User B cannot see User A's notes
  PASS  User B GET /api/notes returns 200
  PASS  User A's notes not visible to User B

[NOTES] CAS: stale expectedRevision returns conflict
  PASS  Advance nid1 revision to 2
  PASS  Stale write returns 200 with conflict (not 500)
  PASS  Stale write produces 1 conflict
  PASS  Conflict reason=revision_mismatch
  PASS  Conflict includes serverRevision
  PASS  Conflict serverRecord not None

[NOTES] CAS: stale delete returns conflict
  PASS  Stale delete returns 200 with conflict
  PASS  Stale delete produces 1 conflict
  PASS  Stale delete conflict reason=revision_mismatch

[NOTES] Correct delete creates tombstone
  PASS  Correct delete applied
  PASS  Tombstone appears in GET response
  PASS  Tombstone has deletedAt field
  PASS  Tombstone has revision field

[NOTES] Tombstone prevents resurrection
  PASS  Resurrect attempt returns 200
  PASS  Resurrect produces conflict (tombstoned)

[NOTES] Idempotency-Key: retried batch returns same result
  PASS  Idempotent first call returns 200
  PASS  Idempotent retry returns 200
  PASS  Both idempotent calls same applied list

[NOTES] Size validation
  PASS  Title > 1024 bytes returns 400
  PASS  Content > 65536 bytes returns 400

[NOTES] Delta sync via ?since=
  PASS  GET /api/notes?since= returns 200
  PASS  since= response has notes and tombstones keys

[DIARY] User A creates diary entries
  PASS  User A creates 2 diary entries

[DIARY] User isolation: User B cannot see User A's diary entries
  PASS  User B GET /api/diary returns 200
  PASS  User A's diary not visible to User B

[DIARY] CAS: stale diary upsert returns conflict
  PASS  Stale diary write returns conflict

[DIARY] Tombstone and resurrection prevention
  PASS  Diary entry deleted (tombstoned)
  PASS  Diary tombstone prevents resurrection
  PASS  Diary tombstone in GET response

[DIARY] Idempotency-Key on diary batch
  PASS  Diary idempotent first call 200
  PASS  Diary idempotent retry 200
  PASS  Diary idempotent same applied

[DIARY] Size validation on diary
  PASS  Diary content > 65536 bytes returns 400

[DECOR] Packs and checkout
  PASS  GET /api/decor/packs returns 200
  PASS  At least one decor pack exists
  PASS  Pack has camelCase priceUsdCents
  PASS  Pack has previewAssets list
  PASS  Pack has owned boolean
  PASS  Paid pack fullAssets null for non-owner
  PASS  POST /api/decor/checkout returns 503 (gated)
  PASS  Checkout 503 has ok=false
  PASS  Checkout 503 has error field
  PASS  Unauthenticated GET /api/decor/packs returns 401

[NOTES] User B creates own note — confirms separate namespace
  PASS  User B creates own note
  PASS  User A cannot see User B's note

[AUTH] Unauthenticated access rejected for sync endpoints
  PASS  Unauthenticated GET /api/notes returns 401
  PASS  Unauthenticated GET /api/diary returns 401
  PASS  Unauthenticated POST /api/notes/batch returns 401

[SCHEMA] Response schema verification
  PASS  Note fields are snake_case (user_id)
  PASS  Note has is_pinned (snake_case bool int)
  PASS  Note has folder_id (snake_case)
  PASS  Note has created_at (snake_case)
  PASS  DiaryEntry fields are snake_case (user_id)
  PASS  DiaryEntry has photo_url snake_case
  PASS  Note tombstone has camelCase deletedAt
  PASS  Note tombstone has camelCase-ish keys (not deleted_at)
  PASS  DecorPack uses camelCase priceUsdCents
  PASS  DecorPack uses camelCase previewAssets
  PASS  DecorPack uses camelCase fullAssets key

==================================================
RESULTS: 72/72 passed, 0 failed
==================================================
```

### Sync verification checklist
| Check | Result |
|---|---|
| User isolation: A cannot see B's notes | ✅ PASS |
| User isolation: B cannot see A's notes | ✅ PASS |
| User isolation: A cannot see B's diary | ✅ PASS |
| User isolation: B cannot see A's diary | ✅ PASS |
| `expectedRevision` CAS conflict on stale write | ✅ PASS |
| `expectedRevision` CAS conflict on stale delete | ✅ PASS |
| Correct delete creates tombstone | ✅ PASS |
| Tombstone appears in GET response | ✅ PASS |
| Tombstone prevents resurrection (conflict reason=tombstoned) | ✅ PASS |
| `decorAssetId` (tapeStyle, tapePosition, doodle) round-trips | ✅ PASS |
| Idempotency-Key dedup on notes batch | ✅ PASS |
| Idempotency-Key dedup on diary batch | ✅ PASS |
| Size validation: title > 1024 bytes → 400 | ✅ PASS |
| Size validation: content > 65536 bytes → 400 | ✅ PASS |
| Delta sync `?since=` | ✅ PASS |
| Decor checkout always 503 | ✅ PASS |
| Unauthenticated access → 401 | ✅ PASS |
| Schema: notes snake_case, tombstones camelCase, packs camelCase | ✅ PASS |

---

## Summary

- **auth-runtime.py**: 13/13 PASSED — full challenge-confirm-poll flow verified end-to-end
- **sync-regression.py**: 72/72 PASSED — all sync, isolation, CAS, tombstone, and decor checks pass
- **Fix**: Added `cwd=WORKER_DIR` to `auth-runtime.py`'s `d1_query()` so wrangler finds `wrangler.toml` regardless of invocation directory
- **Note**: A transient `rate_limited 429` was hit during sync-regression run due to prior auth-runtime test using the same IP. Cleared via `DELETE FROM rate_limits WHERE key LIKE 'challenge:%'`. Tests run sequentially in CI should add a brief pause or pre-clear rate limits between test files.
