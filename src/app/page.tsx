import type { CSSProperties } from "react";
import Link from "next/link";
import { preload } from "react-dom";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";
import HomepageHero from "@/components/site/HomepageHero";
import RecentWork from "@/components/site/RecentWork";
import AdditionalWork from "@/components/site/AdditionalWork";
import ReferenceLibrary from "@/components/site/ReferenceLibrary";
import CareerHistory from "@/components/site/CareerHistory";
import RevealObserver from "@/components/site/motion/RevealObserver";
import { MOTION, rv } from "@/lib/motion";
import {
  additionalWork,
  additionalWorkIntro,
  contact,
  projects,
  roles,
  skills,
} from "@/lib/home";

/* Homepage · Figma Portfolio-Playground 215:205616 (approved redesign).
   Order: hero → 01 Recent work → 02 Additional work → 03 My personal
   reference library → 04 Career history + skills → 05 Contact. */

/* The content column, applied per band instead of once on <main>.
   w-[min(1376px,...)], centered (mx-auto): 1376 = the 1440 design width
   minus the 32px rail on each side. Below that width the min() falls
   through to the fluid calc(100%-4rem) term, so the column always stops
   exactly at the rails' inner edge. Each band owns its own copy because the
   paper fill belongs to the BAND (full-bleed, uncapped) while the content
   inside it stays capped. */
const SHELL = "mx-auto px-6 md:px-12 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8";

/* 32px of bare white between bands, matching the perimeter rails' own
   width — the Figma separates every section this way. Halved to 16px below
   lg, where there are no rails. Full-bleed by
   construction: it sits outside SHELL, so the white it exposes is the
   <body> itself. */
function BandGap() {
  return <div aria-hidden className="h-4 lg:h-8" />;
}

/* Band fills are painted, not set as background-color, so they stop at the
   1376px content column on screens wider than the 1440 design frame and the
   body's white shows beyond. Below 1440 the fill is the band's full width
   (the rails cover its outer 32px). */
const BAND_SIZE = "min(1376px, 100%) 100%";

function bandFill(color: string, ...layers: string[]) {
  return {
    backgroundImage: [...layers, `linear-gradient(${color}, ${color})`].join(","),
    backgroundSize: BAND_SIZE,
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
  };
}

/* Same limit for the absolutely-positioned texture sheets inside a band:
   clipped rather than resized, so their dot scale is untouched. */
const BAND_CLIP = { clipPath: "inset(0 max(0px, calc((100% - 1376px) / 2)))" };

/* Reference library graph paper · Figma "Grid" 267:296755 — 20px cells of
   #fcf9f1 with 1px rules of #bfb37f at 30% over the paper (= #e7e1cb). */
const LIBRARY_PAPER = "#fcf9f1";
const LIBRARY_RULE = "#e7e1cb";

/* The halftone sheet — public/additional-work-texture.webp is the Figma's
   "Background" fill byte for byte. */
const TEXTURE_SRC = "/additional-work-texture.webp";

