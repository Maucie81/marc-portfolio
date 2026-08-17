/**
 * Interval-based dose tracking: store timestamp per dose, reset at midnight.
 */

const DOSE_PREFIX = "harrison_dose_";
const LAST_RESET_KEY = "harrison_last_reset_date";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function doseKey(medId: string, doseIndex: number): string {
  return `${DOSE_PREFIX}${medId}_${doseIndex}`;
}

/** Call on read/write: if we're on a new day, clear all dose records and set lastResetDate. */
export function ensureReset(): void {
  if (typeof window === "undefined") return;
  const today = todayKey();
  const last = localStorage.getItem(LAST_RESET_KEY);
  if (last === today) return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(DOSE_PREFIX)) keysToRemove.push(k);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  localStorage.setItem(LAST_RESET_KEY, today);
}

/** Get when this dose was given (today), or null if not yet given. */
export function getGivenAt(medId: string, doseIndex: number): string | null {
  if (typeof window === "undefined") return null;
  ensureReset();
  return localStorage.getItem(doseKey(medId, doseIndex));
}

/** Record that this dose was given at the given ISO timestamp. */
export function setGivenAt(medId: string, doseIndex: number, isoTimestamp: string): void {
  if (typeof window === "undefined") return;
  ensureReset();
  localStorage.setItem(doseKey(medId, doseIndex), isoTimestamp);
}

/** Count total doses given today across the listed med configs (each with dosesPerDay). */
export function getCheckedCountToday(
  configs: Array<{ id: string; dosesPerDay: number }>,
  getGivenAtFn: (medId: string, doseIndex: number) => string | null
): number {
  if (typeof window === "undefined") return 0;
  ensureReset();
  let count = 0;
  for (const c of configs) {
    for (let i = 0; i < c.dosesPerDay; i++) {
      if (getGivenAtFn(c.id, i)) count++;
    }
  }
  return count;
}

/** Total number of doses (all meds) for today — used for "X of Y doses given". */
export function getTotalDosesTodayFromConfigs(configs: Array<{ dosesPerDay: number }>): number {
  return configs.reduce((sum, c) => sum + c.dosesPerDay, 0);
}
