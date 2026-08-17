"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { getMedicationConfigsForDate } from "@/lib/medications";
import { ensureReset, getGivenAt } from "@/lib/storage";
import { requestNotificationPermission, startDoseReminderChecks } from "@/lib/notifications";
import { MedicationCard } from "@/components/MedicationCard";
import { dispatchDosesChanged } from "@/components/DoseCounter";

function useToday() {
  const [today, setToday] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setToday(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return today;
}

export default function TodayPage() {
  const today = useToday();
  const configs = useMemo(() => getMedicationConfigsForDate(today), [today]);

  const refreshCheckedCount = useCallback(() => {
    if (typeof window === "undefined") return;
    ensureReset();
    dispatchDosesChanged();
  }, []);

  useEffect(() => {
    ensureReset();
    dispatchDosesChanged();
  }, []);

  useEffect(() => {
    let stop: (() => void) | undefined;
    const t = setTimeout(() => {
      requestNotificationPermission();
      stop = startDoseReminderChecks(configs, getGivenAt);
    }, 100);
    return () => {
      clearTimeout(t);
      stop?.();
    };
  }, [configs]);

  return (
    <main className="mx-auto max-w-lg px-4 pb-6 pt-safe">
      <section className="mt-6 space-y-4">
        {configs.map((config) => (
          <MedicationCard key={config.id} config={config} onCheckChange={refreshCheckedCount} />
        ))}
      </section>
    </main>
  );
}
