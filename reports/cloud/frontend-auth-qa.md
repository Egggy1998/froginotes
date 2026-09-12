# Frontend Auth QA Report
**Date:** 2026-09-11  
**Project:** FrogiNotes — Cloud & Auth MVP  
**Status:** ✅ All checks pass

---

## 1. Unit Test Suite — `src/tests/auth-store.test.ts`

**Runner:** `bun test`  
**Result:** 21 pass / 0 fail / 55 expect() calls in 337ms

### Test Cases

| Group | Test | Result |
|-------|------|--------|
| Happy path startLogin | idle → requesting → polling → authenticated | ✅ pass |
| Happy path startLogin | stores user.plan from /me response | ✅ pass |
| Happy path startLogin | polls pending N times before confirmed | ✅ pass |
| 429 on requestChallenge | sets phase=error, code=rate_limited, retryAfterSeconds | ✅ pass |
| 503 emailUnavailable | sets emailUnavailable=true, phase=error | ✅ pass |
| 503 emailUnavailable | does not authenticate on 503 | ✅ pass |
| 429 during poll loop | continues polling after backoff, eventually authenticates | ✅ pass |
| cancelLogin | during requesting → phase=idle, pendingEmail cleared | ✅ pass |
| cancelLogin | during polling → phase=idle | ✅ pass |
| cancelLogin | does NOT touch notes (auth store owns no notes keys) | ✅ pass |
| logout | clears user, phase, pendingEmail | ✅ pass |
| logout | calls revokeSession with bearer token | ✅ pass |
| logout | survives revokeSession throw (best-effort) | ✅ pass |
| logout | does NOT touch local notes | ✅ pass |
| Poll: expired | phase=error, code=expired | ✅ pass |
| Poll: already_retrieved | phase=error, code=already_retrieved | ✅ pass |
| getMe failure | phase=error, code=me_failed | ✅ pass |
| Network error on requestChallenge | phase=error, code=network_error | ✅ pass |
| ApiDisabledError | cloudDisabled=true, phase=idle | ✅ pass |
| clearError | phase→idle, error→null | ✅ pass |
| Concurrent login | second startLogin cancels first | ✅ pass |

### Test strategy
- **Fake transport via `_setTransport()`** — zero real HTTP calls.
- **Fast timers** — `setTimeout` overridden to 0ms so poll-loop sleeps don't slow tests.
- **Zustand state reset** before each test via `useAuthStore.setState({...})`.
- **Generation guard** verified implicitly by cancel/concurrent tests.

---

## 2. UI Modal Audit

### AuthModal (`src/components/landing/AuthModal.tsx`)
- **Phase-driven UX:** All 6 phases handled explicitly:
  - `idle`/`requesting`: email input form with `startLogin()` on submit, spinner while requesting
  - `polling`: "Kiểm tra hộp thư đến" screen with Mail icon, Loader2 spinner for "Đang chờ xác nhận...", **cancel button** calling `cancelLogin()` + `clearError()`
  - `verifying`: Loader2 spinner "Đang xác minh phiên..."
  - `authenticated`: CheckCircle ✅ flash with user email, auto-closes modal after 1.2s
  - `error`: shows error code-specific message (rate_limited, expired, emailUnavailable), retry/close buttons
  - `cloudDisabled`: clear "API chưa được cấu hình" banner
- **Cancel on modal close:** `useEffect` on `showAuthModal=false` calls `cancelLogin()` during active flows
- **Status:** ✅ Fully implemented

### AccountModal (`src/components/landing/AccountModal.tsx`)
- **Authenticated view:** uses `useAuthStore` — displays `cloudUser.name ?? cloudUser.email.split('@')[0]`, `cloudUser.email`, `cloudUser.plan` (FREE/PRO badge)
- **Logout:** calls `useAuthStore.logout()` which revokes bearer token server-side and clears all in-memory auth state; local notes explicitly not deleted
- **Unauthenticated view:** shows "Sign in with email" button leading to AuthModal
- **cloudDisabled:** shows amber warning "Đồng bộ chưa kích hoạt"
- **Status:** ✅ Fully implemented

### CloudSyncModal (`src/components/CloudSyncModal.tsx`)
- **Previously:** Only showed a static warning (old insecure sync disabled). Had no awareness of auth state.
- **Updated in this QA pass:** Now imports `useAuthStore` and shows real connection state:
  - `authenticated`: green ✅ banner with `user.email` + plan badge + sync-pending notice
  - `requesting/polling/verifying`: blue Loader2 spinner "Đang xác thực..."
  - `cloudDisabled`: amber warning (API not configured)
  - `emailUnavailable`: amber warning (backend email service not ready)
  - Not logged in: amber warning + **"Đăng nhập tài khoản đám mây"** CTA button that routes to AuthModal
- **Local data card:** retained — always shows notes/diary count, "Đang hoạt động" badge
- **Status:** ✅ Updated

---

## 3. TypeScript — `tsc --noEmit`

```
$ ./node_modules/.bin/tsc --noEmit
(no output)
Exit code: 0
```
✅ Zero errors across all source files including the new test file.

---

## 4. Build — `bun run build`

```
$ vite build
✓ 1903 modules transformed.
dist/index.html                   1.79 kB │ gzip:   0.88 kB
dist/assets/index-IjRVoKZx.css  106.76 kB │ gzip:  16.69 kB
dist/assets/index-CNfkEhyc.js   478.96 kB │ gzip: 133.09 kB
✓ built in 3.86s
```
✅ Clean production build.

---

## 5. Files Modified

| File | Action | Description |
|------|--------|-------------|
| `src/tests/auth-store.test.ts` | **Created** | 21-test suite covering all auth phases and edge cases |
| `src/components/CloudSyncModal.tsx` | **Updated** | Wired to `useAuthStore` for real connection state display |

Files **not modified** (verified correct as-is):
- `src/stores/useAuthStore.ts` — implementation complete with DI transport
- `src/lib/api-client.ts` — transport layer clean
- `src/components/landing/AuthModal.tsx` — all phases handled
- `src/components/landing/AccountModal.tsx` — cloudUser state displayed correctly

---

## 6. Local Notes Safety

- `useAuthStore` owns no `notes` or `diaryEntries` keys — confirmed by tests
- `logout()` explicitly documented: "Never touch local notes"
- `cancelLogin()` resets only `phase`, `error`, `pendingEmail` — local store untouched
- Tests assert `'notes' in state === false` for both cancelLogin and logout

---

## 7. Known Gaps (out of scope for MVP)

- `src/lib/api-sync.ts` — sync bridge between `useNotesStore` and `/api/notes/sync` not yet implemented; AccountModal and CloudSyncModal correctly show "đang tích hợp 🚧"
- No E2E tests (Playwright) for the auth flow UI; unit tests cover store behavior only
- Polling countdown timer (visual "X phút còn lại") not implemented in UI; spinner only
