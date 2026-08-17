"use client";

import { motion } from "framer-motion";
import type { DoseRowDisplay } from "@/lib/medications";

interface DoseRowProps {
  row: DoseRowDisplay;
  asNeeded: boolean;
  onMarkGiven: () => void;
  onUncheck?: () => void;
}

export function DoseRow({ row, asNeeded, onMarkGiven, onUncheck }: DoseRowProps) {
  const { doseNumber, label, checked, locked, canUncheck } = row;

  const isTappable = checked
    ? canUncheck
    : locked
      ? asNeeded
      : true;

  const opacity = checked ? 0.5 : locked ? 0.25 : 1;

  const handleClick = () => {
    if (checked && canUncheck && onUncheck) {
      onUncheck();
    } else if (!checked && isTappable) {
      onMarkGiven();
    }
  };

  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span
          className="text-[14px] font-medium text-[#56440f]"
          style={{ fontFamily: "var(--harrison-font-ui)", opacity }}
        >
          Dose {doseNumber}
        </span>
        {label ? (
          <span
            className="text-[14px] font-medium tabular-nums text-[#56440f]"
            style={{ fontFamily: "var(--harrison-font-ui)", opacity }}
          >
            {label}
          </span>
        ) : null}
      </div>
      <motion.button
        type="button"
        onClick={isTappable ? handleClick : undefined}
        disabled={!isTappable}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#56440f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa11c] focus-visible:ring-offset-1 disabled:opacity-50"
        style={{ opacity: isTappable ? 1 : 0.25 }}
        aria-label={
          checked
            ? canUncheck
              ? `Uncheck dose ${doseNumber}`
              : `Dose ${doseNumber} given`
            : locked && !asNeeded
              ? `Dose ${doseNumber} (complete previous dose first)`
              : `Mark dose ${doseNumber} as given`
        }
        aria-pressed={checked}
        whileTap={isTappable ? { scale: 0.96 } : undefined}
      >
        {checked ? (
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#56440f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.svg>
        ) : null}
      </motion.button>
    </div>
  );
}
