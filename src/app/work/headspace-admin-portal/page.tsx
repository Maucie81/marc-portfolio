import type { Metadata } from "next";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import { blocks, meta, sidebar } from "@/lib/headspace-admin-portal";

export const metadata: Metadata = {
  title: `${meta.company} ${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

export default function HeadspaceAdminPortalPage() {
  return (
    <CaseStudyPage
      navTitle="Headspace admin portal redesign"
      meta={meta}
      sidebar={sidebar}
      blocks={blocks}
    />
  );
}
