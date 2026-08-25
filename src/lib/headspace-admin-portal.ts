/**
 * Headspace Admin Portal Redesign — case-study content.
 *
 * Source of truth: full speaker-notes transcript, research synthesis deck,
 * and survey results for the Q1 2022 Admin Portal Redesign research
 * project. This is a research-and-vision deliverable, not a shipped
 * product — a prioritized roadmap and wireframe explorations presented to
 * Headspace leadership. Copy stays honest about that distinction; no
 * shipped-impact language. Long direct survey quotes are paraphrased per
 * copyright guidance — any verbatim quote here is kept under 15 words.
 *
 * [PLACEHOLDER] marks anything without final copy or exported assets yet —
 * same convention as the YPP and Airbnb Hotels case studies.
 */

import type { Block, ImageSpec } from "@/lib/ypp";

export const meta = {
  title: "Admin Portal Redesign",
  subtitle:
    "Headspace's B2B Admin Portal hadn't been meaningfully touched since 2017. When a merger with Ginger introduced a second internal platform, the gap between what Admins needed and what existed became impossible to ignore. 17 stakeholder interviews and a 147-respondent survey made the case for separating internal and external experiences entirely, and put the redesign on the roadmap.",
  company: "Headspace",
  years: "2022",
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: [
        "Product designer. Led research, prioritization, and wireframe direction",
      ],
    },
    {
      label: "Timeline",
      items: ["Q4 2021 — Q1 2022"],
    },
    {
      label: "Audience",
      items: [
        "2,000+ external Admins",
        "Internal customer success, engineering, and data teams",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "Journey mapping & stakeholder interviews",
        "Admin survey design & synthesis",
        "Need vs. Impact prioritization",
        "Portal architecture & roadmap",
      ],
    },
  ],
  highlights: [
    "17 stakeholders across 12 sessions",
    "147 of 700 Admins responded",
    "Split one portal into two purpose-built tools",
  ],
};

export { type Block, type ImageSpec };

