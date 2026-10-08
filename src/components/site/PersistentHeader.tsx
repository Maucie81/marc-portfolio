"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type MouseEvent, useEffect, useRef, useState } from "react";
import ArrowIcon from "@/components/site/ArrowIcon";
import BackLink from "@/components/site/BackLink";
import {
  BottomBand,
  LeftRail,
  RightRail,
  SHEET,
  TopBandChrome,
} from "@/components/site/PerimeterFrame";
import { contact } from "@/lib/home";
import { CASE_STUDY_TITLES, comingSoonProject } from "@/lib/page-titles";

/**
 * Renders whichever nav belongs to the current route, but lives in the root
 * layout as a sibling of PageTransition's {children}, not inside it.
 * Previously the home page's own <header> and each case study's own
 * <TopBar> were rendered as part of {children}, inside PageTransition's
 * animated motion.div; the nav disappearing along with the rest of the page
 * during every transition was the most visible part of a blank-screen issue
 * that motivated removing that animation entirely (see PageTransition.tsx).
 * Covers the three case studies that share CaseStudyPage.tsx (Yahoo Partner
 * Portal, Airbnb Account Creation & Onboarding, Headspace Admin Portal
 * Redesign), Headspace Unified
 * Main Door (its own page.tsx, but the same top bar so it reads as one of
 * the set), the coming-soon page (same top bar, title from its `?p=` slug),
 * and the contact page (same top bar, static "Contact" title) — plus the
 * home page, which is the only route still on HomeHeader. */

const RESUME_URL = contact.resume;

