"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MedicationConfig } from "@/lib/medications";
import { getDoseRowsForMedication } from "@/lib/medications";
import { DoseRow } from "./DoseRow";
import { getGivenAt, setGivenAt } from "@/lib/storage";

const DESCRIPTIONS: Record<string, string> = {
  codeine: "A mild opioid prescribed for post-surgical pain relief. Give every 8 hours as scheduled.",
  gabapentin: "Prescribed for nerve pain and anxiety management during recovery. Give every 8 hours.",
  trazodone: "A sedative prescribed as needed to help restrict activity during recovery. May cause drowsiness.",
  carprofen: "A non-steroidal anti-inflammatory (NSAID) for pain and swelling. Always give with food.",
  simplicef: "An antibiotic to prevent post-surgical infection. Give once daily with food.",
};

interface MedicationCardProps {
  config: MedicationConfig;
  today: Date;
  onCheckChange?: () => void;
}

export function MedicationCard({ config, today, onCheckChange }: MedicationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const description = DESCRIPTIONS[config.id];

  const getGivenAtBound = (medId: string, doseIndex: number) => getGivenAt(medId, doseIndex);
  const doseRows = getDoseRowsForMedication(config, today, getGivenAtBound);

  const handleMarkGiven = (doseIndex: number) => {
    setGivenAt(config.id, doseIndex, new Date().toISOString());
    onCheckChange?.();
  };

  return (
    <motion.article layout className="rounded-[4px] border border-[#d3d4c5] bg-transparent p-4" style={{ borderRadius: "var(--harrison-card-radius, 4px)" }}>
      <button type="button" onClick={() => setExpanded((e) => !e)} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0 flex-1">
          <h3 className="text-[20px] font-semibold text-[#56440f]" style={{ fontFamily: "var(--harrison-font-ui)" }}>
            {config.name}
          </h3>
          <p className="mt-0.5 pb-2 text-[14px] font-medium text-[#56440f]" style={{ fontFamily: "var(--harrison-font-ui)" }}>
            {config.frequencyLabel}
          </p>
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-[#56440f]" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.span>
      </button>
      <div className="mt-2 border-b border-[#d3d4c5]">
        <AnimatePresence initial={false}>
          {expanded && description && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden text-[12px] font-normal text-[#56440f]"
              style={{ fontFamily: "var(--harrison-font-ui)" }}
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <ul className="mt-4 space-y-6">
        {doseRows.map((row) => (
          <li key={`${config.id}-${row.doseIndex}`}>
            <DoseRow
              row={row}
              medicationId={config.id}
              onMarkGiven={() => handleMarkGiven(row.doseIndex)}
            />
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
