/**
 * payment.ts — GPM Pay integration for FrogiNotes Cloud package
 *
 * Cloud plan: 50,000 VND/month | 500,000 VND/year
 *
 * Flow:
 *  1. POST /api/payment/create-order → mint order in D1, return VietQR image URL
 *  2. POST /api/payment/webhook      → GPM Pay HMAC-signed webhook, verify + reconcile
 *
 * GPM Pay does NOT hold order state — we own the orders table, we reconcile.
 * Docs: node_modules/@gpmpay/sdk/AGENTS.md
 */

import { Hono } from 'hono';
import type { Env } from '../lib/types.js';
import { getAuthContext } from './auth.js';
import { buildVietQrImageUrl } from '@gpmpay/sdk/vietqr';
import { constructWebhookEvent, GpmPayWebhookSignatureError } from '@gpmpay/sdk/webhooks';

// Re-export GpmPay lazily so the worker doesn't crash at boot when GPMPAY_API_TOKEN is absent
// (Cloudflare Workers import modules at request time, not at startup)
async function getGpmClient(token: string) {
  const { GpmPay } = await import('@gpmpay/sdk');
  return new GpmPay({ apiToken: token });
}

export const paymentRouter = new Hono<{ Bindings: Env }>();

// ─── Pricing table ───────────────────────────────────────────────────────────
// Cloud package: 50,000 VND/month | 500,000 VND/year
const PRICES: Record<string, number> = {
  'cloud:monthly':  50_000,
  'cloud:yearly':  500_000,
  // legacy aliases kept for forward-compat
  'pro:monthly':    50_000,
  'pro:yearly':    500_000,
};

const DEFAULT_PERIOD = 'monthly';

// ─── Fallback bank config (MB Bank) used when GPMPAY_API_TOKEN is absent ─────
const FALLBACK_BANK_BIN    = '970422';   // MB Bank BIN
const FALLBACK_ACCOUNT_NO  = '9704198526191432198'; // example – set real account in env

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeOrderId(): string {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FRG${ts}${rnd}`;
}

/**
 * Build a VietQR image URL.
 * Tries to fetch bank account info from GpmPay; falls back to hardcoded config.
 */
async function buildQrUrl(
  apiToken: string | undefined,
  amount: number,
  description: string,
): Promise<string> {
  if (apiToken) {
    try {
      const client = await getGpmClient(apiToken);
      const accounts = await client.bankAccounts.list({ status: 'ACTIVE' });
      const account = accounts.data[0];
      if (account?.bank?.bin && account.accountNumber) {
        return buildVietQrImageUrl({
          bankBin:       account.bank.bin,
          accountNumber: account.accountNumber,
          amount,
          description,
        });
      }
    } catch (err) {
      console.warn('[payment] GpmPay bankAccounts.list failed, using fallback:', (err as Error).message);
    }
  }

  // Fallback: MB Bank
  return buildVietQrImageUrl({
    bankBin:       FALLBACK_BANK_BIN,
    accountNumber: FALLBACK_ACCOUNT_NO,
    amount,
    description,
  });
}

// ─── POST /api/payment/create-order ──────────────────────────────────────────
paymentRouter.post('/create-order', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);

  const body = await c.req.json<{ plan?: string; period?: string }>().catch(() => ({} as { plan?: string; period?: string }));
  const plan   = body.plan   ?? 'cloud';
  const period = body.period ?? DEFAULT_PERIOD;   // default: monthly

  if (period !== 'monthly' && period !== 'yearly') {
    return c.json({ ok: false, error: 'invalid_period', message: "period must be 'monthly' or 'yearly'." }, 400);
  }

  const priceKey = `${plan}:${period}`;
  const amount   = PRICES[priceKey];
  if (!amount) {
    return c.json({ ok: false, error: 'invalid_plan', message: `Unknown plan/period: ${priceKey}` }, 400);
  }

  const orderId = makeOrderId();                       // e.g. FRG1A2B3C4D5XYZAB
  const code    = `FRG${orderId}`;                     // transfer description code
  const transferDescription = `FRG ${orderId}`;        // what customer types in transfer content
  const now       = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

  const qrUrl = await buildQrUrl(
    (c.env as any).GPMPAY_API_TOKEN as string | undefined,
    amount,
    code,
  );

  await c.env.DB.prepare(
    `INSERT INTO orders (id, user_id, plan, period, amount, transfer_description, status, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending', ?7, ?8)`
  ).bind(orderId, auth.userId, plan, period, amount, transferDescription, now, expiresAt).run();

  return c.json({
    ok:   true,
    orderId,
    code,
    amount,
    currency: 'VND',
    period,
    qrUrl,
    transferDescription,
    expiresAt,
    status: 'pending',
  });
});

// ─── GET /api/payment/order/:orderId ─────────────────────────────────────────
paymentRouter.get('/order/:orderId', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) return c.json({ error: 'unauthenticated' }, 401);

  const orderId = c.req.param('orderId');
  const row = await c.env.DB.prepare(
    'SELECT id, user_id, plan, period, amount, status, created_at, expires_at, completed_at FROM orders WHERE id=?1'
  ).bind(orderId).first<{
    id: string; user_id: string; plan: string; period: string;
    amount: number; status: string; created_at: string; expires_at: string; completed_at: string | null;
  }>();

  if (!row) return c.json({ ok: false, error: 'not_found' }, 404);
  if (row.user_id !== auth.userId) return c.json({ ok: false, error: 'forbidden' }, 403);

  // Auto-expire if past expires_at and still pending
  let status = row.status;
  if (status === 'pending' && new Date(row.expires_at).getTime() < Date.now()) {
    status = 'expired';
    await c.env.DB.prepare("UPDATE orders SET status='expired' WHERE id=?1").bind(orderId).run();
  }

  return c.json({
    ok:          true,
    orderId:     row.id,
    plan:        row.plan,
    period:      row.period,
    amount:      row.amount,
    currency:    'VND',
    status,
    createdAt:   row.created_at,
    expiresAt:   row.expires_at,
    completedAt: row.completed_at,
  });
});

