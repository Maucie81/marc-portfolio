"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useCallback } from "react";
import { getMedicationConfigsForDate, getTodayFormatted } from "@/lib/medications";
import { ensureReset, getGivenAt, getCheckedCountToday, getTotalDosesTodayFromConfigs } from "@/lib/storage";
import { requestNotificationPermission, startDoseReminderChecks } from "@/lib/notifications";
import { MedicationCard } from "@/components/MedicationCard";
import { HarrisonInlineNav } from "@/components/HarrisonInlineNav";

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
  const [checkedCount, setCheckedCount] = useState(0);

  const configs = useMemo(() => getMedicationConfigsForDate(today), [today]);
  const totalDoses = useMemo(() => getTotalDosesTodayFromConfigs(configs), [configs]);

  const refreshCheckedCount = useCallback(() => {
    if (typeof window === "undefined") return;
    ensureReset();
    setCheckedCount(getCheckedCountToday(configs, getGivenAt));
  }, [configs]);

  useEffect(() => {
    ensureReset();
    refreshCheckedCount();
  }, [refreshCheckedCount]);

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
      <header className="relative border-b border-[#d3d4c5] pb-5 pt-14">
        <HarrisonInlineNav />
        <div className="flex flex-col items-center">
          <div className="h-[97px] w-[97px] shrink-0 overflow-hidden rounded-full">
            <Image src="/harrison/harrison-portrait.png" alt="" width={97} height={97} className="h-full w-full object-cover" priority />
          </div>
          <h1 className="harrison-display mt-3 text-[92px] font-bold leading-none tracking-[-2.76px] text-[#56440f]">
            Harrison!
          </h1>
        </div>
        <p className="mt-2 text-center text-[14px] font-medium text-[#56440f]" style={{ fontFamily: "var(--harrison-font-ui)" }}>
          {getTodayFormatted()}
          <span className="mx-[4px]" aria-hidden>|</span>
          {checkedCount} of {totalDoses} doses given
        </p>
      </header>
      <section className="mt-6 space-y-4">
        {configs.map((config) => (
          <MedicationCard key={config.id} config={config} today={today} onCheckChange={refreshCheckedCount} />
        ))}
      </section>
    </main>
  );
}
