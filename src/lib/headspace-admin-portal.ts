/**
 * Headspace Admin portal research & proposal — case-study content.
 *
 * Source of truth: the portfolio copy doc (Google Doc 1Y5ZCQfpgUOKFFOQdDQqiW8HxOHPUC275jJPcAHZO1JA,
 * "Headspace Admin Portal Redesign") for copy, and Figma "Portfolio-2026"
 * node 916:62808 ("Headspace Case Study") for layout and section order —
 * The proposal now comes before Wireframe explorations. Headings stay in
 * sentence case per the site's casing rules.
 *
 * This is a research-and-vision deliverable, not a shipped product: a
 * prioritized roadmap and wireframe explorations presented to Headspace
 * leadership. Copy stays honest about that; no shipped-impact language.
 *
 * Media and the 2026-09-30 copy pass come from the same Figma frame. The
 * two walkthroughs are the user's Figma-prototype screen recordings, cropped
 * just inside the prototype frame (the old portal's frame has rounded
 * corners and a gray edge baked in); the stills are Figma exports. Every
 * box is sized to its media's own shape at the shared 609px height.
 */

import type { Block, Bullet, ImageSpec } from "@/lib/ypp";

const MEDIA = "/headspace/admin-portal";

/** The same points drive the expand-to-read list and the plain fallback,
 * as on the Airbnb sections. */
function points(list: Bullet[]) {
  return {
    bullets: list,
    expandedPoints: list.map((p) => ({ label: p.title, text: p.body })),
  };
}

export const meta = {
  title: "Admin portal research & proposal",
  subtitle:
    "Headspace's B2B Admin Portal hadn't been redesigned since 2017, and the merger with Ginger exposed how poorly it served the companies using it. Twelve interviews and the first direct survey of Admins led to one recommendation: split the portal in two, one for Admins and one for Headspace's own teams.",
  company: "Headspace",
  years: "2021 — 2022",
  // The outlined opening's title, one line each (uppercased by CSS).
  heroLines: ["admin portal", "research & proposal"],
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: [
        "Senior product designer. Led research, prioritization and wireframe direction",
      ],
    },
    {
      label: "Timeline",
      items: ["Q4 2021 — Q3 2022"],
    },
    {
      label: "Audience",
      items: [
        "2,000+ Admins at partner companies",
        "Internal Customer Success, Engineering and Data teams",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "Journey mapping and stakeholder interviews",
        "Admin survey design and synthesis",
        "Need × Impact prioritization",
        "Portal architecture and roadmap",
      ],
    },
  ],
  highlights: [
    "First direct survey of Headspace's Admins",
    "147 responses, no incentive",
  ],
};

export { type Block, type ImageSpec };

