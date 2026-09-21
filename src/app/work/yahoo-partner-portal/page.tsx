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
      navTitle="Yahoo partner portal"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
    />
  );
}
