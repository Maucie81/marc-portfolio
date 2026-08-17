"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HarrisonInlineNav() {
  const pathname = usePathname();
  const isToday = pathname === "/harrison";
  const isCare = pathname === "/harrison/care";

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        fontFamily: "var(--harrison-font-ui)",
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: "-0.84px",
        lineHeight: "18px",
      }}
      aria-label="Main"
    >
      <Link
        href="/harrison"
        aria-current={isToday ? "page" : undefined}
        style={{
          color: isToday ? "#FFA11C" : "#D3D4C5",
        }}
      >
        Today&apos;s Doses
      </Link>
      <Link
        href="/harrison/care"
        aria-current={isCare ? "page" : undefined}
        style={{
          color: isCare ? "#FFA11C" : "#D3D4C5",
        }}
      >
        Care Guide
      </Link>
    </nav>
  );
}
