"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * No transition — routes swap instantly, same as Next's default client-side
 * navigation. There used to be a Framer Motion fade+slide here; it was
 * removed because coordinating its timing with HorizontalTrack's GSAP setup
 * (see that file) kept causing more bugs than the animation was worth: a
 * ~1s blank-screen window, a doubled-DOM bug on /work/* routes masked only
 * by the fade's own delay, double-fade-in races with React StrictMode, etc.
 * What's left here is only the functional scroll-position fix those bugs
 * exposed — unrelated to animation, still needed regardless of transition
 * style: without it, whatever scrollY the browser carries over from the
 * previous route (or restores on Back) is what HorizontalTrack's
 * ScrollTrigger reads on setup, which is what caused case studies to
 * initialize mid-story instead of at the cover.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hands scroll position on navigation entirely to the effect below,
  // instead of letting the browser replay a route's previous scrollY on
  // Back/Forward at some unpredictable point.
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    // "instant" bypasses `html:has(#home)`'s `scroll-behavior: smooth`
    // (globals.css) so this is a snap, not an animated scroll.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return <>{children}</>;
}
