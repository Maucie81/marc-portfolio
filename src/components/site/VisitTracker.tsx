"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sends one page view to /api/visit (the private log behind /analytics) on
 * the first page load and on every App Router navigation to a new path.
 * Runs alongside Vercel Web Analytics, which is untouched.
 *
 * Sends only the path, the referrer and any utm_* tags — location and device
 * are worked out on the server, and nothing is stored in the browser. A
 * navigation within the site reports the site itself as its referrer, so the
 * dashboard can tell it apart from an arrival.
 *
 * Skips the owner's browsers (excludeAnalytics=true, set by /owner) and
 * automated ones (Lighthouse, Playwright). The server checks the cookie
 * again, so this is just a saved request.
 *
 * `lastPath` lives outside the component so a remount, or a query/hash-only
 * change, never counts the same page twice; a reload is a new page view.
 */
let lastPath: string | null = null;

const isOwner = () =>
  /(?:^|;\s*)excludeAnalytics=true(?:;|$)/.test(document.cookie);

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === lastPath) return;
    const arrival = lastPath === null;
    lastPath = pathname;
    if (isOwner() || navigator.webdriver) return;

    const query = new URLSearchParams(window.location.search);
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: arrival ? document.referrer : window.location.origin,
        utmSource: query.get("utm_source"),
        utmMedium: query.get("utm_medium"),
        utmCampaign: query.get("utm_campaign"),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
