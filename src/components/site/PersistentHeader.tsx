"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowIcon from "@/components/site/ArrowIcon";
import BackLink from "@/components/site/BackLink";
import {
  BottomBand,
  LeftRail,
  RightRail,
  TopBandChrome,
} from "@/components/site/PerimeterFrame";
import { contact } from "@/lib/home";
import { CASE_STUDY_TITLES } from "@/lib/page-titles";

/**
 * Renders whichever nav belongs to the current route, but lives in the root
 * layout as a sibling of PageTransition's {children}, not inside it.
 * Previously the home page's own <header> and each case study's own
 * <TopBar> were rendered as part of {children}, inside PageTransition's
 * animated motion.div; the nav disappearing along with the rest of the page
 * during every transition was the most visible part of a blank-screen issue
 * that motivated removing that animation entirely (see PageTransition.tsx).
 * Covers the three case studies that share CaseStudyPage.tsx (Yahoo Partner
 * Portal, Airbnb Hotels, Headspace Admin Portal Redesign), Headspace Unified
 * Main Door (its own page.tsx, but the same top bar so it reads as one of
 * the set), plus the home page. ht-perks keeps its own locally-defined
 * header.
 */

const RESUME_URL = contact.resume;

function HomeHeader({ active }: { active: "home" | "contact" }) {
  const activeClass = (key: typeof active) =>
    active === key ? " text-accent hover:text-accent lg:font-semibold" : "";
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
          <div className="mx-auto flex items-center justify-between px-6 pb-6 pt-6 lg:h-[42px] lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:py-0">
            {/* w-[min(1376px,...)], centered (mx-auto): content must not
                grow past the confirmed 1440px design width (get_metadata,
                node 627:49704) minus the 32px rail on each side —
                matches <main>'s own treatment. Below that width the
                min() falls through to the fluid calc(100%-4rem) term,
                unchanged (logo near the left rail, nav links near the
                right, spreading further apart via
                justify-between as the window widens) at any width. */}
            {/* ml-[0px]: aligns the logo lockup's own left edge flush
                with the hero grid box's left edge (64px), per direct
                pixel check — measured logo at 81px vs. hero box at 64px
                (17px too far right), so the previous ml-[16.714px] (a
                different, unrelated alignment target) is reduced by that
                same 17px. Moved as one unit, not just the dot, so the dot
                stays glued to "Marc Favro" via the existing gap-3 rather
                than tearing away from it. Desktop typography (Roboto
                Mono, 10/20, uppercase, black) confirmed via
                get_design_context on 627:49704/643:52825 — mobile keeps
                the original Google Sans Flex treatment (no confirmed
                discrepancy there). */}
            <Link
              href="/"
              className="ml-[0px] flex items-center gap-3 font-display text-base font-semibold leading-[18px] tracking-[-0.16px] text-ink transition-colors hover:text-accent lg:text-[12px] lg:font-normal lg:uppercase lg:leading-[20px] lg:tracking-normal lg:text-black lg:[font-family:var(--font-mono),ui-monospace,monospace]"
            >
              <span
                aria-hidden
                className="inline-block size-[14px] shrink-0 rounded-full bg-accent"
              />
              Marc Favro
            </Link>
            <nav className="flex gap-8 font-display text-sm font-semibold leading-[18px] tracking-[-0.14px] text-muted lg:gap-4 lg:text-[12px] lg:font-normal lg:uppercase lg:leading-[20px] lg:tracking-normal lg:text-black lg:[font-family:var(--font-mono),ui-monospace,monospace]">
              <Link
                href="/#hero"
                className={`transition-colors hover:text-accent${activeClass("home")}`}
              >
                Home
              </Link>
              <Link
                href="/contact"
                className={`transition-colors hover:text-accent${activeClass("contact")}`}
              >
                Contact
              </Link>
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

/** Case-study nav. Below 901px (the vertical-fallback layout) it's the
 * original 56px sticky strip: "← Back · title", grey, hairline underneath.
 * From 901px up — the same width HorizontalTrack/globals.css switch to the
 * pinned horizontal story — it becomes the perimeter frame's 42px white top
 * band, with the same TopBandChrome ornaments, BottomBand, and rails the
 * homepage draws (PerimeterFrame.tsx), so a case study reads as the same
 * printed sheet as the page it was opened from. Nav type switches to the
 * band's Roboto Mono role at that width too (mirrors HomeHeader's lg:
 * treatment) — the title keeps its accent color so it still reads as the
 * breadcrumb, 32px right of "Back" at every width (per direct request).
 * Content insets 64px from each viewport edge: 32px rail +
 * 32px, landing "Back" on the same x the homepage logo sits at (at 1440).
 * Not capped/centered like the homepage's 1376px column, because the
 * horizontal track underneath isn't either. */
function CaseStudyTopBar({ title }: { title: string }) {
  const bandType =
    "min-[901px]:text-[12px] min-[901px]:font-normal min-[901px]:uppercase min-[901px]:leading-[20px] min-[901px]:tracking-normal min-[901px]:[font-family:var(--font-mono),ui-monospace,monospace]";
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/95 backdrop-blur min-[901px]:border-b-0 min-[901px]:bg-white min-[901px]:backdrop-blur-none">
        <div className="relative">
          <div className="flex h-14 items-center justify-between px-6 min-[901px]:h-[42px] min-[901px]:px-16">
            <div className="flex items-center gap-8">
              <BackLink
                className={`flex items-center gap-1.5 text-sm font-medium leading-4 text-ink-strong transition-colors hover:text-accent [font-family:var(--font-display)] min-[901px]:text-black ${bandType}`}
              >
                <ArrowIcon className="mt-0 rotate-180 text-current" />
                Back
              </BackLink>
              <span
                className={`text-sm font-medium leading-4 text-accent [font-family:var(--font-display)] ${bandType}`}
              >
                {title}
              </span>
            </div>
            <nav
              className={`hidden gap-4 text-xs leading-4 text-ink-strong min-[901px]:flex min-[901px]:text-black ${bandType}`}
            >
              <Link href="/#hero" className="transition-colors hover:text-accent">
                Home
              </Link>
              <Link href="/#contact" className="transition-colors hover:text-accent">
                Contact
              </Link>
              <a href={RESUME_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
                Resume
              </a>
            </nav>
          </div>
          <div className="pointer-events-none absolute inset-0 hidden min-[901px]:block">
            <TopBandChrome />
          </div>
        </div>
      </header>
      <BottomBand breakpoint="cs" />
      <LeftRail breakpoint="cs" />
      <RightRail breakpoint="cs" />
    </>
  );
}

export default function PersistentHeader() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/coming-soon") {
    return <HomeHeader active="home" />;
  }
  if (pathname === "/contact") {
    return <HomeHeader active="contact" />;
  }

  const title = CASE_STUDY_TITLES[pathname];
  if (title) {
    return <CaseStudyTopBar title={title} />;
  }

  return null;
}
