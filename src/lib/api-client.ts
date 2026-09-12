/**
 * api-client.ts — FrogiNotes cloud API transport layer.
 *
 * Reads VITE_API_URL from build-time env. If absent, all calls throw
 * ApiDisabledError so callers can degrade gracefully without a network touch.
 *
 * HTTPS is enforced for non-loopback origins.
 * Bearer tokens are never written to localStorage or sessionStorage.
 * No CORS bypass — server must allow the origin.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const RAW_API_URL: string | undefined =
  typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_URL as string | undefined) : undefined;

function resolveApiBase(): string | null {
  if (!RAW_API_URL || RAW_API_URL.trim() === '') return null;
  const url = RAW_API_URL.trim().replace(/\/$/, '');
  // Enforce HTTPS except for loopback
  try {
    const parsed = new URL(url);
    const loopback =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1';
    if (!loopback && parsed.protocol !== 'https:') {
      console.error('[api-client] VITE_API_URL must use HTTPS for non-loopback origins. Cloud disabled.');
      return null;
    }
  } catch {
    console.error('[api-client] VITE_API_URL is not a valid URL. Cloud disabled.');
    return null;
  }
  return url;
}

export const API_BASE: string | null = resolveApiBase();
export const cloudEnabled = API_BASE !== null;

// ─── Error types ─────────────────────────────────────────────────────────────

export class ApiDisabledError extends Error {
  constructor() {
    super('Cloud API is not configured (VITE_API_URL absent or invalid).');
    this.name = 'ApiDisabledError';
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(`API error ${status}: ${code}`);
    this.name = 'ApiError';
  }
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function apiFetch(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<Response> {
  if (!API_BASE) throw new ApiDisabledError();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  return res;
}

function bearerHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface ChallengeResponse {
  challengeId: string;
  pollSecret: string;
  expiresAt: string;
}

export type PollStatus =
  | { status: 'pending' }
  | { status: 'confirmed'; token: string }
  | { status: 'expired' }
  | { status: 'already_retrieved' };

export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'pro';
  createdAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/request-challenge
 * Throws ApiDisabledError if cloud is not configured.
 * Throws ApiError with status 429 (rate_limited) or 503 (email_unavailable).
 */
export async function requestChallenge(
  email: string,
  signal?: AbortSignal,
): Promise<ChallengeResponse> {
  const res = await apiFetch(
    '/api/auth/request-challenge',
    { method: 'POST', body: JSON.stringify({ email }) },
    signal,
  );

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const code = (body as any)?.error ?? `http_${res.status}`;
    const retryAfter = (body as any)?.retryAfterSeconds as number | undefined;
    throw new ApiError(res.status, code, retryAfter);
  }

  return body as ChallengeResponse;
}

/**
 * GET /api/auth/poll/:challengeId?ps=:pollSecret
 * Returns PollStatus. Caller is responsible for spacing calls >= 2 s apart.
 * 410 → status expired or already_retrieved.
 * 429/403/404 → throws ApiError.
 */
export async function pollChallenge(
  challengeId: string,
  pollSecret: string,
  signal?: AbortSignal,
): Promise<PollStatus> {
  const res = await apiFetch(
    `/api/auth/poll/${encodeURIComponent(challengeId)}?ps=${encodeURIComponent(pollSecret)}`,
    { method: 'GET' },
    signal,
  );

  const body = await res.json().catch(() => ({})) as any;

  if (res.status === 202) return { status: 'pending' };
  if (res.status === 200 && body.status === 'confirmed') {
    return { status: 'confirmed', token: body.token as string };
  }
  if (res.status === 410) {
    // body.status may be 'expired' or 'already_retrieved'
    return { status: (body.status ?? 'expired') as 'expired' | 'already_retrieved' };
  }
  // 400, 403, 404, 429 — errors
  const code = body?.error ?? `http_${res.status}`;
  throw new ApiError(res.status, code);
}

/**
 * GET /api/auth/me
 * Throws ApiError(401) if token is invalid/revoked.
 */
export async function getMe(token: string, signal?: AbortSignal): Promise<MeResponse> {
  const res = await apiFetch('/api/auth/me', { headers: bearerHeaders(token) }, signal);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as any;
    throw new ApiError(res.status, body?.error ?? `http_${res.status}`);
  }
  return res.json() as Promise<MeResponse>;
}

/**
 * POST /api/auth/logout
 * Best-effort: swallows non-network errors (token may already be revoked).
 */
export async function revokeSession(token: string, signal?: AbortSignal): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST', headers: bearerHeaders(token) }, signal);
  } catch (e) {
    // Swallow — logout is best-effort
    if (!(e instanceof ApiDisabledError)) {
      console.warn('[api-client] logout request failed (best-effort):', e);
    }
  }
}

// ─── Injected transport for tests ─────────────────────────────────────────────

/**
 * ApiTransport allows tests to inject fakes without network calls.
 * Production code uses the real implementation above.
 */
export interface ApiTransport {
  requestChallenge(email: string, signal?: AbortSignal): Promise<ChallengeResponse>;
  pollChallenge(id: string, ps: string, signal?: AbortSignal): Promise<PollStatus>;
  getMe(token: string, signal?: AbortSignal): Promise<MeResponse>;
  revokeSession(token: string, signal?: AbortSignal): Promise<void>;
}

export const defaultTransport: ApiTransport = {
  requestChallenge,
  pollChallenge,
  getMe,
  revokeSession,
};
