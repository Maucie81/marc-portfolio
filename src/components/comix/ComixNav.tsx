import InkRule from "./InkRule";
import RegistrationMark from "./RegistrationMark";

const ITEMS = [
  { n: "01", label: "Work", href: "#work" },
  { n: "02", label: "Experience", href: "#experience" },
  { n: "03", label: "Contact", href: "#contact" },
];

/**
 * A comic's table-of-contents page, not a product-site nav bar — numbered,
 * flat, no hover theatrics (no underline slide, no color transition delay,
 * hard color cut only). The divider is a hand-drawn rule (InkRule), same
 * system as the hero panel, so the ink logic reaches the chrome instead of
 * stopping at the splash panel's edge.
 */
export default function ComixNav() {
  return (
    <nav aria-label="Section index" className="bg-comix-paper sticky top-0 z-30">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 sm:px-10">
        <a
          href="#top"
          className="font-comix-display text-comix-ink flex items-center gap-2 text-lg tracking-tight uppercase"
        >
          <RegistrationMark size={16} />
          Favro
        </a>
        <ul className="flex items-center gap-6 sm:gap-10">
          {ITEMS.map((item) => (
            <li key={item.n}>
              <a
                href={item.href}
                className="font-comix-body text-comix-ink hover:text-comix-rust flex items-baseline gap-1.5 text-sm font-semibold tracking-wide uppercase [transition:color_0s]"
              >
                <span className="text-comix-rust font-comix-display text-xs">
                  {item.n}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <InkRule seed={5} />
    </nav>
  );
}
