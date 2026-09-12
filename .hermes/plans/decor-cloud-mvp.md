# FrogiNotes — Decor Packs + Cloud MVP Contract
**Version:** 0.1 — Discovery Only (no code written)
**Date:** 2026-09-11
**Status:** Ready to dispatch parallel backend + frontend subagents

---

## 0. Trạng thái repo hiện tại (discovery)

| Hạng mục | Trạng thái |
|---|---|
| Build | `bun run build` + `tsc` xanh; NSIS installer hoạt động |
| Cloud DB | **Stub hoàn toàn** — `db.ts` trả về `false`/`[]`, không có live client |
| Auth | **Fake client-side only** — `login()` trong store tạo profile localStorage, không có backend |
| Token cũ | Turso token bị xóa khỏi bundle, **chưa rotate** trên Turso dashboard — CẦN rotate trước khi public |
| localStorage keys | `froginotes_data_v7_empty`, `froginotes_diary_v2_empty`, `froginotes_user_v1` |
| Mascots | 14 frog PNG trong `public/mascots/` — miễn phí, không paywall |
| Tape/Decor | `TapeStyle` (5 types), `TapePosition` (3), `NoteColor` (9), `doodle` (7) — đã trong type |
| Plan field | `UserProfile.plan: 'free' \| 'pro'` đã có trong types |
| Payment | **KHÔNG có credentials** — checkout phải fail-closed hoàn toàn |
| Dep `@libsql/client` | Vẫn còn trong `package.json` nhưng không dùng — giữ nguyên, chỉ xóa khi safe |

---

## 1. Quyết định backend — D1 all-in-one (DEPARTURE từ Turso)

**⚠️ Thay đổi so với intent cũ:** Turso bị loại bỏ vĩnh viễn cho MVP này.

**Lý do:**
- Turso đã gây security incident (shared tables, client-side token)
- Token Turso cũ chưa rotate → không thể dùng instance cũ, tạo mới cần credential setup
- **Cloudflare Workers + D1** = zero client-side credentials, worker-side only access
- D1 bindings chỉ available trong Worker context → không thể bị expose vào bundle React
- Free tier: 5M reads/day, 100K writes/day — đủ cho MVP
- Single deploy artifact: `wrangler deploy` không cần manage DB separately
- Hỗ trợ HTTP/REST API từ Worker → client dùng `fetch()` + JWT cookie

**Alternative đã cân nhắc:** Turso server-side proxy — vẫn cần rotate token + manage 2 services → phức tạp hơn không có thêm lợi ích.

---

## 2. Architecture tổng quan

```
┌─────────────────────┐     HTTPS + httpOnly cookie
│  React App (Vite)   │ ←──────────────────────────────────────────┐
│  Electron wrapper   │                                             │
└─────────────────────┘                                             │
         │ fetch('/api/...')                                        │
         ▼                                                          │
┌─────────────────────────────────────────────────────┐            │
│        Cloudflare Worker (froginotes-api)            │            │
│  - Magic link auth (Resend free tier)               │            │
│  - JWT sign/verify (jose, no 3rd party KV)          │            │
│  - D1 binding (server-side only, never exposed)     │ ───────────┘
│  - Entitlement check for Decor Packs                │
│  - Notes + Diary sync proxy                         │
└─────────────────────────────────────────────────────┘
         │ D1 SQL binding
         ▼
┌─────────────────────────────────────────────────────┐
│               Cloudflare D1 (froginotes-db)          │
│  Tables: users, sessions, notes, diary_entries,     │
│          entitlements, tombstones, decor_packs       │
└─────────────────────────────────────────────────────┘
```

**Client không bao giờ có:**
- D1 credentials
- JWT signing secret
- DB URL/token

---

## 3. D1 Schema

