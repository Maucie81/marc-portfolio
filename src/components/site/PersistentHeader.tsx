"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowIcon from "@/components/site/ArrowIcon";
import {
  BottomBand,
  LeftRail,
  RightRail,
  TopBandChrome,
} from "@/components/site/PerimeterFrame";
import { contact } from "@/lib/home";

/**
 * Renders whichever nav belongs to the current route, but lives in the root
 * layout as a sibling of PageTransition's {children}, not inside it.
 * Previously the home page's own <header> and each case study's own
 * <TopBar> were rendered as part of {children}, inside PageTransition's
 * animated motion.div; the nav disappearing along with the rest of the page
 * during every transition was the most visible part of a blank-screen issue
 * that motivated removing that animation entirely (see PageTransition.tsx).
 * Scoped to the three case studies that share
 * CaseStudyPage.tsx (Yahoo Partner Portal, Airbnb Hotels, Headspace Admin
 * Portal Redesign) plus the home page — headspace-health-umd and ht-perks
 * each keep their own separate, locally-defined header unchanged, since
 * folding those in too would mean touching more surface than this pass
 * intends to.
 */

const RESUME_URL = contact.resume;

const CASE_STUDY_TITLES: Record<string, string> = {
  "/work/yahoo-partner-portal": "Yahoo Partner Portal",
  "/work/airbnb-hotels": "Airbnb Hotels",
  "/work/headspace-admin-portal": "Headspace Admin Portal Redesign",
};

function HomeHeader() {
  // Mobile/tablet: unchanged sticky in-flow header, no frame chrome (Step 5
  // exclusion). At lg+ this becomes the perimeter frame's fixed top band —
  // position switches to fixed and height locks to 42px (nav vertically
  // centered instead of padded) so PerimeterFrame's dividers/diamond/
  // crosshairs, absolutely positioned against this same element, land where
  // the mirrored BottomBand expects. See page.tsx's lg:pt-[42px] on <main>,
  // which compensates for this leaving normal document flow at lg+.
  return (
    <>
      <header className="sticky top-0 z-50 bg-bg lg:fixed lg:inset-x-0 lg:top-0 lg:bg-white">
        <div className="relative">
          <div className="mx-auto flex max-w-[88rem] items-center justify-between px-6 pb-6 pt-6 lg:h-[42px] lg:w-[calc(100%-4rem)] lg:px-8 lg:py-0">
            {/* ml-[16.714px]: nudges the whole lockup right so the dot's
                centre (14px, no border → centre at x=7 from its own left
                edge) lands on the hero's crosshair centre (x=23.714 from the
                shared left edge — same 540:xxx grid as the rail-dot fix).
                Moved as one unit, not just the dot, so the dot stays glued
                to "Marc Favro" via the existing gap-3 rather than tearing
                away from it. Desktop typography (Roboto Mono, 10/20,
                uppercase, black) confirmed via get_design_context on
                627:49704/643:52825 — mobile keeps the original Google Sans
                Flex treatment (no confirmed discrepancy there). */}
            <a
              href="/"
              className="ml-[16.714px] flex items-center gap-3 font-display text-base font-semibold leading-[18px] tracking-[-0.16px] text-ink transition-colors hover:text-accent lg:text-[12px] lg:font-normal lg:uppercase lg:leading-[20px] lg:tracking-normal lg:text-black lg:[font-family:var(--font-mono),ui-monospace,monospace]"
            >
              <span
                aria-hidden
                className="inline-block size-[14px] shrink-0 rounded-full bg-accent"
              />
              Marc Favro
            </a>
            <nav className="flex gap-8 font-display text-sm font-semibold leading-[18px] tracking-[-0.14px] text-muted lg:gap-4 lg:text-[12px] lg:font-normal lg:uppercase lg:leading-[20px] lg:tracking-normal lg:text-black lg:[font-family:var(--font-mono),ui-monospace,monospace]">
              <a
                href="#hero"
                className="transition-colors hover:text-accent lg:font-semibold"
              >
                Home
              </a>
              <a href="#work" className="transition-colors hover:text-accent">
                Work
              </a>
              <a
                href="/contact"
                className="transition-colors hover:text-accent"
              >
                Contact
              </a>
              <a
                href={contact.resume}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                Resume
              </a>
            </nav>
          </div>
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <TopBandChrome />
          </div>
        </div>
      </header>
      <BottomBand />
      <LeftRail />
      <RightRail />
    </>
  );
}

function CaseStudyTopBar({ title }: { title: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-line bg-bg/95 px-6 backdrop-blur min-[901px]:h-16 min-[901px]:px-8">
      <div className="flex items-center gap-3 min-[901px]:gap-[65px]">
        <Link
          href="/#work"
          className="flex items-center gap-1.5 text-sm font-medium leading-4 text-ink-strong transition-colors hover:text-accent [font-family:var(--font-display)]"
        >
          <ArrowIcon className="mt-0 rotate-180 text-current" />
          Back
        </Link>
        <span className="text-sm font-medium leading-4 text-accent [font-family:var(--font-display)]">
          {title}
        </span>
      </div>
      <nav className="hidden gap-8 text-xs leading-4 text-ink-strong min-[901px]:flex">
        <Link href="/#hero" className="transition-colors hover:text-accent">
          Home
        </Link>
        <Link href="/#work" className="transition-colors hover:text-accent">
          Work
        </Link>
        <Link href="/#contact" className="transition-colors hover:text-accent">
          Contact
        </Link>
        <a href={RESUME_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
          Resume
        </a>
      </nav>
    </header>
  );
}

export default function PersistentHeader() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <HomeHeader />;
  }

  const title = CASE_STUDY_TITLES[pathname];
  if (title) {
    return <CaseStudyTopBar title={title} />;
  }

  return null;
}
