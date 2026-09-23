import Link from "next/link";
import ArrowIcon from "@/components/site/ArrowIcon";
import { contact } from "@/lib/home";

/**
 * Phone-only closing footer for case studies — the homepage's coral contact
 * band, trimmed for this context: no "05 Contact" section number, and the
 * headline is a "Get in touch" link to /contact rather than the email.
 * Hidden from 901px, where the horizontal track owns the page's end.
 */
export default function CaseStudyFooter() {
  return (
    <div className="on-dark relative isolate overflow-hidden bg-accent min-[901px]:hidden">
      {/* Same multiply texture as the homepage's coral panels. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage: "url(/case-study-texture.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <section className="relative px-6 pt-12">
        <h2 className="display text-[clamp(2rem,4vw,2.5rem)]">
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-75"
          >
            Get in touch
            <ArrowIcon className="h-[0.7em] w-[0.7em] text-current" />
          </Link>
        </h2>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm tracking-wide">
          <a
            href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
            className="t-mark transition-opacity hover:opacity-75"
          >
            {contact.phone}
          </a>
          <span aria-hidden className="text-white/50">
            |
          </span>
          <a
            href={contact.resume}
            target="_blank"
            rel="noreferrer"
            className="t-mark transition-opacity hover:opacity-75"
          >
            Resume
          </a>
          <span aria-hidden className="text-white/50">
            |
          </span>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            className="t-mark transition-opacity hover:opacity-75"
          >
            LinkedIn
          </a>
        </p>
      </section>
      <footer className="relative px-6 pb-10 pt-12">
        <p className="t-meta-sm border-t border-white/40 pt-5 text-center">
          Built &amp; designed using Claude Code
        </p>
      </footer>
    </div>
  );
}
