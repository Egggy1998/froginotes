# PAYMENT-GATE-HANDOFF.md

## Summary

Implemented server-side plan gating for Cloud Sync and a full payment order/webhook API for FrogiNotes.

**Test result: 51/51 PASS** — all acceptance criteria verified.

---

## Changes Made

### 1. Plan Gating — `src/routes/notes.ts` + `src/routes/diary.ts`

Both `GET /api/notes` and `POST /api/notes/batch` (and their diary equivalents) now check `auth.user.plan` immediately after authentication:

```ts
if (auth.user.plan !== 'pro') return c.json(PLAN_REQUIRED_RESPONSE, 403);
```

Response shape:
```json
{
  "ok": false,
  "error": "plan_required",
  "message": "Tính năng Cloud Sync yêu cầu gói Pro. Vui lòng nâng cấp để sử dụng."
}
```

The gate fires **after** auth (so unauthenticated still returns 401, not 403) and **before** rate-limiting/idempotency logic.

---

### 2. Payment Route — `src/routes/payment.ts`

New file. Registered as `/api/payment`.

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/payment/create-order` | Required | Creates a pending order, returns orderId + VietQR link |
| `GET /api/payment/order/:orderId` | Required (owner-only) | Returns order status |
| `POST /api/payment/webhook` | None | Verifies transfer description, marks order completed, upgrades user plan |

**create-order request:**
```json
{ "plan": "pro", "period": "yearly" | "lifetime" }
```

**create-order response:**
```json
{
  "ok": true,
  "orderId": "FRG-<ts>-<rnd>",
  "amount": 299000,
  "currency": "VND",
  "qrUrl": "https://img.vietqr.io/image/MB-...",
  "transferDescription": "FROGI FRG-...",
  "expiresAt": "...",
  "status": "pending"
}
```

**Pricing:**
- `pro:yearly` → 299,000 VND
- `pro:lifetime` → 799,000 VND

**Webhook:** Accepts `{ transferDescription }` or `{ orderId }`. Extracts orderId from description `FROGI <orderId>`. On match: marks order `completed`, sets `users.plan = 'pro'`.

Auto-expiry: `GET /order/:id` checks `expires_at` and marks `expired` if past due.

---

### 3. Dev Simulate-Payment — `src/routes/dev.ts`

Added `POST /api/dev/simulate-payment { orderId }`:
- Guards with `ENVIRONMENT !== 'development'` → 404 in prod
- No auth required (test harness convenience)
- Marks order `completed` and upgrades `users.plan` atomically

---

### 4. Schema — `schema.sql` + `schema_patch_v4_orders.sql`

New `orders` table:

```sql
CREATE TABLE IF NOT EXISTS orders (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL DEFAULT 'pro',
  period               TEXT NOT NULL DEFAULT 'yearly',
  amount               INTEGER NOT NULL,
  transfer_description TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending',
  created_at           TEXT NOT NULL,
  expires_at           TEXT NOT NULL,
  completed_at         TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, expires_at);
```

Migration file: `schema_patch_v4_orders.sql`

Apply to local dev:
```bash
wrangler d1 execute froginotes-db --local --file=schema_patch_v4_orders.sql
```

Apply to production:
```bash
wrangler d1 execute froginotes-db --remote --file=schema_patch_v4_orders.sql
```

---

### 5. Router Registration — `src/index.ts`

```ts
import { paymentRouter } from './routes/payment.js';
app.route('/api/payment', paymentRouter);
```

---

## Test Results

File: `tests/payment-gating.py`

```
=== payment-gating tests ===

[PLAN GATE] Free user sync endpoints must return 403 plan_required
  PASS  Free user GET /api/notes returns 403
  PASS  GET /api/notes error=plan_required
  PASS  GET /api/notes ok=false
  PASS  GET /api/notes has Vietnamese message
  PASS  Free user POST /api/notes/batch returns 403
  PASS  POST /api/notes/batch error=plan_required
  PASS  Free user GET /api/diary returns 403
  PASS  GET /api/diary error=plan_required
  PASS  Free user POST /api/diary/batch returns 403
  PASS  POST /api/diary/batch error=plan_required

[PAYMENT] Unauthenticated create-order returns 401
[PAYMENT] Invalid plan returns 400
[PAYMENT] Create order pro/yearly
  (9 checks for orderId, amount, status, qrUrl, transferDescription, expiresAt)

[PAYMENT] GET order/:id for owner
  PASS  GET order status=pending
  PASS  GET order wrong user returns 403
  PASS  GET non-existent order returns 404

[PAYMENT] POST /api/dev/simulate-payment
  PASS  simulate-payment returns 200 / status=completed / plan=pro

[PAYMENT] GET order now shows completed
  PASS  GET order after payment status=completed
  PASS  GET order completedAt set

[PAYMENT] /api/auth/me shows plan=pro after upgrade
  PASS  /me plan=pro after upgrade

[PLAN GATE] Pro user sync endpoints must return 200
  PASS  Pro user GET /api/notes returns 200
  PASS  Pro user POST /api/notes/batch returns 200
  PASS  Pro user GET /api/diary returns 200
  PASS  Pro user POST /api/diary/batch returns 200

[PAYMENT] Webhook via transfer description
  PASS  Webhook via transferDescription returns 200 / status=completed
  PASS  Secondary user /me plan=pro after webhook

RESULTS: 51/51 passed, 0 failed
```

---

## Production Checklist

- [ ] Apply `schema_patch_v4_orders.sql` to remote D1 with `--remote`
- [ ] Set real bank account / VietQR credentials in `payment.ts` (`VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`) — or move to `env` secrets
- [ ] Wire real payment gateway webhook signature verification in `POST /api/payment/webhook`
- [ ] `POST /api/dev/simulate-payment` is auto-blocked in production (returns 404 when `ENVIRONMENT !== 'development'`)

---

## Files Modified / Created

| File | Change |
|---|---|
| `src/routes/notes.ts` | Added `plan !== 'pro'` gate on GET / POST batch |
| `src/routes/diary.ts` | Added `plan !== 'pro'` gate on GET / POST batch |
| `src/routes/payment.ts` | **New** — create-order, get-order, webhook |
| `src/routes/dev.ts` | Added `POST /api/dev/simulate-payment` |
| `src/index.ts` | Imported and registered `paymentRouter` |
| `schema.sql` | Added `orders` table + indexes |
| `schema_patch_v4_orders.sql` | **New** — migration for existing databases |
| `tests/payment-gating.py` | **New** — 51-check integration test suite |
