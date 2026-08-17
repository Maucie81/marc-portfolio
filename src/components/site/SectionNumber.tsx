"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The 01–05 marker in the left margin. Turns accent while its section owns the
 * viewport — one of the few places accent is allowed (an active state).
 */
export default function SectionNumber({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current?.closest("section");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="sec-num" data-active={active}>
      <div className="sec-num-inner">
        <span>{number}</span>
        <span aria-hidden className="sec-num-bar" />
        <span className="sec-num-label">{label}</span>
      </div>
    </div>
  );
}
