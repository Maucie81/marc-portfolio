"use client";

import { useRef, useState } from "react";
import { experienceSkills, experienceTooling, type Role } from "@/lib/home";
import ExpandGlyph, { spinExpandGlyph } from "./ExpandGlyph";

/**
 * Experience rows, per Figma 177:112122–112220.
 *
 * Row grid is expand-icon · content — the icon leads on the left, at +6,
 * with the copy at +66 from the row's left edge. The intro paragraph stays
 * visible whether or not the row is open; expanding adds the longer
 * description.
 *
 * The Tooling/Skills panel is pinned to the top of the section (177:112200)
 * and is a fixed curated list (`experienceTooling`/`experienceSkills` in
 * home.ts), not derived from the roles below, so it neither moves nor
 * changes when a row opens or closes.
 */
export default function Experience({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState(0);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
                onClick={() => {
                  const clickedGlyph = glyphRefs.current[i];

                  spinExpandGlyph(clickedGlyph, !isOpen);
                  if (!isOpen && open !== -1 && open !== i) {
                    spinExpandGlyph(glyphRefs.current[open], false);
                  }
                  setOpen(isOpen ? -1 : i);
                }}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="group grid w-full grid-cols-[44px_minmax(0,1fr)] items-start pt-6 text-left lg:grid-cols-[66px_minmax(0,1fr)]"
              >
                {/* Expand control — leads the row (499:54855/499:54884),
                    accent when open (matches the open row's "×" in Figma),
                    ink at rest. Vertically centered on the date line
                    specifically (measured via getClientRects, not eyeballed
                    — the glyph's own line-height doesn't match the date's). */}
                <ExpandGlyph
                  ref={(el) => {
                    glyphRefs.current[i] = el;
                  }}
                  expanded={isOpen}
                  className={`ml-1.5 mt-[-2.25px] self-start ${
                    isOpen ? "text-accent" : "text-ink group-hover:text-accent"
                  }`}
                />

                {/* 499:54859 — date leads, above the company | role line. */}
                <div className="flex flex-col gap-2">
                  {role.period ? <p className="t-meta-title">{role.period}</p> : null}
                  <h3 className="flex flex-wrap items-baseline gap-x-2">
                    <span className="t-label text-ink-2">{role.company}</span>
                    <span aria-hidden className="t-meta-sm">
                      |
                    </span>
                    <span className="t-label text-ink-2">{role.title}</span>
                  </h3>
                </div>
              </button>

              {/* Copy aligns under the date/title block. */}
              <div className="pb-6 pl-[44px] pt-3 lg:pl-[66px]">
                {/* Intro is visible whether or not the row is open;
                    expanding adds the longer description below it. */}
                <p className="t-body max-w-[604px] text-muted">{role.intro}</p>

                {/* Same reveal as the case-study ExpandCollapse: a
                    grid-template-rows 0fr/1fr transition (not a fixed
                    max-height) — content stays mounted, just visually
                    collapsed, so the two match exactly. A fixed max-height
                    (this used to animate to a flat 800px regardless of the
                    real content height) makes the transition's easing run
                    against an arbitrary distance instead of the content's
                    actual height, which is what read as a glitch: short
                    descriptions finished animating well before the curve
                    did, long ones never really matched it either. 0fr→1fr
                    always animates to the exact content height. */}
                <div
                  id={panelId}
                  className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-[350ms] ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    {/* 499:54867 */}
                    <p className="t-body mt-4 max-w-[604px] text-muted">
                      {role.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 177:112200 — pinned to the top of the section, inset 136px, a
          single stacked column: Skills first, then Tooling below it.
          Constant regardless of which row is open. */}
      <aside className="lg:self-start lg:pl-[136px] lg:pt-6">
        <dl>
          <dt className="cs-label pb-3">Skills</dt>
          <dd className="t-meta-sm space-y-1.5 pb-8">
            {experienceSkills.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </dd>
          <dt className="cs-label pb-3">Tooling</dt>
          <dd className="t-meta-sm space-y-1.5">
            {experienceTooling.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </dd>
        </dl>
      </aside>
    </div>
  );
}
