import type { Metadata } from "next";
import { CaseStudyPage, type Brand } from "@/components/case-study/CaseStudyPage";
import { blocks, meta, sidebar } from "@/lib/ypp";

export const metadata: Metadata = {
  title: `${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

const BRAND: Brand = { bold: "partner", normal: "portal", initials: "JD", color: "#5D5EFF" };

export default function YahooPartnerPortalPage() {
  return (
    <CaseStudyPage
      navTitle="Yahoo Partner Portal"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
      brand={BRAND}
    />
  );
}