```sql
-- users: mỗi user 1 row, email là primary identifier
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- uuid v4
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- sessions: magic link tokens + refresh tokens
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,           -- uuid
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,      -- SHA-256 of magic token (never stored plain)
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- notes: per-user, full isolation by user_id
CREATE TABLE notes (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  color TEXT NOT NULL DEFAULT 'yellow',
  icon TEXT,
  mascot TEXT,
  doodle TEXT,
  folder_id TEXT NOT NULL DEFAULT 'personal',
  checklist_json TEXT,
  bullets_json TEXT,
  chip_json TEXT,
  photo_url TEXT,
  tape_style TEXT,
  tape_position TEXT,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_starred INTEGER NOT NULL DEFAULT 0,
  is_today INTEGER NOT NULL DEFAULT 0,
  has_reminder INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  is_trash INTEGER NOT NULL DEFAULT 0,
  reminder_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,               -- tombstone: NULL = active
  PRIMARY KEY (id, user_id)
);
CREATE INDEX idx_notes_user ON notes(user_id, deleted_at);

-- diary_entries: per-user
CREATE TABLE diary_entries (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'happy',
  weather TEXT,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  tape_style TEXT,
  tape_position TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  PRIMARY KEY (id, user_id)
);
CREATE INDEX idx_diary_user ON diary_entries(user_id, deleted_at);

-- decor_packs: catalog (seeded, không edit qua app)
CREATE TABLE decor_packs (
  id TEXT PRIMARY KEY,           -- 'pack-sakura', 'pack-winter', etc.
  name TEXT NOT NULL,
  description TEXT,
  price_usd_cents INTEGER NOT NULL DEFAULT 0, -- 0 = free
  is_active INTEGER NOT NULL DEFAULT 1,
  preview_asset_ids TEXT NOT NULL DEFAULT '[]', -- JSON array, shown to all
  full_asset_ids TEXT NOT NULL DEFAULT '[]',    -- JSON array, gated
  created_at TEXT NOT NULL
);

-- entitlements: user → pack ownership
CREATE TABLE entitlements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL REFERENCES decor_packs(id),
  source TEXT NOT NULL DEFAULT 'free', -- 'free' | 'purchase' | 'seed_dev'
  granted_at TEXT NOT NULL,
  PRIMARY KEY (user_id, pack_id)
);
```

---

## 4. API Schema — Cloudflare Worker endpoints

Base URL: `https://froginotes-api.<subdomain>.workers.dev/api`
Dev local: `http://localhost:8787/api` (wrangler dev)

### 4.1 Auth

```
POST /api/auth/magic-link
  Body: { email: string }
  Response: { ok: true, message: "Email gửi thành công" }
  Fail: 429 nếu > 3 request/phút/IP, 400 nếu email invalid
  NOTE: Gửi link qua Resend (free tier, cần RESEND_API_KEY secret trong Worker)

GET /api/auth/verify?token=<token>
  Response: redirect to app + Set-Cookie: frogi_session=<JWT>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
  Cookie: JWT signed bằng JWT_SECRET (Worker env secret), contains { sub: userId, email, plan }
  Fail: 400 token invalid/expired/used

POST /api/auth/logout
  Response: Set-Cookie (empty, expired) + { ok: true }

GET /api/auth/me
  Requires: frogi_session cookie
  Response: { id, email, name, plan, createdAt }
  Fail: 401 nếu no session/expired
```

### 4.2 Notes Sync

```
GET /api/notes?since=<ISO8601>
  Requires: auth cookie
  Response: { notes: Note[], tombstones: { id: string, deletedAt: string }[] }
  since=0 hoặc omit → full sync

POST /api/notes/batch
  Requires: auth cookie
  Body: { upsert: Note[], delete: string[] }
  Response: { ok: true, conflicts: { id, serverUpdatedAt }[] }
  Conflict strategy: last-write-wins dựa trên updatedAt; server wins nếu server.updatedAt > client.updatedAt
  NOTE: delete tạo tombstone (deleted_at), không xóa vật lý ngay
```

### 4.3 Diary Sync

```
GET /api/diary?since=<ISO8601>
POST /api/diary/batch
  (cùng pattern notes)
```

### 4.4 Decor Packs

```
GET /api/decor/packs
  Requires: auth cookie
  Response: {
    packs: [{
      id, name, description, priceUsdCents,
      previewAssets: string[],     -- luôn trả, không gated
      fullAssets: string[] | null, -- null nếu user chưa có entitlement
      owned: boolean
    }]
  }

POST /api/decor/checkout
  Requires: auth cookie
  Body: { packId: string }
  Response: 503 { ok: false, error: "Thanh toán chưa khả dụng. Vui lòng thử lại sau." }
  NOTE: Luôn fail-closed. Không fake purchase. Không redirect.
  Khi payment provider ready → subagent thay thế body này.
```

### 4.5 Dev-only Seed (local wrangler dev ONLY)

