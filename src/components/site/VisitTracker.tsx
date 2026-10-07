"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { actionFor, trackAction, trackPageview } from "@/lib/analytics/client";

/**
 * Feeds the private log behind /analytics, alongside Vercel Web Analytics
 * (untouched): a pageview on the first page load and on every App Router
 * navigation to a new path, plus the few portfolio actions in
 * src/lib/analytics/events.ts. Session handling, exclusions and what gets
 * sent live in src/lib/analytics/client.ts.
 *
 * Actions are picked up from one capturing click listener rather than a
 * handler in each component — by link address, or a data-track attribute
 * where the address doesn't say (see actionFor). Middle-clicks (auxclick)
 * count too, since opening a case study or the resume in a new tab is the
 * same intent.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackPageview(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      if (!(e.target instanceof Element)) return;
      const action = actionFor(e.target);
      if (action) trackAction(...action);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return null;
}
