import type { Metadata } from "next";
import { CaseStudyPage, type Brand } from "@/components/case-study/CaseStudyPage";
import { blocks, meta, sidebar } from "@/lib/airbnb-hotels";

export const metadata: Metadata = {
  title: `${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

const BRAND: Brand = { bold: "airbnb", normal: " hotels", initials: "HM", color: "#FF5A5F" };

export default function AirbnbHotelsPage() {
  return (
    <CaseStudyPage
      navTitle="Airbnb Hotels"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
      brand={BRAND}
    />
  );
}