export const blocks: Block[] = [
  // 1. Cover
  { kind: "cover" },

  // 2. The problem — copy, stat and quote as one stack
  {
    kind: "intro-stack",
    sectionNumber: "01",
    heading: "The problem",
    body: [
      "By 2022, the Admin Portal served 2,000+ partner companies on a structure built in 2017. Features had been added for years, but nobody had asked Admins directly what they needed.",
      "The portal also served two audiences at once. Admins used it to manage their company's benefit, while Headspace's own teams used it to troubleshoot eligibility files and investigate member issues. The merger with Ginger, which brought its own internal platform, made the overlap impossible to ignore.",
    ],
    stat: {
      value: "5",
      label: "User types, internal and external, sharing one portal",
    },
    quote: {
      text: "The engagement reports are pretty underwhelming. It doesn't give us much detail and I am not super fond of it being a PDF. I wish it was an actual dashboard where we could filter the information and slice and dice it.",
      attribution: "Admin survey respondent, 2022",
    },
    image: {
      src: `${MEDIA}/videos/CurrentPortal.webm`,
      alt: "The 2022 Admin Portal: a General Electric account's Members, Insights, Settings and Toolkit tabs",
      frame: "plain",
      type: "video",
      aspect: "2858/1834",
    },
    caption: "The Admin Portal as Admins used it in 2022, largely unchanged since 2017.",
  },

  // 3. Research — journey map and stakeholder interviews
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "No map? Build it",
    title: "Research",
    body: "Before the first interview, I mapped the portal end to end, from setting up a company to resolving a member issue. Twelve interviews with seventeen people across Headspace, Ginger and partner companies then tested what the map suggested.",
    ...points([
      {
        title: "One need, five teams",
        body: "Data integration made the top three for four of the five groups. The toolkit and company hierarchy each made it for two.",
      },
    ]),
    caption:
      "The Admin Portal journey across five user types, from company setup to member support.",
    image: {
      src: `${MEDIA}/journey-map.webp`,
      alt: "The Admin Portal journey map: dashboard tasks and phases for new org creation, synthesis categories, and the full journey board of sticky notes",
      frame: "bare",
      aspect: "3882/1220",
    },
  },

  // 4. The admin survey — the stats get their own card, ahead of the Kano
  // results (Figma 1002:62238). No caption in Figma.
  {
    kind: "section",
    sectionNumber: "03",
    eyebrow: "Size matters",
    title: "The admin survey",
    body: "Headspace had never surveyed its Admins directly. I partnered with a UX researcher to design the first survey, split by company size so each segment's priorities stayed visible instead of being averaged away.",
    ...points([
      {
        title: "Only one must-have",
        body: "Customizable reporting was the only must-have overall, but only the smallest and largest companies called it essential. Admins at companies with 1,000 to 4,999 employees ranked a searchable toolkit and a performance homepage first.",
      },
    ]),
    caption: "",
    statsInMedia: true,
    image: {
      src: `${MEDIA}/kano-results.webp`,
      alt: "Kano results, priorities by company size: customizable reporting is a must-have for all Admins, SMB and Strategic; a searchable toolkit and performance homepage are must-haves for mid-market",
      frame: "plain",
      aspect: "2880/1694",
    },
    stats: [
      { value: "700", label: "Admins surveyed through the PSM team" },
      { value: "147", label: "Direct responses received" },
      { value: "21%", label: "Response rate, no incentive" },
      { value: "4", label: "Company-size segments, from SMB to Strategic" },
    ],
  },

  // 5. Synthesis — the need × impact matrix
  {
    kind: "section",
    sectionNumber: "04",
    eyebrow: "Research 1, Designer 0",
    title: "Synthesis",
    body: "Every idea was scored for need and impact, then checked against feature requests, support tickets and competitors. The in-portal Admin community I was most excited about landed in the low-priority corner. The data was right.",
    ...points([
      {
        title: "Pain versus payoff",
        body: "Need measured how often a problem came up, how many people it affected and how much it hurt. Impact measured revenue, enrollment, Admin satisfaction and internal efficiency.",
      },
    ]),
    caption:
      "Every opportunity plotted by need and impact, with the Admin community in the low-priority corner.",
    image: {
      src: `${MEDIA}/synthesis.webp`,
      alt: "Synthesized interview data and how-might-we statements beside the need × impact matrix: top priority, nice to have, differentiators and low priority",
      frame: "plain",
      aspect: "2976/1220",
    },
  },

  // 6. The proposal — one portal split into two
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "Two audiences, neither served",
    title: "The proposal",
    body: "Comparing Ginger's internal platform with the Admin Portal showed internal tools crowding out what Admins came for. I proposed an Admin Portal built only for Admins, with internal work moving to tools built for Headspace's own teams.",
    ...points([
      {
        title: "The features Admins never found",
        body: "Up to 44% of Admins didn't know the settings features existed, and 65% had never heard of SFTP uploads. Those were the screens internal teams lived in.",
      },
      {
        title: "A list that couldn't carry over",
        body: "For Ginger, showing employers who had enrolled would reveal who was seeking mental health care. The Headspace portal's most-used feature was a legal problem for the combined offering.",
      },
    ]),
    caption: "The proposed split: what moves to internal tools, and what the Admin Portal keeps.",
    image: {
      src: `${MEDIA}/proposal-split.webp`,
      alt: "The proposed split: the Admin Portal for external Admins, with Salesforce, Croc Pit and a new Implementation Portal serving internal teams",
      frame: "plain",
      aspect: "1714/1218",
    },
  },

  // 7. Wireframe explorations
  {
    kind: "section",
    sectionNumber: "06",
    eyebrow: "Built to convince, not to ship",
    title: "Wireframe explorations",
    body: "Research is easy to dismiss as a slide deck. I wireframed what an Admin-only portal could be, starting with what Admins asked for most: reporting they could explore instead of a PDF.",
    ...points([
      {
        title: "A feature that had lost clients",
        body: "Headspace had lost clients for not offering Challenges, but the old version was too buggy and manual to offer beyond top-tier accounts. The Features tab put launching one in every Admin's hands.",
      },
    ]),
    caption:
      "Open the proposed Home tab to see live enrollment, engagement and content reports, then move\nthrough Members, Settings, Features, Resources and Reports.",
    image: {
      src: `${MEDIA}/videos/WireframeWalkthrough.webm`,
      alt: "Wireframe walkthrough of the proposed Admin Portal: Home reports, Members, Settings, Features, Resources and Reports",
      frame: "plain",
      type: "video",
      aspect: "2296/1394",
    },
  },

  // 8. Learnings (Figma 917:127552)
  {
    kind: "closing",
    sectionNumber: "07",
    heading: "Learnings",
    body: [
      "Before this project, Headspace had never gone directly to its Admin population for research. Every insight about what Admins needed had been filtered through PSM conversations: secondhand, incomplete, and shaped by what internal teams thought Admins wanted rather than what they actually said.",
      "Seventeen stakeholders across twelve interviews, a survey of 700 Admins, four additional validation sources, an in-person working session, and a Need × Impact framework that overruled instinct, including my own, produced a proposal that reframed the entire problem. This wasn't a portal that needed a redesign. It was a portal that had been asked to serve two completely different audiences for years, and had failed both of them as a result.",
      "The proposal went to leadership in Q3 2022 and was approved. Foundational Phase 0 work began rolling out before the year was out. That outcome matters, but what I'm most proud of is that the research program itself changed how the team thought about Admins. Not as a user type to design for, but as a constituency that had never been properly heard.",
    ],
    stats: [],
  },
];
