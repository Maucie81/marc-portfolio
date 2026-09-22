import type { Metadata } from "next";
import HorizontalTrack from "@/components/case-study/HorizontalTrack";
import CaseStudyClosing from "@/components/case-study/CaseStudyClosing";
import {
  BottomRule,
  CoverBlock,
  IntroStackBlock,
  RailDots,
} from "@/components/case-study/CaseStudyPage";
import { closingLinksFor } from "@/lib/case-studies";
import { context, meta, sidebar } from "@/lib/harrisons-app";

export const metadata: Metadata = {
  title: `${meta.company} | ${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

// Gated by src/proxy.ts — public visitors and search engines are
// redirected to /coming-soon?p=harrisons-app; this route only renders for
// whoever holds the preview-key cookie. The fixed top bar comes from
// PersistentHeader via CASE_STUDY_TITLES, same as every other /work page.

export default function HarrisonsAppPage() {
  return (
    <main className="bg-bg">
      <BottomRule />

      <HorizontalTrack>
        <RailDots />
        <CoverBlock meta={meta} sidebar={sidebar} />
        <IntroStackBlock heading="Overview" body={context} />
        <CaseStudyClosing links={closingLinksFor("harrisons-app")} />
      </HorizontalTrack>
    </main>
  );
}
