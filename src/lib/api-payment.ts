/**
 * api-payment.ts — Payment API client for FrogiNotes Cloud Pro.
 *
 * Calls the backend payment endpoints:
 *   POST /api/payment/create-order  → creates a VietQR order
 *   GET  /api/payment/order/:id     → checks order status
 *
 * Uses the same API_BASE and HTTPS enforcement as api-client.ts.
 * Bearer token is injected via getBearerToken() from useAuthStore.
 */

import { API_BASE, ApiDisabledError, ApiError } from './api-client';
import { getBearerToken } from '../stores/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanType = 'pro';
export type PeriodType = 'monthly' | 'yearly' | 'trial';

/** Default period for new subscriptions: monthly at 50,000 VND */
export const DEFAULT_PERIOD: PeriodType = 'monthly';
/** Default amount in VND for monthly Pro plan */
export const DEFAULT_MONTHLY_AMOUNT = 50_000;

export interface CreateOrderResponse {
  orderId: string;
  /** VietQR deeplink or base64 PNG URL */
  qrCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  /** Amount in VND */
  amount: number;
  /** Exact content the user must paste into the transfer note */
  transferContent: string;
  /** ISO timestamp after which this order expires */
  expiresAt: string;
}

export type OrderStatus = 'pending' | 'completed' | 'expired' | 'cancelled';

export interface OrderStatusResponse {
  orderId: string;
  status: OrderStatus;
  plan: PlanType;
  period: PeriodType;
  /** Present when status === 'completed' */
  completedAt?: string;
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function paymentFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!API_BASE) throw new ApiDisabledError();
  const token = getBearerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  return res;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/create-order
 * Creates a new VietQR payment order for the given plan/period.
 * Defaults to monthly Pro plan (50,000 VND).
 * Requires the user to be logged in (bearer token attached).
 */
export async function createPaymentOrder(
  plan: PlanType = 'pro',
  period: PeriodType = DEFAULT_PERIOD,
): Promise<CreateOrderResponse> {
  const res = await paymentFetch('/api/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ plan, period }),
  });

  const body = await res.json().catch(() => ({})) as any;

  if (!res.ok) {
    const code = body?.error ?? `http_${res.status}`;
    throw new ApiError(res.status, code);
  }

  return body as CreateOrderResponse;
}

/**
 * GET /api/payment/order/:orderId
 * Polls the status of an existing order.
 * Returns OrderStatusResponse; caller is responsible for polling frequency.
 */
export async function checkOrderStatus(
  orderId: string,
): Promise<OrderStatusResponse> {
  const res = await paymentFetch(
    `/api/payment/order/${encodeURIComponent(orderId)}`,
    { method: 'GET' },
  );

  const body = await res.json().catch(() => ({})) as any;

  if (!res.ok) {
    const code = body?.error ?? `http_${res.status}`;
    throw new ApiError(res.status, code);
  }

  return body as OrderStatusResponse;
}
