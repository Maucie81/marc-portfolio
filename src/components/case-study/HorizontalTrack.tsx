"use client";

import { useLayoutEffect, useRef } from "react";
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

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    const progress = progressRef.current;
    if (!section || !track || !bar || !progress) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Re-measured on every refresh (resize, font swap, image decode).
        const distance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth);

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.fromTo(track, { x: 0 }, { x: () => -distance(), duration: 1 }, 0);
        tl.fromTo(bar, { left: "0%" }, { left: "100%", duration: 1 }, 0);

        const st = ScrollTrigger.create({
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

        // --- Drag-to-scrub: grab the marker (or anywhere on the tick row)
        // and drag left/right to move through the story directly, instead of
        // scrolling. `tl.progress()` gives instant 1:1 feedback (bypassing
        // the scrub smoothing lag); `st.scroll()` keeps the real page scroll
        // position in sync so wheel/trackpad scrolling resumes from the
        // right spot the moment the pointer is released.
        let dragging = false;

        const ratioFromEvent = (e: PointerEvent) => {
          const rect = progress.getBoundingClientRect();
          return gsap.utils.clamp(0, 1, (e.clientX - rect.left) / rect.width);
        };

        const scrubTo = (ratio: number) => {
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
        // range and never recovers on its own. So watch the measured width
        // directly and refresh whenever it moves, until it holds steady.
        let lastWidth = track.scrollWidth;
        let stableFrames = 0;
        let rafId = requestAnimationFrame(function watchWidth() {
          const width = track.scrollWidth;
          if (width !== lastWidth) {
            lastWidth = width;
            stableFrames = 0;
            ScrollTrigger.refresh();
          } else if (++stableFrames > 90) {
            rafId = 0; // ~1.5s steady: stylesheet, fonts and images have landed
            return;
          }
          rafId = requestAnimationFrame(watchWidth);
        });

        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        document.fonts?.ready.then(refresh).catch(() => {});

        return () => {
          if (rafId) cancelAnimationFrame(rafId);
          window.removeEventListener("load", refresh);
          progress.removeEventListener("pointerdown", onPointerDown);
          progress.removeEventListener("pointermove", onPointerMove);
          progress.removeEventListener("pointerup", onPointerUp);
          progress.removeEventListener("pointercancel", onPointerUp);
          progress.dataset.dragging = "false";
          // `kill(true)` also unwraps the pin-spacer. Without it, resizing
          // down to the vertical fallback leaves a 100vh spacer behind that
          // clamps the stacked content.
          st.kill(true);
          tl.kill();
          progress.dataset.visible = "false";
          gsap.set(track, { clearProps: "transform" });
          gsap.set(bar, { clearProps: "left" });
          ScrollTrigger.refresh();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <>
      <div
        ref={progressRef}
        className="cs-progress"
        data-visible="false"
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
        <div ref={trackRef} className="cs-track">
          {children}
        </div>
      </section>
    </>
  );
}
