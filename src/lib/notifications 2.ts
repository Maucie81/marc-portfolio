import type { MedicationConfig } from "./medications";
import { getDoseRowsForMedication } from "./medications";
import { formatTimeFromDate } from "./medications";
import { ensureReset } from "./storage";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

/**
 * Run every minute: for each med, find next due dose; if due time is past (or within 2 min), show notification once.
 */
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
    const nowMs = now.getTime();

    for (const config of configs) {
      const rows = getDoseRowsForMedication(config, now, getGivenAt);
      const nextUnchecked = rows.find((r) => !r.checked);
      if (!nextUnchecked || !nextUnchecked.dueTime) continue;

      const dueMs = nextUnchecked.dueTime.getTime();
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
