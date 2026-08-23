import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import { contact } from "@/lib/home";

export const metadata: Metadata = {
  title: "Contact — Marc Favro",
  description: "Get in touch with Marc Favro.",
};

export default function ContactPage() {
  return (
    <div className="bg-bg">
      <header className="sticky top-0 z-50 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-6 pb-3 pt-6 lg:px-10">
          <a
            href="/"
            className="flex items-center gap-3 font-display text-base font-semibold leading-[18px] tracking-[-0.16px] text-ink transition-colors hover:text-accent"
          >
            <span
              aria-hidden
              className="inline-block size-[14px] shrink-0 rounded-full bg-accent"
            />
            Welcome. I&apos;m Marc
          </a>
          <nav className="flex gap-8 font-display text-sm font-semibold leading-[18px] tracking-[-0.14px] text-muted">
            <a href="/#hero" className="transition-colors hover:text-accent">
              Home
            </a>
            <a href="/#work" className="transition-colors hover:text-accent">
              Work
            </a>
            <a href="/contact" className="transition-colors hover:text-accent">
              Contact
            </a>
            <a
              href={contact.resume}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-accent"
            >
              Resume
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10 lg:py-32">
        <div className="max-w-[36rem]">
          <h1 className="display text-[clamp(2.5rem,6vw,3.75rem)]">
            Let&apos;s work together
          </h1>
          <p className="t-body mt-4 max-w-[392px] text-ink-2">
            I&apos;m currently open to new opportunities. Send me a message and
            I&apos;ll get back to you.
          </p>

          <div className="mt-12">
            <ContactForm />
          </div>
        </div>
      </main>
    </div>
  );
}