```
POST /api/dev/seed-entitlement
  Header: X-Dev-Seed: <DEV_SEED_SECRET env var>
  Body: { email: string, packId: string }
  Response: { ok: true }
  Guard: Worker từ chối nếu env.ENVIRONMENT !== 'development'
  KHÔNG deploy endpoint này lên production
```

---

## 5. Auth/Session Strategy

| Quyết định | Chi tiết |
|---|---|
| Mechanism | Magic link email → JWT httpOnly cookie |
| JWT secret | Worker env secret `JWT_SECRET` (không commit, set qua `wrangler secret put`) |
| Token lifetime | 7 ngày; magic link token expires sau 15 phút hoặc 1 lần dùng |
| Storage | Cookie httpOnly — không accessible từ JS, không localStorage |
| CORS | Worker chỉ accept origin `froginotes.pages.dev` + `localhost:5173` + `localhost:8787` |
| Electron | Electron dùng `session.defaultSession.webRequest` để forward cookie; hoặc `fetchOptions: { credentials: 'include' }` + `partition: 'persist:froginotes'` |
| Logout | Xóa cookie + vô hiệu session trong D1 |
| Offline | App vẫn hoạt động hoàn toàn offline; cloud sync là optional add-on |

**Electron cookie handling:** Electron BrowserWindow với `partition: 'persist:froginotes'` giữ cookie qua restart. Worker API gọi qua `fetch` trong renderer process với `credentials: 'include'`. Preload không expose credential trực tiếp.

---

## 6. Decor Packs — Phạm vi MVP

### 6.1 Pack catalog (seed data)

| Pack ID | Tên | Giá | Assets |
|---|---|---|---|
| `pack-free-sample` | Washi Sakura Sample | Free | 1 tape color variant (sakura-pink) |
| `pack-pastel-dream` | Pastel Dream | Paid (TBD) | 3 tape colors + 2 tape patterns |
| `pack-forest-cozy` | Forest Cozy | Paid (TBD) | 3 tape colors + forest doodles |

**MVP: chỉ implement `pack-free-sample`** — tự động owned bởi mọi user đăng nhập.
Paid packs: hiển thị UI preview + "Sắp ra mắt" banner — không enable checkout.

### 6.2 Asset representation

Decor assets trong MVP là CSS/SVG variations của `TapeStyle` hiện có, không cần file PNG mới:
- `sakura-pink`: tape màu `#F9B8CC` (biến thể pink hiện có)
- Extend `TapeStyle` type thêm `'sakura'` trong Phase 1

**Không tạo new frog PNG assets** — 14 mascots hiện tại giữ nguyên miễn phí.

### 6.3 Entitlement flow client-side

```
App start (logged in)
  → GET /api/decor/packs
  → Store ownedPackIds: string[] trong Zustand (không persist localStorage)
  → NoteModal / DiaryView check: canUseAsset(assetId) → ownedPackIds.includes(packId của asset)
  → Nếu không owned: preview shimmer UI + lock icon
  → Nếu checkout click: hiện modal "Thanh toán chưa khả dụng"
```

---

## 7. Data Migration Strategy

### Offline → Cloud (khi user lần đầu đăng nhập)

```
1. User đăng nhập lần đầu
2. Client detect: localStorage có data, cloud trống (GET /api/notes?since=0 returns [])
3. Prompt user: "Bạn có muốn đồng bộ dữ liệu local lên đám mây không?"
4. Nếu yes: POST /api/notes/batch { upsert: localNotes, delete: [] }
5. Đánh dấu sync done trong localStorage: froginotes_cloud_migrated_v1 = true
6. Tiếp tục sync bình thường
```

### Logout safety

```
- Logout KHÔNG xóa localStorage
- Data local vẫn accessible offline
- Sau logout, cloud sync tắt; local data intact
```

### Conflict tiebreak

```
- updatedAt so sánh ISO string lexicographic (ISO8601 sortable)
- Server wins nếu server.updatedAt >= client.updatedAt
- Client wins nếu client.updatedAt > server.updatedAt
- Deleted items: tombstone wins (nếu deleted_at tồn tại → không restore)
```

---

## 8. File/Ownership Boundaries

