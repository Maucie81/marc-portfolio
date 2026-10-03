import { Fragment, type CSSProperties, type ReactNode } from "react";
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
import { FURNITURE, rv, rvGroup } from "@/lib/motion";
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
  return <div aria-hidden className="h-4 bg-white lg:h-8" />;
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

/* A band: its paper fill, with its section on top. The fill is a layer of
   its own so that on the opening screen it can settle in together with the
   hero board, ahead of its own content (data-reveal="open" +
   data-reveal-fill, see src/lib/motion.ts); anywhere below that screen it's
   simply there. The white beneath is what it settles onto — below lg the
   page's base is the footer's ink. The section must be positioned to sit
   over the fill. */
function Band({ fill, children }: { fill: CSSProperties; children: ReactNode }) {
  return (
    <div className="relative bg-white">
      <div
        aria-hidden
        data-reveal="open"
        data-reveal-fill
        className="rv-settle absolute inset-0"
        style={{ ...fill, ...rv(0) }}
      />
      {children}
    </div>
  );
}

/* Same limit for the absolutely-positioned texture sheets inside a band:
   clipped rather than resized, so their dot scale is untouched. */
const BAND_CLIP = { clipPath: "inset(0 max(0px, calc((100% - 1376px) / 2)))" };

/* A section title as section furniture: static, unless it's on the opening
   screen, where it fades up with the rest (see src/lib/motion.ts). */
