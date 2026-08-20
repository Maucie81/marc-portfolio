/**
 * Centered brand wordmark overlaid on a placeholder card — a visual cue for
 * which case studies have real work behind them, not a licensed logo asset.
 * Same lowercase-bold-sans convention as the case-study page mockup chrome
 * (see MediaPlaceholder in each work/*\/page.tsx).
 */
const BRAND_COLOR: Record<string, string> = {
  Yahoo: "#6001D2",
  Airbnb: "#FF5A5F",
  Headspace: "#F2703C",
};

export default function CompanyLogo({
  company,
  className = "",
}: {
  company: string;
  className?: string;
}) {
  const color = BRAND_COLOR[company];
  if (!color) return null;

  return (
    <span
      aria-hidden
      className={`select-none font-bold lowercase tracking-tight ${className}`}
      style={{ color }}
    >
      {company}
    </span>
  );
}