function HomeHeader({ active }: { active: "home" | "contact" }) {
  // Active = the word set bold, not recolored. Accent is reserved for
  // interactive/landmark type elsewhere, and on this band it was the only
  // place a nav item changed hue, which read as a link state rather than a
  // location marker.
  const activeClass = (key: typeof active) =>
    active === key ? " font-semibold" : "";

  // Phones (<640px) fold Home / Work / Contact / Resume into a menu button. Closes
  // on a link tap, Escape, or any tap outside the header.
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);
  // The logo goes back to the top of the homepage. This header only shows
  // on the homepage, where a link to "/" alone would stay put (same route),
  // so the scroll is done here; any "#section" left in the address is
  // dropped with it. Modified clicks still open the link as usual.
  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    closeMenu();
    if (location.hash) history.replaceState(history.state, "", "/");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  };
  // Mobile/tablet: unchanged sticky in-flow header, no frame chrome (Step 5
  // exclusion). At lg+ this becomes the perimeter frame's fixed top band —
  // position switches to fixed and height locks to 42px (nav vertically
  // centered instead of padded) so PerimeterFrame's dividers/diamond/
  // crosshairs, absolutely positioned against this same element, land where
  // the mirrored BottomBand expects. See page.tsx's lg:pt-[42px] on <main>,
  // which compensates for this leaving normal document flow at lg+.
  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-white lg:fixed lg:inset-x-0 lg:top-0"
      >
        <div className="relative">
          <div className="mx-auto flex items-center justify-between px-6 py-4 md:px-12 lg:h-[42px] lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:py-0">
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
                than tearing away from it. The name is Google Sans Flex
                SemiBold 16, sentence case, per direct request (it was
                Roboto Mono uppercase, like the nav links still are).
                Desktop (lg+): the name sits 2px nearer the dot (gap 10), and
                the whole lockup is nudged 3px right (lg:ml-[3px]) so the
                dot's center lands on the center of the rail circle below
                it (circle 12px at x=68, dot 14px; measured 3px apart at
                every width from 1024 up). The name travels with the dot.
                Type is the same spec as the "Recent work" section title
                (.t-section-title): 16px / 600 / no tracking, at every
                width. */}
            <Link
              href="/"
              onClick={toTop}
              className="ml-[0px] lg:ml-[3px] flex items-center gap-3 text-[16px] lg:gap-2.5 font-semibold leading-[20px] text-ink-strong transition-colors hover:text-accent [font-family:var(--font-display),system-ui,sans-serif]"
            >
              <span
                aria-hidden
                className="inline-block size-[14px] shrink-0 rounded-full bg-accent"
              />
              Marc Favro
            </Link>
            <nav className="hidden gap-4 text-[12px] font-normal uppercase leading-[20px] tracking-normal text-ink-strong sm:flex [font-family:var(--font-mono),ui-monospace,monospace]">
              <Link
                href="/#hero"
                className={`transition-colors hover:text-accent${activeClass("home")}`}
              >
                Home
              </Link>
              <Link href="/#work" className="transition-colors hover:text-accent">
                Work
              </Link>
              <a
                href={contact.resume}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-accent"
              >
                Resume
              </a>
              <Link
                href="/contact"
                className={`transition-colors hover:text-accent${activeClass("contact")}`}
              >
                Contact
              </Link>
            </nav>
            {/* Two 20px strokes that cross into an × when open. 40px hit
                area, pulled back by negative margins so the header keeps
                its height and the icon's right edge sits on the content
                edge. */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="home-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="-my-[10px] -mr-[10px] flex size-10 items-center justify-center text-ink-strong sm:hidden"
            >
              <span aria-hidden className="relative block h-[8px] w-5">
                <span
                  className={`absolute inset-x-0 h-[1.5px] bg-current transition-transform duration-200 motion-reduce:transition-none ${
                    menuOpen ? "top-[3.25px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute inset-x-0 h-[1.5px] bg-current transition-transform duration-200 motion-reduce:transition-none ${
                    menuOpen ? "top-[3.25px] -rotate-45" : "top-[6.5px]"
                  }`}
                />
              </span>
            </button>
          </div>
          {/* Phone menu: drops from under the header on the same paper,
              one 48px row per link in the nav's mono uppercase. */}
          <div
            id="home-menu"
            className={`absolute inset-x-0 top-full border-b border-line bg-white transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none sm:hidden ${
              menuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-1 opacity-0"
            }`}
          >
            <nav className="flex flex-col px-6 pb-4 md:px-12 text-[16px] font-normal uppercase leading-[24px] tracking-normal text-ink-strong [font-family:var(--font-mono),ui-monospace,monospace]">
              <Link
                href="/#hero"
                onClick={closeMenu}
                className={`border-t border-line py-3 transition-colors hover:text-accent${activeClass("home")}`}
              >
                Home
              </Link>
              <Link
                href="/#work"
                onClick={closeMenu}
                className="border-t border-line py-3 transition-colors hover:text-accent"
              >
                Work
              </Link>
              <a
                href={contact.resume}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="border-t border-line py-3 transition-colors hover:text-accent"
              >
                Resume
              </a>
              <Link
                href="/contact"
                onClick={closeMenu}
                className={`border-t border-line py-3 transition-colors hover:text-accent${activeClass("contact")}`}
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className={`pointer-events-none absolute inset-0 hidden lg:block ${SHEET}`}>
            <TopBandChrome />
          </div>
        </div>
      </header>
      <BottomBand capped />
      <LeftRail capped />
      <RightRail capped />
    </>
  );
}

/** Case-study nav — the one "← Back · title" bar every case study and the
 * coming-soon page share, so a not-yet-written project reads as one of the
 * set instead of carrying its own in-page Back row. Below 901px (the
 * vertical-fallback layout) it's the original 56px sticky strip: "← Back ·
 * title", grey, hairline underneath.
 * From 901px up — the same width HorizontalTrack/globals.css switch to the
 * pinned horizontal story — it becomes the perimeter frame's 42px white top
 * band, with the same TopBandChrome ornaments, BottomBand, and rails the
 * homepage draws (PerimeterFrame.tsx), so a case study reads as the same
 * printed sheet as the page it was opened from. Nav type switches to the
 * band's Roboto Mono role at that width too (mirrors HomeHeader's lg:
 * treatment), title included — it keeps only its accent color so it still
 * reads as the breadcrumb.
 * Content insets 64px from each viewport edge: 32px rail +
 * 32px, landing "Back" on the same x the homepage logo sits at (at 1440).
 * The title, from 901px up, is pulled out of the flex row and pinned at
 * 129.6px — the same x .cs-track's padding-left (globals.css) starts the
 * story at, i.e. the hero grid box's left edge — so the breadcrumb sits on
 * the content column, not a text-width-dependent gap after "Back". Below
 * 901px it stays in flow, 32px after Back, as before. */
