/**
 * security-containment.test.node.js
 *
 * Runnable security containment tests — Node.js only, no test runner needed.
 *
 * Usage (from repo root):
 *   node src/tests/security-containment.test.node.js
 *
 * Tests verify:
 * 1. No credentials / DB client in source or bundle
 * 2. Store cloud sync is permanently disabled
 * 3. No live DB calls remain in any code path
 * 4. Auth/CloudSync/Account UI shows unavailability, not fake success
 * 5. toggleChecklistItem does NOT mutate updatedAt (prevents card reorder)
 * 6. Local CRUD (localStorage) paths are intact
 */

const { readFileSync, readdirSync } = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DIST_JS = path.join(ROOT, 'dist', 'assets');

function read(f) { return readFileSync(f, 'utf-8'); }
function bundle() {
  return readdirSync(DIST_JS).filter(f => f.endsWith('.js'))
    .map(f => read(path.join(DIST_JS, f))).join('\n');
}

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.error('  FAIL', name, '-', e.message); fail++; }
}
function expect(v) {
  return {
    toMatch: (re) => { if (!re.test(v)) throw new Error('Expected to match: ' + re); },
    not: { toMatch: (re) => { if (re.test(v)) throw new Error('Expected NOT to match: ' + re); } },
  };
}

const dbSrc = read(path.join(ROOT, 'src/lib/db.ts'));
const storeSrc = read(path.join(ROOT, 'src/stores/useNotesStore.ts'));
const authSrc = read(path.join(ROOT, 'src/components/landing/AuthModal.tsx'));
const cloudSrc = read(path.join(ROOT, 'src/components/CloudSyncModal.tsx'));
const accountSrc = read(path.join(ROOT, 'src/components/landing/AccountModal.tsx'));
const bundleSrc = bundle();

// Extract toggleChecklistItem block precisely (from declaration to next top-level method)
const toggleStart = storeSrc.indexOf('toggleChecklistItem: (noteId, itemId)');
const toggleEnd = storeSrc.indexOf('\n  toggleStar:', toggleStart);
const toggleBlock = storeSrc.slice(toggleStart, toggleEnd);

// Extract syncFromDB block precisely
const syncStart = storeSrc.indexOf('syncFromDB: async');
const syncEnd = storeSrc.indexOf('\n  addNote:', syncStart);
const syncBlock = storeSrc.slice(syncStart, syncEnd);

console.log('\n=== Security Containment Tests ===\n');

