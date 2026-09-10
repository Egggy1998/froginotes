import { createClient } from '@libsql/client/web';
import { Note, ChecklistItem, DiaryEntry, DiaryWeather, MascotMood, TapeStyle, TapePosition } from '../types';

const TURSO_URL = 'libsql://forginotes-egggy.aws-ap-northeast-1.turso.io';
const TURSO_AUTH_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkwMTA3NTgsImlkIjoiMDFhMDg5NTItYjkwMS03YWI3LTljMzgtMjVhYjNkYjkwMTQ4Iiwia2lkIjoiMGxKNWEzTzhKdndZZXE0OTBhd29EUHByWkpJOHNwZ1FLY09jX1VOeG9xRSIsInJpZCI6Ijc1ZmFhZDQ0LTNlZWUtNDY0ZC1hYTZlLWM2YjEwMDZmOTI5YyJ9.ZVjol95nEv5TjhiUG3Ohl1bDLCMDR3vpS0W6Cnumdx07CodxqjX8LoWy36ZG9N4imsYsOje5RGBJd-4TsKL0Cg';

export const dbClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Row mapper helper for Notes
export function rowToNote(row: any): Note {
  let checklist: ChecklistItem[] | undefined;
  if (row.checklist_json) {
    try {
      checklist = JSON.parse(row.checklist_json);
    } catch {
      checklist = undefined;
    }
  }

  let bullets: string[] | undefined;
  if (row.bullets_json) {
    try {
      bullets = JSON.parse(row.bullets_json);
    } catch {
      bullets = undefined;
    }
  }

  let chip = undefined;
  if (row.chip_text) {
    chip = {
      icon: (row.chip_icon as 'clock' | 'calendar') || 'clock',
      text: row.chip_text,
    };
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

// Row mapper helper for Diary Entries
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

// Initialize tables and verify schema
export async function initDatabase(initialNotes: Note[] = []): Promise<Note[]> {
  try {
    // 1. Notes Table
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        mascot TEXT,
        doodle TEXT,
        folder_id TEXT NOT NULL,
        chip_icon TEXT,
        chip_text TEXT,
        checklist_json TEXT,
        bullets_json TEXT,
        is_pinned INTEGER DEFAULT 0,
        is_starred INTEGER DEFAULT 0,
        is_today INTEGER DEFAULT 0,
        has_reminder INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        is_trash INTEGER DEFAULT 0,
        reminder_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        photo_url TEXT,
        tape_style TEXT,
        tape_position TEXT
      );
    `);

    // 2. Diary Table
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        mood TEXT NOT NULL,
        weather TEXT,
        title TEXT,
        content TEXT NOT NULL,
        photo_url TEXT,
        tape_style TEXT,
        tape_position TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Check notes count
    const countRes = await dbClient.execute('SELECT COUNT(*) as cnt FROM notes;');
    const totalCount = Number(countRes.rows[0].cnt || 0);

    if (totalCount === 0 && initialNotes.length > 0) {
      console.log('Seeding initial notes to Turso LibSQL...');
      for (const note of initialNotes) {
        await insertNoteToDB(note);
      }
      return initialNotes;
    }

    // Fetch existing notes
    const fetched = await fetchNotesFromDB();
    return fetched;
  } catch (error) {
    console.error('Failed to init Turso DB:', error);
    return [];
  }
}

// Fetch all notes
export async function fetchNotesFromDB(): Promise<Note[]> {
  try {
    const res = await dbClient.execute('SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC;');
    return res.rows.map(rowToNote);
  } catch (error) {
    console.error('Failed to fetch from Turso DB:', error);
    return [];
  }
}

// Insert single note
export async function insertNoteToDB(note: Note): Promise<boolean> {
  try {
    await dbClient.execute({
      sql: `
        INSERT OR REPLACE INTO notes (
          id, title, content, type, color, icon, mascot, doodle, folder_id,
          chip_icon, chip_text, checklist_json, bullets_json,
          is_pinned, is_starred, is_today, has_reminder, is_archived, is_trash,
          reminder_at, created_at, updated_at, photo_url, tape_style, tape_position
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        );
      `,
      args: [
        note.id,
        note.title || '',
        note.content || null,
        note.type || 'text',
        note.color || 'yellow',
        note.icon || null,
        note.mascot || null,
        note.doodle || null,
        note.folderId || 'personal',
        note.chip?.icon || null,
        note.chip?.text || null,
        note.checklist ? JSON.stringify(note.checklist) : null,
        note.bullets ? JSON.stringify(note.bullets) : null,
        note.isPinned ? 1 : 0,
        note.isStarred ? 1 : 0,
        note.isToday ? 1 : 0,
        note.hasReminder ? 1 : 0,
        note.isArchived ? 1 : 0,
        note.isTrash ? 1 : 0,
        note.reminderAt || null,
        note.createdAt || new Date().toISOString(),
        note.updatedAt || new Date().toISOString(),
        note.photoUrl || null,
        note.tapeStyle || null,
        note.tapePosition || null,
      ],
    });
    return true;
  } catch (error) {
    console.error('Failed to insert note into Turso DB:', error);
    return false;
  }
}

// Update single note
export async function updateNoteInDB(id: string, updates: Partial<Note>): Promise<boolean> {
  try {
    const res = await dbClient.execute({
      sql: 'SELECT * FROM notes WHERE id = ? LIMIT 1;',
      args: [id],
    });

    if (res.rows.length === 0) return false;
    const current = rowToNote(res.rows[0]);
    const merged: Note = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return await insertNoteToDB(merged);
  } catch (error) {
    console.error('Failed to update note in Turso DB:', error);
    return false;
  }
}

// Delete note
export async function deleteNoteFromDB(id: string): Promise<boolean> {
  try {
    await dbClient.execute({
      sql: 'DELETE FROM notes WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (error) {
    console.error('Failed to delete note from Turso DB:', error);
    return false;
  }
}

/* =========================================================================
   DIARY ENTRIES CRUD
   ========================================================================= */

// Fetch all diary entries
export async function fetchDiaryEntriesFromDB(): Promise<DiaryEntry[]> {
  try {
    const res = await dbClient.execute('SELECT * FROM diary_entries ORDER BY date DESC, updated_at DESC;');
    return res.rows.map(rowToDiaryEntry);
  } catch (error) {
    console.error('Failed to fetch diary entries from Turso DB:', error);
    return [];
  }
}

// Insert or replace single diary entry
export async function insertDiaryEntryToDB(entry: DiaryEntry): Promise<boolean> {
  try {
    await dbClient.execute({
      sql: `
        INSERT OR REPLACE INTO diary_entries (
          id, date, mood, weather, title, content, photo_url, tape_style, tape_position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        entry.id,
        entry.date,
        entry.mood || 'happy',
        entry.weather || 'sunny',
        entry.title || null,
        entry.content || '',
        entry.photoUrl || null,
        entry.tapeStyle || null,
        entry.tapePosition || null,
        entry.createdAt || new Date().toISOString(),
        entry.updatedAt || new Date().toISOString(),
      ],
    });
    return true;
  } catch (error) {
    console.error('Failed to insert diary entry into Turso DB:', error);
    return false;
  }
}

// Delete diary entry
export async function deleteDiaryEntryFromDB(id: string): Promise<boolean> {
  try {
    await dbClient.execute({
      sql: 'DELETE FROM diary_entries WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (error) {
    console.error('Failed to delete diary entry from Turso DB:', error);
    return false;
  }
}
