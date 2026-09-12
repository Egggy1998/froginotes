import { Hono } from 'hono';
import type { Env } from './lib/types.js';
import { authRouter } from './routes/auth.js';
import { notesRouter } from './routes/notes.js';
import { diaryRouter } from './routes/diary.js';
import { decorRouter } from './routes/decor.js';
import { devRouter } from './routes/dev.js';
import { paymentRouter } from './routes/payment.js';

const app = new Hono<{ Bindings: Env }>();

// ─── CORS ─────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:8787',
  'https://froginotes.pages.dev',
]);

function corsHeaders(origin: string | undefined): Record<string, string> {
  const matched = origin && ALLOWED_ORIGINS.has(origin) ? origin : null;

  // Electron app:// and file:// protocol pages get explicit allow
  const isElectron = origin?.startsWith('app://') || origin?.startsWith('file://');
  const allowOrigin = matched ?? (isElectron ? origin! : 'null');

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key, X-Dev-Seed',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Handle preflight
app.options('*', (c) => {
  const origin = c.req.header('Origin');
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
});

// Inject CORS on all responses
app.use('*', async (c, next) => {
  await next();
  const origin = c.req.header('Origin');
  const headers = corsHeaders(origin);
  for (const [k, v] of Object.entries(headers)) {
    c.res.headers.set(k, v);
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.route('/api/auth', authRouter);
app.route('/api/notes', notesRouter);
app.route('/api/diary', diaryRouter);
app.route('/api/decor', decorRouter);
app.route('/api/dev', devRouter);
app.route('/api/payment', paymentRouter);

// Health check
app.get('/api/health', (c) => c.json({ ok: true, version: '0.2.0', environment: c.env.ENVIRONMENT }));

// 404 fallback
app.notFound((c) => c.json({ error: 'not_found' }, 404));

// Error handler — never leak internals
app.onError((err, c) => {
  console.error('[worker error]', err.message);
  return c.json({ error: 'internal_error' }, 500);
});

export default app;
