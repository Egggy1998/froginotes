// Cryptographic utilities — Web Crypto API (available in Workers runtime)

/** SHA-256 hash of a string → hex string */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Generate cryptographically random hex string of `bytes` bytes */
export function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Generate a UUID v4 */
export function uuidv4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

/** Constant-time string comparison to prevent timing attacks */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Validate email format (RFC 5322 simplified) */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}

/** Current UTC ISO8601 string */
export function now(): string {
  return new Date().toISOString();
}

/** ISO8601 string N minutes from now */
export function addMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

/** ISO8601 string N days from now */
export function addDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

/** Is the given ISO8601 string in the past? */
export function isPast(isoString: string): boolean {
  return new Date(isoString).getTime() < Date.now();
}
