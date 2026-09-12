# Cloud Paywall Frontend QA Report

**Date:** 2026-09-11  
**Task:** Frontend Cloud Paywall & Payment UI implementation  
**Status:** ✅ PASSED — All checks green

---

## Summary

Implemented the full Cloud Paywall & Payment UI for FrogiNotes. All components follow the existing design system (green palette, rounded cards, frog mascots) and are TypeScript-clean. Local notes are never touched.

---

## Files Created / Modified

| File | Action |
|------|--------|
| `src/lib/api-payment.ts` | Created — Payment API client layer |
| `src/components/payment/PaymentModal.tsx` | Created — VietQR payment modal with auto-poll |
| `src/components/CloudSyncModal.tsx` | Modified — Full paywall & plan-gated sync UI |
| `src/components/landing/AccountModal.tsx` | Modified — Pro badge + upgrade CTA |
| `src/tests/cloud-paywall.test.ts` | Created — 21 unit tests |

---

## 1. API Client Layer (`src/lib/api-payment.ts`)

- `createPaymentOrder(plan, period)` → `POST /api/payment/create-order`
  - Attaches bearer token from `getBearerToken()` automatically
  - Returns `CreateOrderResponse` (orderId, qrCode, bankName, accountNumber, accountName, amount, transferContent, expiresAt)
- `checkOrderStatus(orderId)` → `GET /api/payment/order/:orderId`
  - Returns `OrderStatusResponse` with `status: 'pending' | 'completed' | 'expired' | 'cancelled'`
- Reuses `ApiError` / `ApiDisabledError` from `api-client.ts` for consistent error handling
- HTTPS enforcement inherited from `API_BASE` in `api-client.ts`

---

## 2. CloudSyncModal Paywall (`src/components/CloudSyncModal.tsx`)

### State machine:

| Auth State | Plan | Renders |
|-----------|------|---------|
| Not logged in | — | "Đăng nhập để xem gói Cloud Sync" + login button |
| Connecting (polling/verifying) | — | Spinner + "Đang xác thực..." |
| Authenticated | `free` | PRO upgrade card + **locked** sync controls |
| Authenticated | `pro` | Green active status + **unlocked** toggle/sync |

### Free plan paywall card:
- Header: **"Mở khóa Cloud Sync Đa Nền Tảng ☁️🍃"**
- Frog mascot in `crown` mood
- Perks: ⚡ Đồng bộ thời gian thực, 📔 Sao lưu nhật ký & ảnh an toàn, 🔄 Khôi phục mọi lúc, 💬 Hỗ trợ ưu tiên
- Price: **299.000đ / năm** (hoặc gói dùng thử)
- CTA: **"Nâng cấp gói Pro ngay 👑"** → opens `PaymentModal`
- Sync toggle and "Đồng bộ ngay" are visually locked with `<Lock>` icon + 60% opacity

### Pro plan active panel:
- Green `CheckCircle2` banner: "Cloud Sync đang hoạt động ✅" + PRO ⭐ badge
- Toggle sync auto with animated `ToggleRight`/`ToggleLeft`
- "Đồng bộ ngay" button with `RefreshCw` icon + loading spinner while syncing
- Last sync timestamp display (when available)

---

## 3. PaymentModal (`src/components/payment/PaymentModal.tsx`)

- Shows VietQR code (rendered as `<img>` if URL/base64 provided)
- Bank details table: ngân hàng, số tài khoản, chủ tài khoản, số tiền, nội dung chuyển khoản
- **1-click copy** buttons (`CopyButton`) for: account number, amount, transfer content
  - Shows `CheckCircle2` (green) for 2 seconds after copy
- **Auto-polls** `checkOrderStatus()` every **3 seconds** via `setInterval`
- On `status === 'completed'`:
  - Fires `canvas-confetti` burst (3 waves, 300ms apart)
  - Updates `useAuthStore.user.plan → 'pro'` via `setState`
  - Auto-closes after 3.5 seconds
- Handles `expired` / `cancelled` with retry button
- Handles API errors with retry button
- Loading state while creating order

---

## 4. AccountModal (`src/components/landing/AccountModal.tsx`)

- **Pro users**: Golden gradient badge `👑 PRO` in header + "Cloud Pro đang hoạt động ⭐" notice
- **Free users**: `FREE` badge in header + upgrade card with "Nâng cấp Pro — 299.000đ / năm" → `PaymentModal`
- Not authenticated: unchanged (login CTA)
- `PaymentModal` is rendered in a `z-[60]` layer on top of the account modal

---

## 5. Unit Tests (`src/tests/cloud-paywall.test.ts`)

```
bun test src/tests/cloud-paywall.test.ts

 21 pass
  0 fail
 29 expect() calls
Ran 21 tests across 1 file. [331.00ms]
```

### Test suites:

| Suite | Tests |
|-------|-------|
| CloudSyncModal paywall — plan=free | 4 tests |
| CloudSyncModal — plan=pro shows active sync controls | 4 tests |
| CloudSyncModal — not logged in | 2 tests |
| Local notes are NEVER touched by cloud paywall | 5 tests |
| PaymentModal success — upgrades user.plan to pro | 3 tests |
| AccountModal Pro badge logic | 3 tests |

### Key verifications:
- ✅ Paywall shows when `plan === 'free'`
- ✅ Cloud sync controls show when `plan === 'pro'`
- ✅ Auth store has **no note fields** (`notes`, `diaryEntries` absent)
- ✅ Local notes count unchanged across: free login, upgrade, logout
- ✅ Payment success sets `user.plan → 'pro'` in `useAuthStore`
- ✅ Upgrade does not touch `useNotesStore.notes`

---

## 6. Build Verification

```bash
bunx --no-install tsc --noEmit
# Exit 0 — no TypeScript errors

bun run build
# vite v6.4.3 building for production...
# ✓ 1905 modules transformed.
# dist/assets/index-CtHKNas9.js   493.59 kB │ gzip: 136.40 kB
# ✓ built in 4.07s
```

---

## Design Principles Preserved

- **Local notes 100% free and offline** — `useNotesStore` never modified; auth state fully isolated
- **No state leakage** — payment plan update uses `useAuthStore.setState` only
- **Bearer token never in localStorage** — `getBearerToken()` from module-level closure
- **Dirty tree preserved** — no unrelated files touched
- **HTTPS enforced** — inherited from `API_BASE` validation in `api-client.ts`
