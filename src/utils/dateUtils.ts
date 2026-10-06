/**
 * Centralized local date utility.
 * Always operates using the device's local calendar day and timezone.
 * Prevents UTC timezone conversion offsets (e.g. 2026-10-05 becoming 2026-10-04).
 */

/**
 * Returns a YYYY-MM-DD date key based strictly on local calendar time.
 */
export function getLocalDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object set to local midnight.
 */
export function parseLocalDateKey(dateStr: string): Date {
  if (!dateStr || !dateStr.includes('-')) {
    return new Date();
  }
  const parts = dateStr.split('T')[0].split('-').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * Formats a YYYY-MM-DD calendar date string into a localized display string.
 */
export function formatLocalDateKey(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  const parsed = parseLocalDateKey(dateStr);
  return parsed.toLocaleDateString('en-US', options);
}

/**
 * Compares dateStr with today's local date key.
 */
export function isOverdue(dateStr: string, todayStr: string = getLocalDateKey()): boolean {
  if (!dateStr) return false;
  return dateStr.trim() < todayStr;
}

export function isToday(dateStr: string, todayStr: string = getLocalDateKey()): boolean {
  if (!dateStr) return false;
  return dateStr.trim() === todayStr;
}

export function isUpcoming(dateStr: string, todayStr: string = getLocalDateKey()): boolean {
  if (!dateStr) return false;
  return dateStr.trim() > todayStr;
}
