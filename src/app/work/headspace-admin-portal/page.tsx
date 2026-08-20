import type { Metadata } from "next";
import { CaseStudyPage, type Brand } from "@/components/case-study/CaseStudyPage";
import { blocks, meta, sidebar } from "@/lib/headspace-admin-portal";

export const metadata: Metadata = {
  title: `${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

const BRAND: Brand = { bold: "headspace", normal: " admin", initials: "BA", color: "#F2703C" };

export default function HeadspaceAdminPortalPage() {
  return (
    <CaseStudyPage
      navTitle="Headspace Admin Portal Redesign"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
      brand={BRAND}
    />
  );
}
