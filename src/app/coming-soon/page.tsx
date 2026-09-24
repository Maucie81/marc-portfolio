import type { Metadata } from "next";
import Link from "next/link";
import CtaArrow from "@/components/site/CtaArrow";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";
import { comingSoonTitle } from "@/lib/page-titles";

type SearchParams = Promise<{ p?: string }>;

/** Same "Company | Title" the top bar shows (PersistentHeader reads the
 * same slug), so the tab title matches the breadcrumb. Awaiting
 * searchParams also keeps this page dynamic, which is what lets the header
 * resolve the title on the server instead of after hydration. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { p } = await searchParams;
  const project = comingSoonTitle(p);
  return {
    title: project ? `${project} — Coming soon` : "Coming soon — Marc Favro",
    description: "This case study is still being written.",
  };
}

export default function ComingSoonPage() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Nav is PersistentHeader's case-study top bar (fixed: 56px below
          901px, the 42px perimeter band from there up), so <main> pads for
          it the same way a case study does. Symmetric 82px above/below the
          section at lg so its vertical centre — where the rail's middle dot
          and the copy sit — lands on the perimeter frame's 50vh crosshairs. */}
      <main className="mx-auto px-6 pb-16 pt-14 min-[901px]:pt-[42px] lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:py-[82px]">
        {/* 828:63070 — same framing as /contact: the "05" column keeps the
            layout but its number is opacity 0 in the design. */}
        <section className="sec py-12 lg:min-h-[calc(100dvh-164px)] lg:grid-cols-[1.5rem_6.25rem_1fr]! lg:py-0">
          <SectionRail />
          <SectionNumber
            number="05"
            label="Coming soon"
            className="invisible max-lg:hidden"
          />
          <div className="relative flex flex-col self-stretch lg:justify-center">
            <div className="flex flex-col gap-2 py-12 lg:py-0">
              {/* 828:63126 — DM Sans Bold 16/20 */}
              <p className="text-base font-bold leading-5 text-accent [font-family:var(--font-body),system-ui,sans-serif]">
                Sorry for the delay
              </p>
              <h1 className="display text-[clamp(2.5rem,6vw,3.75rem)] leading-none">
                Coming soon.
              </h1>
              {/* Secondary (outline) CTA, Portfolio-Playground 100:209186 —
                  the same treatment that frame gives "Get in touch" on the
                  case-study closing. */}
              <Link
                href="/contact"
                className="cta cta-secondary mt-10 self-start"
              >
                Get in touch
                <CtaArrow />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
