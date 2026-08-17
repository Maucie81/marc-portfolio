/**
 * Interval-based medication configs and dose row computation.
 */

export interface MedicationPhase {
  switchDate: string;
  afterIntervalHours: number;
  afterDosesPerDay: number;
}

export interface MedicationConfig {
  id: string;
  name: string;
  doseLabel: string;
  frequencyLabel: string;
  intervalHours: number;
  dosesPerDay: number;
  suggestedFirstDose: string;
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
  isSuggested: boolean;
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
    suggestedFirstDose: "07:30",
    endDate: "2026-03-05",
  },
  {
    id: "gabapentin",
    name: "Gabapentin 300mg",
    doseLabel: "1 capsule",
    frequencyLabel: "1 capsule every 8 hours",
    intervalHours: 8,
    dosesPerDay: 3,
    suggestedFirstDose: "07:30",
    note: "Give 1–2 hours before recheck appointment",
  },
  {
    id: "trazodone",
    name: "Trazodone",
    doseLabel: "1.5–2 tablets",
    frequencyLabel: "1.5–2 tablets every 8–12 hours as needed",
    intervalHours: 8,
    dosesPerDay: 3,
    suggestedFirstDose: "07:30",
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
    suggestedFirstDose: "07:30",
    note: "Always give with food",
    phase: {
      switchDate: "2026-03-13",
      afterIntervalHours: 24,
      afterDosesPerDay: 1,
    },
  },
  {
    id: "simplicef",
    name: "Simplicef 200mg",
    doseLabel: "1 tablet",
    frequencyLabel: "1 tablet every 24 hours",
    intervalHours: 24,
    dosesPerDay: 1,
    suggestedFirstDose: "07:30",
    note: "With food",
    startDate: "2026-03-04",
    endDate: "2026-03-13",
  },
];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseSuggestedFirst(s: string): { hour: number; minute: number } {
  const [h, m] = s.split(":").map(Number);
  return { hour: h ?? 7, minute: m ?? 30 };
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

/** Format suggested first dose "07:30" -> "7:30 AM". */
function formatSuggestedFirst(s: string): string {
  const { hour, minute } = parseSuggestedFirst(s);
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m} ${period}`;
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
        frequencyLabel:
          c.phase.afterIntervalHours === 24
            ? "1 tablet every 24 hours"
            : `1 tablet every ${c.phase.afterIntervalHours} hours`,
      });
    } else {
      out.push({ ...c });
    }
  }
  return out;
}

/**
 * Build dose rows for one medication: all given doses + the next due/suggested dose only.
 * getGivenAt(medId, doseIndex) returns ISO string or null.
 */
export function getDoseRowsForMedication(
  config: MedicationConfig,
  today: Date,
  getGivenAt: (medId: string, doseIndex: number) => string | null
): DoseRowDisplay[] {
  const rows: DoseRowDisplay[] = [];
  const { suggestedFirstDose, intervalHours, dosesPerDay, asNeeded } = config;
  const [sugH, sugM] = suggestedFirstDose.split(":").map(Number);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

  for (let i = 0; i < dosesPerDay; i++) {
    const givenIso = getGivenAt(config.id, i);

    if (givenIso) {
      const givenAt = new Date(givenIso);
      rows.push({
        doseIndex: i,
        doseNumber: i + 1,
        label: `Given ${formatTimeFromDate(givenAt)}`,
        givenAt: givenIso,
        dueTime: null,
        checked: true,
        isSuggested: false,
      });
      continue;
    }

    // Next unchecked dose
    let dueTime: Date;
    if (i === 0) {
      dueTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sugH ?? 7, sugM ?? 30, 0);
    } else {
      const prevIso = getGivenAt(config.id, i - 1);
      if (!prevIso) break;
      const prev = new Date(prevIso);
      dueTime = new Date(prev.getTime() + intervalHours * 60 * 60 * 1000);
    }
    const dueLabel = asNeeded ? "Suggested" : "Due";
    rows.push({
      doseIndex: i,
      doseNumber: i + 1,
      label: `${dueLabel} ${formatTimeFromDate(dueTime)}`,
      givenAt: null,
      dueTime,
      checked: false,
      isSuggested: !!asNeeded,
    });
    break;
  }
  return rows;
}

export function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
