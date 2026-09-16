import type { Metadata } from "next";
import Link from "next/link";
import ArrowIcon from "@/components/site/ArrowIcon";
import BackBar from "@/components/site/BackBar";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";
import { additionalWork } from "@/lib/home";

export const metadata: Metadata = {
  title: "Coming soon — Marc Favro",
  description: "This case study is still being written.",
};

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const project = p
    ? additionalWork.find((item) => item.href === `/coming-soon?p=${p}`)
    : undefined;

  return (
    <div className="min-h-dvh bg-bg">
      {/* Symmetric 82px above/below the section at lg so its vertical centre —
          where the rail's middle dot and the copy sit — lands on the
          perimeter frame's 50vh crosshairs. */}
      <main className="mx-auto px-6 pb-16 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:py-[82px]">
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
            <div className="lg:absolute lg:inset-x-0 lg:top-0">
              <BackBar
                title={
                  project ? `${project.company} | ${project.title}` : undefined
                }
              />
            </div>
            <div className="flex flex-col gap-2 py-12 lg:py-0">
              {/* 828:63126 — DM Sans Bold 16/20 */}
              <p className="text-base font-bold leading-5 text-accent [font-family:var(--font-body),system-ui,sans-serif]">
                Sorry for the delay
              </p>
              <h1 className="display text-[clamp(2.5rem,6vw,3.75rem)] leading-none">
                Coming soon.
              </h1>
              {/* 828:63135 — Google Sans Flex SemiBold 20/28 + 16px arrow */}
              <Link
                href="/contact"
                className="group mt-2 inline-flex items-center gap-1 self-start text-xl font-semibold leading-7 text-ink transition-colors [font-family:var(--font-display),system-ui,sans-serif] hover:text-accent"
              >
                Get in touch
                <ArrowIcon className="text-current transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