export const blocks: Block[] = [
  // 1. Cover
  { kind: "cover" },

  // 2. The Problem — scale, age, and the structural (not visual) issue
  {
    kind: "intro-stack",
    sectionNumber: "01",
    heading: "The Problem",
    body: [
      "By 2022 the Admin Portal was serving 2,000+ partners on a structure that hadn't changed since 2017. Capability had been added throughout various phases over the years, but the foundation underneath it never kept pace with the scale of who was using it or what they needed from it. Every insight about what Admins needed had been filtered through PSM conversations — secondhand, and shaped by what internal teams assumed rather than what Admins actually said.",
      "The deeper issue was structural. Internal and external use cases were tangled in one tool: an Admin managing their company's benefits, a Partner Success Manager troubleshooting an eligibility file, an engineer investigating a member issue. Admin value was getting buried under internal tooling needs. A coming merger with a company called Ginger made the gap impossible to ignore.",
    ],
    quote: {
      text: "The engagement reports are pretty underwhelming. It doesn't give us much detail and I am not super fond of it being a PDF. I wish it was an actual dashboard where we could filter the information and slice and dice it.",
      attribution: "Admin survey respondent, 2022",
    },
  },

  // 3. Research — journey mapping and stakeholder interviews
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "Hypotheses before opinions",
    title: "Research",
    body: "Before the first interview, I mapped the full Admin Portal experience from sales org setup through member resolution. Twelve interviews across every stakeholder group who touches the portal followed, designed to pressure-test what the map already suggested rather than start from scratch.",
    bullets: [
      {
        title: "167 data points, one throughline",
        body: "Interviews spanned Partner Success, Engineering, Data, Member Experience, and external Admins. Across every group, the same three needs surfaced: better reporting, clearer data integration, and more visibility into org hierarchy. The research didn't reveal competing priorities — it revealed consensus hiding behind different vocabularies.",
      },
    ],
    caption:
      "[PLACEHOLDER — journey map (Miro) or stakeholder-interview spreadsheet excerpt]",
    expandedPoints: [
      {
        label: "167 data points, one throughline",
        text: "Interviews spanned Partner Success, Engineering, Data, Member Experience, and external Admins. Across every group, the same three needs surfaced: better reporting, clearer data integration, and more visibility into org hierarchy. The research didn't reveal competing priorities — it revealed consensus hiding behind different vocabularies.",
      },
    ],
  },

  // 4. The Admin Survey — text panel + media placeholder + stats list,
  // matching the Figma restructure (node 511:59581).
  {
    kind: "section",
    sectionNumber: "03",
    eyebrow: "Size matters",
    title: "The Admin Survey",
    body: "Before this project, Headspace's understanding of Admins came entirely through PSM conversations. I partnered with our PM and UX researcher to design the first direct survey of this population, structured by company size so priorities could be read by segment instead of averaged into noise.",
    bullets: [
      {
        title: "We can't live without it",
        body: "Customizable reporting was the only feature that came back as a universal must-have across every segment. Everything else is split by company size. That single point of consensus became the anchor for the prioritization work that followed.",
      },
    ],
    caption:
      "[PLACEHOLDER — journey map (Miro) or stakeholder-interview spreadsheet excerpt]",
    expandedPoints: [
      {
        label: "We can't live without it",
        text: "Customizable reporting was the only feature that came back as a universal must-have across every segment. Everything else is split by company size. That single point of consensus became the anchor for the prioritization work that followed.",
      },
    ],
    stats: [
      { value: "700", label: "Admins surveyed through the PSM team" },
      {
        value: "147",
        label: "Responses — a strong rate for an unincentivized survey",
      },
      { value: "21%", label: "Response rate" },
      {
        value: "4",
        label: "Company-size segments analyzed, from SMB to Strategic",
      },
    ],
  },

  // 5. Synthesis — Need × Impact matrix and the LA offsite
  {
    kind: "section",
    sectionNumber: "04",
    eyebrow: "Research 1, Designer 0",
    title: "Synthesis",
    body: "Every opportunity was mapped on a Need × Impact matrix and were cross-checked against feature requests, support tickets, and competitor examples — nothing moved forward on a single source. The in-portal Admin community I was most excited about landed in the low-priority quadrant. The data was right.",
    bullets: [
      {
        title: "Stress tested research",
        body: "Most of the team had never met in person. We used the LA offsite to run synthesis, build How Might We statements, and go into prioritization with shared ground.",
      },
    ],
    caption: "[PLACEHOLDER — process diagram of the six-step inherited flow]",
    expandedPoints: [
      {
        label: "Stress tested research",
        text: "Most of the team had never met in person. We used the LA offsite to run synthesis, build How Might We statements, and go into prioritization with shared ground.",
      },
    ],
  },

  // 6. Wireframe Explorations
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "Built to convince, not to ship",
    title: "Wireframe Explorations",
    body: "Research findings are easy to dismiss as a slide deck. These wireframes gave leadership something to react to — six modules built on Headspace's updated UI patterns, not the portal's 2017 styling.",
    bullets: [
      {
        title: "Every module earned its place",
        body: "Customizable reporting and a searchable multimedia toolkit weren't aspirational additions. They were the two features Admins called must-haves across every company size in the survey.",
      },
    ],
    caption:
      "[PLACEHOLDER — wireframe screenshots: Home, Members, Settings, Features, Resources, Reports]",
    expandedPoints: [
      {
        label: "Every module earned its place",
        text: "Customizable reporting and a searchable multimedia toolkit weren't aspirational additions. They were the two features Admins called must-haves across every company size in the survey.",
      },
    ],
  },

  // 7. The Proposal — internal/external split, systems of record, roadmap
  {
    kind: "section",
    sectionNumber: "06",
    eyebrow: "Split it or kill it",
    title: "The Proposal",
    body: "The merger with Ginger made the diagnosis unavoidable. Comparing their internal Django platform to the Admin Portal revealed that Admin value was getting buried under internal tooling that had no business being there.",
    bullets: [
      {
        title: "One tool, one audience",
        body: "The external portal scoped purely to Admin value — org performance insights, customizable reporting, and a searchable multimedia toolkit. Internal teams got their own purpose-built Implementation Portal.",
      },
      {
        title: "A path, not just a pitch",
        body: "The roadmap went to leadership in Q3 2022. Foundational work was already rolling before the presentation was over.",
      },
    ],
    caption:
      "[PLACEHOLDER — internal/external portal architecture diagram and phased roadmap]",
    expandedPoints: [
      {
        label: "One tool, one audience",
        text: "The external portal scoped purely to Admin value — org performance insights, customizable reporting, and a searchable multimedia toolkit. Internal teams got their own purpose-built Implementation Portal.",
      },
      {
        label: "A path, not just a pitch",
        text: "The roadmap went to leadership in Q3 2022. Foundational work was already rolling before the presentation was over.",
      },
    ],
  },

  // 8. Outcome — research program reframed the problem, proposal approved
  {
    kind: "closing",
    heading: "Outcome",
    body: [
      "Before this project, Headspace had never gone directly to its Admin population for research. Every insight about what Admins needed had been filtered through PSM conversations — secondhand, incomplete, and shaped by what internal teams thought Admins wanted rather than what they actually said.",
      "Seventeen stakeholders across twelve interviews, a 147-respondent survey with a 21% unincentivized response rate, four additional validation sources, an in-person working session, and a Need × Impact framework that overruled instinct — including my own — produced a proposal that reframed the entire problem. This wasn't a portal that needed a redesign. It was a portal that had been asked to serve two completely different audiences for years, and had failed both of them as a result.",
      "The proposal went to leadership in Q3 2022 and was approved. Foundational Phase 0 work began rolling out before the year was out. That outcome matters — but what I'm most proud of is that the research program itself changed how the team thought about Admins. Not as a user type to design for, but as a constituency that had never been properly heard.",
    ],
    stats: [],
  },
];
