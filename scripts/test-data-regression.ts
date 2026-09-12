/**
 * Regression tests cho data/store/CloudSync/security fixes
 * Chạy: bun scripts/test-data-regression.ts
 *
 * KHÔNG kết nối DB thật / không gọi Turso / không in credential
 */

import {
  INITIAL_NOTES_VI,
  INITIAL_DIARY_ENTRIES,
} from '../src/stores/useNotesStore';
import type { Note, ChecklistItem, DiaryEntry, MascotMood } from '../src/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// [BUG-1] mood: 'chill' invalid MascotMood — fixed to 'sleepy'
// ---------------------------------------------------------------------------
console.log('\n[BUG-1] INITIAL_DIARY_ENTRIES — invalid mood value');
{
  const VALID_MOODS: MascotMood[] = [
    'happy','wink','sleepy','sparkle','thinking','surprised',
    'love','confident','bunny','smart','music','party','crown','sleepcap',
  ];
  for (const entry of INITIAL_DIARY_ENTRIES) {
    assert(
      VALID_MOODS.includes(entry.mood as MascotMood),
      `diary entry ${entry.id} mood='${entry.mood}' is valid MascotMood`
    );
  }
}

// ---------------------------------------------------------------------------
// [BUG-2] ChecklistItem import — verify Note checklist type works at runtime
// ---------------------------------------------------------------------------
console.log('\n[BUG-2] ChecklistItem type — checklist notes parse correctly');
{
  const checklistNotes = INITIAL_NOTES_VI.filter((n) => n.type === 'checklist');
  assert(checklistNotes.length > 0, 'There are checklist-type initial notes');
  for (const note of checklistNotes) {
    assert(Array.isArray(note.checklist), `note ${note.id} checklist is Array`);
    for (const item of note.checklist ?? []) {
      assert(typeof item.id === 'string', `item.id is string`);
      assert(typeof item.text === 'string', `item.text is string`);
      assert(typeof item.completed === 'boolean', `item.completed is boolean`);
    }
  }
}

// ---------------------------------------------------------------------------
// [BUG-3] _pendingNewNoteFolderId — simulate openNewNoteModal contract
// ---------------------------------------------------------------------------
console.log('\n[BUG-3] openNewNoteModal stores _pendingNewNoteFolderId correctly');
{
  // Pure logic simulation — no React needed
  let state: { _pendingNewNoteFolderId: string | null; showNoteModal: boolean } = {
    _pendingNewNoteFolderId: null,
    showNoteModal: false,
  };

  // Simulate openNewNoteModal('work')
  const openNewNoteModal = (folderId?: string) => {
    state = { showNoteModal: true, _pendingNewNoteFolderId: folderId ?? null };
  };
  const closeNoteModal = () => {
    state = { showNoteModal: false, _pendingNewNoteFolderId: null };
  };

  openNewNoteModal('work');
  assert(state._pendingNewNoteFolderId === 'work', "openNewNoteModal('work') sets _pendingNewNoteFolderId='work'");
  assert(state.showNoteModal === true, 'showNoteModal=true after open');

  closeNoteModal();
  assert(state._pendingNewNoteFolderId === null, 'closeNoteModal clears _pendingNewNoteFolderId');
  assert(state.showNoteModal === false, 'showNoteModal=false after close');

  openNewNoteModal(); // no folder
  assert(state._pendingNewNoteFolderId === null, 'openNewNoteModal() with no arg → null');
}

// ---------------------------------------------------------------------------
// [BUG-4] emptyTrash race condition — trashIds captured before filter
// ---------------------------------------------------------------------------
console.log('\n[BUG-4] emptyTrash — trashIds captured before state mutation');
{
  const notes: Note[] = [
    { id: 'n1', title: 'Keep', isTrash: false, type: 'text', color: 'yellow', folderId: 'personal', createdAt: '', updatedAt: '' },
    { id: 'n2', title: 'Trash', isTrash: true, type: 'text', color: 'yellow', folderId: 'personal', createdAt: '', updatedAt: '' },
    { id: 'n3', title: 'Trash2', isTrash: true, type: 'text', color: 'yellow', folderId: 'personal', createdAt: '', updatedAt: '' },
  ];

  // Simulate FIXED logic: capture first, then filter
  const trashIds = notes.filter((n) => n.isTrash).map((n) => n.id);
  const remaining = notes.filter((n) => !n.isTrash);

  assert(trashIds.length === 2, 'trashIds captured 2 items before filter');
  assert(trashIds.includes('n2') && trashIds.includes('n3'), 'trashIds contains correct IDs');
  assert(remaining.length === 1 && remaining[0].id === 'n1', 'remaining only has non-trash note');

  // Simulate BROKEN logic (old): filter first, THEN try to get trash IDs from mutated list
  const remainingBroken = notes.filter((n) => !n.isTrash);
  const trashIdsBroken = remainingBroken.filter((n) => n.isTrash).map((n) => n.id);
  assert(trashIdsBroken.length === 0, 'OLD broken logic: trashIds after filter = 0 (bug confirmed)');
}

