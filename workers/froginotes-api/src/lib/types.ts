// Shared environment bindings type
export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;       // "development" | "production"
  DEV_SEED_SECRET: string;   // only meaningful when ENVIRONMENT=development
  RESEND_API_KEY?: string;       // optional; required for prod email
  GPMPAY_API_TOKEN?: string;     // GPM Pay API token — read from env, never hardcode
  GPMPAY_WEBHOOK_SECRET?: string; // GPM Pay webhook HMAC secret — set after createHmacEndpoint
}

// ─── Domain types ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  device_hint: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  revision: number;
  title: string;
  content: string | null;
  type: string;
  color: string;
  icon: string | null;
  mascot: string | null;
  doodle: string | null;
  folder_id: string;
  checklist_json: string | null;
  bullets_json: string | null;
  chip_json: string | null;
  photo_url: string | null;
  tape_style: string | null;
  tape_position: string | null;
  is_pinned: number;
  is_starred: number;
  is_today: number;
  has_reminder: number;
  is_archived: number;
  is_trash: number;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  revision: number;
  date: string;
  mood: string;
  weather: string | null;
  title: string | null;
  content: string;
  photo_url: string | null;
  tape_style: string | null;
  tape_position: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DecorPack {
  id: string;
  name: string;
  description: string | null;
  price_usd_cents: number;
  is_active: number;
  preview_asset_ids: string;
  full_asset_ids: string;
  created_at: string;
}

export interface AuthedRequest {
  userId: string;
  sessionId: string;
  user: User;
}
