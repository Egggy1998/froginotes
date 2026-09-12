/**
 * security-containment-regression.ts
 *
 * Standalone Bun-runnable regression script — no test framework required.
 * Verifies that all security containment changes are in effect.
 *
 * Run with: bun run scripts/security-containment-regression.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT    = join(__dirname, '..');
const SRC     = join(ROOT, 'src');
const DIST_JS = join(ROOT, 'dist', 'assets');
const SRC_DB      = join(SRC, 'lib',    'db.ts');
const SRC_STORE   = join(SRC, 'stores', 'useNotesStore.ts');
const SRC_AUTH    = join(SRC, 'components', 'landing', 'AuthModal.tsx');
const SRC_CLOUD   = join(SRC, 'components', 'CloudSyncModal.tsx');
const SRC_ACCOUNT = join(SRC, 'components', 'landing', 'AccountModal.tsx');

// ── Tiny test harness ─────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS  ${name}`);
    passed++;
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error(`  ❌ FAIL  ${name}\n           ${msg}`);
    failures.push(`${name}: ${msg}`);
    failed++;
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function assertMatch(src: string, pattern: RegExp, msg: string) {
  assert(pattern.test(src), msg);
}

function assertNoMatch(src: string, pattern: RegExp, msg: string) {
  assert(!pattern.test(src), msg);
}

function readSrc(path: string): string {
  assert(existsSync(path), `File not found: ${path}`);
  return readFileSync(path, 'utf-8');
}

function getBundleContent(): string {
  assert(existsSync(DIST_JS), `dist/assets not found — run \`bun run build\` first: ${DIST_JS}`);
  const files = readdirSync(DIST_JS).filter(f => f.endsWith('.js'));
  assert(files.length > 0, 'No .js files in dist/assets');
  return files.map(f => readFileSync(join(DIST_JS, f), 'utf-8')).join('\n');
}

// ── 1. No credentials in source ───────────────────────────────────────────────
console.log('\n[1] db.ts — No hardcoded auth token or cloud client');
check('db.ts: no JWT-like token', () => {
  const src = readSrc(SRC_DB);
  assertNoMatch(src, /eyJ[A-Za-z0-9_-]{20,}/, 'Found JWT-like token in db.ts');
});
check('db.ts: no turso.io URL', () => {
  const src = readSrc(SRC_DB);
  assertNoMatch(src, /turso\.io/, 'Found turso.io reference in db.ts');
});
check('db.ts: no @libsql/client import', () => {
  const src = readSrc(SRC_DB);
  assertNoMatch(src, /@libsql\/client/, 'Found @libsql/client import in db.ts');
});

// ── 2. No credentials in production bundle ────────────────────────────────────
console.log('\n[2] dist bundle — No Turso/libsql credentials');
check('bundle: no JWT token (100+ chars)', () => {
  const bundle = getBundleContent();
  assertNoMatch(bundle, /eyJ[A-Za-z0-9_-]{100,}/, 'Found JWT token in bundle');
});
check('bundle: no turso.io', () => {
  const bundle = getBundleContent();
  assertNoMatch(bundle, /turso\.io/, 'Found turso.io in bundle');
});
check('bundle: no @libsql', () => {
  const bundle = getBundleContent();
  assertNoMatch(bundle, /@libsql/, 'Found @libsql reference in bundle');
});

// ── 3. Store: cloudSyncEnabled always false ───────────────────────────────────
console.log('\n[3] store — cloudSyncEnabled hardcoded false');
check('store: cloudSyncEnabled: false present', () => {
  const src = readSrc(SRC_STORE);
  assertMatch(src, /cloudSyncEnabled:\s*false/, 'cloudSyncEnabled is not set to literal false in store init');
});
check('store: cloudSyncEnabled init not derived from localStorage', () => {
  const src = readSrc(SRC_STORE);
  // The initial state block must set cloudSyncEnabled: false (literal), not read from localStorage.
  // We look for the pattern where cloudSyncEnabled is assigned a truthy localStorage value.
  // A removeItem call on SYNC_ENABLED_KEY (in disableCloudSync) is fine — we exclude that.
  assertNoMatch(src, /localStorage\.getItem\([^)]*SYNC_ENABLED[^)]*\)[\s\S]{0,300}cloudSyncEnabled/,
    'Store reads localStorage via getItem to derive cloudSyncEnabled initial value');
});

// ── 4. Store: activateCloudSync is a disabled stub ────────────────────────────
console.log('\n[4] store — activateCloudSync is a no-op stub');
check('store: activateCloudSync contains "permanently disabled"', () => {
  const src = readSrc(SRC_STORE);
  assertMatch(src, /activateCloudSync[\s\S]{0,500}permanently disabled/,
    'activateCloudSync does not mention "permanently disabled"');
});
check('store: activateCloudSync returns false', () => {
  const src = readSrc(SRC_STORE);
  assertMatch(src, /return false/, 'Store has no "return false" statement');
});
check('store: no insertNoteToDB', () => {
  assertNoMatch(readSrc(SRC_STORE), /insertNoteToDB/, 'Found insertNoteToDB in store');
});
check('store: no updateNoteInDB', () => {
  assertNoMatch(readSrc(SRC_STORE), /updateNoteInDB/, 'Found updateNoteInDB in store');
});
check('store: no deleteNoteFromDB', () => {
  assertNoMatch(readSrc(SRC_STORE), /deleteNoteFromDB/, 'Found deleteNoteFromDB in store');
});
check('store: no insertDiaryEntryToDB', () => {
  assertNoMatch(readSrc(SRC_STORE), /insertDiaryEntryToDB/, 'Found insertDiaryEntryToDB in store');
});
check('store: no deleteDiaryEntryFromDB', () => {
  assertNoMatch(readSrc(SRC_STORE), /deleteDiaryEntryFromDB/, 'Found deleteDiaryEntryFromDB in store');
});

// ── 5. Store: toggleChecklistItem does NOT update updatedAt ──────────────────
console.log('\n[5] store — toggleChecklistItem does not mutate updatedAt');
check('toggleChecklistItem: no updatedAt assignment', () => {
  const src = readSrc(SRC_STORE);
  // Extract the function body between toggleChecklistItem and the next top-level function
  const match = src.match(/toggleChecklistItem[\s\S]*?(?=\n  [a-zA-Z_][\w]*\s*[:(])/);
  assert(match !== null, 'Could not find toggleChecklistItem function body');
  const fnBody = match![0];
  assertNoMatch(fnBody, /updatedAt.*new Date/, 'toggleChecklistItem assigns updatedAt — would cause card reorder');
  assertNoMatch(fnBody, /NoteInDB|DiaryEntryToDB/, 'toggleChecklistItem calls a DB function');
});

// ── 6. AuthModal: no setTimeout fake auth ─────────────────────────────────────
console.log('\n[6] AuthModal — fake auth removed');
check('AuthModal: no setTimeout (functional code — comments exempt)', () => {
  const src = readSrc(SRC_AUTH);
  // Strip single-line and block comments before checking, so comment-only references don't fail.
  const noComments = src
    .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
    .replace(/\/\/[^\n]*/g, '');         // line comments
  assertNoMatch(noComments, /setTimeout/, 'Found setTimeout in AuthModal functional code (not a comment)');
});
check('AuthModal: no handleQuickDemo', () => {
  assertNoMatch(readSrc(SRC_AUTH), /handleQuickDemo/, 'Found handleQuickDemo in AuthModal');
});
check('AuthModal: shows unavailability message', () => {
  assertMatch(readSrc(SRC_AUTH), /chưa khả dụng|bị vô hiệu hoá|unavailable/i,
    'AuthModal does not show unavailability message to users');
});