const TITLE_REVEAL = rv(0, FURNITURE);

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
          a plain "/" load does. Painted white: below lg the page's base is
          the footer's ink, and the board fades in over this, not over
          that. */}
      <section
        id="hero"
        aria-label="Introduction"
        data-reveal="load"
        className="mx-auto scroll-mt-[52px] bg-white lg:w-[min(1376px,calc(100%-4rem))] lg:scroll-mt-0 lg:px-0 lg:pt-[42px]"
      >
        <HomepageHero />
      </section>

      <BandGap />

      {/* ---------- 01 Recent work ---------- */}
      <Band fill={bandFill("var(--bg)")}>
        <section
          id="work"
          aria-labelledby="work-title"
          className={`${SHELL} sec relative pb-[60px] pt-10 lg:pb-[100px]`}
        >
          <SectionRail dots={3} flush reveal />
          <SectionNumber number="01" label="Recent work" reveal />
          <div className="min-w-0">
            <h2
              id="work-title"
              data-reveal="open"
              className="t-section-title rv-rise"
              style={{ ...TITLE_REVEAL, marginBottom: 32 }}
            >
              Recent work
            </h2>
            <RecentWork projects={projects} />
          </div>
        </section>
      </Band>

      <BandGap />

      {/* ---------- 02 Additional work ---------- */}
      <Band fill={bandFill("var(--bg)")}>
        <section
          id="additional-work"
          aria-labelledby="additional-work-title"
          // 80px under the last line: Figma's 20px frame padding plus the
          // ~60px the list stops short of its 538px frame (263:276081).
          className={`${SHELL} sec relative pb-[50px] pt-[50px] lg:pb-20 lg:pt-10`}
        >
          <SectionRail dots={3} flush reveal />
          <SectionNumber number="02" label="A little bit more" reveal />
          <div className="min-w-0">
            <p data-reveal="open" className="t-section-title rv-rise" style={{ ...TITLE_REVEAL, marginBottom: 60 }}>
              A little bit more
            </p>
            <AdditionalWork intro={additionalWorkIntro} items={additionalWork} />
          </div>
        </section>
      </Band>

      <BandGap />

      {/* ---------- 03 My personal reference library ---------- */}
      <Band
        fill={bandFill(
          LIBRARY_PAPER,
          `repeating-linear-gradient(to right, ${LIBRARY_RULE} 0 1px, transparent 1px 21px)`,
          `repeating-linear-gradient(to bottom, ${LIBRARY_RULE} 0 1px, transparent 1px 21px)`,
        )}
      >
        <section
          id="interests"
          aria-labelledby="library-title"
          style={{ "--lib-f": "clamp(2.75rem, 5.56vw, 5rem)" } as CSSProperties}
          className={`${SHELL} sec relative pb-[60px] pt-[50px] lg:pb-[77px] lg:pt-11`}
        >
          {/* The first circle and "03" sit level with the middle of the
              title's first line, not the section's top. The title scales
              (--lib-f, its font size), and that line's middle sits 0.918
              of it below the row's top, so both offsets follow it. */}
          <SectionRail dots={3} flush reveal className="lg:pt-[calc(0.918*var(--lib-f)-10px)]" />
          <SectionNumber
            number="03"
            label="Reference library"
            reveal
            className="lg:mt-[calc(0.918*var(--lib-f)-18px)]"
          />
          {/* The title block and the gallery are separate triggers; when
              they arrive together the gallery follows 250ms behind. */}
          <div className="min-w-0" data-reveal-group style={rvGroup(250)}>
            {/* 247:272660 — title right-set against an accent bar, the
                copy 30px on; the group centers on the 271.8px bar. */}
            {/* Motion: one of the page's two expressive moments, after the
                hero — the title's three lines rise out of their masks
                (720ms, 90ms apart), the copy simply fades in after them,
                and the library panel settles in like every card (see
                ReferenceLibrary). */}
            <div
              data-reveal="view"
              className="flex flex-col gap-6 md:flex-row md:items-center md:gap-[30px]"
            >
              <div className="flex items-center gap-[0.36em] text-[clamp(2.75rem,5.56vw,5rem)]">
                <h2 id="library-title" className="lib-title">
                  {["My personal", "reference", "library"].map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 ? " " : null}
                      <span className="rv-line block" style={rv(i * 90, { dur: 720 })}>
                        {line}
                      </span>
                    </Fragment>
                  ))}
                </h2>
                <span aria-hidden className="lib-bar shrink-0" />
              </div>
              <p className="lib-copy rv-fade max-w-[498px]" style={rv(320, { dur: 500, ease: "quiet" })}>
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
      </Band>

      <BandGap />

      {/* ---------- 04 Career history + Skills ---------- */}
      <Band fill={bandFill("var(--bg)")}>
        <section
          id="experience"
          aria-labelledby="experience-title"
          className={`${SHELL} sec relative py-[50px] lg:py-[100px]`}
        >
          <SectionRail dots={3} flush reveal />
          <SectionNumber number="04" label="Where I’ve been" reveal />
          <div className="min-w-0">
            <p data-reveal="open" className="t-section-title rv-rise" style={{ ...TITLE_REVEAL, marginBottom: 60 }}>
              Where I’ve been
            </p>
            <CareerHistory roles={roles} skills={skills} />
          </div>
        </section>
      </Band>

      {/* No white gap here: the ink footer sits flush under 04. */}

      {/* ---------- 05 Contact ---------- */}
      {/* Figma 297:301541 — the ink band, white type, the halftone panel
          behind the lockup; the copy starts at the rail column's 64px edge
          and the credit line sits under the panel. */}
      <footer id="contact" style={bandFill("var(--ink-deep)")}>
        {/* The footer panel sits at half the other sections' side inset
            (12px on phones, 24px to lg), with its copy padded back in line
            with them. */}
        <div className="mx-auto px-3 pt-4 md:px-6 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8">
          {/* Motion: restrained — no mask, no movement. It starts as soon as
              the panel is on screen: the halftone field fades up over 550ms
              and the copy fades in on top of it almost at once, so the CTA is
              readable straight away; the contact line follows. */}
          <div data-reveal="view" data-reveal-quiet className="relative">
            {/* The halftone runs out to the band's top, left and right
                edges (the wrapper's own padding), ending under the lockup.
                On the ink
                it's colour-burned (Hero 5's dark-board treatment), since a
                multiply sheet vanishes on a dark fill. It's turned 180°, so
                its top-to-bottom wipe reads bottom to top. */}
            <div
              aria-hidden
              className="rv-fade pointer-events-none absolute -inset-x-3 -top-4 bottom-0 rotate-180 mix-blend-color-burn blur-[0.5px] md:-inset-x-6 lg:-inset-x-8"
              style={{ ...rv(0, { dur: 550, ease: "quiet" }), background: `url(${TEXTURE_SRC}) center / 900px auto repeat` }}
            />
            {/* The same grid as every numbered section (hidden rail column,
                "05" 64px in, the lockup after it), in white on the ink
                (.on-dark). Its padding centers it in the halftone, which
                also takes in the wrapper's top padding above it. Below lg
                the title folds into the "05" label, as elsewhere. */}
            <div className="on-dark sec relative px-3 pb-6 pt-2 md:px-6 lg:px-0">
              <SectionRail dots={2} flush className="invisible" />
              <SectionNumber number="05" label="We should probably chat, right?" />
              <div className="min-w-0">
                <p
                  className="t-section-title rv-fade"
                  style={{ ...rv(60, { dur: 400, ease: "quiet" }), marginBottom: 20 }}
                >
                  We should probably chat, right?
                </p>
                <h2
                  className="rv-fade text-[20px] font-bold leading-[1.26] tracking-[-0.01em] text-white"
                  style={rv(60, { dur: 400, ease: "quiet" })}
                >
                  <Link href="/contact" className="transition-opacity hover:opacity-75">
                    Get in touch →
                  </Link>
                </h2>
                <p
                  className="rv-fade mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[16px] font-normal leading-6 text-white"
                  style={rv(180, { dur: 400, ease: "quiet" })}
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
          {/* Under the panel, in the career dates' style (14px muted):
              centered on phones; from sm up its right edge meets the
              panel's. It spans the band edge to edge at z 39 on its own
              ink, so the page grain (z 38) stops at the halftone panel. */}
          <p className="footer-credit relative z-[39] -mx-3 bg-[var(--ink-deep)] px-6 pb-0 pt-2 text-center sm:pb-2 text-[14px] leading-6 tracking-[-0.01em] text-white/50 sm:pr-3 sm:text-right md:-mx-6 md:pl-12 md:pr-6 lg:-mx-8 lg:pl-24 lg:pr-8">
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
