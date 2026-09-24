import Image from "next/image";
import { selectedWork } from "@/lib/home";

/**
 * "Selected work | 2019 — 2026" ledger on the textured ink panel — Figma
 * 106:209338 on 94:202973 + pattern 106:209353. The desktop hero's dark
 * block and the phone hero's closing card are the same piece; they differ
 * only in how the type is sized (`textClassName`, which also carries the
 * padding) and whether a line may wrap. Every other measurement is in em off
 * that one font-size, so the ledger scales as a unit.
 */
export default function SelectedWork({
  className = "",
  textClassName = "",
  labelColumn = "7.25em",
  wrap = false,
}: {
  className?: string;
  textClassName?: string;
  /** Width of the company column — 116px at 16px on desktop. */
  labelColumn?: string;
  /** Let a line wrap under itself (phone) instead of holding one line. */
  wrap?: boolean;
}) {
  return (
    <div className={`relative isolate overflow-hidden bg-ink-deep ${className}`}>
      {/* Hand-drawn frame + crosshatch vignette, multiplied onto the ink so
          its white center disappears. Crop/offsets copied from the Figma
          image fill: the layer overhangs 3px left and 2px up, clipped here
          the way the coral panel and grid sit over it in the file. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[3px] -top-[2px] right-0 bottom-0 overflow-hidden mix-blend-multiply"
      >
        <Image
          src="/hero/dark-panel-texture.png"
          alt=""
          width={1774}
          height={887}
          loading="eager"
          sizes="600px"
          className="absolute left-[-3.13%] top-[-26.67%] h-[153.88%] w-[106.72%] max-w-none"
        />
      </div>
      <div className={`relative ${textClassName}`}>
        <p
          className="text-[1em] font-medium uppercase leading-[1.5em] text-accent [font-family:var(--font-display)]"
          style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
        >
          Selected work
          <span aria-hidden className="px-[0.5em]">
            |
          </span>
          {selectedWork.period}
        </p>
        {/* Dashed rule above each row: 1px, 3 on / 3 off (Line 216), white
            at half strength so the rows lead. 16px cap-to-rule on both
            sides = 0.594em padding around a 24px line box, 43px row pitch. */}
        <dl className="mt-[1.594em] text-[1em] leading-[1.5em] text-bg [font-family:var(--font-mono)]">
          {selectedWork.items.map(({ company, line }) => (
            <div
              key={company}
              className="grid pt-[calc(0.594em+1px)] pb-[0.594em] last:pb-0"
              style={{
                gridTemplateColumns: `${labelColumn} 1fr`,
                backgroundImage:
                  "repeating-linear-gradient(to right, rgb(255 255 255 / 0.5) 0 3px, transparent 3px 6px)",
                backgroundSize: "100% 1px",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left top",
              }}
            >
              <dt className="font-bold">{company}:</dt>
              {/* Desktop holds one line: the longest fills the column to
                  within a fraction of a px, and em rounding below 1440 was
                  tipping "admins" onto its own line. */}
              <dd className={wrap ? undefined : "whitespace-nowrap"}>
                {/* Hyphenated words never split ("design-" / "to-code"),
                    so a wrapped line breaks between words only. */}
                {line.split(" ").map((word, i) => (
                  <span key={i}>
                    {i > 0 ? " " : null}
                    {word.includes("-") ? (
                      <span className="whitespace-nowrap">{word}</span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
