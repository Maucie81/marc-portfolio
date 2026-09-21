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
      // Figma "Gradient 22" (Portfolio-Playground 35:3480): the blurred dark
      // wash that rises from the bottom of the story under the Overview
      // section. Exported composite (3325×1004, blur + noise baked in) — the
      // three blurred vectors + blend modes it's built from aren't worth
      // recreating live. Placed at its native 1:1 size along the track.
      backdrop={{ src: "/yahoo/gradient.webp", left: 1550, width: 3325 }}
    />
  );
}
