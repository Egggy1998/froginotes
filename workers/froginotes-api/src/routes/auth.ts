import { Hono } from 'hono';
import type { Env } from '../lib/types.js';
import {
  createChallenge, getChallenge, confirmChallenge, getSessionByTokenHash,
  getUserByEmail, upsertUser, createSession, revokeSession, validateToken,
  rateLimit,
} from '../lib/db.js';
import { sha256, randomHex, isValidEmail, now } from '../lib/crypto.js';
import { sendEmail, buildChallengeEmail, EmailError } from '../lib/email.js';

export const authRouter = new Hono<{ Bindings: Env }>();

// POST /api/auth/request-challenge
// Returns { challengeId, pollSecret, expiresAt }
// pollSecret is a one-time secret the initiating client must hold and supply on /poll.
// poll_secret_hash (sha256 of pollSecret) is stored server-side; the raw secret is NEVER stored.
authRouter.post('/request-challenge', async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}));
  const email = (body.email ?? '').trim().toLowerCase();

  if (!isValidEmail(email)) {
    return c.json({ error: 'invalid_email' }, 400);
  }

  // In production, fail closed if no email service is configured
  const isDev = c.env.ENVIRONMENT === 'development';
  if (!isDev && !c.env.RESEND_API_KEY) {
    return c.json({ error: 'email_unavailable', message: 'Email service not configured.' }, 503);
  }

  // Rate limit: 3 requests per 5 minutes per IP
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
  const allowed = await rateLimit(c.env.DB, `challenge:${ip}`, 3, 5 * 60);
  if (!allowed) {
    return c.json({ error: 'rate_limited', retryAfterSeconds: 300 }, 429);
  }

  // challenge secret: verifies the confirm link came from the emailed URL
  const secret = randomHex(32); // 64-char hex, never stored plain
  const secretHash = await sha256(secret);

  // poll secret: held only by the initiating client; required to pick up the session token
  const pollSecret = randomHex(32); // 64-char hex, never stored plain
  const pollSecretHash = await sha256(pollSecret);

  const baseUrl = new URL(c.req.url).origin;
  const challengeId = await createChallenge(c.env.DB, email, secretHash, pollSecretHash);

  const confirmUrl = `${baseUrl}/api/auth/confirm-challenge?c=${challengeId}&secret=${secret}`;

  // In dev: store full confirm URL in D1 so test harness can read it directly
  if (isDev) {
    await c.env.DB.prepare('UPDATE challenges SET dev_confirm_url=?2 WHERE id=?1')
      .bind(challengeId, confirmUrl).run();
  }

  const emailSubject = `Xác nhận đăng nhập FrogiNotes 🐸`;
  const emailHtml = `<div style="font-family:sans-serif"><p><a href="${confirmUrl}">Confirm login</a></p></div>`;

  try {
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      environment: c.env.ENVIRONMENT,
      resendApiKey: c.env.RESEND_API_KEY,
    });
  } catch (e) {
    if (e instanceof EmailError) {
      console.error('[auth] email error:', e.message);
      return c.json({ error: 'email_unavailable', message: 'Dịch vụ email tạm thời không khả dụng.' }, 503);
    }
    throw e;
  }

  return c.json({
    challengeId,
    pollSecret, // returned ONLY here, ONLY to initiating client; never stored plain
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  });
});

