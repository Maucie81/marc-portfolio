import type { ReactNode } from "react";

/**
 * Deadpan caption/stat callout — the rectangular boxes captions and data
 * points sit in throughout an underground comic, never a cartoon thought
 * bubble. Two tones only: paper-on-ink (default, reads as narration) and a
 * spot-color fill (reads as emphasis — a stat, a pull number).
 */
export default function CaptionBox({
  children,
  tone = "paper",
  className = "",
}: {
  children: ReactNode;
  tone?: "paper" | "rust" | "indigo";
  className?: string;
}) {
  const toneClass =
    tone === "rust"
      ? "bg-comix-rust text-comix-paper border-comix-ink"
      : tone === "indigo"
        ? "bg-comix-indigo text-comix-paper border-comix-ink"
        : "bg-comix-paper text-comix-ink border-comix-ink";

  return (
    <div className={`border-2 px-4 py-3 ${toneClass} ${className}`}>
      {children}
    </div>
  );
}
