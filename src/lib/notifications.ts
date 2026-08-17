import type { MedicationConfig } from "./medications";
import { getDoseRowsForMedication } from "./medications";
import { formatTimeFromDate } from "./medications";
import { ensureReset } from "./storage";

const scheduledTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

export function scheduleNextDoseNotification(
  config: MedicationConfig,
  doseIndexJustChecked: number,
  getGivenAt: (medId: string, doseIndex: number) => string | null
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  const nextIndex = doseIndexJustChecked + 1;
  if (nextIndex >= config.dosesPerDay) return;

  if (scheduledTimeouts[config.id]) {
    clearTimeout(scheduledTimeouts[config.id]);
    delete scheduledTimeouts[config.id];
  }

  const rows = getDoseRowsForMedication(config, getGivenAt);
  const nextRow = rows[nextIndex];
  if (!nextRow?.dueTime) return;

  const dueMs = nextRow.dueTime.getTime();
  const nowMs = Date.now();
  const delayMs = Math.max(0, dueMs - nowMs);

  scheduledTimeouts[config.id] = setTimeout(() => {
    delete scheduledTimeouts[config.id];
    if (Notification.permission !== "granted") return;
    try {
      const timeStr = formatTimeFromDate(nextRow.dueTime!);
      const title = `Harrison · ${config.name}`;
      const body = config.asNeeded
        ? `Dose ${nextRow.doseNumber} suggested at ${timeStr} (as needed)`
        : `Dose ${nextRow.doseNumber} due at ${timeStr}`;
      new Notification(title, { body });
    } catch {}
  }, delayMs);
}

export function startDoseReminderChecks(
  configs: MedicationConfig[],
  getGivenAt: (medId: string, doseIndex: number) => string | null
): () => void {
  if (typeof window === "undefined") return () => {};
  const notified = new Set<string>();

  const check = () => {
    if (Notification.permission !== "granted") return;
    ensureReset();
    const now = new Date();

    for (const config of configs) {
      const rows = getDoseRowsForMedication(config, getGivenAt);
      const nextUnchecked = rows.find((r) => !r.checked);
      if (!nextUnchecked || !nextUnchecked.dueTime) continue;

      const dueMs = nextUnchecked.dueTime.getTime();
      const nowMs = now.getTime();
      const windowMs = 2 * 60 * 1000;
      if (nowMs < dueMs - windowMs) continue;

      const key = `${config.id}-${nextUnchecked.doseNumber}-${now.getDate()}-${now.getHours()}-${Math.floor(now.getMinutes() / 5)}`;
      if (notified.has(key)) continue;

      notified.add(key);
      try {
        const timeStr = formatTimeFromDate(nextUnchecked.dueTime);
        const title = `Harrison · ${config.name}`;
        const body = nextUnchecked.isSuggested
          ? `Dose ${nextUnchecked.doseNumber} suggested at ${timeStr} (as needed)`
          : `Dose ${nextUnchecked.doseNumber} due at ${timeStr}`;
        new Notification(title, { body });
      } catch {}
    }

    if (notified.size > 50) {
      Array.from(notified).slice(0, 20).forEach((x) => notified.delete(x));
    }
  };

  const id = setInterval(check, 60 * 1000);
  check();
  return () => clearInterval(id);
}