```
workers/                         ← NEW (Cloudflare Worker project)
  froginotes-api/
    src/
      index.ts                   ← Router (Hono hoặc itty-router)
      routes/
        auth.ts                  ← Magic link + JWT
        notes.ts                 ← Notes sync
        diary.ts                 ← Diary sync
        decor.ts                 ← Pack catalog + entitlement
        dev.ts                   ← Seed-only (guarded)
      lib/
        jwt.ts                   ← Sign/verify JWT (jose)
        db.ts                    ← D1 query helpers (typed)
        email.ts                 ← Resend integration
      schema.sql                 ← D1 migrations
    wrangler.toml
    package.json
    tsconfig.json

src/                             ← EXISTING (không phá vỡ)
  lib/
    api-client.ts                ← NEW: typed fetch wrapper → /api/*
    decor.ts                     ← NEW: decor asset registry + pack metadata
  stores/
    useNotesStore.ts             ← Thêm cloud sync actions (không xóa local path)
    useDecorStore.ts             ← NEW: ownedPackIds, syncDecor()
    useAuthStore.ts              ← NEW: separate từ useNotesStore (tách concern)
  components/
    decor/
      DecorPackModal.tsx         ← NEW: pack browser + preview
      DecorLockOverlay.tsx       ← NEW: lock shimmer cho gated assets
    cloud/
      CloudAuthModal.tsx         ← REPLACE AuthModal (giữ file cũ stub)
      CloudSyncStatus.tsx        ← NEW: indicator trong TopBar
  types/
    index.ts                     ← Thêm DecorPack, Entitlement types; extend TapeStyle
```

---

## 9. Acceptance Tests (integration, chạy local wrangler dev)

Các tests này PHẢI pass trước khi merge bất kỳ phase nào:

```
tests/integration/
  auth.test.ts
    ✓ Magic link gửi email (mock Resend)
    ✓ Token verify → set cookie
    ✓ Token dùng 2 lần → 401
    ✓ Expired token → 401
    ✓ /api/auth/me với cookie hợp lệ → user profile
    ✓ /api/auth/me không có cookie → 401

  notes-sync.test.ts
    ✓ User A không thể đọc notes của User B
    ✓ Upsert note → GET trả về note đó
    ✓ Delete note → tombstone tồn tại, note không trả về trong GET
    ✓ Conflict: server wins khi server.updatedAt >= client
    ✓ Full sync (since=0) trả đủ data
    ✓ Delta sync (since=T) chỉ trả items sau T

  decor.test.ts
    ✓ GET /api/decor/packs trả previewAssets cho mọi user
    ✓ fullAssets = null nếu không owned
    ✓ fullAssets = [...] nếu owned (sau seed-entitlement)
    ✓ POST /api/decor/checkout → 503 fail-closed

  security.test.ts
    ✓ D1 binding không accessible từ response headers
    ✓ JWT_SECRET không leak trong response body
    ✓ /api/dev/seed-entitlement reject nếu ENVIRONMENT !== 'development'
    ✓ CORS reject origin ngoài whitelist
```

**Unit tests client-side** (bun test / vitest):
```
src/tests/
  decor-store.test.ts
    ✓ canUseAsset() false khi không owned
    ✓ canUseAsset() true khi owned
    ✓ checkout click không thực hiện purchase, hiện modal unavailable
  auth-store.test.ts
    ✓ logout giữ localStorage intact
    ✓ cloud sync tắt sau logout
```

---

## 10. Phased Work

### Phase 0 — Pre-conditions (KHÔNG implement, chỉ verify)
- [ ] Rotate Turso token cũ (nếu instance còn tồn tại) — **blocker bảo mật**
- [ ] Confirm Resend API key available (hoặc chọn email alt)
- [ ] Confirm Cloudflare account có D1 access (free tier đủ)
- [ ] Không commit secrets vào repo

### Phase 1 — Backend Worker (backend subagent)
**Scope:** Worker + D1 schema + auth routes + notes/diary sync
**Output:** `wrangler dev` chạy local, integration tests xanh
**Files:** `workers/froginotes-api/**`
**NOT included:** Decor packs, payment, deploy to production

### Phase 2 — Frontend Cloud Integration (frontend subagent, parallel với Phase 1 nếu mock server available)
**Scope:** `useAuthStore`, `api-client.ts`, CloudAuthModal, CloudSyncStatus, notes sync hooks
**Output:** Login flow + sync hoạt động với local Worker
**Files:** `src/lib/api-client.ts`, `src/stores/useAuthStore.ts`, `src/components/cloud/**`
**NOT included:** Decor UI, checkout

