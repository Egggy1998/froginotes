/**
 * db.ts — CLOUD DATABASE DISABLED
 *
 * All Turso/LibSQL credentials and direct browser-to-database access have been
 * removed. The shared Turso instance had no tenant isolation (every user shared
 * the same tables with no user_id filter) and the auth token was bundled in the
 * client-side JS bundle — a critical security risk.
 *
 * Cloud sync is permanently disabled until a proper backend proxy (server-side
 * authentication + per-user row isolation) is implemented. All data is stored
 * locally in localStorage.
 *
 * DO NOT re-add credentials here. DO NOT use VITE_* env vars as a workaround
 * (they are bundled into public JS and equally exposed).
 */

import { Note, ChecklistItem, DiaryEntry, DiaryWeather, MascotMood, TapeStyle, TapePosition } from '../types';

// ── Stub client (no real connection) ─────────────────────────────────────────
export const dbClient = null as null; // No live client — cloud disabled

// ── Row mappers (kept for future use when a safe backend exists) ──────────────
export function rowToNote(row: any): Note {
  let checklist: ChecklistItem[] | undefined;
  if (row.checklist_json) {
    try { checklist = JSON.parse(row.checklist_json); } catch { checklist = undefined; }
  }

  let bullets: string[] | undefined;
  if (row.bullets_json) {
    try { bullets = JSON.parse(row.bullets_json); } catch { bullets = undefined; }
  }

  let chip = undefined;
  if (row.chip_text) {
    chip = { icon: (row.chip_icon as 'clock' | 'calendar') || 'clock', text: row.chip_text };
  }

  return {
    id: String(row.id),
    title: String(row.title || ''),
    content: row.content ? String(row.content) : undefined,
    type: row.type || 'text',
    color: row.color || 'yellow',
    icon: row.icon || undefined,
    mascot: row.mascot || undefined,
    doodle: row.doodle || undefined,
    folderId: row.folder_id || 'personal',
    chip,
    checklist,
    bullets,
    isPinned: Boolean(row.is_pinned),
    isStarred: Boolean(row.is_starred),
    isToday: Boolean(row.is_today),
    hasReminder: Boolean(row.has_reminder),
    isArchived: Boolean(row.is_archived),
    isTrash: Boolean(row.is_trash),
    reminderAt: row.reminder_at || undefined,
    photoUrl: row.photo_url || undefined,
    tapeStyle: (row.tape_style as TapeStyle) || undefined,
    tapePosition: (row.tape_position as TapePosition) || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function rowToDiaryEntry(row: any): DiaryEntry {
  return {
    id: String(row.id),
    date: String(row.date),
    mood: (row.mood as MascotMood) || 'happy',
    weather: (row.weather as DiaryWeather) || 'sunny',
    title: row.title ? String(row.title) : undefined,
    content: String(row.content || ''),
    photoUrl: row.photo_url || undefined,
    tapeStyle: (row.tape_style as TapeStyle) || undefined,
    tapePosition: (row.tape_position as TapePosition) || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// ── All cloud functions are stubs that fail closed ────────────────────────────

/** @deprecated Cloud DB disabled — no credentials, no live connection. */
export async function initDatabase(_initialNotes: Note[] = []): Promise<Note[]> {
  console.warn('[db] Cloud database is disabled. Using local storage only.');
  return [];
}

/** @deprecated Cloud DB disabled. */
export async function fetchNotesFromDB(): Promise<Note[]> {
  console.warn('[db] Cloud database is disabled. Using local storage only.');
  return [];
}

/** @deprecated Cloud DB disabled. */
export async function insertNoteToDB(_note: Note): Promise<boolean> {
  console.warn('[db] Cloud database is disabled. Note not written to cloud.');
  return false;
}

/** @deprecated Cloud DB disabled. */
export async function updateNoteInDB(_id: string, _updates: Partial<Note>): Promise<boolean> {
  console.warn('[db] Cloud database is disabled. Note not updated in cloud.');
  return false;
}

/** @deprecated Cloud DB disabled. */
export async function deleteNoteFromDB(_id: string): Promise<boolean> {
  console.warn('[db] Cloud database is disabled. Note not deleted from cloud.');
  return false;
}

/** @deprecated Cloud DB disabled. */
export async function fetchDiaryEntriesFromDB(): Promise<DiaryEntry[]> {
  console.warn('[db] Cloud database is disabled. Using local storage only.');
  return [];
}

/** @deprecated Cloud DB disabled. */
export async function insertDiaryEntryToDB(_entry: DiaryEntry): Promise<boolean> {
  console.warn('[db] Cloud database is disabled. Diary entry not written to cloud.');
  return false;
}

/** @deprecated Cloud DB disabled. */
export async function deleteDiaryEntryFromDB(_id: string): Promise<boolean> {
  console.warn('[db] Cloud database is disabled. Diary entry not deleted from cloud.');
  return false;
}
