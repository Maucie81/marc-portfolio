import { FURNITURE, rv } from "@/lib/motion";

/**
 * The 01–05 marker in the left margin. `reveal`: on the homepage it fades
 * up with the opening screen when it's on it (data-reveal="open", see
 * src/lib/motion.ts); otherwise it's static.
 */
export default function SectionNumber({
  number,
  label,
  className = "",
  reveal = false,
}: {
  number: string;
  label: string;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <div
      data-reveal={reveal ? "open" : undefined}
      className={`sec-num ${reveal ? "rv-rise" : ""} ${className}`}
      style={reveal ? rv(0, FURNITURE) : undefined}
    >
      <div className="sec-num-inner">
        <span className="sec-num-digits">{number}</span>
        <span aria-hidden className="sec-num-bar" />
        <span className="sec-num-label">{label}</span>
      </div>
    </div>
  );
}