export default function Home() {
  // The hero's halftone is a CSS background, so the browser would only find
  // it once the stylesheet loads — fetch it up front instead.
  preload(TEXTURE_SRC, { as: "image", fetchPriority: "high" });

  return (
    <main id="home">
      {/* ---------- Hero ---------- */}
      {/* Flush to the rails at lg (no side padding), 42px under the fixed
          top band. Below lg it runs full bleed — no side inset.
          scroll-mt = the header's height, so the nav's "/#hero" lands where
          a plain "/" load does. */}
      <section
        id="hero"
        aria-label="Introduction"
        data-reveal="load"
        className="mx-auto scroll-mt-[52px] lg:w-[min(1376px,calc(100%-4rem))] lg:scroll-mt-0 lg:px-0 lg:pt-[42px]"
      >
        <HomepageHero />
      </section>

      <BandGap />

      {/* ---------- 01 Recent work ---------- */}
      <div style={bandFill("var(--bg)")}>
        <section
          id="work"
          aria-labelledby="work-title"
          className={`${SHELL} sec pb-[60px] pt-10 lg:pb-[100px]`}
        >
          <SectionRail dots={3} flush />
          <SectionNumber number="01" label="Recent work" />
          <div className="min-w-0">
            <h2 id="work-title" className="t-section-title" style={{ marginBottom: 32 }}>
              Recent work
            </h2>
            <RecentWork projects={projects} />
          </div>
        </section>
      </div>

      <BandGap />

      {/* ---------- 02 Additional work ---------- */}
      <div style={bandFill("var(--bg)")}>
        <section
          id="additional-work"
          aria-labelledby="additional-work-title"
          // 80px under the last line: Figma's 20px frame padding plus the
          // ~60px the list stops short of its 538px frame (263:276081).
          className={`${SHELL} sec pb-[50px] pt-[50px] lg:pb-20 lg:pt-10`}
        >
          <SectionRail dots={3} flush />
          <SectionNumber number="02" label="A little bit more" />
          <div className="min-w-0">
            <p className="t-section-title" style={{ marginBottom: 60 }}>
              A little bit more
            </p>
            <AdditionalWork intro={additionalWorkIntro} items={additionalWork} />
          </div>
        </section>
      </div>

      <BandGap />

      {/* ---------- 03 My personal reference library ---------- */}
      <div
        style={bandFill(
          LIBRARY_PAPER,
          `repeating-linear-gradient(to right, ${LIBRARY_RULE} 0 1px, transparent 1px 21px)`,
          `repeating-linear-gradient(to bottom, ${LIBRARY_RULE} 0 1px, transparent 1px 21px)`,
        )}
      >
        <section
          id="interests"
          aria-labelledby="library-title"
          style={{ "--lib-f": "clamp(2.75rem, 5.56vw, 5rem)" } as CSSProperties}
          className={`${SHELL} sec pb-[60px] pt-[50px] lg:pb-[77px] lg:pt-11`}
        >
          {/* The first circle and "03" sit level with the middle of the
              title's first line, not the section's top. The title scales
              (--lib-f, its font size), and that line's middle sits 0.918
              of it below the row's top, so both offsets follow it. */}
          <SectionRail dots={3} flush className="lg:pt-[calc(0.918*var(--lib-f)-10px)]" />
          <SectionNumber
            number="03"
            label="Reference library"
            className="lg:mt-[calc(0.918*var(--lib-f)-18px)]"
          />
          <div className="min-w-0">
            {/* 247:272660 — title right-set against an accent bar, the
                copy 30px on; the group centers on the 271.8px bar. */}
            {/* Motion: kept quiet so the gallery (its own trigger, see
                ReferenceLibrary) leads — the title fades up 8px, the copy
                fades in after it. */}
            <div
              data-reveal="view"
              className="flex flex-col gap-6 md:flex-row md:items-center md:gap-[30px]"
            >
              <div className="flex items-center gap-[0.36em] text-[clamp(2.75rem,5.56vw,5rem)]">
                <h2 id="library-title" className="lib-title rv-rise" style={rv(0, { dur: 600 })}>
                  <span className="block">My personal</span>{" "}
                  <span className="block">reference</span>{" "}
                  <span className="block">library</span>
                </h2>
                <span aria-hidden className="lib-bar shrink-0" />
              </div>
              <p className="lib-copy rv-fade max-w-[498px]" style={rv(180, { dur: 600 })}>
                <span className="md:block">A collection of images, objects,</span>{" "}
                <span className="md:block">and environments that continue to</span>{" "}
                <span className="md:block">shape my taste and influence how</span>{" "}
                <span className="md:block">I approach design.</span>
              </p>
            </div>
            <div className="mt-8">
              <ReferenceLibrary />
            </div>
          </div>
        </section>
      </div>

      <BandGap />

      {/* ---------- 04 Career history + Skills ---------- */}
      <div style={bandFill("var(--bg)")}>
        <section
          id="experience"
          aria-labelledby="experience-title"
          className={`${SHELL} sec py-[50px] lg:py-[100px]`}
        >
          <SectionRail dots={3} flush />
          <SectionNumber number="04" label="Where I’ve been" />
          <div className="min-w-0">
            <p className="t-section-title" style={{ marginBottom: 60 }}>
              Where I’ve been
            </p>
            <CareerHistory roles={roles} skills={skills} />
          </div>
        </section>
      </div>

      {/* No white gap here: the ink footer sits flush under 04. */}

      {/* ---------- 05 Contact ---------- */}
      {/* Figma 297:301541 — the ink band, white type, the halftone panel
          behind the lockup; the copy starts at the rail column's 64px edge
          and the credit line sits under the panel. */}
      <footer id="contact" style={bandFill("var(--ink-deep)")}>
        {/* The footer panel sits at half the other sections' side inset
            (12px on phones, 24px to lg), with its copy padded back in line
            with them. */}
        <div className="mx-auto px-3 py-6 md:px-6 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:py-[27px]">
          {/* Motion: the halftone field is uncovered by a hard wipe from the
              bottom up, then the CTA sets as a masked line — the hero's own
              treatment, bookending the page — and the contact line fades
              in last. */}
          <div data-reveal="view" className="relative">
            {/* The halftone panel behind the lockup — on the ink it's
                colour-burned (Hero 5's dark-board treatment), since a
                multiply sheet vanishes on a dark fill. The layer is turned
                180°, so its top-to-bottom wipe reads bottom to top. */}
            <div
              aria-hidden
              className="rv-wipe rv-wipe-ttb pointer-events-none absolute inset-0 rotate-180 mix-blend-color-burn blur-[0.5px]"
              style={{ ...rv(0, { dur: 800 }), background: `url(${TEXTURE_SRC}) center / 1168px auto repeat` }}
            />
            {/* No section number here: the lockup starts where the other
                sections' "0" sits, 64px in (24px rail column + 40px gap). */}
            <div className="relative px-3 py-[21px] md:px-6 lg:pb-[22px] lg:pl-16 lg:pr-0">
              <div className="min-w-0">
                <p
                  className="rv-fade mb-[13px] pt-0.5 text-[16px] font-semibold leading-6 text-white"
                  style={rv(380)}
                >
                  We should probably chat, right?
                </p>
                <h2
                  className="rv-line text-[clamp(2rem,4vw,2.5rem)] font-bold leading-[1.26] text-white"
                  style={rv(450, { dur: MOTION.major })}
                >
                  <Link href="/contact" className="transition-opacity hover:opacity-75">
                    Get in touch →
                  </Link>
                </h2>
                <p
                  className="rv-fade mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[16px] font-semibold leading-6 text-white"
                  style={rv(850)}
                >
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                      className="transition-opacity hover:opacity-75"
                    >
                      {contact.phone}
                    </a>
                    <span aria-hidden className="text-[12px] leading-[18px]">
                      |
                    </span>
                    <a
                      href={contact.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-75"
                    >
                      Resume
                    </a>
                    <span aria-hidden className="text-[12px] leading-[18px]">
                      |
                    </span>
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-75"
                    >
                      LinkedIn
                    </a>
                </p>
              </div>
            </div>
          </div>
          {/* Under the panel, on the plain paper, in the career dates' style
              (14px muted): centered on phones; from sm up its right edge meets
              the panel's. */}
          <p className="px-3 pt-4 text-center text-[14px] leading-6 tracking-[-0.01em] text-white/70 sm:pr-0 sm:text-right md:pl-6 lg:pl-16">
            Built using way too many AI platforms to remember
          </p>
        </div>
      </footer>

      {/* The fixed bottom band (PerimeterFrame) covers the page's last
          32px at lg; this keeps the footer clear of it, as in the Figma.
          Below lg there's no bottom band, so no gap. */}
      <div aria-hidden className="hidden h-8 lg:block" />

      <RevealObserver />
    </main>
  );
}
