import type { Metadata } from "next";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import { blocks, meta, sidebar } from "@/lib/ypp";

export const metadata: Metadata = {
  title: `${meta.company} ${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

export default function YahooPartnerPortalPage() {
  return (
    <CaseStudyPage
      navTitle="Yahoo Partner Portal"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
      // Figma "Gradient 22" (Portfolio-Playground 35:3480): the soft dark
      // wash rising from the bottom of the story under the Overview section
      // and its quotes. Painted in CSS by .cs-backdrop--yahoo (globals.css);
      // the box matches the Figma frame's 3325×1004 at 1:1 along the track.
      backdrop={{ className: "cs-backdrop--yahoo", left: 1550, width: 3325, height: 1004 }}
    />
  );
}
