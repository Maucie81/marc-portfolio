"use client";

import Link from "next/link";
import { useReading } from "@/components/case-study/ReadingMotion";
import CtaArrow from "@/components/site/CtaArrow";
import type { CaseStudyLink } from "@/lib/case-studies";

/**
 * Closing section for every case study page — Figma 387:66552. In the
 * Figma canvas this frame is a sibling slide in the same horizontal row as
 * the preceding stats block (same y, same 518px height), not a section
 * below it — so it renders as a `.cs-block` inside `HorizontalTrack`,
 * matching that frame's exact 809px width, and centers between the fixed
 * chrome like every other block. The middle "Want to see more?"
 * group carries the file's own `flex: 1 0 0`, which is what pins "Get in
 * touch" to the frame's bottom edge once `.cs-closing-block` (globals.css)
 * gives the block its literal 518px height.
 *
 * `links` is the pair of case studies to offer — see `closingLinksFor` in
 * case-studies.ts, which sets each page's own pair explicitly so a page
 * never lists itself. */
export default function CaseStudyClosing({ links }: { links: CaseStudyLink[] }) {
  // Case-study motion: "The end" and "Thank you." settle as one heading
  // (each carries it — the coral line sits above the grain), the links
  // follow as copy.
  const { reveal, trigger, group } = useReading();
  const heading = reveal("heading");
  const copy = reveal("body", { trigger: true });
  return (
    <div
      {...group}
      className="flex flex-col items-start gap-4 cs-block cs-closing-block"
      style={{ ...group.style, ["--w" as string]: "calc(809px * var(--cs-scale, 1))" }}
    >
      <div {...trigger} className="flex w-full flex-col items-start gap-2">
        <p
          className={`text-[16px] font-bold leading-[20px] text-accent [font-family:var(--font-display)] ${heading.className}`}
          style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100', ...heading.style }}
        >
          The end
        </p>
        <h2
          className={`display text-[2.5rem] leading-[1.1] sideways:text-[60px] sideways:leading-[1.1] ${heading.className}`}
          style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100', ...heading.style }}
        >
          Thank you.
        </h2>
      </div>

      <div {...copy} className={`flex min-h-px flex-1 flex-col items-start gap-3 ${copy.className}`}>
        {/* 495:49633 — 16/24 SemiBold, was 20px/normal and (like the pill
            links below) on a second sans instead of Google Sans Flex. */}
        <p
          className="text-[16px] font-semibold leading-[20px] text-ink [font-family:var(--font-display)]"
          style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
        >
          Want to see more?
        </p>
        {/* CTA default buttons, Portfolio-Playground 100:209186 — the
            closing example in that frame uses them for this pair. */}
        {links.map((cs) => (
          <Link key={cs.slug} href={cs.href} className="cta" data-track="project_nav">
            {cs.title}
          </Link>
        ))}
      </div>

      {/* Hidden on phone: the coral CaseStudyFooter below carries
          "Get in touch" there. Secondary (outline) CTA, per the same
          frame. */}
      <Link
        href="/contact"
        {...copy}
        className={`cta cta-secondary hidden min-[901px]:inline-flex ${copy.className}`}
      >
        Want the full story? Get in touch
        <CtaArrow />
      </Link>
    </div>
  );
}
