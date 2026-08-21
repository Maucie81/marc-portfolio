/**
 * Yahoo Partner Portal — case-study content.
 *
 * Source of truth: YPP_Portfolio_Case_Study_DRAFT-2, cross-checked against
 * YPP_Project_Reconstruction and YPP_Bushwick_FirstPerson_Quotes. Copy is
 * condensed from that narrative into the short-block format the horizontal
 * track needs — no invented facts, no placeholder copy.
 *
 * NOTE: partner-side individuals are referenced by company/role only, per the
 * verification checklist at the end of the draft. Same for the Apartment
 * Therapy affiliate-revenue figure, which is generalized here.
 */

export const meta = {
  title: "Yahoo Partner Portal",
  subtitle:
    "Replacing a broken publisher-reporting tool with a self-service portal that puts control directly in partners' hands in order to track content performance, monitor feed health, simplify takedowns, and administer their own users - empowering them to deliver higher-quality content at higher volumes, maximize their success, and see the evidence.",
  company: "Yahoo",
  years: "2024 — 2026",
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: ["Sole designer, concept through launch"],
    },
    {
      label: "Audience",
      items: [
        "8,700+ external media partners",
        "Internal Yahoo admins & partner management",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "Scope & roadmap definition",
        "Wireframing & Information architecture",
        "Research Program (2 phases, 11 partners)",
        "Data visualization design system",
      ],
    },
  ],
  highlights: [
    "Retired two legacy systems on launch day",
    "313 Yahoo Creator accounts migrated the following day",
    "Multi-select filtering shipped in MVP",
  ],
};

export type Bullet = { title: string; body: string };
export type PullQuote = { quote: string; attribution: string };

export type Block =
  | { kind: "cover" }
  | { kind: "copy"; heading?: string; body: string[]; width?: string; accent?: boolean; sectionNumber?: string }
  | { kind: "stat"; value: string; label: string; note?: string }
  | { kind: "stat-group"; stats: { value: string; label: string }[] }
  | { kind: "quote"; text: string; attribution: string }
  | { kind: "image"; image: ImageSpec }
  | {
      kind: "intro-stack";
      heading: string;
      body: string[];
      stat: { value: string; label: string };
      quote: { text: string; attribution: string };
      sectionNumber?: string;
    }
  | {
      kind: "section";
      eyebrow: string;
      title: string;
      subhead?: string;
      body: string | string[];
      bullets: Bullet[];
      caption: string;
      pullQuotes?: PullQuote[];
      pullQuotePosition?: "top" | "middle" | "bottom";
      sectionNumber?: string;
      expandedPoints?: Array<{
        label: string;
        text: string;
      }>;
    }
  | {
      kind: "closing";
      heading: string;
      body: string[];
      stats: { value: string; label: string }[];
    };

export type ImageSpec = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Track width for this block in horizontal mode. */
  w: string;
};

