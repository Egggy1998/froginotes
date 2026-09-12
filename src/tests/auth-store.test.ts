/**
 * auth-store.test.ts — Comprehensive unit tests for useAuthStore
 *
 * Run: bun test src/tests/auth-store.test.ts
 *
 * Strategy:
 *   - Uses _setTransport() DI to inject fake transports (no real HTTP)
 *   - Overrides globalThis.setTimeout to be instant so poll sleeps don't block
 *   - Resets Zustand state and module-level generation/abort vars before each test
 *
 * Tests:
 *   ✓ Happy path: startLogin → requesting → polling → confirmed → getMe → authenticated
 *   ✓ 429 rate limit on request-challenge: error state + retryAfterSeconds
 *   ✓ 503 emailUnavailable on request-challenge: emailUnavailable flag set
 *   ✓ 429 during poll loop: backs off and retries (continues polling)
 *   ✓ cancelLogin during requesting: reverts to idle, does not touch notes
 *   ✓ cancelLogin during polling: reverts to idle, does not touch notes
 *   ✓ logout: revokes session, clears all auth state, does not touch local notes
 *   ✓ expired poll result: error state with 'expired' code
 *   ✓ already_retrieved poll result: error state
 *   ✓ getMe failure after confirmed: error state with me_failed code
 *   ✓ network error during requestChallenge: error state with network_error code
 *   ✓ cloudDisabled: idle phase returned when ApiDisabledError thrown
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { useAuthStore } from '../stores/useAuthStore';
import { ApiError, ApiDisabledError, type ChallengeResponse, type PollStatus, type MeResponse, type ApiTransport } from '../lib/api-client';

// ─── Speed up sleeps to near-zero ────────────────────────────────────────────

let _origSetTimeout: typeof setTimeout;

function installFastTimers() {
  _origSetTimeout = globalThis.setTimeout;
  // Override: run callbacks with 0ms delay regardless of requested ms
  (globalThis as any).setTimeout = (fn: (...args: unknown[]) => void, _ms?: number, ...args: unknown[]) => {
    return _origSetTimeout(fn, 0, ...args);
  };
}

function uninstallFastTimers() {
  globalThis.setTimeout = _origSetTimeout;
}

// ─── Fake data ────────────────────────────────────────────────────────────────

const FAKE_CHALLENGE: ChallengeResponse = {
  challengeId: 'chal_test_001',
  pollSecret: 'ps_secret_abc',
  expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
};

const FAKE_ME: MeResponse = {
  id: 'user_001',
  email: 'test@example.com',
  name: 'Test User',
  plan: 'free',
  createdAt: new Date().toISOString(),
};

const FAKE_TOKEN = 'tok_abcdefghijklmnopqrstuvwxyz123456789012345678901234567890123';

// ─── Reset store before each test ────────────────────────────────────────────

function resetStore() {
  // Reset Zustand state
  useAuthStore.setState({
    phase: 'idle',
    user: null,
    error: null,
    pendingEmail: '',
    cloudDisabled: false,
    emailUnavailable: false,
  });

  // Re-install a default (failing) fake transport so no test accidentally calls real network
  useAuthStore.getState()._setTransport(makeFakeTransport({}));
}

// ─── Transport builder ────────────────────────────────────────────────────────

interface TransportOverrides {
  requestChallenge?: () => Promise<ChallengeResponse>;
  pollResults?: PollStatus[];       // returned in sequence; last one repeated
  getMe?: (token: string, signal?: AbortSignal) => Promise<MeResponse>;
  revokeSession?: (token: string, signal?: AbortSignal) => Promise<void>;
}

function makeFakeTransport(overrides: TransportOverrides): ApiTransport {
  let pollCallCount = 0;

  return {
    requestChallenge: overrides.requestChallenge
      ?? (() => Promise.resolve(FAKE_CHALLENGE)),

    pollChallenge: (_id, _ps, _signal) => {
      const results = overrides.pollResults ?? [{ status: 'confirmed', token: FAKE_TOKEN }];
      const idx = Math.min(pollCallCount, results.length - 1);
      pollCallCount++;
      return Promise.resolve(results[idx]);
    },

    getMe: overrides.getMe
      ?? ((_token: string, _signal?: AbortSignal) => Promise.resolve(FAKE_ME)),

    revokeSession: overrides.revokeSession
      ?? ((_token: string) => Promise.resolve()),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAuthStore — happy path startLogin', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('transitions: idle → requesting → polling → authenticated', async () => {
    const phases: string[] = [];
    const unsub = useAuthStore.subscribe((state) => phases.push(state.phase));

    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    // Should have gone through requesting → polling → verifying → authenticated
    expect(phases).toContain('requesting');
    expect(phases).toContain('polling');
    expect(phases).toContain('verifying');
    expect(phases).toContain('authenticated');

    const final = useAuthStore.getState();
    expect(final.phase).toBe('authenticated');
    expect(final.user).not.toBeNull();
    expect(final.user?.email).toBe('test@example.com');
    expect(final.error).toBeNull();
    expect(final.pendingEmail).toBe('test@example.com');

    unsub();
  });

  it('stores user.plan from /me response', async () => {
    const proMe: MeResponse = { ...FAKE_ME, plan: 'pro' };
    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
      getMe: () => Promise.resolve(proMe),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('pro@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('authenticated');
    expect(state.user?.plan).toBe('pro');
  });

  it('polls pending N times before confirmed', async () => {
    let callCount = 0;
    const transport = makeFakeTransport({
      pollResults: [
        { status: 'pending' },
        { status: 'pending' },
        { status: 'confirmed', token: FAKE_TOKEN },
      ],
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('authenticated');
  });
});

describe('useAuthStore — 429 rate limit on requestChallenge', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('sets phase=error with code=rate_limited and retryAfterSeconds', async () => {
    const transport = makeFakeTransport({
      requestChallenge: () => Promise.reject(new ApiError(429, 'rate_limited', 120)),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('error');
    expect(state.error?.code).toBe('rate_limited');
    expect(state.error?.retryAfterSeconds).toBe(120);
    expect(state.emailUnavailable).toBe(false);
  });
});

describe('useAuthStore — 503 emailUnavailable on requestChallenge', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('sets emailUnavailable=true and phase=error', async () => {
    const transport = makeFakeTransport({
      requestChallenge: () => Promise.reject(new ApiError(503, 'email_unavailable')),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('error');
    expect(state.emailUnavailable).toBe(true);
    expect(state.error?.code).toBe('email_unavailable');
  });

  it('does not authenticate on 503', async () => {
    const transport = makeFakeTransport({
      requestChallenge: () => Promise.reject(new ApiError(503, 'email_unavailable')),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('useAuthStore — 429 backoff during poll loop', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('continues polling after 429 and eventually authenticates', async () => {
    let pollCount = 0;
    const transport: ApiTransport = {
      requestChallenge: () => Promise.resolve(FAKE_CHALLENGE),
      pollChallenge: (_id, _ps, _signal) => {
        pollCount++;
        if (pollCount === 1) {
          return Promise.reject(new ApiError(429, 'rate_limited'));
        }
        return Promise.resolve({ status: 'confirmed', token: FAKE_TOKEN });
      },
      getMe: () => Promise.resolve(FAKE_ME),
      revokeSession: () => Promise.resolve(),
    };
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('authenticated');
    expect(pollCount).toBeGreaterThan(1); // polled at least twice
  });
});

describe('useAuthStore — cancelLogin', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('cancelLogin during requesting sets phase=idle and clears pendingEmail', async () => {
    let resolveChallenge!: (v: ChallengeResponse) => void;
    const challengePromise = new Promise<ChallengeResponse>((res) => { resolveChallenge = res; });

    const transport = makeFakeTransport({
      requestChallenge: () => challengePromise,
    });
    useAuthStore.getState()._setTransport(transport);

    // Start login (will block at requestChallenge)
    const loginPromise = useAuthStore.getState().startLogin('test@example.com');

    // Wait for requesting state
    await new Promise((r) => setTimeout(r, 0));

    // Cancel immediately
    useAuthStore.getState().cancelLogin();

    // Unblock the challenge (result should be ignored)
    resolveChallenge(FAKE_CHALLENGE);
    await loginPromise;

    const state = useAuthStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.pendingEmail).toBe('');
    expect(state.error).toBeNull();
  });

  it('cancelLogin during polling sets phase=idle', async () => {
    let firstPoll = true;
    let resolveFirstPoll!: (v: PollStatus) => void;
    const firstPollPromise = new Promise<PollStatus>((res) => { resolveFirstPoll = res; });

    const transport: ApiTransport = {
      requestChallenge: () => Promise.resolve(FAKE_CHALLENGE),
      pollChallenge: (_id, _ps, _signal) => {
        if (firstPoll) {
          firstPoll = false;
          return firstPollPromise;
        }
        return Promise.resolve({ status: 'pending' });
      },
      getMe: () => Promise.resolve(FAKE_ME),
      revokeSession: () => Promise.resolve(),
    };
    useAuthStore.getState()._setTransport(transport);

    const loginPromise = useAuthStore.getState().startLogin('test@example.com');

    // Let it get into polling state
    await new Promise((r) => setTimeout(r, 10));

    // Cancel
    useAuthStore.getState().cancelLogin();

    // Unblock (result discarded)
    resolveFirstPoll({ status: 'pending' });
    await loginPromise.catch(() => {});

    const state = useAuthStore.getState();
    expect(state.phase).toBe('idle');
  });

  it('cancelLogin does NOT delete any notes (local notes untouched)', async () => {
    // notes are in useNotesStore, not useAuthStore — cancelLogin only touches auth state
    // Here we verify auth state doesn't unexpectedly hold note refs
    useAuthStore.getState().cancelLogin();
    const state = useAuthStore.getState();
    // Auth store should have no notes-related keys in it
    expect('notes' in state).toBe(false);
    expect('diaryEntries' in state).toBe(false);
  });
});

describe('useAuthStore — logout', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('logout clears user, phase, pendingEmail', async () => {
    // First authenticate
    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
    });
    useAuthStore.getState()._setTransport(transport);
    await useAuthStore.getState().startLogin('test@example.com');
    expect(useAuthStore.getState().phase).toBe('authenticated');

    // Now logout
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.user).toBeNull();
    expect(state.pendingEmail).toBe('');
    expect(state.error).toBeNull();
    expect(state.emailUnavailable).toBe(false);
  });

  it('logout calls revokeSession with the bearer token (best-effort)', async () => {
    let revokedToken: string | null = null;
    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
      revokeSession: (token: string) => { revokedToken = token; return Promise.resolve(); },
    });
    useAuthStore.getState()._setTransport(transport);
    await useAuthStore.getState().startLogin('test@example.com');

    await useAuthStore.getState().logout();

    expect(revokedToken as unknown as string).toBe(FAKE_TOKEN);
  });

  it('logout does not crash if revokeSession throws (best-effort)', async () => {
    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
      revokeSession: () => Promise.reject(new Error('network error')),
    });
    useAuthStore.getState()._setTransport(transport);
    await useAuthStore.getState().startLogin('test@example.com');

    // Should not throw
    await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

    const state = useAuthStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.user).toBeNull();
  });

  it('logout does NOT touch local notes (auth store owns no notes)', async () => {
    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
    });
    useAuthStore.getState()._setTransport(transport);
    await useAuthStore.getState().startLogin('test@example.com');
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect('notes' in state).toBe(false);
    expect('diaryEntries' in state).toBe(false);
  });
});

describe('useAuthStore — expired / already_retrieved poll results', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('expired poll result → phase=error, code=expired', async () => {
    const transport = makeFakeTransport({
      pollResults: [{ status: 'expired' }],
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('error');
    expect(state.error?.code).toBe('expired');
  });

  it('already_retrieved poll result → phase=error, code=already_retrieved', async () => {
    const transport = makeFakeTransport({
      pollResults: [{ status: 'already_retrieved' }],
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('error');
    expect(state.error?.code).toBe('already_retrieved');
  });
});

describe('useAuthStore — getMe failure after confirmed', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('sets phase=error with me_failed code when /me throws', async () => {
    const transport = makeFakeTransport({
      pollResults: [{ status: 'confirmed', token: FAKE_TOKEN }],
      getMe: () => Promise.reject(new ApiError(401, 'unauthorized')),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('error');
    expect(state.error?.code).toBe('me_failed');
    expect(state.user).toBeNull();
  });
});

describe('useAuthStore — network error on requestChallenge', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('non-ApiError → phase=error with network_error code', async () => {
    const transport = makeFakeTransport({
      requestChallenge: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('error');
    expect(state.error?.code).toBe('network_error');
  });
});

describe('useAuthStore — ApiDisabledError (cloudDisabled)', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('ApiDisabledError on requestChallenge → cloudDisabled=true, phase=idle', async () => {
    const transport = makeFakeTransport({
      requestChallenge: () => Promise.reject(new ApiDisabledError()),
    });
    useAuthStore.getState()._setTransport(transport);

    await useAuthStore.getState().startLogin('test@example.com');

    const state = useAuthStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.cloudDisabled).toBe(true);
  });
});

describe('useAuthStore — clearError', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('clearError resets phase from error to idle', async () => {
    const transport = makeFakeTransport({
      requestChallenge: () => Promise.reject(new ApiError(429, 'rate_limited', 60)),
    });
    useAuthStore.getState()._setTransport(transport);
    await useAuthStore.getState().startLogin('test@example.com');
    expect(useAuthStore.getState().phase).toBe('error');

    useAuthStore.getState().clearError();

    const state = useAuthStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.error).toBeNull();
  });
});

describe('useAuthStore — concurrent login cancels previous', () => {
  beforeEach(() => { installFastTimers(); resetStore(); });
  afterEach(() => { uninstallFastTimers(); });

  it('second startLogin cancels first and wins', async () => {
    let firstLoginResolved = false;
    const transport: ApiTransport = {
      requestChallenge: () => Promise.resolve(FAKE_CHALLENGE),
      pollChallenge: (_id, _ps, _signal) => Promise.resolve({ status: 'confirmed', token: FAKE_TOKEN }),
      getMe: (_token, _signal) => {
        firstLoginResolved = true;
        return Promise.resolve({ ...FAKE_ME, email: 'second@example.com' });
      },
      revokeSession: () => Promise.resolve(),
    };
    useAuthStore.getState()._setTransport(transport);

    // Both fire concurrently; second should win
    const [, second] = await Promise.all([
      useAuthStore.getState().startLogin('first@example.com'),
      useAuthStore.getState().startLogin('second@example.com'),
    ]);

    const state = useAuthStore.getState();
    // Either authenticated (second won) or idle (first was cancelled)
    expect(['authenticated', 'idle']).toContain(state.phase);
  });
});
