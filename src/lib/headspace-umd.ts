/**
 * Headspace Unified Main Door (UMD) — case-study content.
 *
 * Shown as a secondary project: cover lockup + metadata, a single Context
 * stack, and the recorded prototype walkthrough — no section-by-section
 * narrative. `company` + `title` are split because the shared cover hero
 * (CaseStudyPage's CoverBlock) sets them on two lines, "Headspace" over
 * "Unified Main Door", same as "Yahoo" over "Partner Portal".
 */

export const meta = {
  title: "unified main door",
  subtitle:
    "Designing the enrollment front door for a bundled mental health benefit, from eligibility to booked care.",
  company: "Headspace",
  years: "2022 — 2023",
};

export const context = [
  "Headspace acquired Ginger in 2021. The two products, Headspace's meditation and mindfulness platform and Ginger's behavioral health coaching service, could now be offered to employers as a single bundled benefit. But there was no unified way for employees to access it. Each product had its own signup flow, its own eligibility system, and its own app. Getting the benefit meant navigating two doors that had nothing to do with each other.",
  "Unified Main Door was the first product the combined company shipped to solve that. I designed the web enrollment experience: building the flow, translating the mobile-native design across web formats, and running usability testing to validate it before launch.",
];

export const PROTOTYPE_URL =
  "https://www.figma.com/proto/Gl8lfFlJSLy2i1eSOh1Biw/UMD---Walk-Through-File?node-id=2710-44808&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2710%3A44808&page-id=1%3A62";

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: [
        "Product designer, web enrollment experience across mobile web, desktop, and tablet",
      ],
    },
    {
      label: "Timeline",
      items: ["Mid-2022 – January 2023"],
    },
    {
      label: "Audience",
      items: ["Enterprise employees"],
    },
    {
      label: "Areas of influence",
      items: [
        "Web enrollment experience design",
        "Cross-platform translation (mobile → web)",
        "Usability testing",
        "UX copy",
      ],
    },
  ],
  highlights: [
    "First unified product shipped after the Headspace–Ginger acquisition",
    "Enterprise launch: Whole Foods Market, January 2023",
  ],
};
