"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { pageLabel } from "@/lib/page-titles";
import { timeAgo } from "@/lib/proof/anchor";
import { PROOF_TTL_DAYS } from "@/lib/proof/types";
import { PinGlyph } from "./ProofLayer";
import { useProof } from "./ProofProvider";

/**
 * The drawer the CMYK lockup opens: every note this visitor has left, on
 * any page, grouped by page. Clicking one jumps to it (navigating first if
 * it lives on another route). Sits just inboard of the 32px left rail.
 */
export default function ProofPanel() {
  const proof = useProof();
  const { panelOpen, pins, pathname } = proof;

  const groups = useMemo(() => {
    const byPath = new Map<string, typeof pins>();
    for (const pin of pins) {
      const list = byPath.get(pin.path) ?? [];
      list.push(pin);
      byPath.set(pin.path, list);
    }
    // Current page first, then the rest in the order they were first noted.
    return [...byPath.entries()].sort(([a], [b]) =>
      a === pathname ? -1 : b === pathname ? 1 : 0,
    );
  }, [pins, pathname]);

  return (
    <AnimatePresence>
      {panelOpen ? (
        <motion.aside
          key="proof-panel"
          data-proof-ui=""
          role="dialog"
          aria-label="Proof notes"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed bottom-[76px] left-[44px] z-[70] flex max-h-[min(600px,calc(100vh-120px))] w-[312px] flex-col border border-line bg-white shadow-[0_10px_30px_rgba(0,0,0,.14)]"
        >
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CmykDots />
              <span className="font-display text-sm font-semibold leading-none text-ink-strong">
                Proof notes
              </span>
              {pins.length > 0 ? (
                <span className="t-frame-mono rounded-full bg-bg px-1.5 leading-4!">
                  {pins.length}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={proof.closePanel}
              aria-label="Close"
              className="-mr-1 flex size-6 items-center justify-center text-base leading-none text-muted transition-colors hover:text-accent"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
            <p className="t-meta-sm">
              Drop a note anywhere on the page — a question, a nit, a hunch. I read
              every one. Notes stay on this browser for {PROOF_TTL_DAYS} days.
            </p>
            <button
              type="button"
              onClick={proof.startPlacing}
              className="flex items-center justify-between bg-accent px-3 py-1.5 text-xs font-semibold leading-6 text-white transition-opacity [font-family:var(--font-display),system-ui,sans-serif] hover:opacity-90"
            >
              <span>+ New note</span>
              <kbd className="t-frame-mono rounded-[2px] border border-white/40 px-1 leading-4! text-white!">
                C
              </kbd>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-line-soft">
            {groups.length === 0 ? (
              <p className="t-meta-sm px-4 py-4">
                Nothing yet. Hit <span className="text-ink-strong">New note</span> (or press C), then click
                anywhere on the page.
              </p>
            ) : (
              groups.map(([path, list]) => (
                <section key={path} className="border-b border-line-soft last:border-b-0">
                  <h3 className="t-frame-mono px-4 pb-1 pt-3 text-muted!">
                    {pageLabel(path)}
                    {path === pathname ? " · this page" : ""}
                  </h3>
                  <ul>
                    {list.map((pin) => (
                      <li key={pin.id}>
                        <button
                          type="button"
                          onClick={() => proof.jumpTo(pin)}
                          className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bg"
                        >
                          <span className="mt-0.5 shrink-0 scale-[0.72] origin-top-left">
                            <PinGlyph tone="accent">{proof.numberOf(pin.id)}</PinGlyph>
                          </span>
                          <span className="-ml-2 flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="t-body line-clamp-2 text-[13px] leading-5 text-ink-2">
                              {pin.text}
                            </span>
                            <span className="t-meta-sm leading-4">
                              {pin.name ? `${pin.name} · ` : ""}
                              {timeAgo(pin.createdAt)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

const CMYK = ["#00AEEF", "#EC008C", "#FFF200", "#000000"];

function CmykDots() {
  return (
    <span aria-hidden className="flex gap-0.5">
      {CMYK.map((c) => (
        <span key={c} className="block size-2" style={{ backgroundColor: c }} />
      ))}
    </span>
  );
}
