/** The CTA buttons' 12px arrow — Figma ArrowRight (1:2), same path as the
 * exported asset, with its fill swapped for currentColor so one icon follows
 * the button's own color through default, hover and secondary states. */
export default function CtaArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0">
      <path
        d="M12.1256 6.10025L6.72899 0.755506L5.51514 1.98114L8.80336 5.23775L-0.127613 5.23775L-0.127613 6.96275L8.80336 6.96275L5.51514 10.2194L6.72899 11.445L12.1256 6.10025Z"
        fill="currentColor"
      />
    </svg>
  );
}
