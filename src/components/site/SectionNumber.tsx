/**
 * The 01–05 marker in the left margin.
 */
export default function SectionNumber({
  number,
  label,
  className = "",
}: {
  number: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`sec-num ${className}`}>
      <div className="sec-num-inner">
        <span>{number}</span>
        <span aria-hidden className="sec-num-bar" />
        <span className="sec-num-label">{label}</span>
      </div>
    </div>
  );
}
