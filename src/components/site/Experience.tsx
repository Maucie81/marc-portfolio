"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Role } from "@/lib/home";

/** Placeholder entries shouldn't leak into the aggregate panel. */
const real = (values: string[]) => values.filter((v) => !/^add /i.test(v));

/**
 * Experience rows, per Figma 177:112122–112220.
 *
 * Row grid is expand-icon · index · content — the icon leads on the left, at
 * +6, with the index at +66 and the copy at +100 from the row's left edge.
 * The intro paragraph stays visible whether or not the row is open; expanding
 * adds the longer description and the pipe-separated tags.
 *
 * The Tooling/Category panel is pinned to the top of the section (177:112200)
 * and describes the whole list, so it neither moves nor changes when a row
 * opens or closes.
 */
export default function Experience({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState(0);

  const tooling = [...new Set(roles.flatMap((r) => real(r.tooling)))];
  const category = [...new Set(roles.flatMap((r) => real(r.category)))];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_495px] lg:gap-0">
      <div>
        {roles.map((role, i) => {
          const isOpen = i === open;
          const panelId = `role-panel-${i}`;

          return (
            // 177:112137 — white divider, and none after the last row.
            <div
              key={role.company}
              className={
                i < roles.length - 1 ? "border-b border-white" : undefined
              }
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="group grid w-full grid-cols-[44px_30px_minmax(0,1fr)] items-start pt-6 text-left lg:grid-cols-[66px_34px_minmax(0,1fr)]"
              >
                {/* Expand control — leads the row (177:112158) */}
                <span
                  aria-hidden
                  className={`relative ml-1.5 mt-1 h-3 w-3 transition-transform duration-300 ${
                    isOpen
                      ? "rotate-45 text-accent"
                      : "text-ink group-hover:text-accent"
                  }`}
                >
                  <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                </span>

                {/* 177:112140 — row index */}
                <span className="t-label text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* 177:112141 — company | role, 8px either side of the pipe */}
                <h3 className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={`t-label transition-colors ${
                      isOpen ? "text-accent" : "text-ink group-hover:text-accent"
                    }`}
                  >
                    {role.company}
                  </span>
                  <span aria-hidden className="t-meta text-muted">
                    |
                  </span>
                  <span className="t-label text-ink">{role.title}</span>
                </h3>
              </button>

              {/* Copy aligns under the company name, not the index. */}
              <div className="pb-6 pl-[74px] pt-3 lg:pl-[100px]">
                {/* 177:112149 — visible whether or not the row is open */}
                <p className="max-w-[604px] text-base leading-[22px] text-ink-2">
                  {role.intro}
                </p>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      {/* 177:112151 */}
                      <p className="mt-4 max-w-[604px] text-base leading-[22px] text-ink-2">
                        {role.description}
                      </p>

                      {/* 177:112152 — plain pipe-separated text, no chips */}
                      <p className="t-meta mt-4 text-ink-2">
                        {role.tags.map((tag, t) => (
                          <span key={tag}>
                            {t > 0 ? (
                              <span aria-hidden className="px-2 text-muted">
                                |
                              </span>
                            ) : null}
                            {tag}
                          </span>
                        ))}
                      </p>

                      {role.period ? (
                        <p className="t-meta mt-4 text-muted">{role.period}</p>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* 177:112200 — pinned to the top of the section, inset 136px, two
          175.5px columns. Constant regardless of which row is open. */}
      <aside className="lg:self-start lg:pl-[136px] lg:pt-6">
        <dl className="grid grid-cols-2 gap-x-2">
          <dt className="t-label pb-3 text-ink">Tooling</dt>
          <dt className="t-label pb-3 text-ink">Category</dt>
          <dd className="t-meta space-y-3 text-muted">
            {tooling.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </dd>
          <dd className="t-meta space-y-3 text-muted">
            {category.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </dd>
        </dl>
      </aside>
    </div>
  );
}