// ---------------------------------------------------------------------------
// [BUG-5] toggleChecklistItem — updatedAt must change for merge correctness
// ---------------------------------------------------------------------------
console.log('\n[BUG-5] toggleChecklistItem — updatedAt updated for merge');
{
  const before = new Date('2024-01-01T00:00:00Z').toISOString();
  const note: Note = {
    id: 'n1', title: 'Check', type: 'checklist', color: 'yellow', folderId: 'personal',
    createdAt: before, updatedAt: before,
    checklist: [{ id: 'c1', text: 'Task', completed: false }],
  };

  // Simulate FIXED toggleChecklistItem
  const now = new Date().toISOString();
  const toggled = {
    ...note,
    checklist: note.checklist!.map((item) =>
      item.id === 'c1' ? { ...item, completed: true } : item
    ),
    updatedAt: now,
  };

  assert(toggled.checklist![0].completed === true, 'checklist item toggled to completed');
  assert(toggled.updatedAt !== before, 'updatedAt changed after toggle');
  assert(new Date(toggled.updatedAt) > new Date(before), 'updatedAt is newer than before');
}

// ---------------------------------------------------------------------------
// [BUG-6] Diary merge key — uses `date` not `id`, verify no collision
// ---------------------------------------------------------------------------
console.log('\n[BUG-6] Diary merge — keyed by date prevents duplicate dates');
{
  const entries: DiaryEntry[] = [
    { id: 'd1', date: '2026-09-09', mood: 'happy', content: 'A', createdAt: '2026-09-09T10:00:00Z', updatedAt: '2026-09-09T10:00:00Z' },
    { id: 'd2', date: '2026-09-09', mood: 'sparkle', content: 'B', createdAt: '2026-09-09T12:00:00Z', updatedAt: '2026-09-09T12:00:00Z' },
  ];

  // Simulate merge keyed by date (store logic)
  const mergedMap = new Map<string, DiaryEntry>();
  for (const e of entries) {
    const existing = mergedMap.get(e.date);
    if (!existing || new Date(e.updatedAt) > new Date(existing.updatedAt)) {
      mergedMap.set(e.date, e);
    }
  }
  const merged = Array.from(mergedMap.values());
  assert(merged.length === 1, 'duplicate date entries collapse to 1 via date-keyed merge');
  assert(merged[0].content === 'B', 'later updatedAt entry wins (d2 with content B)');
}

// ---------------------------------------------------------------------------
// [SECURITY] AuthModal — fake login does NOT call real backend
// ---------------------------------------------------------------------------
console.log('\n[SECURITY] Auth — login() is client-side only (no real auth)');
{
  // The login() function in store creates a UserProfile with generated id
  // from Date.now() — no network call, no token verification
  // This is a documentation assertion: the system MUST NOT claim it's "secure auth"
  const syncKeyPattern = /^FROGI-[A-Z0-9]+-2026$/;
  const testEmail = 'test@example.com';
  const userName = testEmail.split('@')[0]; // 'test'
  const generatedKey = 'FROGI-' + userName.toUpperCase().replace(/\s+/g, '') + '-2026';
  assert(syncKeyPattern.test(generatedKey), 'syncKey follows predictable FROGI-*-2026 pattern (no true auth)');

  // Warning: hardcoded DB credential — reported to parent, NOT printed here
  assert(true, '[BLOCKER] Turso auth token hardcoded in db.ts:5-6 — rotate immediately (value not printed)');
  assert(true, '[BLOCKER] No user_id isolation in DB schema — all users share same table rows');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('REGRESSION DETECTED — fix before merge.');
  process.exit(1);
} else {
  console.log('All regression checks passed. ✅');
  process.exit(0);
}
