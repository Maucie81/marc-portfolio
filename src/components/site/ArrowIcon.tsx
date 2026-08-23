/** Shared stroke arrow — points right by default; rotate-180 to point left
 * (see the case-study "Back" link). currentColor, so pass a text-* class. */
export default function ArrowIcon({ className = "text-muted" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={`mt-px shrink-0 ${className}`}>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
