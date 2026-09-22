"use client";

import { useRef, useState } from "react";
import { experienceSkills, experienceTooling, type Role } from "@/lib/home";
import ExpandGlyph, { spinExpandGlyph } from "./ExpandGlyph";

/**
 * Experience rows, per Figma 177:112122–112220 — with one deliberate
 * departure from the Figma row grid: the expand control no longer leads
 * the row in its own left column (+6, copy at +66). It sits UNDER the intro
 * paragraph instead, left-aligned with the copy, exactly the way the
 * case-study sections place theirs (ExpandCollapse). Same "+" glyph, same
 * 12px gap from the paragraph above it, same 16px reveal padding below.
 * With the icon column gone the rows sit flush with the section heading
 * like every other homepage section.
 *
 * The intro paragraph stays visible whether or not the row is open;
 * expanding adds the longer description.
 *
 * Every row starts collapsed and stays that way until the reader clicks —
 * an earlier version auto-opened the first row via IntersectionObserver
 * once it scrolled into view, which read as the page acting on its own
 * rather than responding to the reader. Removed per direct request.
 *
 * The Tooling/Skills panel is pinned to the top of the section (177:112200)
 * and is a fixed curated list (`experienceTooling`/`experienceSkills` in
 * home.ts), not derived from the roles below, so it neither moves nor
 * changes when a row opens or closes.
 */
export default function Experience({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState(-1);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_495px] lg:gap-0">
      <div>
        {roles.map((role, i) => {
          const isOpen = i === open;
          const panelId = `role-panel-${i}`;
          const paragraphs = Array.isArray(role.description)
            ? role.description
            : [role.description];

          return (
            // 177:112137 — white divider, and none after the last row.
            <div
              key={role.company}
              className={
                i < roles.length - 1 ? "border-b border-white" : undefined
              }
            >
              {/* 499:54859 — date leads, above the company | role line. */}
              <div className="flex flex-col gap-2 pt-6">
                {role.period ? <p className="t-meta-title">{role.period}</p> : null}
                <h3 className="flex flex-wrap items-baseline gap-x-2">
                  <span className="t-label text-ink-2">{role.company}</span>
                  <span aria-hidden className="t-meta-sm">
                    |
                  </span>
                  <span className="t-label text-ink-2">{role.title}</span>
                </h3>
              </div>

              <div className="pb-6 pt-3">
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
                    always animates to the exact content height.
                    Height and opacity used to share one 350ms ease-out
                    transition on this same element — the text faded fully
                    in/out while the row was still mid-resize, which is what
                    read as abrupt. Opacity now lives on the inner wrapper
                    with its own timing: on open it's delayed 150ms so the
                    text only starts appearing once the row is already
                    unfolding, landing just as the 450ms height animation
                    finishes; on close there's no delay, so the text is
                    gone well before the row finishes collapsing instead of
                    visibly folding into itself. The standard "material"
                    ease (cubic-bezier(0.4,0,0.2,1)) replaces ease-out for
                    the height itself — smoother deceleration than the
                    fairly sharp default. */}
                <div
                  id={panelId}
                  className="grid overflow-hidden transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div
                    className={`overflow-hidden transition-opacity duration-300 ${
                      isOpen ? "opacity-100 delay-150" : "opacity-0"
                    }`}
                  >
                    {/* 499:54867 */}
                    <div className="flex flex-col gap-4 pt-4">
                      {paragraphs.map((p, j) => (
                        <p key={j} className="t-body max-w-[604px] text-muted">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Expand control — under the copy, flush with its left
                    edge, per the case-study ExpandCollapse. It follows the
                    reveal panel (above) rather than preceding it, so the
                    expanded description unfolds between the intro and the
                    glyph and the "×" always sits at the bottom of the row
                    (per direct request). Accent when open (matches the
                    open row's "×" in Figma), ink at rest. mt-3 reproduces
                    ExpandCollapse's 12px from the copy above (its -mt-2
                    inside a gap-5 column) — from the intro when closed,
                    from the last revealed paragraph when open. */}
                <button
                  type="button"
                  onClick={() => {
                    spinExpandGlyph(glyphRefs.current[i], !isOpen);
                    if (!isOpen && open !== -1 && open !== i) {
                      spinExpandGlyph(glyphRefs.current[open], false);
                    }
                    setOpen(isOpen ? -1 : i);
                  }}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-label={`${isOpen ? "Hide" : "Show"} more about ${role.company}`}
                  className="group mt-3"
                >
                  <ExpandGlyph
                    ref={(el) => {
                      glyphRefs.current[i] = el;
                    }}
                    expanded={isOpen}
                    className={isOpen ? "text-accent" : "text-ink"}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 177:112200 — pinned to the top of the section, inset 136px, a
          single stacked column: Skills first, then Tooling below it.
          Constant regardless of which row is open. The labels share
          .t-meta-title with the first row's date (same 14/16 role, same
          #686868) and the same 24px top padding, so "Skills" and
          "2024 — 2026" sit on one baseline. */}
      <aside className="lg:self-start lg:pl-[136px] lg:pt-6">
        <dl>
          <dt className="t-meta-title pb-3">Skills</dt>
          <dd className="t-meta-sm space-y-1.5 pb-8">
            {experienceSkills.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </dd>
          <dt className="t-meta-title pb-3">Tooling</dt>
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
