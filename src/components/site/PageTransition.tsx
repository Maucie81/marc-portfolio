"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fade + slide-up transition between routes — same shape as pierregeorges.ch
 * (built on the Animsition jQuery plugin there: fade-out-up-sm on exit,
 * fade-in-up-sm on enter, 500ms each way). Next's App Router already does
 * client-side navigation, so this is the same effect without the full page
 * reload the reference site relies on to sequence exit → enter.
 *
 * `mode="wait"` (sequential exit-then-enter, see below) is load-bearing
 * right now, not just a pacing choice. A client-side `<Link>` navigation to
 * a statically-prerendered route in this app — confirmed independent of
 * paused:true, of prefetch (tested with prefetch={false}, no change), and
 * of anything in HorizontalTrack — currently lands two full copies of the
 * destination page in the DOM simultaneously (one opaque, one at opacity 0,
 * each contributing their own document height — the page ends up twice as
 * tall as it should be). A hard reload to the same URL is clean; only the
 * client-side navigation path produces it. `mode="wait"`'s ~500ms exit
 * happens to run long enough for whatever produces the second copy to
 * resolve before the new page is ever shown, so it's never been visible —
 * but switching to an overlapping crossfade (mode="sync"/default) removes
 * that buffer and exposes it immediately, doubled scroll height and all.
 * Root cause is still open — reproduces on a clean production build, so
 * it's not a dev/Fast-Refresh artifact — needs its own investigation before
 * an overlapping transition is safe to ship. Don't remove `mode="wait"`
 * without re-verifying this first.
 */
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Every route under /work/ renders HorizontalTrack, which now handles its
 * own content reveal — .cs-track fades in on its own timer, ~400ms after
 * mount (see HorizontalTrack.tsx). Stacking this wrapper's own 500ms
 * opacity fade underneath that produced the "blank screen": two separate
 * low-opacity windows, one right after the other, before anything was
 * visible. `initial` and `animate` are identical here on purpose — the
 * wrapper is fully opaque from its first frame on these routes, so the
 * shell (background, PersistentHeader nav, RailDots/BottomRule) appears
 * immediately and cs-track's own delayed fade is the only reveal left to
 * watch. `exit` is untouched — leaving a case study still fades out like
 * any other route; only entering one skips the wrapper-level fade.
 */
const instantEnterVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * The enter animation is triggered imperatively (via `controls`, inside a
 * cleanup-guarded effect) instead of Framer Motion's declarative `animate`
 * prop. That's not stylistic — it's the fix for a real double-fade-in bug.
 *
 * `animate="animate"` fires directly off the render/commit cycle with no
 * cancel-first step. React 18 StrictMode (dev only) double-invokes render,
 * and Framer Motion doesn't discard the throwaway pass the way pure
 * rendering does — it genuinely starts the enter animation, gets
 * re-triggered by the second render a couple ms later, and the two
 * overlapping tweens are exactly what reads as "fades in, disappears
 * quickly, fades in again and stays." Confirmed with a production build
 * (`next build && next start`): there StrictMode's double-invoke doesn't
 * happen and the animation fires exactly once — so this only ever showed
 * up in local dev, but that's what's actually being tested against.
 *
 * `useEffect` cleanup gives the fix a natural home: StrictMode's double
 * mount there really is mount → cleanup → mount, so `controls.stop()`
 * cancels the first (spurious) start before the second, real one begins —
 * same guard already used for HorizontalTrack's GSAP setup. `initial` and
 * `exit` stay on the declarative variants prop since AnimatePresence's own
 * exit-detection lifecycle already fired cleanly once in testing — only
 * the mount-triggered enter needed this.
 */
function TransitionChild({
  children,
  instantEnter,
}: {
  children: React.ReactNode;
  instantEnter: boolean;
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    // Snap to the top before the fade-in starts, while opacity is still 0
    // (`initial` variant), so the jump is invisible. Without this, whatever
    // scrollY the browser carried over from the previous page — or was mid-
    // way through restoring on a Back navigation — is what's on screen as
    // this page fades in: the home page reads as "washed out" because
    // you're looking at a scrolled-down, already-dense section through low
    // opacity instead of a clean top-of-page reveal, and on the case-study
    // page a nonzero scrollY at this point is exactly what makes
    // HorizontalTrack's ScrollTrigger initialize mid-story instead of at
    // the cover. `behavior: "instant"` bypasses `html:has(#home)`'s
    // `scroll-behavior: smooth` (still active here since the outgoing home
    // page hasn't unmounted at the moment this fires), which would
    // otherwise animate the jump instead of snapping it.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    controls.start("animate");
    return () => {
      controls.stop();
    };
  }, [controls]);

  return (
    <motion.div
      variants={instantEnter ? instantEnterVariants : variants}
      initial="initial"
      animate={controls}
      exit="exit"
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Every case study lives under /work/ and renders HorizontalTrack — see
  // instantEnterVariants above for why that means skipping the wrapper's
  // own fade specifically on these routes.
  const instantEnter = pathname.startsWith("/work/");

  // The browser's own scroll restoration (default "auto") replays a route's
  // previous scrollY on Back/Forward independently of this fade — it can
  // land at any point during the 500ms exit or enter tween, which is what
  // made the home page look "washed out" (fading in over a scroll position
  // it hadn't settled into yet). "manual" hands that entirely to
  // TransitionChild's own scrollTo(0, 0) above, so every route enters at a
  // known, static position before it starts fading in. Set once, here (not
  // in TransitionChild), since this component doesn't remount on route
  // change — only its AnimatePresence-managed child does.
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <TransitionChild key={pathname} instantEnter={instantEnter}>
        {children}
      </TransitionChild>
    </AnimatePresence>
  );
}
