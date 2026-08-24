"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: React.ReactNode;
};

/** Tick count for the progress scrubber — dense enough to read as a comb,
 * spaced evenly via `justify-content: space-between` so it never needs
 * re-measuring on resize. */
const PROGRESS_TICK_COUNT = 80;
const PROGRESS_TICKS = Array.from({ length: PROGRESS_TICK_COUNT });

/**
 * Pins the section and maps vertical scroll progress (0–1) continuously onto
 * horizontal position along one long track. No snap points: whatever falls at
 * the current progress mark is what's in view, even mid-element.
 *
 * The progress marker and the track transform are two tweens on the SAME
 * timeline at the same position with the same duration, so one value drives
 * both. With `scrub` smoothing, reading progress off the ScrollTrigger for
 * the marker instead would let it run ahead of the content during momentum —
 * this can't drift.
 */
export default function HorizontalTrack({ children }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // PageTransition's wrapper is now instantly opaque on entry for every
  // /work/ route (see instantEnterVariants there) — the shell (background,
  // header, RailDots/BottomRule) shows up immediately, and this is the
  // delayed reveal that's supposed to happen instead: cs-track sits at
  // opacity 0 for ~400ms after mount, then fades in on its own. Completely
  // independent of the GSAP setup below — the track is already correctly
  // positioned (untransformed, showing the cover) before ScrollTrigger ever
  // runs, so there's nothing to wait on. Plain useState/setTimeout rather
  // than folding it into the GSAP effect: this only ever touches opacity,
  // never transform, so it can't fight anything GSAP sets on the same node.
  const [contentVisible, setContentVisible] = useState(false);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setContentVisible(true), 400);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    const progress = progressRef.current;
    if (!section || !track || !bar || !progress) return;

    const mm = gsap.matchMedia();

    // PageTransition's route-change animation causes this component to
    // genuinely mount, fully unmount, then mount again roughly 500ms later
    // (confirmed by instrumenting the effect directly — a hard reload into
    // this page mounts once and stays put; a client-side Link navigation
    // reliably shows a real unmount ~510ms after the first mount, not just
    // React's dev-only double-invoke, which is a separate <1ms blip on top
    // of this). If setup runs on that first, transient mount, the resulting
    // pin-spacer gets created and immediately torn down when it unmounts —
    // the visible "presents, disappears, reappears" flash. A fixed 600ms
    // floor (safely past the observed ~510ms gap) before even attempting
    // setup means only the final, settled mount ever creates one.
    const SETUP_DELAY_MS = 600;
    const setupTimeoutId = window.setTimeout(() => {
      mm.add(
        "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        () => {
        // Re-measured continuously via the function values below (resize,
        // font swap, image decode all change this).
        const distance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth);

        // `paused: true` is load-bearing, not stylistic. This timeline is
        // built in the longhand form — created here, handed to
        // ScrollTrigger's `animation` option below — rather than the
        // `gsap.timeline({ scrollTrigger: {...} })` shorthand that
        // implicitly pauses playback until the trigger attaches. Without it,
        // an unpaused timeline starts playing on GSAP's own ticker the
        // instant it's created — fully independent of scroll — and keeps
        // running for its full 1s duration until ScrollTrigger.create()
        // below finally claims it. That claim is delayed behind the
        // waitForStableWidth rAF loop just below, so whatever progress the
        // untethered timeline reached in that gap is what showed up as a
        // flash of a mid-story block before ScrollTrigger corrected it back
        // to match scroll position. Pausing it means it just sits at its
        // immediateRender'd from-state (track x:0, i.e. the cover) until
        // ScrollTrigger takes over — nothing to flash.
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.fromTo(track, { x: 0 }, { x: () => -distance(), duration: 1 }, 0);
        tl.fromTo(bar, { left: "0%" }, { left: "100%", duration: 1 }, 0);

        let st: ReturnType<typeof ScrollTrigger.create> | null = null;
        let rafId = 0;

        // --- Drag-to-scrub: grab the marker (or anywhere on the tick row)
        // and drag left/right to move through the story directly, instead of
        // scrolling. `tl.progress()` gives instant 1:1 feedback (bypassing
        // the scrub smoothing lag); `st.scroll()` keeps the real page scroll
        // position in sync so wheel/trackpad scrolling resumes from the
        // right spot the moment the pointer is released. Guarded on `st`
        // since these listeners are live before the trigger exists (see
        // below) — before creation there's nothing to scrub yet.
        let dragging = false;

        const ratioFromEvent = (e: PointerEvent) => {
          const rect = progress.getBoundingClientRect();
          return gsap.utils.clamp(0, 1, (e.clientX - rect.left) / rect.width);
        };

        const scrubTo = (ratio: number) => {
          if (!st) return;
          tl.progress(ratio);
          st.scroll(st.start + ratio * (st.end - st.start));
        };

        const onPointerDown = (e: PointerEvent) => {
          dragging = true;
          progress.setPointerCapture(e.pointerId);
          progress.dataset.dragging = "true";
          scrubTo(ratioFromEvent(e));
        };
        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return;
          scrubTo(ratioFromEvent(e));
        };
        const onPointerUp = (e: PointerEvent) => {
          if (!dragging) return;
          dragging = false;
          progress.dataset.dragging = "false";
          if (progress.hasPointerCapture(e.pointerId)) {
            progress.releasePointerCapture(e.pointerId);
          }
        };

        progress.addEventListener("pointerdown", onPointerDown);
        progress.addEventListener("pointermove", onPointerMove);
        progress.addEventListener("pointerup", onPointerUp);
        progress.addEventListener("pointercancel", onPointerUp);

        // The track's own width never changes — only its scrollWidth does — so
        // a ResizeObserver on it would never fire. And if the horizontal CSS
        // hasn't applied at the moment ScrollTrigger first measures, distance
        // is 0, `end` resolves to "+=0", and the section pins with no scroll
        // range and never recovers on its own. So this waits for scrollWidth
        // to hold steady BEFORE creating the trigger at all, rather than
        // creating immediately and calling ScrollTrigger.refresh() to correct
        // it afterward.
        //
        // That distinction matters: with `pin: true`, every refresh() briefly
        // tears down and rebuilds the pin-spacer — visible as a flash — and
        // images/fonts don't all land in the same frame, so scrollWidth
        // typically ticks upward more than once as each one decodes. Correcting
        // via refresh() (the previous version) meant one flash per tick. This
        // waits out that settling period first and only creates once, with
        // already-correct measurements, so there's nothing to correct after —
        // no refresh, no flash, for the common case. If a resize or a very
        // late-decoding asset changes the width after this point, ScrollTrigger
        // still fires its own refresh via its resize listener as normal.
        let lastWidth = track.scrollWidth;
        let stableFrames = 0;
        let framesElapsed = 0;
        rafId = requestAnimationFrame(function waitForStableWidth() {
          framesElapsed++;
          const width = track.scrollWidth;
          if (width !== lastWidth) {
            lastWidth = width;
            stableFrames = 0;
          } else {
            stableFrames++;
          }
          // Settle once width holds for ~100ms, or after ~1.5s regardless —
          // stylesheet, fonts, and images should have landed by then even if
          // something's still shifting layout marginally.
          if (stableFrames > 6 || framesElapsed > 90) {
            rafId = 0;
            // ScrollTrigger reads whatever window.scrollY already is as the
            // initial scrub progress — it doesn't assume a fresh page starts
            // at 0. PageTransition resets scroll on mount, but that's ~600ms
            // plus this stable-width wait before this point, which is enough
            // time for stale scroll state (or a still-settling browser
            // scroll-restoration) to reassert itself. Forcing it again right
            // here, at the moment the trigger is actually created, is what
            // guarantees the track always initializes at the cover block
            // (progress 0) instead of wherever leftover scrollY happens to
            // land — that leftover value is exactly what showed up as a
            // mid-story panel dropping in instead of the cover.
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            st = ScrollTrigger.create({
              animation: tl,
              trigger: section,
              start: "top top",
              end: () => "+=" + distance(),
              pin: true,
              anticipatePin: 1,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                // Keep the bar up at exactly progress 1 — the trigger reports
                // inactive at that boundary, but it's the last frame of the
                // sequence, not the end of it.
                progress.dataset.visible =
                  self.isActive || self.progress >= 1 ? "true" : "false";
              },
            });
            // `pin: true` inflates the document from one viewport tall to the
            // full story length (thousands of px) in this same tick — that's
            // a big enough layout change that it's not safe to assume
            // window.scrollY is still the 0 we just set two lines up by the
            // time ScrollTrigger finishes its own initial measurement pass
            // over the new, taller document. `st.scroll(st.start)` is
            // ScrollTrigger's own API for putting scroll and scrub progress
            // back in lockstep — the same method the drag-to-scrub handler
            // above already uses — so this re-asserts position 0 through the
            // mechanism ScrollTrigger itself considers authoritative, rather
            // than trusting a raw scrollTo from before the layout settled.
            st.scroll(st.start);
            tl.progress(0);
            return;
          }
          rafId = requestAnimationFrame(waitForStableWidth);
        });

        return () => {
          if (rafId) cancelAnimationFrame(rafId);
          progress.removeEventListener("pointerdown", onPointerDown);
          progress.removeEventListener("pointermove", onPointerMove);
          progress.removeEventListener("pointerup", onPointerUp);
          progress.removeEventListener("pointercancel", onPointerUp);
          progress.dataset.dragging = "false";
          // `kill(true)` also unwraps the pin-spacer. Without it, resizing
          // down to the vertical fallback leaves a 100vh spacer behind that
          // clamps the stacked content.
          st?.kill(true);
          tl.kill();
          progress.dataset.visible = "false";
          gsap.set(track, { clearProps: "transform" });
          gsap.set(bar, { clearProps: "left" });
          ScrollTrigger.refresh();
        };
      },
      );
    }, SETUP_DELAY_MS);

    return () => {
      window.clearTimeout(setupTimeoutId);
      // No-op if the timeout never fired (nothing registered yet).
      mm.revert();
    };
  }, []);

  return (
    <>
      <div
        ref={progressRef}
        className="cs-progress"
        // Shell chrome, not content — renders at full opacity immediately on
        // mount, same as PersistentHeader/RailDots/BottomRule, instead of
        // waiting on GSAP setup (SETUP_DELAY_MS + the stable-width wait)
        // before the onToggle callback below ever gets a chance to flip this
        // to "true". The onToggle callback still owns hiding it again once
        // scroll passes the end of the story — that's real scroll-driven
        // state, not a mount reveal, so it's untouched.
        data-visible="true"
        data-dragging="false"
      >
        <div className="cs-progress-ticks" aria-hidden="true">
          {PROGRESS_TICKS.map((_, i) => (
            <span key={i} className="cs-progress-tick" />
          ))}
        </div>
        <div ref={barRef} className="cs-progress-marker" />
      </div>

      <section ref={sectionRef} className="cs-pin">
        <div
          ref={trackRef}
          className="cs-track"
          style={{
            opacity: contentVisible ? 1 : 0,
            transition: "opacity 400ms ease",
          }}
        >
          {children}
        </div>
      </section>
    </>
  );
}