### Phase 3 — Decor Packs (sau Phase 1+2 verified)
**Scope:** Decor Worker routes + `useDecorStore` + DecorPackModal + lock overlay
**Output:** Free sample pack unlocked tự động khi login; paid packs locked với "Sắp ra mắt"
**Files:** `workers/.../routes/decor.ts`, `src/stores/useDecorStore.ts`, `src/components/decor/**`
**NOT included:** Real payment processing

### Phase 4 — Local Integration Tests (sau Phase 1-3)
**Scope:** Viết và pass tất cả integration tests trong Section 9
**Output:** CI script `bun run test:integration` xanh với wrangler dev running

---

## 11. Blockers cụ thể

| Blocker | Mô tả | Cần từ |
|---|---|---|
| **Turso token chưa rotate** | Token cũ vẫn valid trên Turso dashboard → risk nếu ai có access GitHub history. Không phải blocker để build Worker mới, nhưng phải rotate trước khi public repo. | User action |
| **Resend API key** | Cần để gửi magic link. Không thể fake trong prod. Local test có thể mock với console.log. Worker cần `RESEND_API_KEY` secret. | User action |
| **Cloudflare account** | Cần account để `wrangler deploy` (Phase deploy, không phải Phase 1). `wrangler dev` chạy local không cần auth. | User action (chỉ cần khi deploy) |
| **Payment provider** | Không có Stripe/Paddle credentials → checkout route **luôn 503**. Không unlock cho đến khi confirmed. | User action |
| **Electron cookie CORS** | Electron renderer dùng custom protocol — cần test `credentials: 'include'` với `localhost:8787`. Có thể cần `ses.webRequest.onHeadersReceived` để allow. | Phase 2 risk |
| **`@libsql/client` dep** | Vẫn trong package.json, bundle tree-shaking loại bỏ nhưng cần verify sau khi thêm api-client mới | Phase 2 check |

---

## 12. Constraints không được vi phạm

```
✗ KHÔNG hardcode bất kỳ secret nào trong source code
✗ KHÔNG dùng VITE_* env vars cho credentials (bundled vào JS)
✗ KHÔNG fake purchase (checkout luôn 503 cho đến khi payment configured)
✗ KHÔNG paywall 14 mascot hiện tại hoặc bất kỳ feature note/diary hiện có
✗ KHÔNG require login để dùng app (cloud = optional, offline = default)
✗ KHÔNG xóa hoặc reset localStorage khi logout
✗ KHÔNG deploy lên production hoặc tốn chi phí trong phase plan này
✗ KHÔNG đọc live DB hoặc rotate token trong plan phase
✗ KHÔNG generate frog assets mới (14 PNG hiện tại là đủ cho MVP)
```

---

## 13. Dispatch template cho subagents

### Backend subagent prompt key points:
> Implement `workers/froginotes-api/` — Cloudflare Worker với Hono router, D1 bindings, magic link auth qua Resend (mock email với console.log nếu no key), JWT httpOnly cookie. Implement routes: `/api/auth/*`, `/api/notes/*`, `/api/diary/*`, `/api/decor/packs` (fail-closed checkout). Schema trong section 3. Integration tests trong section 9. Chạy với `wrangler dev --local`. KHÔNG deploy. KHÔNG đọc live secrets. Tham chiếu plan: `.hermes/plans/decor-cloud-mvp.md`.

### Frontend subagent prompt key points:
> Implement `src/lib/api-client.ts` (typed fetch wrapper), `src/stores/useAuthStore.ts` (tách từ useNotesStore), `src/components/cloud/CloudAuthModal.tsx` (replace stub AuthModal), cloud sync hooks trong useNotesStore. Target: `http://localhost:8787/api`. KHÔNG modify existing note/diary local CRUD paths. KHÔNG enable checkout. KHÔNG paywall existing features. Build phải pass `bun run build && tsc`. Tham chiếu plan: `.hermes/plans/decor-cloud-mvp.md`.

### Decor subagent prompt key points (Phase 3):
> Implement `src/stores/useDecorStore.ts`, `src/components/decor/DecorPackModal.tsx`, `src/components/decor/DecorLockOverlay.tsx`. Extend TapeStyle type thêm `'sakura'`. GET /api/decor/packs → populate store. Free sample auto-owned khi logged in. Paid packs: preview + lock overlay + "Sắp ra mắt" (không phải checkout). Tham chiếu plan: `.hermes/plans/decor-cloud-mvp.md`.
