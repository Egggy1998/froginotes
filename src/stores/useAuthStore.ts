/**
 * useAuthStore.ts — Authoritative cloud auth state for FrogiNotes.
 *
 * Owns:
 *   - bearer token (in memory only, never localStorage)
 *   - MeResponse (user profile once authenticated)
 *   - polling lifecycle for magic-link login
 *
 * The older useNotesStore.login() fake MUST NOT be used to establish auth.
 * When cloud auth succeeds, useAuthStore.user is the source of truth.
 *
 * Auth flow:
 *   1. startLogin(email) → POST /request-challenge → store challengeId + pollSecret
 *   2. poll loop every 2 s → GET /poll/:id?ps=...
 *   3. On 'confirmed' → store token → GET /me → set user
 *   4. logout() → POST /logout → clear all state
 *
 * Robustness:
 *   - Generation guard: if email changes mid-flow, old poll loop drops result
 *   - AbortController per poll loop: cancelled on logout/unmount signal
 *   - 429 → backs off 5 s before next poll
 *   - 503 on request-challenge → sets emailUnavailable flag (prod without RESEND)
 *   - 410 → stops polling, surfaces 'expired' state
 *   - Cancellation via cancelLogin() or logout()
 */

import { create } from 'zustand';
import { ApiTransport, MeResponse, defaultTransport, ApiError, ApiDisabledError, cloudEnabled } from '../lib/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthPhase =
  | 'idle'          // not logged in, no flow in progress
  | 'requesting'    // awaiting POST /request-challenge response
  | 'polling'       // waiting for user to click email link
  | 'verifying'     // token received, calling GET /me
  | 'authenticated' // user.email confirmed from /me
  | 'error';        // something went wrong — see error field

export interface AuthError {
  code: string;
  message: string;
  retryAfterSeconds?: number;
}

export interface AuthState {
  // ─── Public state ──────────────────────────────────────────────────────────
  phase: AuthPhase;
  user: MeResponse | null;
  error: AuthError | null;
  /** Email used for the current/last login attempt */
  pendingEmail: string;
  /** True when VITE_API_URL is absent/invalid */
  cloudDisabled: boolean;
  /** True when backend returned 503 (email provider not configured) */
  emailUnavailable: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────────
  /** Begin login flow. Idempotent: cancels any in-progress flow first. */
  startLogin(email: string): Promise<void>;
  /** Cancel in-progress login (polling or requesting). Safe to call always. */
  cancelLogin(): void;
  /** Revoke session and clear all state. Does NOT delete local notes. */
  logout(): Promise<void>;
  /** Reset error state back to idle so user can retry */
  clearError(): void;

  // ─── Internal (test-visible) ───────────────────────────────────────────────
  _transport: ApiTransport;
  _setTransport(t: ApiTransport): void;
}

// ─── Internal polling state (not in Zustand, to avoid re-render on tick) ─────