// ── 7. CloudSyncModal: activation form removed ───────────────────────────────
console.log('\n[7] CloudSyncModal — activation UI removed');
check('CloudSyncModal: no handleActivate', () => {
  assertNoMatch(readSrc(SRC_CLOUD), /handleActivate/, 'Found handleActivate in CloudSyncModal');
});
check('CloudSyncModal: no activateCloudSync call', () => {
  assertNoMatch(readSrc(SRC_CLOUD), /activateCloudSync/, 'Found activateCloudSync in CloudSyncModal');
});
check('CloudSyncModal: no handleSyncNow', () => {
  assertNoMatch(readSrc(SRC_CLOUD), /handleSyncNow/, 'Found handleSyncNow in CloudSyncModal');
});
check('CloudSyncModal: no syncFromDB', () => {
  assertNoMatch(readSrc(SRC_CLOUD), /syncFromDB/, 'Found syncFromDB in CloudSyncModal');
});
check('CloudSyncModal: shows disabled message', () => {
  assertMatch(readSrc(SRC_CLOUD), /bị vô hiệu hoá|tạm thời/i,
    'CloudSyncModal does not show disabled/temporary message');
});

// ── 8. AccountModal: no cloud sync trigger ────────────────────────────────────
console.log('\n[8] AccountModal — cloud sync triggers removed');
check('AccountModal: no syncFromDB', () => {
  assertNoMatch(readSrc(SRC_ACCOUNT), /syncFromDB/, 'Found syncFromDB in AccountModal');
});
check('AccountModal: no handleSyncNow', () => {
  assertNoMatch(readSrc(SRC_ACCOUNT), /handleSyncNow/, 'Found handleSyncNow in AccountModal');
});
check('AccountModal: no isSyncing state', () => {
  assertNoMatch(readSrc(SRC_ACCOUNT), /isSyncing/, 'Found isSyncing in AccountModal');
});
check('AccountModal: shows unavailability notice', () => {
  assertMatch(readSrc(SRC_ACCOUNT), /bị vô hiệu hoá|unavailable/i,
    'AccountModal does not show unavailability notice');
});

// ── 9. db.ts: all exports are no-op stubs ─────────────────────────────────────
console.log('\n[9] db.ts — all cloud functions are stubs');
const cloudFns = [
  'initDatabase', 'fetchNotesFromDB', 'insertNoteToDB',
  'updateNoteInDB', 'deleteNoteFromDB', 'fetchDiaryEntriesFromDB',
  'insertDiaryEntryToDB', 'deleteDiaryEntryFromDB',
];
for (const fn of cloudFns) {
  check(`db.ts: ${fn} exported as async function`, () => {
    assertMatch(readSrc(SRC_DB), new RegExp(`export async function ${fn}`),
      `${fn} is not exported as async function`);
  });
}
check('db.ts: stubs return [] or false', () => {
  const src = readSrc(SRC_DB);
  assertMatch(src, /return \[\]|return false/, 'No stub return found in db.ts');
});
check('db.ts: no .execute() calls', () => {
  assertNoMatch(readSrc(SRC_DB), /\.execute\(/, 'Found .execute() call in db.ts — live SQL!');
});
check('db.ts: no dbClient.execute', () => {
  assertNoMatch(readSrc(SRC_DB), /dbClient\.execute/, 'Found dbClient.execute in db.ts — live SQL!');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.error('\nFailures:');
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('\n✅ All security containment checks passed.');
  process.exit(0);
}
