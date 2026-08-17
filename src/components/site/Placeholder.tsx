/**
 * Honest stand-in for artwork that doesn't exist yet. Reads as a deliberate
 * empty frame rather than a broken image — replace with a real asset.
 */
export default function Placeholder({
  label,
  ratio = "16 / 9",
  className = "",
}: {
  /** Omit for a blank wireframe box — Figma's neutral fill, no label, no hatch. */
  label?: string;
  ratio?: string;
  className?: string;
}) {
  // Figma image placeholders: fill #eaeae5, border #d2d2d2, radius 4
  // (177:111971, 177:111999, 177:112269).
  if (!label) {
    return (
      <div
        className={`rounded-[4px] border border-[#d2d2d2] bg-[#eaeae5] ${className}`}
        style={{ aspectRatio: ratio }}
      />
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[4px] border border-[#d2d2d2] bg-[#eaeae5] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 11px, rgba(104,104,104,0.10) 11px 12px)",
        }}
      />
      <span className="eyebrow relative z-10 px-6 text-center">{label}</span>
    </div>
  );
}
