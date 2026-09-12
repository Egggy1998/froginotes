/**
 * UI Regression Checks — FrogiNotes
 * Chạy: npx tsx scripts/test-ui-regression.ts
 * Exit 0 = pass, exit 1 = fail
 *
 * Phạm vi: UI-only (types, logic component). Không cần browser/Electron.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const TSC = path.join(ROOT, 'node_modules', '.bin', 'tsc');

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${e.message}`);
    failures.push(name);
    failed++;
  }
}

function assertNoString(file: string, pattern: RegExp, msg: string) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  if (pattern.test(src)) throw new Error(msg);
}

function assertContains(file: string, pattern: RegExp, msg: string) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  if (!pattern.test(src)) throw new Error(msg);
}

// ─── TypeScript compile ────────────────────────────────────────────────────
console.log('\n[1] TypeScript');

check('tsc — NoteModal không còn lỗi _pendingNewNoteFolderId', () => {
  const out = execSync(`"${TSC}" --noEmit 2>&1 || true`, { cwd: ROOT, encoding: 'utf-8' });
  if (/NoteModal.*_pendingNewNoteFolderId/.test(out))
    throw new Error('NoteModal vẫn lỗi _pendingNewNoteFolderId:\n' + out);
});

check('tsc — TapedPhotoCard không còn lỗi MascotMood vs "none"', () => {
  const out = execSync(`"${TSC}" --noEmit 2>&1 || true`, { cwd: ROOT, encoding: 'utf-8' });
  if (/TapedPhotoCard.*MascotMood.*none/.test(out) || /TapedPhotoCard.*2367/.test(out))
    throw new Error('TapedPhotoCard vẫn lỗi MascotMood:\n' + out);
});

// ─── Source-level logic checks ─────────────────────────────────────────────
console.log('\n[2] NoteModal — filter & date logic');

check('buildChip dùng local date parts (không dùng toISOString cho isSameDay)', () => {
  // Correct: so sánh getFullYear/getMonth/getDate (đã đúng trong source)
  assertContains(
    'src/components/NoteModal.tsx',
    /targetDate\.getFullYear\(\) === today\.getFullYear\(\)/,
    'buildChip không còn so sánh local date parts — kiểm tra lại'
  );
});

check('handleSetQuickPreset không đặt reminderTime về default khi chọn preset', () => {
  // Preset buttons chỉ set date, không reset time — đúng behaviour
  const src = fs.readFileSync(path.join(ROOT, 'src/components/NoteModal.tsx'), 'utf-8');
  const fnMatch = src.match(/handleSetQuickPreset[\s\S]{0,600}?setReminderDate/);
  if (!fnMatch) throw new Error('Không tìm thấy handleSetQuickPreset hoặc setReminderDate bên trong');
  // Đảm bảo function KHÔNG reset reminderTime
  if (/setReminderTime/.test(fnMatch[0]))
    throw new Error('handleSetQuickPreset không nên reset reminderTime');
});

check('enableDate checkbox auto-sets date khi chưa có', () => {
  assertContains(
    'src/components/NoteModal.tsx',
    /e\.target\.checked && !reminderDate/,
    'Checkbox enableDate thiếu guard auto-set date'
  );
});

check('Checklist Enter key thêm item mới ở đúng vị trí (splice sau idx)', () => {
  assertContains(
    'src/components/NoteModal.tsx',
    /\.\.\.prev\.slice\(0, idx \+ 1\)[\s\S]{0,50}newItem[\s\S]{0,50}\.\.\.prev\.slice\(idx \+ 1\)/,
    'Checklist Enter insertion không đúng thứ tự slice'
  );
});

check('Checklist Backspace xóa item chỉ khi length > 1', () => {
  assertContains(
    'src/components/NoteModal.tsx',
    /Backspace.*checklistItems\.length > 1/,
    'Checklist Backspace thiếu guard length > 1'
  );
});

// ─── NoteGrid filter checks ─────────────────────────────────────────────────
console.log('\n[3] NoteGrid — filter logic');

check('Trash view loại notes không phải isTrash', () => {
  assertContains(
    'src/components/NoteGrid.tsx',
    /activeNav === 'trash'[\s\S]{0,100}!note\.isTrash/,
    'Trash filter không có guard !note.isTrash'
  );
});

check('Archive view loại note.isTrash', () => {
  assertContains(
    'src/components/NoteGrid.tsx',
    /isArchived[\s\S]{0,60}note\.isTrash/,
    'Archive filter thiếu loại isTrash'
  );
});

check('activeFolder có độ ưu tiên cao hơn activeNav filter', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/NoteGrid.tsx'), 'utf-8');
  // activeFolder check phải đứng TRƯỚC activeNav nav-section filters (today/starred/reminders)
  const folderIdx = src.indexOf("if (activeFolder)");
  const todayIdx = src.indexOf("activeNav === 'today'");
  if (folderIdx === -1 || todayIdx === -1) throw new Error('Không tìm thấy các block filter');
  if (folderIdx > todayIdx) throw new Error('activeFolder check nằm SAU activeNav filters — ưu tiên sai');
});

check('Search filter tìm trong title, content, bullets, checklist', () => {
  assertContains(
    'src/components/NoteGrid.tsx',
    /matchChecklist.*checklist.*some/,
    'Search không tìm trong checklist'
  );
});

// ─── CalendarView checks ────────────────────────────────────────────────────
console.log('\n[4] CalendarView');

check('CalendarView dùng local date parts cho dateStr (không bị TZ offset)', () => {
  // getNotesForDate dùng startsWith(dateStr) — dateStr được build từ local parts với padStart
  assertContains(
    'src/components/calendar/CalendarView.tsx',
    /padStart\(2, '0'\)/,
    'CalendarView dateStr không dùng padStart local parts — có thể bị timezone offset'
  );
});

check('todayStr trong CalendarView dùng localTodayStr() (local timezone, không phải UTC)', () => {
  // FIXED: replaced new Date().toISOString().split('T')[0] (UTC) with localTodayStr() (local TZ)
  assertContains(
    'src/components/calendar/CalendarView.tsx',
    /localTodayStr\(\)/,
    'todayStr chưa dùng localTodayStr() — vẫn có thể lệch ngày ở timezone +07'
  );
});

check('CalendarView getNotesForDate loại trash và archive', () => {
  assertContains(
    'src/components/calendar/CalendarView.tsx',
    /n\.isTrash.*n\.isArchived/,
    'getNotesForDate không loại trash/archive'
  );
});

check('dayDiary aria title có mood', () => {
  assertContains(
    'src/components/calendar/CalendarView.tsx',
    /title=\{`\$\{t\.calendarDiaryMood\}: \$\{dayDiary\.mood\}`\}/,
    'Diary mood stamp thiếu accessible title'
  );
});

// ─── DiaryView checks ───────────────────────────────────────────────────────
console.log('\n[5] DiaryView');

check('DiaryView handleSave guard content hoặc title hoặc photoUrl', () => {
  assertContains(
    'src/components/diary/DiaryView.tsx',
    /!content\.trim\(\) && !title\.trim\(\) && !photoUrl/,
    'DiaryView save không có guard empty entry'
  );
});

check('DiaryView edit timeline populates tất cả fields bao gồm tapeStyle', () => {
  assertContains(
    'src/components/diary/DiaryView.tsx',
    /setTapeStyle\(entry\.tapeStyle/,
    'Edit diary entry không restore tapeStyle'
  );
});

check('DiaryView formatDate dùng local parts (không toISOString)', () => {
  // formatDate dùng split('-') + new Date(y,m,d) — correct local date
  assertContains(
    'src/components/diary/DiaryView.tsx',
    /parts\.length === 3[\s\S]{0,80}parseInt\(parts\[0\]\)/,
    'DiaryView formatDate không dùng local parts'
  );
});

check('DiaryView date picker onChange reset fields khi chuyển sang ngày khác', () => {
  assertContains(
    'src/components/diary/DiaryView.tsx',
    /const found = diaryEntries\.find/,
    'DiaryView date picker không tìm entry cho ngày mới'
  );
});

// ─── TapedPhotoCard checks ──────────────────────────────────────────────────
console.log('\n[6] TapedPhotoCard');

check('TapedPhotoCard mascot prop không còn so sánh với "none" (union không overlap)', () => {
  assertNoString(
    'src/components/TapedPhotoCard.tsx',
    /mascot !== 'none'/,
    "TapedPhotoCard vẫn còn so sánh mascot !== 'none' — tsc error TS2367"
  );
});

check('TapedPhotoCard prop mascot type là MascotMood (optional, không có "none")', () => {
  assertContains(
    'src/components/TapedPhotoCard.tsx',
    /mascot\?:\s*MascotMood/,
    'TapedPhotoCard prop mascot thiếu type MascotMood'
  );
});

// ─── Sidebar checks ─────────────────────────────────────────────────────────
console.log('\n[7] Sidebar');

check('Sidebar nav buttons có role button (implicit từ <button>)', () => {
  // Các nav items là <button> — OK, không cần check thêm
  assertContains(
    'src/components/Sidebar.tsx',
    /<button[\s\S]{0,200}setActiveNav/,
    'Sidebar nav items không phải <button>'
  );
});

check('Sidebar folder count chỉ đếm non-trash non-archived', () => {
  assertContains(
    'src/components/Sidebar.tsx',
    /!n\.isTrash && !n\.isArchived/,
    'getFolderCount không loại trash/archived'
  );
});

// ─── StickyCard checks ──────────────────────────────────────────────────────
console.log('\n[8] StickyCard');

check('StickyCard checklist toggle dùng stopPropagation (không mở modal khi toggle)', () => {
  assertContains(
    'src/components/StickyCard.tsx',
    /e\.stopPropagation[\s\S]{0,30}toggleChecklistItem/,
    'StickyCard checklist toggle thiếu stopPropagation'
  );
});

check('StickyCard dropdown menu có overlay để đóng khi click outside', () => {
  assertContains(
    'src/components/StickyCard.tsx',
    /fixed inset-0[^\n]*\n\s*onClick.*setShowMenu\(false\)/,
    'StickyCard dropdown thiếu outside-click overlay'
  );
});

// ─── i18n completeness ──────────────────────────────────────────────────────
console.log('\n[9] i18n');

check('i18n vi và en có đủ cùng số key', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/lib/i18n.ts'), 'utf-8');
  // Extract key names từ vi: và en: blocks
  const viBlock = src.match(/vi:\s*\{([\s\S]+?)\n  \},/)?.[1] || '';
  const enBlock = src.match(/en:\s*\{([\s\S]+?)\n  \},/)?.[1] || '';
  const viKeys = (viBlock.match(/^\s+(\w+):/gm) || []).length;
  const enKeys = (enBlock.match(/^\s+(\w+):/gm) || []).length;
  if (viKeys !== enKeys)
    throw new Error(`i18n key count mismatch: vi=${viKeys}, en=${enKeys}`);
});

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log(`Kết quả: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.error('\nFailed checks:');
  failures.forEach(f => console.error(`  ❌ ${f}`));
  process.exit(1);
} else {
  console.log('\n✅ Tất cả UI regression checks passed!');
  process.exit(0);
}
