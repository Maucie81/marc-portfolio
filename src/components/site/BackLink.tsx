"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { canGoBackInApp } from "@/lib/navigation";

/** A "Back" link that really goes back. Plain clicks step through history
 * (PageTransition then restores the previous page's scroll position);
 * `fallbackHref` is only used when the reader arrived from outside the
 * site, and for modified clicks / no-JS, which keep the plain anchor. */
export default function BackLink({
  fallbackHref = "/#work",
  className,
  children,
}: {
  fallbackHref?: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !canGoBackInApp()
    ) {
      return;
    }
    event.preventDefault();
    router.back();
  };

  return (
    <Link href={fallbackHref} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
