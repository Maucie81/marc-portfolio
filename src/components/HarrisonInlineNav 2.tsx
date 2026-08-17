"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function HarrisonInlineNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="absolute right-0 top-[24px] flex justify-end" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-[#56440f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa11c] focus-visible:ring-offset-2"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-[4px] border border-[#d3d4c5] bg-[#fcfdf0] py-2 shadow-sm" role="menu">
          <Link href="/harrison" className="block px-4 py-2 text-[18px] font-medium text-[#ffa11c]" role="menuitem" aria-current={pathname === "/harrison" ? "page" : undefined} onClick={() => setOpen(false)}>Today&apos;s Doses</Link>
          <Link href="/harrison/care" className="block px-4 py-2 text-[18px] font-medium text-[#ffa11c]" role="menuitem" aria-current={pathname === "/harrison/care" ? "page" : undefined} onClick={() => setOpen(false)}>Care Guide</Link>
        </div>
      )}
    </div>
  );
}
