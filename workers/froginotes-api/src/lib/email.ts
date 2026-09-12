/**
 * Email sending via Resend.
 * In development (ENVIRONMENT=development): logs to console, no network call.
 * In production: calls Resend API with RESEND_API_KEY.
 * If production and no key: throws (caller should return 503).
 */

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  environment: string;
  resendApiKey?: string;
}

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailError';
  }
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  if (opts.environment === 'development') {
    // Dev sink: console only, NO network, NO credentials
    console.log('[DEV MAIL SINK]');
    console.log('  To:', opts.to);
    console.log('  Subject:', opts.subject);
    // Print text version (strip HTML tags)
    const text = opts.html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    console.log('  Body:', text.slice(0, 500));
    return;
  }

  // Production: require RESEND_API_KEY
  if (!opts.resendApiKey) {
    throw new EmailError('RESEND_API_KEY not configured — email delivery unavailable');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${opts.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'FrogiNotes <noreply@froginotes.app>',
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new EmailError(`Resend error ${res.status}: ${body.slice(0, 200)}`);
  }
}

export function buildChallengeEmail(baseUrl: string, challengeId: string, secret: string): { subject: string; html: string } {
  const link = `${baseUrl}/api/auth/confirm-challenge?c=${challengeId}&secret=${secret}`;
  return {
    subject: 'Xác nhận đăng nhập FrogiNotes 🐸',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2D6A4F">FrogiNotes 🐸</h2>
        <p>Nhấn nút bên dưới để xác nhận đăng nhập. Liên kết hết hạn sau <strong>15 phút</strong>.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2D6A4F;color:white;text-decoration:none;border-radius:8px;margin:16px 0">
          Xác nhận đăng nhập
        </a>
        <p style="color:#666;font-size:12px">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
        <p style="color:#999;font-size:11px;word-break:break-all">Link: ${link}</p>
      </div>
    `,
  };
}