function CaseStudyTopBar({
  title,
  fallbackHref,
  capped = false,
  active,
}: {
  title: string;
  /** Where "Back" goes when there's no in-app history to step through
   * (BackLink's default is /#work; coming-soon links live further down
   * the homepage). */
  fallbackHref?: string;
  /** Caps and centers the bar on the homepage's 1376px column instead of
   * letting it span the viewport. For the ordinary vertical pages that
   * borrow this bar (contact, coming-soon), whose <main> is capped the
   * same way — past 1440px their nav used to keep spreading while the
   * page content stopped, which the homepage never does. A real case
   * study stays full-bleed: the horizontal track underneath isn't capped
   * either, and its title pins to the track's own 129.6px start. */
  capped?: boolean;
  /** Nav item for the page being shown — set bold, as HomeHeader does. */
  active?: "contact";
}) {
  const bandType =
    "text-[12px] font-normal uppercase leading-[20px] tracking-normal [font-family:var(--font-mono),ui-monospace,monospace]";
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/95 backdrop-blur min-[901px]:border-b-0 min-[901px]:bg-white min-[901px]:backdrop-blur-none">
        <div className="relative">
          <div
            className={`flex h-14 items-center justify-between px-6 min-[901px]:h-[42px] ${
              capped
                ? "min-[901px]:mx-auto min-[901px]:w-[min(1376px,calc(100%-4rem))] min-[901px]:px-8"
                : "min-[901px]:px-16"
            }`}
          >
            <div className="flex items-center gap-8">
              <BackLink
                fallbackHref={fallbackHref}
                className={`flex items-center gap-1.5 text-ink-strong transition-colors hover:text-accent ${bandType}`}
              >
                {/* Same ArrowIcon the cover's Role/Timeline/… list uses,
                    rotated to point back; text-current so it takes the
                    link's own color. */}
                <ArrowIcon className="rotate-180 text-current" />
                Back
              </BackLink>
              {/* Capped bars keep the title in flow (32px after Back, as on
                  mobile) so it travels with the centered column; only the
                  full-bleed case-study bar pins it to the track's start. */}
              <span
                className={`text-accent ${
                  capped
                    ? ""
                    : "min-[901px]:absolute min-[901px]:left-[129.6px] min-[901px]:top-1/2 min-[901px]:-translate-y-1/2"
                } ${bandType}`}
              >
                {title}
              </span>
            </div>
            <nav
              className={`hidden gap-4 text-ink-strong min-[901px]:flex ${bandType}`}
            >
              <Link href="/#hero" className="transition-colors hover:text-accent">
                Home
              </Link>
              <Link href="/#work" className="transition-colors hover:text-accent">
                Work
              </Link>
              <a href={RESUME_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
                Resume
              </a>
              <Link
                href="/contact"
                className={`transition-colors hover:text-accent${
                  active === "contact" ? " font-semibold" : ""
                }`}
              >
                Contact
              </Link>
            </nav>
          </div>
          <div
            className={`pointer-events-none absolute inset-0 hidden min-[901px]:block ${capped ? SHEET : ""}`}
          >
            <TopBandChrome />
          </div>
        </div>
      </header>
      <BottomBand breakpoint="cs" capped={capped} />
      <LeftRail breakpoint="cs" capped={capped} />
      <RightRail breakpoint="cs" capped={capped} />
    </>
  );
}

/** Split out so useSearchParams only runs on /coming-soon — that page is
 * already dynamic (it awaits searchParams), and every other route stays
 * statically prerendered. The Suspense fallback is the same bar with the
 * generic title, so the chrome never blinks out. */
function ComingSoonTopBar() {
  const project = comingSoonProject(useSearchParams().get("p"));
  return (
    <CaseStudyTopBar
      title={project?.title ?? "Coming soon"}
      fallbackHref={project?.backHref ?? "/#additional-work"}
      capped
    />
  );
}

export default function PersistentHeader() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <HomeHeader active="home" />;
  }
  if (pathname === "/contact") {
    return <CaseStudyTopBar title="Contact" fallbackHref="/" capped active="contact" />;
  }
  if (pathname === "/coming-soon") {
    return (
      <Suspense
        fallback={
          <CaseStudyTopBar title="Coming soon" fallbackHref="/#additional-work" capped />
        }
      >
        <ComingSoonTopBar />
      </Suspense>
    );
  }

  const title = CASE_STUDY_TITLES[pathname];
  if (title) {
    return <CaseStudyTopBar title={title} />;
  }

  return null;
}
