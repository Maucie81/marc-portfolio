import Link from "next/link";
import CtaArrow from "@/components/site/CtaArrow";
import type { SmallProject } from "@/lib/home";
import { rv, rvGroup } from "@/lib/motion";

/* The Figma's own line breaks, from 1280px up — the width its columns are
   drawn at. Narrower, the lines run on and wrap to the column. */
function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <span key={i} className="xl:block">
      {i > 0 ? " " : null}
      {line}
    </span>
  ));
}

/**
 * 02 Additional work · Figma 215:212485 — a compact index, deliberately
 * quieter than Recent work: a 236px intro, then (188px over) a 560px list
 * of company / title → / description lockups, 26px apart.
 *
 * Motion: quiet, but meant to be seen — each row (the intro, then every
 * lockup) fades up 4px over 500ms once it's properly on screen; rows
 * arriving together step 110ms apart. No masks, no clipping.
 */
const ROW = rv(0, { dur: 500 });
export default function AdditionalWork({
  intro,
  items,
}: {
  intro: string[];
  items: SmallProject[];
}) {
  return (
    <div
      data-reveal-group
      style={rvGroup(110, { y: 4, ease: "quiet" })}
      className="grid gap-8 md:grid-cols-[236px_minmax(0,560px)] md:gap-x-[clamp(2.5rem,13vw,188px)]"
    >
      <div data-reveal="view" className="rv-rise flex flex-col gap-2" style={ROW}>
        <h2 id="additional-work-title" className="phone-cap-trim text-[18px] font-bold leading-6 tracking-[-0.01em] text-ink-deep md:text-[20px] md:leading-[1.5]">
          Additional work
        </h2>
        <p className="text-[14px] leading-[22px] text-ink-2">
          <Lines lines={intro} />
        </p>
      </div>

      <ul className="flex flex-col gap-8 md:gap-[26px]">
        {items.map((item) => {
          const live = Boolean(item.href) && !item.comingSoon;
          const title = (
            <>
              {item.title}
              {/* Phones (Figma 329:2662): its own line, in the title's
                  size and weight. */}
              {live ? null : (
                <>
                  <span className="hidden text-[14px] font-normal tracking-[-0.01em] text-muted md:inline"> — Coming soon</span>
                  <span className="block text-muted md:hidden">Coming soon</span>
                </>
              )}
            </>
          );
          return (
            <li
              key={item.company + item.title}
              data-reveal="view"
              className="rv-rise flex flex-col gap-1.5"
              style={ROW}
            >
              <div className="flex flex-col gap-1">
                <p className="text-[14px] tracking-[-0.01em] text-muted">{item.company}</p>
                <h3 className="text-[16px] font-semibold leading-6 text-accent">
                  {live ? (
                    <Link
                      href={item.href!}
                      data-track="additional_work"
                      className="group inline-flex items-center gap-2 transition-colors hover:text-[var(--accent-deep)]"
                    >
                      {title}
                      <span className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
                        <CtaArrow />
                      </span>
                    </Link>
                  ) : (
                    title
                  )}
                </h3>
              </div>
              <p className="max-w-[475px] text-[14px] leading-[22px] text-ink-2">
                <Lines lines={item.description} />
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
