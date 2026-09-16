import type { Metadata } from "next";
import BackBar from "@/components/site/BackBar";
import ContactForm from "@/components/site/ContactForm";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";

export const metadata: Metadata = {
  title: "Contact — Marc Favro",
  description: "Get in touch with Marc Favro.",
};

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Same frame as the homepage: PersistentHeader supplies the fixed top
          band + rails at lg, so <main> pads for it the same way page.tsx does. */}
      <main className="mx-auto px-6 pb-16 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:py-[82px]">
        {/* 828:64259 — the "05" column is kept for alignment but its number
            is opacity 0 in the design, so it's hidden here too. */}
        <section className="sec py-12 lg:h-[calc(100dvh-164px)] lg:grid-cols-[1.5rem_6.25rem_1fr]! lg:py-0">
          <SectionRail />
          <SectionNumber
            number="05"
            label="Contact"
            className="invisible max-lg:hidden"
          />
          <div className="relative flex min-h-0 flex-col self-stretch">
            <div className="lg:absolute lg:inset-x-0 lg:top-0">
              <BackBar fallbackHref="/" />
            </div>
            {/* 828:64259 — 111px top offset at the 1024 design height; the
                offset and gaps shrink on shorter viewports and the Message
                field absorbs the remainder so the page never scrolls at lg. */}
            <div className="flex flex-col gap-12 pt-12 lg:min-h-0 lg:flex-1 lg:gap-[clamp(16px,calc(10.5dvh-60px),48px)] lg:pt-[clamp(24px,calc(28.6dvh-182px),111px)] lg:pb-[clamp(8px,calc(10.5dvh-68px),40px)]">
              <div className="flex max-w-[565px] flex-col gap-2">
                {/* 828:64264 — DM Sans Bold 16/20, not the display face */}
                <p className="text-base font-bold leading-5 text-accent [font-family:var(--font-body),system-ui,sans-serif]">
                  I&apos;d love to hear from you
                </p>
                <h1 className="display text-[clamp(2.5rem,6vw,3.75rem)] leading-none">
                  Get in touch
                </h1>
                <p className="t-body mt-2 text-ink-2">
                  You&apos;re a couple clicks away from discussing a role, or
                  exchanging ideas on design. I would be very interested in
                  either.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
