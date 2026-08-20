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
  title: "Headspace Admin Portal Redesign",
  subtitle:
    "A research-driven proposal to rebuild the B2B Admin Portal around Admins, not around the internal and external needs bolted onto it since 2017",
  company: "Headspace",
  years: "2022",
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: [
        "Product designer — led the research program, the prioritization framework, and the wireframe direction for the proposed next-phase portal",
      ],
    },
    {
      label: "Timeline",
      items: [
        "Research and synthesis, Q4 2021 — Q1 2022",
        "Presented to leadership Q1 2022",
      ],
    },
    {
      label: "Audience",
      items: [
        "2,000+ external partners (Admins) served by the portal",
        "5 internal/external user types: Admins, PSMs, MX, Engineering, Data/Analytics",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "HDI research process — journey mapping, interviews, survey",
        "Admin survey design & Need × Impact prioritization framework",
        "Wireframe exploration across 6 portal modules",
        "Internal/external portal architecture proposal",
      ],
    },
  ],
  highlights: [
    "17 stakeholders interviewed across 12 sessions — 167 logged data points",
    "147 survey responses from 700 Admins — a strong rate for an unincentivized survey",
    "Proposed splitting one tangled tool into two purpose-built portals",
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
      "Headspace's B2B Admin Portal was built in 2017 and never fundamentally redesigned. Three phases bolted on capability over the years — bulk access-code distribution, a standardized enrollment flow, eligibility file verification — but by 2022 it was still running on its original structure while serving 2,000+ partners across employer, channel, and health segments.",
      "The deeper problem wasn't visual. Internal and external use cases — an Admin managing their company's benefits, a Partner Success Manager troubleshooting an eligibility file, an engineer investigating a member issue — were all tangled into one tool. Comparing it to Ginger's purpose-built internal platform made that obvious: admin-facing value was getting lost in the intermingling. A coming merger with Ginger was about to raise the stakes further.",
    ],
    stat: {
      value: "2,000+",
      label:
        "Partners running on a portal whose underlying design hadn't changed since 2017",
    },
    quote: {
      text: "[PLACEHOLDER — Admin quote on the portal feeling dated or hard to use]",
      attribution: "[Admin partner, company size — placeholder]",
    },
  },

  // 3. Research — journey mapping and stakeholder interviews
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "Empathy before ideas",
    title: "Research",
    body: "Headspace's Hypothesis Driven Innovation framework starts with empathy-building before narrowing to ideas worth testing. The team began with a full journey map of the Admin Portal experience, then ran twelve interviews across every stakeholder group who touches it.",
    bullets: [
      {
        title: "Journey mapping, before a single interview",
        body: "A full map of the Admin Portal experience — sales and org setup through Member Experience resolution — built in Miro ahead of user interviews, so the team shared one picture of the system before hearing from anyone in it.",
      },
      {
        title: "12 interviews, 17 stakeholders, 167 data points",
        body: "Partner reps, internal Admins, PSMs, engineers, Analytics & BI, Ginger reps, and Revenue Ops — each conversation logged into a shared spreadsheet. Strong cross-functional consensus emerged around three things: org hierarchy, reporting, and data integration.",
      },
      {
        title: "Priorities split by role",
        body: "Admins wanted enhanced reporting and a better toolkit. PSMs wanted permissioning and data integration. Engineering and Data/Analytics both wanted org hierarchy and troubleshooting tools. Member Experience wanted a better search bar and self-service access.",
      },
    ],
    caption:
      "[PLACEHOLDER — journey map (Miro) or stakeholder-interview spreadsheet excerpt]",
    expandedPoints: [
      {
        label: "Journey mapping, before a single interview",
        text: "A full map of the Admin Portal experience — every phase from sales and org setup through Member Experience resolution — tracking roles & responsibilities, positive moments, pain points, and product ideas surfaced along the way. Built in Miro ahead of user interviews to give the team shared understanding of the full system before talking to anyone in it.",
      },
      {
        label: "12 interviews, 17 stakeholders, 167 data points",
        text: "Interviews spanned Partner Representatives, Data Representatives (Analytics & BI), Engineers, Ginger Representatives, internal Admins, Member Experience Representatives, and Revenue Operations. 167 discrete pieces of data were collected and logged in a stakeholder interview spreadsheet. Strong cross-functional consensus emerged around org hierarchy, reporting, and data integration — the throughline that shaped everything downstream.",
      },
      {
        label: "Priorities split by role",
        text: "Admins: enhanced reporting, enhanced toolkit, more data integration. PSMs: data integration, user permissioning, enhanced toolkit. Engineering: troubleshooting capabilities, hierarchy of orgs, more data integration. Data/Analytics: troubleshooting capabilities, hierarchy of orgs, more data integration. Member Experience: improved search bar, self-service access, error explanation.",
      },
    ],
  },

  // 4. The Admin Survey — copy framing, then the stat-group callout for the
  // strongest, most quantifiable evidence in the case study.
  {
    kind: "copy",
    sectionNumber: "03",
    heading: "The Admin Survey",
    accent: true,
    width: "34rem",
    body: [
      "Before this project, Headspace's understanding of Admins came second-hand, through PSM conversations — never directly from Admins themselves. Marc pushed for and secured research-team support to run the company's first significant direct survey of this population.",
      "Distributed through the PSM team, the survey used a Kano-style must-have / nice-to-have / delighter framework, broken out by company size — SMB, Midmarket, Enterprise, and Strategic — so priorities could be read by segment instead of averaged into noise. A second wave, sent to 802 Admins, was already planned for early April 2022.",
    ],
  },
  {
    kind: "stat-group",
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
  {
    kind: "copy",
    width: "34rem",
    body: [
      "Customizable reporting was the only feature that came back as a universal must-have, across every segment. Midmarket Admins were the easiest to satisfy — about half of features landed as \"desired,\" half as \"delighters.\" Back-office features like SSO and permissioning skewed nice-to-have; front-of-house features like reporting and the toolkit skewed must-fix-now.",
    ],
  },
  {
    kind: "quote",
    text: "The engagement reports are pretty underwhelming.",
    attribution: "Admin survey respondent, 2022",
  },

  // 5. Synthesis — insight validation, the LA offsite, and the 2x2
  {
    kind: "section",
    sectionNumber: "04",
    eyebrow: "Need × impact, not need alone",
    title: "Synthesis",
    body: "Interview and survey findings were cross-checked against three more sources — customer feature requests, WCR tickets, and competitor examples partners raised directly — before the team gathered in LA for an in-person working session to turn all of it into a prioritization framework.",
    bullets: [
      {
        title: "Insight validation across four sources",
        body: "Interviews, the survey, feature requests logged by sales/success on Admins' behalf, and WCR tickets were checked against each other before anything got prioritized — no single source drove a decision on its own.",
      },
      {
        title: "The LA working session",
        body: "Design Researchers and the PM facilitated an in-person offsite — many team members meeting face-to-face for the first time — synthesizing everything into \"How Might We\" statements and early ideas.",
      },
      {
        title: "Need × Impact, plotted",
        body: "Need combined ask frequency, how many stakeholders felt it, and how sharp the pain was. Impact combined revenue, enrollment, Admin satisfaction, and internal efficiency. Four resulting quadrants set the roadmap that followed.",
      },
    ],
    caption: "[PLACEHOLDER — 2×2 Need × Impact prioritization matrix]",
    pullQuotes: [
      {
        quote:
          "The feature I was most excited about — an in-portal Admin community — didn't survive contact with the data.",
        attribution: "On deprioritizing the feature he wanted most",
      },
    ],
    pullQuotePosition: "middle",
    expandedPoints: [
      {
        label: "Insight validation across four sources",
        text: "Survey and interview findings were cross-checked against customer feature requests (logged by sales/success on Admins' behalf), WCR tickets (bugs and enhancement requests from Admins, members, or internal teams), and competitor or analogous product examples partners raised during interviews. Nothing moved into the roadmap on a single data point.",
      },
      {
        label: "The LA working session",
        text: "An in-person team offsite in LA — many team members meeting face-to-face for the first time. Design Researchers and the Product Manager facilitated a session synthesizing interview and survey data into \"How Might We\" statements and idea generation, ahead of the prioritization exercise.",
      },
      {
        label: "Need × Impact, four quadrants",
        text: "Top Priority: parent/child organization levels, customizable reporting, a searchable multimedia/multilingual toolkit, permissioning levels, Admin SSO. Differentiators: customized data & insights for the joint Ginger offering, an org performance + resource recommendation homepage, portal data collection informing recommendations. Nice to Have: Salesforce integration for org creation and contract detail, differentiating portal access from contract dates, improved eligibility-file troubleshooting. Low Priority: member search enhancements, an in-portal Admin community, toolkit updates — including the community feature deprioritized above.",
      },
    ],
  },

  // 6. The Proposal — internal/external split, systems of record, roadmap
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "Two tools, not one tangled one",
    title: "The Proposal",
    body: "The core recommendation: stop serving internal and external users out of the same tool. Split the Admin Portal into an external, Admin-facing product and an internal Implementation Portal — with Salesforce and Croc Pit as the systems of record they should have been pulling from all along.",
    bullets: [
      {
        title: "Admin Portal (external)",
        body: "Focused purely on delivering value to Admins, Customer Success, and Marketing: org performance insights, customizable reporting through a Tableau integration, a real toolkit, and an in-portal community.",
      },
      {
        title: "Implementation Portal (internal)",
        body: "Org launch setup, eligibility file troubleshooting, and SSO/MFA — for Customer Success, Implementation, Engineering, and Marketing — without external Admin-facing constraints shaping internal workflows.",
      },
      {
        title: "A phased roadmap, not a rewrite",
        body: "Phase 0 (H1 2022) unified org structure and eligibility templates. Phase 1 (H2 2022) built the internal/external delineation. Phase 2 (2023) expanded Admin Portal value. Phase 3 (2024) focused on engagement. Phase 0 and the start of Phase 1 were already underway at presentation time.",
      },
    ],
    caption:
      "[PLACEHOLDER — internal/external portal architecture diagram and phased roadmap]",
    expandedPoints: [
      {
        label: "Admin Portal (external)",
        text: "Serves Admins, Customer Success, and Marketing. Scoped purely to delivering Admin value: org performance insights, customizable reporting via a Tableau integration, a searchable multimedia/multilingual toolkit, and an in-portal community — everything internal teams don't need and Admins were never getting enough of.",
      },
      {
        label: "Implementation Portal (internal)",
        text: "Serves Customer Success, Implementation, Engineering, and Marketing. Handles org launch setup, eligibility file troubleshooting, and SSO/MFA — the operational work that had been crowding the Admin-facing tool and slowing both sides down.",
      },
      {
        label: "Salesforce and Croc Pit as systems of record",
        text: "Salesforce becomes the system of record for contractual org details — start/end dates, org benefits, parent/child structure — synced read-only into the Admin Portal instead of re-entered there. Croc Pit, the existing internal member-management platform, stays where MX, Engineering, and Data investigate enrollment and engagement, without that surfacing in the Admin-facing tool.",
      },
      {
        label: "A phased roadmap",
        text: "Phase 0 (H1 2022) — preparing the Admin Portal for unification: unified org structure (parent/child), unified eligibility file templates. Phase 1 (H2 2022) — establishing delineation: Implementation Portal SSO/MFA, Salesforce integration for org creation and contract dates, improved eligibility-file troubleshooting. Phase 2 (2023) — expanding Admin Portal value: org performance snapshot + resource recommendation homepage, customizable reporting, joint Ginger offering insights, the searchable multilingual toolkit. Phase 3 (2024) — driving engagement: Admin Portal data collection informing recommendations, the in-portal Admin community.",
      },
    ],
  },

  // 7. Wireframe Explorations — six tabs, explicitly illustrative
  {
    kind: "section",
    sectionNumber: "06",
    eyebrow: "Illustrative concepts, not final UI",
    title: "Wireframe Explorations",
    body: "To give leadership and cross-functional partners something concrete to react to, the proposal included wireframe explorations across six modules — built on Headspace's newly updated UI patterns rather than the portal's original 2017 styling. These are illustrative concepts, not final UI.",
    bullets: [
      {
        title: "Home",
        body: "A customizable dashboard — enrolled members, engagement, content-type usage — that surfaces contextual resources based on what the data shows. Elevated stress or sleep signals would surface matching content or program recommendations.",
      },
      {
        title: "Members",
        body: "The enrolled and invited employee list, with add/remove and filtering — the day-to-day view for Admins managing who's in their program.",
      },
      {
        title: "Settings",
        body: "Condensed from a long, disengaged list of modules into key info surfaced up front, with hover-to-edit interaction replacing buried settings pages.",
      },
      {
        title: "Features",
        body: "In-portal Challenge creation — previously a manual, high-touch process reserved for top-tier customers — made self-serve, so smaller organizations get the same capability.",
      },
      {
        title: "Resources",
        body: "The Toolkit expanded past static PDFs into podcasts, docuseries, video, and behavioral science research, with search.",
      },
      {
        title: "Reports",
        body: "Full drill-down into all org data beyond the Home dashboard, with filtering — the customizable reporting Admins named as their one universal must-have.",
      },
    ],
    caption:
      "[PLACEHOLDER — wireframe screenshots: Home, Members, Settings, Features, Resources, Reports]",
    expandedPoints: [
      {
        label: "Home",
        text: "A customizable dashboard covering enrolled members, engagement, and content-type usage, designed to surface contextual resources based on what the underlying data shows — e.g. elevated stress or sleep-issue signals in a company's population would surface relevant content or program recommendations directly on the landing screen.",
      },
      {
        label: "Members",
        text: "The enrolled and invited employee list — add, remove, and filter — the module Admins live in day to day when managing who's covered under their organization's benefit.",
      },
      {
        label: "Settings",
        text: "Condensed from a long, disengaged module list into the key information surfaced up front, with a hover-to-edit interaction pattern replacing pages of buried settings that Admins rarely needed to touch.",
      },
      {
        label: "Features",
        text: "In-portal Challenge creation, previously a manual, high-touch process reserved for top-tier customers only. The redesign's goal was to make it self-serve for smaller organizations too, without requiring a PSM to build it on their behalf.",
      },
      {
        label: "Resources",
        text: "The Toolkit expanded beyond static PDFs to include podcasts, docuseries, video, and behavioral science research, with search — directly answering the \"searchable, multimedia + multilingual toolkit\" must-have that came out of the survey.",
      },
      {
        label: "Reports",
        text: "Full drill-down access to all org data beyond the Home dashboard, with filtering — built around customizable reporting, the only feature that came back as a universal must-have across every company-size segment in the survey.",
      },
    ],
  },

  // 8. Outcome — honest framing, no shipped-product metrics
  {
    kind: "closing",
    heading: "Outcome",
    body: [
      "This was presented to Headspace leadership and cross-functional partners in Q1 2022, and was well received. Foundational Phase 0 work — the unified org structure and eligibility templates — began rolling out shortly after.",
      "As of the last documented status, full design exploration and user testing for the redesigned experience were still in progress. Like the Airbnb Hotels project, there's no shipped-product usage or business-impact metric to report here.",
      "What this case study is actually evidence of is research rigor — 17 stakeholders across 12 interviews, a 147-respondent survey, a documented Need × Impact prioritization framework — and the architecture-level thinking behind splitting one tangled tool into two purpose-built ones. Not a shipped outcome. That's the honest read.",
    ],
    stats: [
      {
        value: "17",
        label: "Stakeholders interviewed across 12 sessions, logging 167 data points",
      },
      {
        value: "147",
        label: "Admin survey responses, out of 700 surveyed — a strong unincentivized rate",
      },
      {
        value: "2",
        label: "Portals proposed to replace the one tangled tool: Admin-facing and internal Implementation",
      },
      {
        value: "0",
        label:
          "Shipped-product usage or business-impact metrics — this was a research and roadmap deliverable, not a launch",
      },
    ],
  },
];
