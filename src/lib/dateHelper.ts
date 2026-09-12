/**
 * dateHelper.ts — local-timezone date utilities
 *
 * new Date().toISOString() returns UTC, which causes an off-by-one day bug
 * for users in positive UTC offsets (e.g. +07:00) during the first hours of
 * the local day. Use localTodayStr() everywhere a "today" date string is needed.
 */

/**
 * Returns today's date as YYYY-MM-DD using the LOCAL timezone (not UTC).
 * Example in +07:00 at 00:30 local: returns "2026-09-12" (correct),
 * whereas new Date().toISOString().split('T')[0] would return "2026-09-11".
 */
export function localTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
