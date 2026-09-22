"use client";

import { useProof } from "./ProofProvider";

/**
 * The CMYK lockup, now a button. "rail" is the original vertical strip in
 * the perimeter frame's left rail (PerimeterFrame.tsx — homepage, contact,
 * coming-soon and every case study), kept pixel-for-pixel but clickable;
 * "floating" is a compact horizontal version for the few routes without
 * that rail (lab pages), parked bottom-left.
 * Desktop only — dropping pins on a phone isn't the v1 story.
 */

const CMYK_GROUPS = [
  { label: "C", color: "#00AEEF" },
  { label: "M", color: "#EC008C" },
  { label: "Y", color: "#FFF200" },
  { label: "K", color: "#000000" },
];
const CMYK_OPACITIES = [1, 0.8, 0.6, 0.4, 0.2];

export default function ProofTrigger({ variant }: { variant: "rail" | "floating" }) {
  const proof = useProof();
  const count = proof.pins.length;
  const label = proof.panelOpen ? "Close proof notes" : "Proof notes — leave a note on this page";

  if (variant === "rail") {
    return (
      <button
        type="button"
        data-proof-ui=""
        onClick={proof.togglePanel}
        aria-label={label}
        aria-expanded={proof.panelOpen}
        className="group absolute inset-x-0 bottom-[76px] flex flex-col items-center gap-2 py-1 transition-opacity hover:opacity-80"
      >
        {count > 0 ? <Badge count={count} className="-top-3" /> : null}
        {CMYK_GROUPS.map((group) => (
          <span key={group.label} className="flex flex-col items-center gap-0.5">
            <span
              className="font-display text-[8px] font-semibold leading-none"
              style={{ color: group.color }}
            >
              {group.label}
            </span>
            <span className="flex flex-col gap-px">
              {CMYK_OPACITIES.map((opacity) => (
                <span
                  key={opacity}
                  className="block size-2.5"
                  style={{ backgroundColor: group.color, opacity }}
                />
              ))}
            </span>
          </span>
        ))}
        <Tip className="left-full top-1/2 ml-3 -translate-y-1/2" />
      </button>
    );
  }

  return (
    <button
      type="button"
      data-proof-ui=""
      onClick={proof.togglePanel}
      aria-label={label}
      aria-expanded={proof.panelOpen}
      className="group fixed bottom-11 left-[72px] z-[65] hidden items-center gap-2 border border-line bg-white px-2 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,.08)] transition-colors hover:border-ink-strong lg:flex"
    >
      {CMYK_GROUPS.map((group) => (
        <span key={group.label} className="flex gap-px">
          {CMYK_OPACITIES.map((opacity) => (
            <span
              key={opacity}
              className="block size-2"
              style={{ backgroundColor: group.color, opacity }}
            />
          ))}
        </span>
      ))}
      <span className="t-frame-mono leading-none!">Notes{count > 0 ? ` · ${count}` : ""}</span>
      <Tip className="bottom-full left-0 mb-2" />
    </button>
  );
}

function Badge({ count, className = "" }: { count: number; className?: string }) {
  return (
    <span
      className={`absolute left-1/2 flex h-4 min-w-4 -translate-x-1/2 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold leading-none text-white [font-family:var(--font-mono),ui-monospace,monospace] ${className}`}
    >
      {count}
    </span>
  );
}

function Tip({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`t-frame-mono pointer-events-none absolute whitespace-nowrap border border-line bg-white px-2 opacity-0 shadow-[0_2px_8px_rgba(0,0,0,.08)] transition-opacity group-hover:opacity-100 ${className}`}
    >
      Leave a note · C
    </span>
  );
}
