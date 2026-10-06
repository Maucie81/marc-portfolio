import Link from "next/link";
import { contact } from "@/lib/home";

/**
 * Phone-only closing footer for case studies — the homepage's ink contact
 * band (halftone panel, 20px "Get in touch →", 16px contact line, credit
 * strip), trimmed for this context: no "05" label or "We should probably
 * chat" line, and the credit names the tool. Hidden from 901px, where the
 * horizontal track owns the page's end.
 */
export default function CaseStudyFooter() {
  return (
    <footer className="on-dark bg-[var(--ink-deep)] min-[901px]:hidden">
      <div className="px-3 pt-4 md:px-6">
        <div className="relative px-3 pb-6 pt-2 md:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-3 -top-4 bottom-0 rotate-180 mix-blend-color-burn blur-[0.5px] md:-inset-x-6"
            style={{ background: "url(/additional-work-texture.webp) center / 900px auto repeat" }}
          />
          <h2 className="relative text-[20px] font-bold leading-[1.26] tracking-[-0.01em] text-white">
            <Link href="/contact" className="transition-opacity hover:opacity-75">
              Get in touch →
            </Link>
          </h2>
          <p className="relative mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[16px] font-normal leading-6 text-white">
            <a
              href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
              className="transition-opacity hover:opacity-75"
            >
              {contact.phone}
            </a>
            <span aria-hidden className="text-[12px] leading-[18px]">
              |
            </span>
            <a
              href={contact.resume}
              target="_blank"
              rel="noreferrer"
              className="transition-opacity hover:opacity-75"
            >
              Resume
            </a>
            <span aria-hidden className="text-[12px] leading-[18px]">
              |
            </span>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="transition-opacity hover:opacity-75"
            >
              LinkedIn
            </a>
          </p>
        </div>
        <p className="footer-credit relative z-[39] -mx-3 bg-[var(--ink-deeper)] px-6 pb-0 pt-2 text-center text-[14px] leading-6 tracking-[-0.01em] text-white/65 sm:pb-2 md:-mx-6">
          Built using Claude Code
        </p>
      </div>
    </footer>
  );
}