// ─── POST /api/payment/webhook ────────────────────────────────────────────────
/**
 * GPM Pay HMAC webhook handler.
 *
 * Security: verify X-GPMPay-Signature HMAC if GPMPAY_WEBHOOK_SECRET is set.
 * Idempotency: de-dup by event.payload.id (GPM Pay transaction id).
 * Reconciliation: find orderId in payload.content, verify exact amount.
 */
paymentRouter.post('/webhook', async (c) => {
  // 1. Read raw body (required for HMAC verify — never JSON.parse before verify)
  const rawBody = await c.req.text();

  const webhookSecret = (c.env as any).GPMPAY_WEBHOOK_SECRET as string | undefined;

  // 2. Verify signature when secret is configured
  let event: ReturnType<typeof constructWebhookEvent>;
  if (webhookSecret) {
    const signature = c.req.header('x-gpmpay-signature') ?? '';
    try {
      event = constructWebhookEvent({
        rawBody,
        signature,
        secret: webhookSecret,
      });
    } catch (err) {
      if (err instanceof GpmPayWebhookSignatureError || (err as any)?.code === 'webhook_signature') {
        console.warn('[payment/webhook] invalid signature:', (err as Error).message);
        return c.json({ ok: false, error: 'invalid_signature' }, 401);
      }
      throw err;
    }
  } else {
    // No secret configured — parse JSON directly (dev/local mode only)
    console.warn('[payment/webhook] GPMPAY_WEBHOOK_SECRET not set — skipping signature verification');
    event = {
      type:      'transaction.created',
      timestamp: Math.floor(Date.now() / 1000),
      payload:   JSON.parse(rawBody),
      rawBody,
    };
  }

  const raw = event.payload as any;
  const payload = {
    id:             raw.id ?? `tx_${Date.now()}`,
    transferType:   raw.transferType ?? 'in',
    transferAmount: raw.transferAmount ?? raw.amount ?? 0,
    content:        raw.content ?? raw.transferDescription ?? '',
    referenceCode:  raw.referenceCode,
    gateway:        raw.gateway,
    source:         raw.source,
    test:           raw.test,
  };

  // 3. Ignore ping packets (sent when registering webhook endpoint)
  if (payload.test === true) {
    return c.json({ ok: true, message: 'ping_received' });
  }

  // 4. Only handle incoming transfers
  if (payload.transferType !== 'in') {
    return c.json({ ok: true, message: 'ignored_transfer_type' });
  }

  // 5. Extract FRG order code from transfer content
  //    Transfer description is "FRG <orderId>" so content contains that string.
  const contentMatch = payload.content?.match(/FRG[\s_:-]+(FRG[A-Z0-9]+)/i)
    ?? payload.content?.match(/\b(FRG[A-Z0-9]{8,})\b/i);

  if (!contentMatch) {
    return c.json({ ok: true, message: 'no_order_code_in_content' });
  }
  const orderId = contentMatch[1];

  // 6. Idempotency check — GPM Pay retries up to 6 times; same tx id must not double-complete
  const existingByTx = await c.env.DB.prepare(
    'SELECT id FROM orders WHERE webhook_tx_id=?1 LIMIT 1'
  ).bind(payload.id).first<{ id: string }>().catch(() => null);

  if (existingByTx) {
    return c.json({ ok: true, message: 'already_processed' });
  }

  // 7. Load order
  const row = await c.env.DB.prepare(
    'SELECT id, user_id, plan, amount, status, expires_at FROM orders WHERE id=?1'
  ).bind(orderId).first<{ id: string; user_id: string; plan: string; amount: number; status: string; expires_at: string }>();

  if (!row) {
    return c.json({ ok: true, message: 'order_not_found_ignored' });
  }

  // 8. Already completed — idempotent success
  if (row.status === 'completed') {
    return c.json({ ok: true, message: 'already_completed' });
  }

  // 9. Expired
  if (row.status === 'expired' || new Date(row.expires_at).getTime() < Date.now()) {
    return c.json({ ok: true, message: 'order_expired_ignored' });
  }

  // 10. Exact amount check — GPM Pay does NOT do this for us
  if (payload.transferAmount !== row.amount) {
    console.warn(`[payment/webhook] amount mismatch for order ${orderId}: expected ${row.amount}, got ${payload.transferAmount}`);
    return c.json({ ok: true, message: 'amount_mismatch_ignored' });
  }

  // 11. Complete order and upgrade user plan to 'pro'
  const completedAt = new Date().toISOString();

  // Store webhook_tx_id for idempotency (gracefully skip if column doesn't exist yet)
  try {
    await c.env.DB.prepare(
      "UPDATE orders SET status='completed', completed_at=?2, webhook_tx_id=?3 WHERE id=?1"
    ).bind(orderId, completedAt, payload.id).run();
  } catch {
    // Column may not exist in older schema — fall back without it
    await c.env.DB.prepare(
      "UPDATE orders SET status='completed', completed_at=?2 WHERE id=?1"
    ).bind(orderId, completedAt).run();
  }

  await c.env.DB.prepare(
    "UPDATE users SET plan='pro', updated_at=?2 WHERE id=?1"
  ).bind(row.user_id, completedAt).run();

  console.info(`[payment/webhook] order ${orderId} completed; user ${row.user_id} upgraded to pro`);

  return c.json({ ok: true, orderId, status: 'completed', plan: 'pro' });
});
