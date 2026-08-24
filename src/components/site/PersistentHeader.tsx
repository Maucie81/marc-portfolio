"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowIcon from "@/components/site/ArrowIcon";
import { contact } from "@/lib/home";

/**
 * Renders whichever nav belongs to the current route, but lives in the root
 * layout — outside PageTransition's AnimatePresence — so it never fades
 * during a route change. Previously the home page's own <header> and each
 * case study's own <TopBar> were rendered as part of {children}, inside
 * PageTransition's animated motion.div; the nav disappearing along with the
 * rest of the page during every transition was the most visible part of the
 * blank-screen issue. Scoped to the three case studies that share
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
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between px-6 pb-3 pt-6 lg:px-10">
        <a
          href="/"
          className="flex items-center gap-3 font-display text-base font-semibold leading-[18px] tracking-[-0.16px] text-ink transition-colors hover:text-accent"
        >
          <span
            aria-hidden
            className="inline-block size-[14px] shrink-0 rounded-full bg-accent"
          />
          Marc Favro
        </a>
        <nav className="flex gap-8 font-display text-sm font-semibold leading-[18px] tracking-[-0.14px] text-muted">
          <a href="#hero" className="transition-colors hover:text-accent">
            Home
          </a>
          <a href="#work" className="transition-colors hover:text-accent">
            Work
          </a>
          <a href="/contact" className="transition-colors hover:text-accent">
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
    </header>
  );
}

function CaseStudyTopBar({ title }: { title: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-line bg-bg/95 px-6 backdrop-blur min-[901px]:h-16 min-[901px]:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/#work"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2 transition-colors hover:text-accent"
        >
          <ArrowIcon className="mt-0 rotate-180 text-current" />
          Back
        </Link>
        <span aria-hidden className="h-3 w-px bg-line" />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent">
          {title}
        </span>
      </div>
      <nav className="hidden gap-8 text-xs leading-[18px] text-ink min-[901px]:flex">
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
