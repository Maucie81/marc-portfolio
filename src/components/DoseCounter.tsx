"use client";

import { useState, useEffect, useCallback } from "react";
import { getMedicationConfigsForDate, getTodayFormatted } from "@/lib/medications";
import { ensureReset, getGivenAt, getCheckedCountToday, getTotalDosesTodayFromConfigs } from "@/lib/storage";

const DOSE_CHANGED_EVENT = "harrison-doses-changed";

export function DoseCounter() {
  const [today] = useState(() => new Date());
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalDoses, setTotalDoses] = useState(0);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    ensureReset();
    const configs = getMedicationConfigsForDate(today);
    setCheckedCount(getCheckedCountToday(configs, getGivenAt));
    setTotalDoses(getTotalDosesTodayFromConfigs(configs));
  }, [today]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(DOSE_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DOSE_CHANGED_EVENT, handler);
  }, [refresh]);

  return (
    <p className="mt-2 text-center text-[14px] font-medium text-[#56440f]" style={{ fontFamily: "var(--harrison-font-ui)" }}>
      {getTodayFormatted()}
      <span className="mx-[4px]" aria-hidden>|</span>
      {checkedCount} of {totalDoses} doses given
    </p>
  );
}

export function dispatchDosesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DOSE_CHANGED_EVENT));
}
