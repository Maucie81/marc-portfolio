"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Placeholder from "./Placeholder";
import type { InterestCategory } from "@/lib/home";

/**
 * 177:112231 — the categories are the display type, not controls above it.
 * Each is Playfair 40: the selected one in ink, the rest in the light rule
 * grey. Selecting a category swaps the body copy and its three image boxes.
 * No pills, borders or fills anywhere in this section.
 */
export default function Interests({
  categories,
}: {
  categories: InterestCategory[];
}) {
  const [active, setActive] = useState(0);
  const current = categories[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Personal interests"
        className="flex flex-wrap items-baseline gap-x-8 gap-y-2"
      >
        {categories.map((category, i) => {
          const isActive = i === active;
          return (
            <button
              key={category.name}
              role="tab"
              type="button"
              id={`interest-tab-${i}`}
              aria-selected={isActive}
              aria-controls="interest-panel"
              onClick={() => setActive(i)}
              className={`display t-title transition-opacity ${
                isActive ? "" : "opacity-40 hover:opacity-70"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div
        id="interest-panel"
        role="tabpanel"
        aria-labelledby={`interest-tab-${active}`}
      >
        {/* 177:112240 — body copy sits under the tabs, 392px */}
        <p className="t-body mt-6 max-w-[392px] text-ink-2">
          {current.description}
        </p>

        {/* 177:112241 — three landscape boxes, 12px gutter */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: current.imageCount }).map((_, i) => (
            <motion.div
              key={`${current.name}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Placeholder ratio="392 / 267" className="w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
