import Link from "next/link";
import type { CaseStudyLink } from "@/lib/case-studies";

/**
 * Closing section for every case study page — Figma 387:66552. In the
 * Figma canvas this frame is a sibling slide in the same horizontal row as
 * the preceding stats block (same y, same 518px height), not a section
 * below it — so it renders as a `.cs-block` inside `HorizontalTrack`,
 * matching that frame's exact 809px width. `cs-anchor-687` (same class
 * `ClosingBlock` uses) anchors its top to that block's top regardless of
 * either block's actual content height. The middle "Want to see more?"
 * group carries the file's own `flex: 1 0 0`, which is what pins "Get in
 * touch" to the frame's bottom edge once `.cs-closing-block` (globals.css)
 * gives the block its literal 518px height.
 *
 * `links` is the pair of case studies to offer — see `closingLinksFor` in
 * case-studies.ts, which sets each page's own pair explicitly so a page
 * never lists itself. */
export default function CaseStudyClosing({ links }: { links: CaseStudyLink[] }) {
  return (
    <div
      className="flex flex-col items-start gap-4 cs-block cs-closing-block cs-anchor-687"
      style={{ ["--w" as string]: "calc(809px * var(--cs-scale, 1))" }}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <p
          className="text-[16px] font-bold leading-[20px] text-accent [font-family:var(--font-body)]"
          style={{ fontVariationSettings: '"opsz" 14' }}
        >
          The end
        </p>
        <h2
          className="display text-[2.5rem] leading-[1.1] min-[901px]:text-[60px] min-[901px]:leading-[1.1]"
          style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
        >
          Thank you.
        </h2>
      </div>

      <div className="flex min-h-px flex-1 flex-col items-start gap-3">
        {/* 495:49633 — 16/24 SemiBold, was 20px/normal and (like the pill
            links below) on --font-body/DM Sans instead of Google Sans Flex. */}
        <p
          className="text-[16px] font-semibold leading-[20px] text-ink [font-family:var(--font-display)]"
          style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
        >
          Want to see more?
        </p>
        {links.map((cs) => (
          <Link
            key={cs.slug}
            href={cs.href}
            className="flex items-center justify-center border border-accent bg-accent px-[8px] py-[2px] text-[12px] font-semibold leading-[20px] text-bg transition-opacity hover:opacity-90 [font-family:var(--font-display)]"
            style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
          >
            {cs.title}
          </Link>
        ))}
      </div>

      <Link
        href="/contact"
        className="flex items-center gap-1 text-[16px] font-semibold leading-[20px] text-ink transition-colors hover:text-accent [font-family:var(--font-display)]"
        style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
      >
        Get in touch
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/arrow-right.svg" alt="" width={16} height={14} />
      </Link>
    </div>
  );
}
