import type { Metadata } from "next";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import { blocks, meta, sidebar } from "@/lib/airbnb-hotels";

export const metadata: Metadata = {
  title: `${meta.company} ${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

export default function AirbnbHotelsPage() {
  return (
    <CaseStudyPage
      navTitle="Airbnb Hotels"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
    />
  );
}
