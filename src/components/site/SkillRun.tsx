"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * The skills list's wrapper. On phones the skills flow as one run with a
 * "•" glued to the end of each skill, so a line can end on a dot that
 * separates nothing. After layout (and on every resize / font load) this
 * hides any dot whose next skill starts on a lower line; from md up, where
 * the designed rows never end on a dot, it leaves them all visible.
 */
export default function SkillRun({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 768px)");

    const update = () => {
      const dots = el.querySelectorAll<HTMLElement>("[data-skill-dot]");
      dots.forEach((dot) => (dot.style.visibility = ""));
      if (wide.matches) return;
      dots.forEach((dot) => {
        const next = dot.nextElementSibling;
        if (!next) return;
        const dotTop = dot.getBoundingClientRect().top;
        const nextTop = next.getClientRects()[0]?.top ?? dotTop;
        if (nextTop > dotTop + 12) dot.style.visibility = "hidden";
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    wide.addEventListener("change", update);
    document.fonts?.ready.then(update);
    return () => {
      ro.disconnect();
      wide.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={ref} role="list" className={className}>
      {children}
    </div>
  );
}