// GET /api/auth/confirm-challenge?c=<id>&secret=<hex>
// Confirms the challenge (single-use: sets confirmed=1 and writes poll_token).
authRouter.get('/confirm-challenge', async (c) => {
  const challengeId = c.req.query('c') ?? '';
  const secret = c.req.query('secret') ?? '';

  if (!challengeId || !secret) {
    return c.json({ error: 'invalid_or_expired' }, 400);
  }

  const challenge = await getChallenge(c.env.DB, challengeId);
  if (!challenge) {
    return c.json({ error: 'invalid_or_expired' }, 400);
  }

  // Check expiry
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return c.json({ error: 'invalid_or_expired' }, 400);
  }

  // Already confirmed — show friendly message, do not re-issue token
  if (challenge.confirmed === 1) {
    return new Response(
      '<html><body style="font-family:sans-serif;padding:32px"><h2>🐸 Đã xác nhận rồi!</h2><p>Tab này có thể đóng.</p></body></html>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Verify challenge secret hash (constant-time via sha256 comparison)
  const providedHash = await sha256(secret);
  if (providedHash !== challenge.secret_hash) {
    return c.json({ error: 'invalid_or_expired' }, 400);
  }

  // Create/find user
  const user = await upsertUser(c.env.DB, challenge.email);

  // Create session (token hash stored; raw token used for poll pickup)
  const token = randomHex(32); // opaque bearer token
  const tokenHash = await sha256(token);
  const ua = c.req.header('User-Agent') ?? '';
  const deviceHint = ua.slice(0, 200);
  const sessionId = await createSession(c.env.DB, user.id, tokenHash, deviceHint);

  // Mark challenge confirmed and store poll_token (raw token, one-time retrieval by poll)
  await confirmChallenge(c.env.DB, challengeId, user.id, sessionId, token);

  // Set cookie for web clients (token goes via Set-Cookie, not response body)
  const cookieValue = `frogi_session=${token}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}; Path=/`;
  const isSecure = !c.req.url.startsWith('http://localhost');
  const cookieHeader = isSecure ? `${cookieValue}; Secure` : cookieValue;

  return new Response(
    `<html><body style="font-family:sans-serif;padding:32px;max-width:480px;margin:0 auto">
      <h2 style="color:#2D6A4F">🐸 Xác nhận thành công!</h2>
      <p>Bạn đã đăng nhập vào FrogiNotes. Tab này có thể đóng.</p>
      <p style="color:#666;font-size:12px">Quay lại app FrogiNotes để tiếp tục.</p>
    </body></html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': cookieHeader,
      },
    }
  );
});

// GET /api/auth/poll/:challengeId?ps=<pollSecret>
// Returns session token only when challenge is confirmed AND poll_secret verifies.
// poll_secret must be the value returned to the initiating client on request-challenge.
// Token is cleared after ONE successful retrieval (single-use pickup).
authRouter.get('/poll/:challengeId', async (c) => {
  const challengeId = c.req.param('challengeId');
  const pollSecret = c.req.query('ps') ?? '';

  if (!pollSecret || pollSecret.length < 60) {
    return c.json({ error: 'poll_secret_required' }, 400);
  }

  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';

  // Rate limit: max 1 poll per 2 seconds per challengeId+IP pair
  const allowed = await rateLimit(c.env.DB, `poll:${challengeId}:${ip}`, 1, 2);
  if (!allowed) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  const challenge = await getChallenge(c.env.DB, challengeId);
  if (!challenge) {
    return c.json({ error: 'not_found' }, 404);
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return c.json({ status: 'expired' }, 410);
  }

  // Verify poll secret BEFORE revealing any state (timing-safe via sha256)
  const providedPollSecretHash = await sha256(pollSecret);
  if (providedPollSecretHash !== challenge.poll_secret_hash) {
    return c.json({ error: 'invalid_poll_secret' }, 403);
  }

  if (challenge.confirmed !== 1 || !challenge.session_id) {
    return c.json({ status: 'pending' }, 202);
  }

  // Fetch poll_token (raw bearer token, stored temporarily)
  const row = await c.env.DB.prepare('SELECT poll_token FROM challenges WHERE id=?1').bind(challengeId).first<{poll_token: string | null}>();
  const pollToken = row?.poll_token ?? null;

  if (!pollToken) {
    // Already picked up (token cleared after first retrieval)
    return c.json({ status: 'already_retrieved' }, 410);
  }

  // Clear poll_token after retrieval (one-time pickup; also clears dev_confirm_url)
  await c.env.DB.prepare('UPDATE challenges SET poll_token=NULL, dev_confirm_url=NULL WHERE id=?1').bind(challengeId).run();

  return c.json({ status: 'confirmed', token: pollToken });
});

// POST /api/auth/logout
authRouter.post('/logout', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) {
    return c.json({ error: 'unauthenticated' }, 401);
  }

  await revokeSession(c.env.DB, auth.sessionId);

  // Clear web cookie
  const expiredCookie = 'frogi_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/';

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': expiredCookie,
    },
  });
});

// GET /api/auth/me
authRouter.get('/me', async (c) => {
  const auth = await getAuthContext(c);
  if (!auth) {
    return c.json({ error: 'unauthenticated' }, 401);
  }
  const { user } = auth;
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    createdAt: user.created_at,
  });
});

// ─── Shared auth helper ───────────────────────────────────────────────────────

export async function getAuthContext(c: { req: { header: (h: string) => string | undefined }; env: Env }): Promise<{ userId: string; sessionId: string; user: import('../lib/types.js').User } | null> {
  // Try Authorization: Bearer *** first (desktop)
  const authHeader = c.req.header('Authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.length === 64) { // 32 bytes hex
      return validateToken(c.env.DB, token);
    }
  }

  // Try cookie (web)
  const cookie = c.req.header('Cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)frogi_session=([a-f0-9]{64})(?:;|$)/);
  if (match) {
    return validateToken(c.env.DB, match[1]);
  }

  return null;
}