let _pollAbortController: AbortController | null = null;
let _loginGeneration = 0; // monotonically incremented; guards stale poll completions

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  // ─── Initial state ──────────────────────────────────────────────────────
  phase: 'idle',
  user: null,
  error: null,
  pendingEmail: '',
  cloudDisabled: !cloudEnabled,
  emailUnavailable: false,

  _transport: defaultTransport,
  _setTransport: (t: ApiTransport) => set({ _transport: t }),

  // ─── clearError ─────────────────────────────────────────────────────────
  clearError: () => set({ phase: 'idle', error: null }),

  // ─── cancelLogin ────────────────────────────────────────────────────────
  cancelLogin: () => {
    _loginGeneration++;
    _pollAbortController?.abort();
    _pollAbortController = null;
    const { phase } = get();
    if (phase === 'requesting' || phase === 'polling') {
      set({ phase: 'idle', error: null, pendingEmail: '' });
    }
  },

  // ─── startLogin ─────────────────────────────────────────────────────────
  startLogin: async (email: string) => {
    const { _transport } = get();

    // Cancel any in-progress flow
    get().cancelLogin();

    const generation = ++_loginGeneration;
    const ac = new AbortController();
    _pollAbortController = ac;

    set({ phase: 'requesting', error: null, pendingEmail: email, emailUnavailable: false });

    // ── Step 1: request-challenge ───────────────────────────────────────
    let challengeId: string;
    let pollSecret: string;

    try {
      const ch = await _transport.requestChallenge(email, ac.signal);
      // Guard: flow may have been cancelled/superseded
      if (generation !== _loginGeneration) return;
      challengeId = ch.challengeId;
      pollSecret = ch.pollSecret;
    } catch (err) {
      if (generation !== _loginGeneration) return;
      if (isAbort(err)) return; // user cancelled
      if (err instanceof ApiDisabledError) {
        set({ phase: 'idle', cloudDisabled: true });
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 503) {
          set({
            phase: 'error',
            emailUnavailable: true,
            error: {
              code: err.code,
              message: 'Email service is not configured yet. Try again later.',
            },
          });
          return;
        }
        if (err.status === 429) {
          set({
            phase: 'error',
            error: {
              code: 'rate_limited',
              message: 'Too many attempts. Please wait before trying again.',
              retryAfterSeconds: err.retryAfterSeconds,
            },
          });
          return;
        }
        set({
          phase: 'error',
          error: { code: err.code, message: `Request failed (${err.status}).` },
        });
        return;
      }
      set({ phase: 'error', error: { code: 'network_error', message: 'Network error. Check your connection.' } });
      return;
    }

    // ── Step 2: poll loop ───────────────────────────────────────────────
    set({ phase: 'polling' });

    const POLL_INTERVAL_MS = 2000;
    const BACKOFF_429_MS = 5000;

    while (true) {
      // Respect the 2-second minimum interval
      await sleep(POLL_INTERVAL_MS, ac.signal);
      if (generation !== _loginGeneration || ac.signal.aborted) return;

      let pollResult: Awaited<ReturnType<ApiTransport['pollChallenge']>>;
      try {
        pollResult = await _transport.pollChallenge(challengeId, pollSecret, ac.signal);
      } catch (err) {
        if (generation !== _loginGeneration) return;
        if (isAbort(err)) return;
        if (err instanceof ApiError && err.status === 429) {
          // Back off before next poll
          await sleep(BACKOFF_429_MS, ac.signal);
          if (generation !== _loginGeneration || ac.signal.aborted) return;
          continue;
        }
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          set({ phase: 'error', error: { code: err.code, message: 'Session invalid. Please try again.' } });
          return;
        }
        // Network error — retry next interval
        continue;
      }

      if (generation !== _loginGeneration) return;

      if (pollResult.status === 'pending') {
        continue; // keep polling
      }

      if (pollResult.status === 'expired' || pollResult.status === 'already_retrieved') {
        set({
          phase: 'error',
          error: {
            code: pollResult.status,
            message: pollResult.status === 'expired'
              ? 'Login link expired (15 min). Please request a new one.'
              : 'Login link already used. Please request a new one.',
          },
        });
        return;
      }

      if (pollResult.status === 'confirmed') {
        const token = pollResult.token;
        // ── Step 3: verify with /me ─────────────────────────────────
        set({ phase: 'verifying' });
        try {
          const me = await _transport.getMe(token, ac.signal);
          if (generation !== _loginGeneration) return;
          // Store token in module-level closure (not Zustand, not localStorage)
          _activeToken = token;
          set({ phase: 'authenticated', user: me, error: null });
        } catch (err) {
          if (generation !== _loginGeneration) return;
          if (isAbort(err)) return;
          set({
            phase: 'error',
            error: { code: 'me_failed', message: 'Could not verify session. Please try again.' },
          });
        }
        return;
      }
    }
  },

  // ─── logout ─────────────────────────────────────────────────────────────
  logout: async () => {
    const { _transport } = get();
    // Cancel any in-progress flow
    get().cancelLogin();

    const token = _activeToken;
    _activeToken = null;

    // Revoke server-side (best-effort)
    if (token) {
      await _transport.revokeSession(token).catch(() => {/* best-effort */});
    }

    // Clear all in-memory auth state. Never touch local notes.
    set({
      phase: 'idle',
      user: null,
      error: null,
      pendingEmail: '',
      emailUnavailable: false,
    });
  },
}));

// ─── Bearer token (in memory, not Zustand state, not localStorage) ────────────

/** Raw 64-char bearer token. Null when not authenticated. */
let _activeToken: string | null = null;

/**
 * Get the current bearer token.
 * Returns null if not authenticated.
 * For use by future sync layers — do not write to storage.
 */
export function getBearerToken(): string | null {
  return _activeToken;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });
}

function isAbort(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError'
  );
}
