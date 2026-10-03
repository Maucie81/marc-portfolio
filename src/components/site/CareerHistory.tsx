import { Fragment } from "react";
import type { Role } from "@/lib/home";

/**
 * 04 Career history + Skills & Specializations · Figma 247:272775.
 * Compact provenance, not a résumé: company / title / dates in 220px
 * columns (56px apart, rows 36px apart), each marked by a numbered accent
 * dot; then the skills set in the Figma's four lines with accent "•"
 * dividers, 70px below.
 */
export default function CareerHistory({
  roles,
  skills,
}: {
  roles: Role[];
  skills: string[][];
}) {
  return (
    <>
      <h2 id="experience-title" className="text-[20px] font-bold tracking-[-0.01em] text-ink-deep">
        Career history
      </h2>

      <ol className="mt-[60px] grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-14 gap-y-9 lg:grid-cols-[repeat(3,220px)]">
        {roles.map((role, i) => (
          <li key={role.company} className="flex gap-2">
            {/* Ellipse 623 — 12px accent dot with the row number in white
                9px; the list's own numbering carries it for assistive
                tech. */}
            <span
              aria-hidden
              className="mt-[3px] flex size-3 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] leading-none text-white"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-[16px] font-semibold leading-6 text-ink-2">{role.company}</p>
              <p className="text-[16px] leading-6 text-ink-2">{role.title}</p>
              <p className="text-[14px] tracking-[-0.01em] text-muted">{role.period}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Indented 20px (the 12px dot + 8px gap) so the skills share the
          company lockups' text edge, per direct request. */}
      <div className="mt-[70px] pl-5">
        <h3 className="text-[16px] font-semibold leading-6 text-ink-2">
          Skills &amp; Specializations
        </h3>
        <div role="list" className="flex flex-col gap-1.5 pb-1 pt-2">
          {skills.map((line) => (
            <div key={line.join()} className="flex flex-wrap items-center gap-x-1.5">
              {line.map((skill, i) => (
                <Fragment key={skill}>
                  {i > 0 ? (
                    <span aria-hidden className="w-1.5 text-center text-[14px] leading-none text-accent">
                      •
                    </span>
                  ) : null}
                  <span role="listitem" className="text-[16px] leading-6 text-ink-2">
                    {skill}
                  </span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
