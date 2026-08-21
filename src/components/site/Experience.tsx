"use client";

import { useRef, useState } from "react";
import type { Role } from "@/lib/home";
import ExpandGlyph, { spinExpandGlyph } from "./ExpandGlyph";

/** Placeholder entries shouldn't leak into the aggregate panel. */
const real = (values: string[]) => values.filter((v) => !/^add /i.test(v));

/** Opening one row can close another (accordion behavior), and both
 * animate their height over 350ms — if a row above the clicked one
 * collapses, the page reflows and the icon the user just clicked jumps
 * to a new spot. This holds `el` at its pre-click viewport position by
 * compensating scroll every frame for the duration of that reflow, so
 * the clicked icon stays put and everything else moves around it instead. */
function holdScrollPosition(el: HTMLElement, duration = 400) {
  const anchorTop = el.getBoundingClientRect().top;
  const start = performance.now();

  const tick = (now: number) => {
    const drift = el.getBoundingClientRect().top - anchorTop;
    if (Math.abs(drift) > 0.5) {
      // behavior: "instant" is required here — the homepage sets
      // `scroll-behavior: smooth` globally, which would otherwise turn
      // every per-frame correction into its own lagging animated scroll,
      // producing exactly the drift-then-catch-up motion this is meant
      // to prevent.
      window.scrollBy({ top: drift, left: 0, behavior: "instant" });
    }
    if (now - start < duration) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

/**
 * Experience rows, per Figma 177:112122–112220.
 *
 * Row grid is expand-icon · content — the icon leads on the left, at +6,
 * with the copy at +66 from the row's left edge. The intro paragraph stays
 * visible whether or not the row is open; expanding adds the longer
 * description and the pipe-separated tags.
 *
 * The Tooling/Category panel is pinned to the top of the section (177:112200)
 * and describes the whole list, so it neither moves nor changes when a row
 * opens or closes.
 */
export default function Experience({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState(0);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
                onClick={() => {
                  const clickedGlyph = glyphRefs.current[i];
                  if (clickedGlyph) holdScrollPosition(clickedGlyph);

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
                {/* Expand control — leads the row (177:112158), centered
                    against the title lockup's own line, not the button */}
                <ExpandGlyph
                  ref={(el) => {
                    glyphRefs.current[i] = el;
                  }}
                  expanded={isOpen}
                  className={`ml-1.5 self-center ${
                    isOpen ? "text-muted" : "text-ink group-hover:text-accent"
                  }`}
                />

                {/* 177:112141 — company | role, 8px either side of the pipe */}
                <h3 className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={`t-label transition-colors ${
                      isOpen ? "text-accent" : "text-ink group-hover:text-accent"
                    }`}
                  >
                    {role.company}
                  </span>
                  <span aria-hidden className="t-meta">
                    |
                  </span>
                  <span className="t-label text-ink">{role.title}</span>
                </h3>
              </button>

              {/* Copy aligns under the company name. */}
              <div className="pb-6 pl-[44px] pt-3 lg:pl-[66px]">
                {/* Dates and intro are visible whether or not the row is
                    open — dates lead, above the intro blurb. */}
                {role.period ? <p className="t-meta">{role.period}</p> : null}
                <p className="mt-2 max-w-[604px] text-base leading-[22px] text-ink-2">
                  {role.intro}
                </p>

                {/* Same reveal as the case-study ExpandCollapse: a plain
                    max-height/opacity CSS transition, not Framer Motion's
                    measured height:auto — content stays mounted, just
                    visually collapsed, so the two match exactly. */}
                <div
                  id={panelId}
                  className="overflow-hidden transition-[max-height,opacity] duration-[350ms] ease-out"
                  style={{
                    maxHeight: isOpen ? "800px" : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  {/* 177:112151 */}
                  <p className="mt-4 max-w-[604px] text-base leading-[22px] text-ink-2">
                    {role.description}
                  </p>

                  {/* 177:112152 — plain pipe-separated text, no chips */}
                  <p className="t-meta mt-4">
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 177:112200 — pinned to the top of the section, inset 136px, two
          175.5px columns. Constant regardless of which row is open. */}
      <aside className="lg:self-start lg:pl-[136px] lg:pt-6">
        <dl className="grid grid-cols-2 gap-x-2">
          <dt className="cs-label pb-3">Tooling</dt>
          <dt className="cs-label pb-3">Focus areas</dt>
          <dd className="t-meta space-y-3">
            {tooling.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </dd>
          <dd className="t-meta space-y-3">
            {category.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </dd>
        </dl>
      </aside>
    </div>
  );
}
