"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  markInAppNavigation,
  readScrollPosition,
  saveScrollPosition,
} from "@/lib/navigation";

/**
 * No transition — routes swap instantly, same as Next's default client-side
 * navigation. There used to be a Framer Motion fade+slide here; it was
 * removed because coordinating its timing with HorizontalTrack's GSAP setup
 * (see that file) kept causing more bugs than the animation was worth.
 *
 * What's left is scroll handling. The browser's own restoration is turned
 * off because it replays a route's previous scrollY at an unpredictable
 * point relative to React swapping the page in (which is what caused case
 * studies to initialize mid-story instead of at the cover). Instead, every
 * route's scrollY is remembered here and, on Back/Forward, restored once
 * the new route has rendered — so Back from a case study lands on the
 * homepage section the reader left from, not the top of the page.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  // Pathname the last popstate landed on; the route effect compares it to
  // the pathname it received so a hash-only pop can't leak into a later
  // Link navigation.
  const poppedTo = useRef<string | null>(null);

  useEffect(() => {
    history.scrollRestoration = "manual";

    const onPopState = () => {
      poppedTo.current = location.pathname;
    };

    const save = () => saveScrollPosition(location.pathname, window.scrollY);

    window.addEventListener("popstate", onPopState);
    window.addEventListener("scroll", save, { passive: true });
    // Capture-phase click: the outgoing route's position is written before
    // any Link handler can start the navigation.
    document.addEventListener("click", save, true);
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("scroll", save);
      document.removeEventListener("click", save, true);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  useEffect(() => {
    let isPop = poppedTo.current === pathname;
    poppedTo.current = null;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // A full document load via the browser's Back/Forward.
      const entry = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      isPop = entry?.type === "back_forward";
    } else {
      markInAppNavigation();
    }

    // "instant" bypasses `html:has(#home)`'s `scroll-behavior: smooth`
    // (globals.css) so every case below is a snap, not an animated scroll.
    const saved = isPop ? readScrollPosition(pathname) : null;
    if (saved !== null) {
      window.scrollTo({ top: saved, left: 0, behavior: "instant" });
      // Once more after layout settles (fonts, image decode) so the target
      // isn't clamped by a page that was still growing.
      const frame = requestAnimationFrame(() =>
        window.scrollTo({ top: saved, left: 0, behavior: "instant" }),
      );
      return () => cancelAnimationFrame(frame);
    }

    const target = location.hash
      ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
      : null;
    if (target) {
      target.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return <>{children}</>;
}
