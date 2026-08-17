"use client";

import { useRef, useState, useEffect } from "react";
import { HarrisonHeader } from "./HarrisonHeader";

export function HarrisonLayoutContent({ children }: { children: React.ReactNode }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <HarrisonHeader ref={headerRef} />
      <div style={{ paddingTop: headerHeight }}>
        {children}
      </div>
    </>
  );
}
