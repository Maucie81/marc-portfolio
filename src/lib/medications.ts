/**
 * Sequential unlock dose logic: due times from previous dose timestamp + interval.
 */

export interface MedicationPhase {
  switchDate: string;
  afterIntervalHours: number;
  afterDosesPerDay: number;
  afterFrequencyLabel: string;
}

export interface MedicationConfig {
  id: string;
  name: string;
  doseLabel: string;
  frequencyLabel: string;
  intervalHours: number;
  dosesPerDay: number;
  note?: string;
  asNeeded?: boolean;
  startDate?: string;
  endDate?: string;
  phase?: MedicationPhase;
}

export interface DoseRowDisplay {
  doseIndex: number;
  doseNumber: number;
  label: string;
  givenAt: string | null;
  dueTime: Date | null;
  checked: boolean;
  locked: boolean;
  isSuggested: boolean;
  canUncheck: boolean;
}

const SURGERY_DATE = "2026-03-02";

const MEDICATION_CONFIGS: MedicationConfig[] = [
  {
    id: "codeine",
    name: "Codeine 30mg",
    doseLabel: "1 tablet",
    frequencyLabel: "1 tablet every 8 hours",
    intervalHours: 8,
    dosesPerDay: 3,
    endDate: "2026-03-05",
  },
  {
    id: "gabapentin",
    name: "Gabapentin 300mg",
    doseLabel: "1 capsule",
    frequencyLabel: "1 capsule every 8 hours",
    intervalHours: 8,
    dosesPerDay: 3,
    note: "Give 1–2 hours before recheck appointment",
  },
  {
    id: "trazodone",
    name: "Trazodone",
    doseLabel: "1.5–2 tablets",
    frequencyLabel: "1.5–2 tablets every 8–12 hours as needed",
    intervalHours: 8,
    dosesPerDay: 3,
    asNeeded: true,
    note: "As needed for activity restriction. May cause drowsiness.",
  },
  {
    id: "carprofen",
    name: "Carprofen 75mg",
    doseLabel: "1 tablet",
    frequencyLabel: "1 tablet every 12 hours",
    intervalHours: 12,
    dosesPerDay: 2,
    note: "Always give with food",
    phase: {
      switchDate: "2026-03-13",
      afterIntervalHours: 24,
      afterDosesPerDay: 1,
      afterFrequencyLabel: "1 tablet every 24 hours",
    },
  },
  {
    id: "simplicef",
    name: "Simplicef 200mg",
    doseLabel: "1 tablet",
    frequencyLabel: "1 tablet every 24 hours",
    intervalHours: 24,
    dosesPerDay: 1,
    note: "With food",
    startDate: "2026-03-04",
    endDate: "2026-03-13",
  },
];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Format time as "7:30 AM", "3:47 PM". */
export function formatTimeFromDate(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min = m.toString().padStart(2, "0");
  return `${hour}:${min} ${period}`;
}

/** Return configs active on this date (start/end, phase applied for Carprofen). */
export function getMedicationConfigsForDate(date: Date): MedicationConfig[] {
  const d = dateKey(date);
  const out: MedicationConfig[] = [];

  for (const c of MEDICATION_CONFIGS) {
    if (d < SURGERY_DATE) continue;
    if (c.startDate && d < c.startDate) continue;
    if (c.endDate && d > c.endDate) continue;

    if (c.phase && d >= c.phase.switchDate) {
      out.push({
        ...c,
        intervalHours: c.phase.afterIntervalHours,
        dosesPerDay: c.phase.afterDosesPerDay,
        frequencyLabel: c.phase.afterFrequencyLabel,
      });
    } else {
      out.push({ ...c } as MedicationConfig);
    }
  }
  return out;
}

export function getDueTime(
  doseIndex: number,
  givenTimestamps: (string | null)[],
  intervalHours: number
): Date | null {
  if (doseIndex === 0) return null;
  const previousGivenAt = givenTimestamps[doseIndex - 1];
  if (!previousGivenAt) return null;
  return new Date(
    new Date(previousGivenAt).getTime() + intervalHours * 60 * 60 * 1000
  );
}

export function getDoseRowsForMedication(
  config: MedicationConfig,
  getGivenAt: (medId: string, doseIndex: number) => string | null
): DoseRowDisplay[] {
  const { id, intervalHours, dosesPerDay, asNeeded } = config;
  const givenTimestamps: (string | null)[] = [];
  for (let i = 0; i < dosesPerDay; i++) {
    givenTimestamps.push(getGivenAt(id, i));
  }

  let lastCheckedIndex = -1;
  for (let i = dosesPerDay - 1; i >= 0; i--) {
    if (givenTimestamps[i]) {
      lastCheckedIndex = i;
      break;
    }
  }

  const rows: DoseRowDisplay[] = [];
  for (let i = 0; i < dosesPerDay; i++) {
    const givenIso = givenTimestamps[i];
    const dueTime = getDueTime(i, givenTimestamps, intervalHours);

    if (givenIso) {
      rows.push({
        doseIndex: i,
        doseNumber: i + 1,
        label: `Given ${formatTimeFromDate(new Date(givenIso))}`,
        givenAt: givenIso,
        dueTime: null,
        checked: true,
        locked: false,
        isSuggested: false,
        canUncheck: i === lastCheckedIndex,
      });
      continue;
    }

    const locked = dueTime === null;
    const timeLabel = dueTime
      ? (asNeeded ? "Suggested" : "Due") + ` ${formatTimeFromDate(dueTime)}`
      : "";

    rows.push({
      doseIndex: i,
      doseNumber: i + 1,
      label: timeLabel,
      givenAt: null,
      dueTime,
      checked: false,
      locked,
      isSuggested: !!asNeeded,
      canUncheck: false,
    });
  }
  return rows;
}

export function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
