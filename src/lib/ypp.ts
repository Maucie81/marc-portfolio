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
    "Replacing a broken publisher-reporting tool with a self-service portal for 8,700+ media partners",
  company: "Yahoo",
  years: "2024 — 2026",
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: [
        "Product designer — sole design credit, from earliest concept work through launch",
      ],
    },
    {
      label: "Timeline",
      items: ["Design began 2024", "Public launch June 3, 2026"],
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
        "Information architecture",
        "Research program (2 phases, 11 partners)",
        "Data visualization & charting stack",
        "Design system on a shared CMS foundation",
      ],
    },
  ],
  highlights: [
    "Retired two legacy systems on launch day",
    "313 Yahoo Creator accounts backfilled the next day",
    "Multi-select filtering shipped in the MVP — a direct research outcome",
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
      body: string;
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
      "Yahoo syndicates content from over 8,700 media partners — Gannett, Business Insider, CNN, the New York Post, Apartment Therapy, BBC — across its own properties. The only tool those partners had to understand how their content was performing was a legacy system already in maintenance mode.",
      "There was no self-service way to see if a story had published, understand why content was being rejected, or take something down without emailing a person and waiting. Partners were Googling their own headlines to find their content on Yahoo. Feed issues arrived as forwarded emails from a rep, days after the fact.",
    ],
    stat: {
      value: "41%",
      label: "Only 41% of publishers were satisfied with their Yahoo syndication experience",
    },
    quote: {
      text: "The disconnect between publisher portals massiveness and how absolutely crappy they usually are — it's just so insane to me.",
      attribution: "New York Post",
    },
  },

  // 3. Overview
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "Every metric in one place",
    title: "Overview",
    body: "The legacy tool gave partners one number: page views. The Overview is the first thing partners see after login — eight KPI cards, each showing the current period and how it compares to the last one. For most partners, it was the first time they'd seen CTR, dwell, or reach without requesting it from a Yahoo contact.",
    bullets: [
      {
        title: "Eight metrics, not one",
        body: 'Views, reach, uniques, dwell, CTR, comments, video streams, and content volume — each as a card showing period-over-period change. Rick Suter at Gannett called it "a 180" and said seeing CTR at all felt "incredible."',
      },
      {
        title: "Set once, stays everywhere",
        body: "Filters set on the Overview carry across every section of the portal. Partners managing dozens of brands don't re-apply the same date, region, and brand selections every time they navigate.",
      },
    ],
    caption:
      "Eight KPI cards — views, reach, uniques, dwell, CTR, comments, video streams, content volume — each with period-over-period movement.",
    expandedPoints: [
      {
        label: "Eight metrics, not one",
        text: 'Views, reach, uniques, dwell, CTR, comments, video streams, and content volume — each as a card showing period-over-period change. Rick Suter at Gannett called it "a 180" and said seeing CTR at all felt "incredible."',
      },
      {
        label: "Set once, stays everywhere",
        text: "Filters set on the Overview carry across every section of the portal. Partners managing dozens of brands don't re-apply the same date, region, and brand selections every time they navigate.",
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
    eyebrow: "See what's working, and why",
    title: "Top Content",
    body: "Top Content was designed to answer the question partners asked most: which stories rose to the top, and what drove them there.",
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
    eyebrow: "From quarterly briefings to on-demand answers",
    title: "KPI Deep‑Dives",
    body: "The previous portal gave partners one number: page views. CTR, reach, and dwell existed — but only in quarterly Yahoo briefings. KPI Deep-Dives make every metric self-service.",
    bullets: [
      {
        title: "Median matters more than average",
        body: "A single breakout story can make a struggling feed look healthy. Partners asked for median specifically — it tells you what a typical piece of content earns, not what your best one did.",
      },
      {
        title: "Everything in the filtered view, not just the first page",
        body: "Partners were downloading full content libraries and sorting them manually just to answer basic questions. The export returns every row, unpaginated — whatever filters you've set, that's what you get.",
      },
    ],
    caption:
      "Drill into any KPI with full historical trend lines, median and average breakdowns, and an export of every row in the filtered view.",
    expandedPoints: [
      {
        label: "Median matters more than average",
        text: "A single breakout story can make a struggling feed look healthy. Partners asked for median specifically — it tells you what a typical piece of content earns, not what your best one did.",
      },
      {
        label: "Everything in the filtered view, not just the first page",
        text: "Partners were downloading full content libraries and sorting them manually just to answer basic questions. The export returns every row, unpaginated — whatever filters you've set, that's what you get.",
      },
    ],
  },

  // 6. Content Vitals
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "Feed health, in the open",
    title: "Content Vitals",
    body: "Feed Health was originally designed as a monitoring dashboard. Our research changed that framing entirely. Partners told us they didn't have bandwidth to watch metrics continuously — they needed a firefighting tool, not a watch floor. Content Vitals was redesigned around that insight.",
    bullets: [
      {
        title: "Issues ranked by impact, not recency",
        body: "A feed with 30 warnings isn't necessarily a crisis. A feed with 3 failures affecting your top brand is. Issues sort by articles affected so the most consequential problems surface first.",
      },
      {
        title: "Code-level diagnostics",
        body: 'When content fails validation, partners see exactly why — down to the highlighted code — with suggested fixes. Dotdash Meredith called it "extremely helpful and unique compared to MSN." Your developer knows exactly where to look.',
      },
    ],
    caption:
      "Monitor feed health in real time: success rate, uptime, latency, and the exact issues holding you back (low word count, duplicate photos, restricted words) with guidance on how to fix each one.",
    expandedPoints: [
      {
        label: "Issues ranked by impact, not recency",
        text: "A feed with 30 warnings isn't necessarily a crisis. A feed with 3 failures affecting your top brand is. Issues sort by articles affected so the most consequential problems surface first.",
      },
      {
        label: "Code-level diagnostics",
        text: 'When content fails validation, partners see exactly why — down to the highlighted code — with suggested fixes. Dotdash Meredith called it "extremely helpful and unique compared to MSN." Your developer knows exactly where to look.',
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
    body: "Knowing an issue exists isn't enough. Issue Trends shows how a specific problem has moved over time — so partners can tell their engineering team exactly what's broken, when it started, and how many pieces of content it's touching.",
    bullets: [
      {
        title: "Trend over time, not just a current count",
        body: "Each issue shows frequency across its full history. A spike last Tuesday reads very differently from a problem that's been slowly growing for three weeks.",
      },
      {
        title: "A list you can hand directly to a developer",
        body: 'Affected content items export as CSV or JSON — partners described the drill-down as unlike anything available through MSN or other platforms: "removes the guesswork and directs us to the right teams."',
      },
    ],
    caption:
      "Watch how specific issues trend across your entire feed over time, drill into affected content, and see the impact on performance.",
    expandedPoints: [
      {
        label: "Trend over time, not just a current count",
        text: "Each issue shows frequency across its full history. A spike last Tuesday reads very differently from a problem that's been slowly growing for three weeks.",
      },
      {
        label: "A list you can hand directly to a developer",
        text: 'Affected content items export as CSV or JSON — partners described the drill-down as unlike anything available through MSN or other platforms: "removes the guesswork and directs us to the right teams."',
      },
    ],
  },

  // 8. Story Details
  {
    kind: "section",
    sectionNumber: "07",
    eyebrow: "The exact warning, and how to fix it",
    title: "Story Details",
    body: "Partners found out about content problems through emails from their Yahoo contact. Story Details replaced that with self-service visibility — the exact warning on a specific piece of content, with remediation guidance built in.",
    bullets: [
      {
        title: "Precise, not categorical",
        body: "Each affected item shows the specific issue — restricted word, low word count, duplicate photo — with a human-readable fix at the surface and the raw code detail one tap deeper for whoever needs to hand it to a developer.",
      },
      {
        title: "A pleasant surprise",
        body: 'Business Insider\'s Corina Pintado had asked for a search-based content lookup. Seeing story-level detail with performance, issues, and canonical URLs in one place gave her "a lot of happiness and excitement."',
      },
    ],
    caption:
      "Click into any piece of content to see performance, metadata, warnings, and actionable next steps — no guessing, no tickets required.",
    expandedPoints: [
      {
        label: "Precise, not categorical",
        text: "Each affected item shows the specific issue — restricted word, low word count, duplicate photo — with a human-readable fix at the surface and the raw code detail one tap deeper for whoever needs to hand it to a developer.",
      },
      {
        label: "A pleasant surprise",
        text: 'Business Insider\'s Corina Pintado had asked for a search-based content lookup. Seeing story-level detail with performance, issues, and canonical URLs in one place gave her "a lot of happiness and excitement."',
      },
    ],
  },

  // 9. Search
  {
    kind: "section",
    sectionNumber: "08",
    eyebrow: "Find any story, any way you know it",
    title: "Search",
    body: "Partners were manually copying headlines into Yahoo.com to find their own content. Search eliminates that entirely.",
    bullets: [
      {
        title: "Five ways in, one result",
        body: "Title, partner URL, Yahoo URL, partner ID, or Yahoo ID — because editorial looks things up differently than engineering does. Results appear inline with enough context to confirm you have the right item before opening it.",
      },
      {
        title: "Straight to the data",
        body: "Every search result opens the full Content Item Detail: metadata, performance KPIs, discovery source, and any active issues. Gannett's team said being able to share a direct link to a story's performance data would replace a whole category of back-and-forth with their Yahoo contact.",
      },
    ],
    caption:
      "Find any story in seconds by title, partner URL, Yahoo URL, partner ID, or Yahoo ID, then jump straight to its performance data.",
    expandedPoints: [
      {
        label: "Five ways in, one result",
        text: "Title, partner URL, Yahoo URL, partner ID, or Yahoo ID — because editorial looks things up differently than engineering does. Results appear inline with enough context to confirm you have the right item before opening it.",
      },
      {
        label: "Straight to the data",
        text: "Every search result opens the full Content Item Detail: metadata, performance KPIs, discovery source, and any active issues. Gannett's team said being able to share a direct link to a story's performance data would replace a whole category of back-and-forth with their Yahoo contact.",
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
    eyebrow: "From one-click delete to mediated request",
    title: "Takedowns",
    body: "The original concept was instant self-service: one click, content gone. Partners loved it in research. Legal reality changed it — and that's a more honest design outcome than most case studies admit.",
    bullets: [
      {
        title: "Why instant delete didn't ship",
        body: "Legal takedowns carry data-preservation and proof-of-notification obligations a silent delete button can't satisfy. The research confirmed the need; a different constraint determined the form.",
      },
      {
        title: "What shipped instead",
        body: "A pre-filled request to Yahoo's takedown team with the content's full metadata already attached — specific enough to be processed without back-and-forth, but mediated rather than instant. Gated to warning-level issues only so the feature stays usable for the majority of requests without creating legal exposure on edge cases.",
      },
    ],
    caption:
      "Request content removal directly from a story's details — include metadata, get confirmation, self-serve without support tickets.",
    expandedPoints: [
      {
        label: "Why instant delete didn't ship",
        text: "Legal takedowns carry data-preservation and proof-of-notification obligations a silent delete button can't satisfy. The research confirmed the need; a different constraint determined the form.",
      },
      {
        label: "What shipped instead",
        text: "A pre-filled request to Yahoo's takedown team with the content's full metadata already attached — specific enough to be processed without back-and-forth, but mediated rather than instant. Gated to warning-level issues only so the feature stays usable for the majority of requests without creating legal exposure on edge cases.",
      },
    ],
    pullQuotes: [
      {
        quote:
          "I really like what you showed us. Almost like a product developers perspective. That is really critical and I would even recommend other partners do that because the amount of time it takes to assess and pinpoint a problem is time consuming for multiple people in our organization.",
        attribution: "DotDash Meredith",
      },
    ],
    pullQuotePosition: "middle",
  },

  // 11. User Management
  {
    kind: "section",
    sectionNumber: "10",
    eyebrow: "Manage your own team, without filing a ticket",
    title: "User Management",
    body: "Adding a user to the legacy system required going through Yahoo. User Management gave that control to the partner organizations themselves — invite, assign, and scope brand access entirely self-serve.",
    bullets: [
      {
        title: "Role plus brand access",
        body: "Admins assign a role and optionally scope it to a subset of their organization's brands — which mattered for publishers like Gannett managing dozens of distinct sites. One form, no Yahoo involvement.",
      },
      {
        title: "Two tiers at launch, deliberately",
        body: "Admin and Viewer shipped. More granular feature-scoped permissions were logged as deferred, not rejected — a deliberate scope call to avoid delaying launch on a feature that was already a significant step forward from what existed.",
      },
    ],
    caption:
      "Add and remove team members, assign roles, control brand access, and manage organizational permissions — all without involving Yahoo.",
    expandedPoints: [
      {
        label: "Role plus brand access",
        text: "Admins assign a role and optionally scope it to a subset of their organization's brands — which mattered for publishers like Gannett managing dozens of distinct sites. One form, no Yahoo involvement.",
      },
      {
        label: "Two tiers at launch, deliberately",
        text: "Admin and Viewer shipped. More granular feature-scoped permissions were logged as deferred, not rejected — a deliberate scope call to avoid delaying launch on a feature that was already a significant step forward from what existed.",
      },
    ],
  },

  // 12. Learnings — copy, stats and outro combined into one closing screen,
  // matching the Figma layout (no section number here).
  {
    kind: "closing",
    heading: "Learnings",
    body: [
      "We set publisher satisfaction as the primary success measure and support-ticket volume as the counter-metric. I left the project before the follow-up survey that would have measured either, so I can't point to a number.",
      "What I can point to is the pattern the research left behind. The loudest, most consistent reaction — across both phases and again at launch — was relief at finally having visibility. The loudest complaint was just as consistent: everyone asked for revenue, and nobody got it in this release.",
      "If I had to predict what a satisfaction survey found, that's the shape I'd expect: a real gain on the problem we solved, and an unmoved — maybe sharper — frustration on the one we knew about, explained, and still couldn't close. That's a testable prediction, not a result I'm claiming.",
    ],
    stats: [
      {
        value: "76%",
        label:
          "Percentage of publishers who were satisfied with their Yahoo syndication experience",
      },
      {
        value: "8,700+",
        label:
          "Number of media partners who moved onto the new Yahoo Partner Platform",
      },
      {
        value: "2",
        label: "Number of legacy systems retired at launch of the new platform",
      },
      { value: "1", label: "Number of self-service partner platform" },
    ],
  },
];
