"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CareSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CareSection({ title, children, defaultOpen = false }: CareSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[#d3d4c5] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 py-4 text-left text-[#56440f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa11c] focus-visible:ring-offset-2"
        style={{ fontFamily: "var(--harrison-font-ui)", fontWeight: 500 }}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium">{title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-block text-[#56440f]" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pb-4 text-sm leading-relaxed text-[#56440f]" style={{ fontFamily: "var(--harrison-font-ui)" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
