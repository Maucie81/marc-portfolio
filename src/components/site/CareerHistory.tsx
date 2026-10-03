import { Fragment } from "react";
import SkillRun from "@/components/site/SkillRun";
import type { Role } from "@/lib/home";
import { rv, rvGroup } from "@/lib/motion";

/**
 * 04 Career history + Skills & Specializations · Figma 247:272775.
 * Compact provenance, not a résumé: company / title / dates in 220px
 * columns (56px apart, rows 36px apart), each marked by a numbered accent
 * dot; then the skills set in the Figma's four lines with accent "•"
 * dividers, 70px below.
 *
 * Motion: quieter than Additional work — closer to text becoming visible
 * than entering. The heading only fades; each role fades up 3px over
 * 500ms (100ms apart when they arrive together) once it's properly on
 * screen. The skills fade in as one block, without moving, as soon as they
 * cross the bottom of the screen.
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
      <h2
        id="experience-title"
        data-reveal="view"
        className="rv-fade text-[20px] font-bold tracking-[-0.01em] text-ink-deep"
        style={rv(0, { dur: 500, ease: "quiet" })}
      >
        Career history
      </h2>

      <ol
        data-reveal-group
        style={rvGroup(100, { y: 3, ease: "quiet" })}
        className="mt-[60px] grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-14 gap-y-9 lg:grid-cols-[repeat(3,220px)]"
      >
        {roles.map((role, i) => (
          <li
            key={role.company}
            data-reveal="view"
            className="rv-rise flex gap-2"
            style={rv(0, { dur: 500 })}
          >
            {/* Ellipse 623 — 12px accent dot with the row number in white
                9px; the list's own numbering carries it for assistive
                tech. */}
            <span
              aria-hidden
              className="mt-[6px] flex size-3 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] leading-none text-white"
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
      <div
        data-reveal="view"
        data-reveal-quiet
        className="rv-fade mt-[70px] pl-5"
        style={rv(0, { dur: 350, ease: "quiet" })}
      >
        <h3 className="text-[16px] font-semibold leading-6 text-ink-2">
          Skills &amp; Specializations
        </h3>
        {/* md+: the designed rows. Phones: one continuous run, so a skill
            fills the line above when it fits; skills stay whole and each
            dot is glued to the skill before it (nbsp), so lines break
            after a dot, never before one — and SkillRun hides any dot
            left at a line's end. */}
        <SkillRun
          className="pb-1 pt-2 leading-[30px] md:flex md:flex-col md:gap-1.5 md:leading-normal"
        >
          {skills.map((line, row) => (
            <div key={line.join()} className="inline md:flex md:flex-wrap md:items-center md:gap-x-1.5">
              {line.map((skill, i) => (
                <Fragment key={skill}>
                  {i > 0 || row > 0 ? (
                    <>
                      <span
                        aria-hidden
                        data-skill-dot
                        className={`text-[14px] leading-none text-accent md:w-1.5 md:text-center ${i === 0 ? "md:hidden" : ""}`}
                      >
                        <span className="md:hidden">{"\u00a0"}</span>•
                      </span>{" "}
                    </>
                  ) : null}
                  {/* Whole skills never split, except one too long for a
                      phone line. */}
                  <span
                    role="listitem"
                    className={`text-[16px] leading-6 text-ink-2 ${skill.length > 36 ? "" : "whitespace-nowrap"}`}
                  >
                    {skill}
                  </span>
                </Fragment>
              ))}
            </div>
          ))}
        </SkillRun>
      </div>
    </>
  );
}