export const blocks: Block[] = [
  // 1. Cover — title and metadata sidebar together, one stop
  { kind: "cover" },

  // 2. The problem — copy, stat and quote as one vertical stack, one stop
  {
    kind: "intro-stack",
    sectionNumber: "01",
    heading: "The Problem",
    body: [
      "Yahoo syndicates content from over 8,700 media partners — Gannett, Business Insider, CNN, the New York Post, Apartment Therapy, BBC — across its own properties. The only tool partners had to understand how their content was performing on Yahoo was a legacy system already in maintenance mode.",
      "There was no self-service way to see if a story had been published, understand why content was being rejected, or take content down without opening a support ticket. Partners were Googling their own content headlines to find where it lived on Yahoo. When a feed broke, partners found out through a forwarded email from their Yahoo rep, days after the fact.",
    ],
    stat: {
      value: "41%",
      label: "Only 41% of publishers were satisfied with their Yahoo syndication experience pre redesign.",
    },
    quote: {
      text: "The disconnect between publisher portals' massiveness and how absolutely crappy they usually are — it's just so insane to me.",
      attribution: "New York Post",
    },
  },

  // 3. Overview
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "Every metric in one place",
    title: "Overview",
    body: "Live Metrics gave partners one insight: page views. The Overview gives them eight — and for most, it was the first time they'd seen Click through Rate, dwell, or reach without asking a Yahoo contact.",
    bullets: [
      {
        title: "Side-by-side, not siloed",
        body: "Partners managing multiple brands could finally compare performance across them in one view — not by pulling separate reports and reconciling them manually.",
      },
      {
        title: "Set once, stays everywhere",
        body: "Filters set on the Overview page carry across every section of the portal. Partners managing dozens of brands no longer need to re-apply the same filters every time they navigate.",
      },
    ],
    caption:
      "Eight KPI cards — views, reach, uniques, dwell, CTR, comments, video streams, content volume — each with period-over-period movement.",
    expandedPoints: [
      {
        label: "Side-by-side, not siloed",
        text: "Partners managing multiple brands could finally compare performance across them in one view — not by pulling separate reports and reconciling them manually.",
      },
      {
        label: "Set once, stays everywhere",
        text: "Filters set on the Overview page carry across every section of the portal. Partners managing dozens of brands no longer need to re-apply the same filters every time they navigate.",
      },
    ],
    pullQuotes: [
      {
        quote:
          "Very easy to read, very easy on the eyes… I just love how simple, easy it is to see at a glance. I feel like it goes through a lot of details in a small amount of space, but in a way that's not overwhelming.",
        attribution: "Business Insider",
      },
      {
        quote:
          "This is just a 180. The amount of data we can see — even the CTR part is incredible.",
        attribution: "Gannett",
      },
    ],
    pullQuotePosition: "middle",
  },

  // 4. Top Content
  {
    kind: "section",
    sectionNumber: "03",
    eyebrow: "What's working, and why",
    title: "Top Content",
    body: "Partners were Googling their own headlines to find where their content lived on Yahoo. Top Content gives them ranked performance, placement data, and filtering to understand what drove every story.",
    bullets: [
      {
        title: "Sort in either direction",
        body: "Most portals show you your best content. Sorting ascending shows you what's underperforming or getting suppressed — a different, equally useful question.",
      },
      {
        title: "The editorial black box, opened",
        body: "Pitching Yahoo editorial had always been \"a big question mark\" — stories went in, but partners had no way to know which ones surfaced or where. Each story now shows exactly where it appeared within Yahoo: homepage, topic feeds, newsletters, notifications.",
      },
    ],
    caption:
      "Rank your best-performing stories by any metric, then slice the results by region, device, type, category, and license to find what's actually working.",
    expandedPoints: [
      {
        label: "Sort in either direction",
        text: "Most portals show you your best content. Sorting ascending shows you what's underperforming or getting suppressed — a different, equally useful question.",
      },
      {
        label: "The editorial black box, opened",
        text: "Pitching Yahoo editorial had always been \"a big question mark\" — stories went in, but partners had no way to know which ones surfaced or where. Each story now shows exactly where it appeared within Yahoo: homepage, topic feeds, newsletters, notifications.",
      },
    ],
    pullQuotes: [
      {
        quote:
          "Oh, this is awesome. Where content appeared — it's like the biggest question our team gets on where the traffic's coming from.",
        attribution: "Apartment Therapy",
      },
    ],
    pullQuotePosition: "bottom",
  },

  // 5. KPI Deep-Dives
  {
    kind: "section",
    sectionNumber: "04",
    eyebrow: "Trends and breakdowns",
    title: "KPI Deep‑Dives",
    body: "The Overview cards show where you stand. KPI Deep-Dives let you interrogate any metric — historical trends, median and average breakdowns, sliced by content type, region, device, and category.",
    bullets: [
      {
        title: "Median > average",
        body: "A single breakout story can make a struggling feed look healthy. Partners asked for median specifically — it tells you what a typical piece of content earns, not what your best one did.",
      },
      {
        title: "Export everything",
        body: "Partners were downloading full content libraries and sorting them manually just to answer basic questions. The export returns every row, unpaginated — whatever filters you've set, that's what you get.",
      },
    ],
    caption:
      "Drill into any KPI with full historical trend lines, median and average breakdowns, and an export of every row in the filtered view.",
    expandedPoints: [
      {
        label: "Median > average",
        text: "A single breakout story can make a struggling feed look healthy. Partners asked for median specifically — it tells you what a typical piece of content earns, not what your best one did.",
      },
      {
        label: "Export everything",
        text: "Partners were downloading full content libraries and sorting them manually just to answer basic questions. The export returns every row, unpaginated — whatever filters you've set, that's what you get.",
      },
    ],
  },

  // 6. Content Vitals
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "Reactive to self-service",
    title: "Content Vitals",
    body: "Content Vitals started as a monitoring dashboard but research changed that. Partners don't have bandwidth to watch metrics continuously — they needed a firefighting tool, not a command center.",
    bullets: [
      {
        title: "Your worst problems surface first",
        body: "A feed with 30 warnings isn't necessarily a crisis. A feed with 3 failures affecting your top brand is.",
      },
      {
        title: "Code-level diagnostics",
        body: "When content fails validation, partners see exactly why. Highlighted code, issue specific error, and suggested fixes. Developers know exactly where to look.",
      },
    ],
    caption:
      "Monitor feed health in real time: success rate, uptime, latency, and the exact issues holding you back (low word count, duplicate photos, restricted words) with guidance on how to fix each one.",
    expandedPoints: [
      {
        label: "Your worst problems surface first",
        text: "A feed with 30 warnings isn't necessarily a crisis. A feed with 3 failures affecting your top brand is.",
      },
      {
        label: "Code-level diagnostics",
        text: "When content fails validation, partners see exactly why. Highlighted code, issue specific error, and suggested fixes. Developers know exactly where to look.",
      },
    ],
    pullQuotes: [
      {
        quote:
          "Viewing the detailed content issue, the highlighted code responsible for the error — extremely helpful and unique compared to other partners like MSN.",
        attribution: "DotDash Meredith",
      },
    ],
    pullQuotePosition: "middle",
  },

  // 7. Issue Trends
  {
    kind: "section",
    sectionNumber: "06",
    eyebrow: "Track issues over time",
    title: "Issue Trends",
    body: "Knowing an issue exists isn't enough. Issue Trends shows how a specific problem has moved over time. Partners can now tell their engineering team exactly what's broken, when it started, and how many pieces of content it's touching.",
    bullets: [
      {
        title: "History, not just a snapshot",
        body: "Each issue shows frequency across its full history. A spike last Tuesday reads very differently from a problem that's been slowly growing for three weeks.",
      },
      {
        title: "Ready for handoff",
        body: "Affected content items export as CSV or JSON — giving partners and their engineering teams exactly what they need to find the problem and fix it fast.",
      },
    ],
    caption:
      "Watch how specific issues trend across your entire feed over time, drill into affected content, and see the impact on performance.",
    expandedPoints: [
      {
        label: "History, not just a snapshot",
        text: "Each issue shows frequency across its full history. A spike last Tuesday reads very differently from a problem that's been slowly growing for three weeks.",
      },
      {
        label: "Ready for handoff",
        text: "Affected content items export as CSV or JSON — giving partners and their engineering teams exactly what they need to find the problem and fix it fast.",
      },
    ],
  },

  // 8. Story Details
  {
    kind: "section",
    sectionNumber: "07",
    eyebrow: "The exact warning. The exact fix.",
    title: "Story Details",
    body: "Partners found out about content problems through emails from their Yahoo partner managers. Story Details replaced that with self-service visibility — the exact warning on a specific piece of content, with remediation guidance built in.",
    bullets: [
      {
        title: "Precise, not categorical",
        body: "Each affected item shows the specific issue — restricted word, low word count, duplicate photo — with a human-readable fix at the surface and the raw code detail one tap deeper for whoever needs to hand it to a developer.",
      },
    ],
    caption:
      "Click into any piece of content to see performance, metadata, warnings, and actionable next steps — no guessing, no tickets required.",
    expandedPoints: [
      {
        label: "Precise, not categorical",
        text: "Each affected item shows the specific issue — restricted word, low word count, duplicate photo — with a human-readable fix at the surface and the raw code detail one tap deeper for whoever needs to hand it to a developer.",
      },
    ],
  },

  // 9. Search
  {
    kind: "section",
    sectionNumber: "08",
    eyebrow: "Find anything, any way",
    title: "Search",
    body: "Partners were manually copying headlines into Yahoo.com to find their own content. Search eliminates that entirely. Results open straight to performance, metadata, and any active issues.",
    bullets: [
      {
        title: "Straight to the data",
        body: "Every search result opens the full Content Item Detail: metadata, performance KPIs, discovery source, and any active issues. A direct link to any story's performance data replaces a whole category of back-and-forth with their Yahoo Partner Manager.",
      },
    ],
    caption:
      "Find any story in seconds by title, partner URL, Yahoo URL, partner ID, or Yahoo ID, then jump straight to its performance data.",
    expandedPoints: [
      {
        label: "Straight to the data",
        text: "Every search result opens the full Content Item Detail: metadata, performance KPIs, discovery source, and any active issues. A direct link to any story's performance data replaces a whole category of back-and-forth with their Yahoo Partner Manager.",
      },
    ],
    pullQuotes: [
      {
        quote:
          "For something like the Oscars, I can pull a link to this story's performance and share it with my team. That makes it a lot easier than just giving them a breakdown.",
        attribution: "Gannett",
      },
    ],
    pullQuotePosition: "bottom",
  },

  // 10. Takedowns
  {
    kind: "section",
    sectionNumber: "09",
    eyebrow: "Mediated content requests",
    title: "Takedowns",
    body: "The original concept was instant self-service: one click, content gone. Partners loved it, but Legal had other opinions. The result: a pre-filled takedown request, straight from the story, with full metadata. No back-and-forth required.",
    bullets: [
      {
        title: "What shipped instead",
        body: "Legal takedowns carry data-preservation and proof-of-notification obligations a silent delete button can't satisfy. The research confirmed the need — a different constraint determined the form.",
      },
    ],
    caption:
      "Request content removal directly from a story's details — include metadata, get confirmation, self-serve without support tickets.",
    expandedPoints: [
      {
        label: "What shipped instead",
        text: "Legal takedowns carry data-preservation and proof-of-notification obligations a silent delete button can't satisfy. The research confirmed the need — a different constraint determined the form.",
      },
    ],
  },

  // 11. User Management
  {
    kind: "section",
    sectionNumber: "10",
    eyebrow: "Manage your own team",
    title: "User Management",
    body: "Adding a user to the legacy system required going through Yahoo. User Management gives that control back to partners — invite, assign, and scope brand access without filing a ticket.",
    bullets: [
      {
        title: "Role based brand access",
        body: "Admins assign a role and scope it to a subset of their organization's brands — one form, no Yahoo involvement.",
      },
      {
        title: "Two tiered management",
        body: "Two roles at launch: Admin and Viewer. More granular permissions were scoped for a later release — a deliberate call to avoid delaying launch.",
      },
    ],
    caption:
      "Add and remove team members, assign roles, control brand access, and manage organizational permissions — all without involving Yahoo.",
    expandedPoints: [
      {
        label: "Role based brand access",
        text: "Admins assign a role and scope it to a subset of their organization's brands — one form, no Yahoo involvement.",
      },
      {
        label: "Two tiered management",
        text: "Two roles at launch: Admin and Viewer. More granular permissions were scoped for a later release — a deliberate call to avoid delaying launch.",
      },
    ],
  },

  // 12. Learnings — copy, stats and outro combined into one closing screen,
  // matching the Figma layout (no section number here).
  {
    kind: "closing",
    heading: "Learnings",
    body: [
      "The portal launched June 3, 2026 to 8,700+ media partners, retiring two legacy systems on the same day. We set publisher satisfaction as the primary success metric and support-ticket volume as the counter-metric, but I left before a follow-up survey could be fielded, so those numbers don't exist yet.",
      "What the research did leave behind was a clear pattern. The loudest, most consistent reaction across both phases and at launch was relief — partners finally had visibility into their own performance on Yahoo. The loudest complaint was just as consistent: revenue data didn't ship, and partners noticed immediately.",
      "That gap pointed toward the next opportunity. Solving transparency created a new expectation for control. The portal successfully moved partners from opaque and manual to visible and partially self-service. What came next was clear: revenue reporting, direct content controls, and more complete self-service workflows.",
    ],
    stats: [],
  },
];