// ── db.ts ──────────────────────────────────────────────────────────────────
test('[db.ts] No hardcoded auth token (JWT pattern)', () => expect(dbSrc).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/));
test('[db.ts] No Turso domain', () => expect(dbSrc).not.toMatch(/turso\.io/));
test('[db.ts] No @libsql/client import', () => expect(dbSrc).not.toMatch(/@libsql\/client/));
test('[db.ts] No .execute() calls (all stubs)', () => expect(dbSrc).not.toMatch(/\.execute\(/));
test('[db.ts] All 8 cloud functions exported as stubs', () => {
  ['initDatabase','fetchNotesFromDB','insertNoteToDB','updateNoteInDB','deleteNoteFromDB',
   'fetchDiaryEntriesFromDB','insertDiaryEntryToDB','deleteDiaryEntryFromDB']
    .forEach(fn => {
      if (!dbSrc.includes('export async function ' + fn))
        throw new Error('Missing stub export: ' + fn);
    });
});

// ── Production bundle ──────────────────────────────────────────────────────
test('[bundle] No Turso domain in dist JS', () => expect(bundleSrc).not.toMatch(/turso\.io/));
test('[bundle] No createClient in dist JS', () => expect(bundleSrc).not.toMatch(/createClient/));
test('[bundle] No @libsql in dist JS', () => expect(bundleSrc).not.toMatch(/@libsql/));

// ── Store ──────────────────────────────────────────────────────────────────
test('[store] cloudSyncEnabled hardcoded false (not from localStorage)', () =>
  expect(storeSrc).toMatch(/cloudSyncEnabled:\s*false/));
test('[store] No insertNoteToDB calls', () => expect(storeSrc).not.toMatch(/insertNoteToDB/));
test('[store] No updateNoteInDB calls', () => expect(storeSrc).not.toMatch(/updateNoteInDB/));
test('[store] No deleteNoteFromDB calls', () => expect(storeSrc).not.toMatch(/deleteNoteFromDB/));
test('[store] No insertDiaryEntryToDB calls', () => expect(storeSrc).not.toMatch(/insertDiaryEntryToDB/));
test('[store] activateCloudSync is disabled stub', () =>
  expect(storeSrc).toMatch(/activateCloudSync.*permanently disabled/s));
test('[store] syncFromDB is no-op (no live DB calls)', () => {
  if (/fetchNotesFromDB|initDatabase|fetchDiaryEntriesFromDB/.test(syncBlock))
    throw new Error('syncFromDB still calls live DB functions');
});
test('[store] addNote writes to localStorage', () =>
  expect(storeSrc).toMatch(/localStorage\.setItem.*STORAGE_KEY/));
test('[store] updateNote writes to localStorage', () =>
  expect(storeSrc).toMatch(/updateNote[\s\S]*?localStorage/));
test('[store] deleteNote writes to localStorage', () =>
  expect(storeSrc).toMatch(/deleteNote[\s\S]*?localStorage/));

// ── toggleChecklistItem card reorder fix ──────────────────────────────────
test('[store] toggleChecklistItem: does NOT mutate updatedAt (prevents card reorder)', () => {
  if (/updatedAt.*new Date/.test(toggleBlock))
    throw new Error('updatedAt is mutated — will cause card reorder on checklist toggle');
});
test('[store] toggleChecklistItem: DOES write to localStorage (local persistence)', () => {
  if (!/localStorage/.test(toggleBlock))
    throw new Error('localStorage not written — checklist state not persisted');
});

// ── AuthModal ──────────────────────────────────────────────────────────────
test('[AuthModal] No setTimeout() invocation (no fake auth)', () =>
  expect(authSrc).not.toMatch(/setTimeout\s*\(/));
test('[AuthModal] No handleQuickDemo (hardcoded demo login)', () =>
  expect(authSrc).not.toMatch(/handleQuickDemo/));
test('[AuthModal] No login() call (no fake auth success)', () =>
  expect(authSrc).not.toMatch(/login\s*\(/));
test('[AuthModal] No activateCloudSync call', () =>
  expect(authSrc).not.toMatch(/activateCloudSync/));
test('[AuthModal] Displays unavailability notice to user', () =>
  expect(authSrc).toMatch(/chưa khả dụng|bị vô hiệu hoá/));

// ── CloudSyncModal ─────────────────────────────────────────────────────────
test('[CloudSyncModal] No activateCloudSync call', () =>
  expect(cloudSrc).not.toMatch(/activateCloudSync/));
test('[CloudSyncModal] No syncFromDB call', () =>
  expect(cloudSrc).not.toMatch(/syncFromDB/));
test('[CloudSyncModal] Displays unavailability notice to user', () =>
  expect(cloudSrc).toMatch(/bị vô hiệu hoá|tạm thời/));

// ── AccountModal ──────────────────────────────────────────────────────────
test('[AccountModal] No syncFromDB call (no Sync Now button)', () =>
  expect(accountSrc).not.toMatch(/syncFromDB/));
test('[AccountModal] No isSyncing state (no cloud UI)', () =>
  expect(accountSrc).not.toMatch(/isSyncing/));
test('[AccountModal] Displays unavailability notice', () =>
  expect(accountSrc).toMatch(/bị vô hiệu hoá/));

console.log('\n=== Results ===');
console.log(`PASS: ${pass}   FAIL: ${fail}`);
if (fail > 0) {
  console.error('\n❌ Security containment incomplete — see FAIL lines above.');
  process.exit(1);
} else {
  console.log('\n✅ All security containment checks passed.\n');
}
