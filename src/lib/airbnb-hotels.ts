import type { Block, ImageSpec } from "@/lib/ypp";

export const meta = {
  title: "Airbnb Hotels",
  subtitle:
    "Redesigning hotel partner onboarding from a six-step manual process into a scalable self-service flow",
  company: "Airbnb",
  years: "2019 — 2020",
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: [
        "Lead designer — owned explorations, research, and implementation for the full account creation and onboarding flow",
      ],
    },
    {
      label: "Timeline",
      items: ["Year-long project, 2019 — 2020", "Launched Q1 2020"],
    },
    {
      label: "Audience",
      items: [
        "Hotel Revenue Managers, Front Desk Agents, Marketing Managers",
        "Airbnb Market Managers and Ops team",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "Account creation and onboarding UX",
        "Competitive and systems audit",
        "Three rounds of user testing",
        "Hubble extension and Rookery integration",
        "Design Language System migration",
      ],
    },
  ],
  highlights: [
    "Lead designer — sole design credit on account creation and onboarding",
    "Leveraged Airbnb Signup, Luxury Retreats, and Hubble — no net-new infrastructure",
    "Launched Q1 2020; Hotels team deprioritized after COVID-19",
  ],
};

export { type Block, type ImageSpec };

export const blocks: Block[] = [
  // 1. Cover
  { kind: "cover" },

  // 2. The Problem — user problems + business problems as one opening block
  {
    kind: "intro-stack",
    sectionNumber: "01",
    heading: "The Problem",
    body: [
      "Airbnb acquired HotelTonight in early 2019 and inherited an onboarding process built for a different kind of host. The existing flow wasn't designed with professional hospitality providers in mind — it didn't account for hotel-specific needs like room-type listing, state and locally mandated information, or the level of professionalism hotels expected.",
      "Hotels relied on account managers to guide them through every step. That reliance was the core business problem: it made onboarding slow, non-scalable, and bottlenecked on headcount rather than product.",
    ],
    stat: {
      value: "6",
      label:
        "Manual handoffs from initial outreach to a property going live — none self-service",
    },
    quote: {
      text: "[PLACEHOLDER — hotelier quote about friction or complexity in the inherited onboarding process]",
      attribution: "[Hotel partner, role — placeholder]",
    },
  },

  // 3. The six-step inherited flow
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "THE INHERITED FLOW, STEP BY STEP",
    title: "Six Steps, All Manual",
    body: "Every hotel went through the same sequence before a single room could be booked. Each step required a human handoff — a different person, a different tool, a separate action on Airbnb's side.",
    bullets: [
      {
        title: "Market Manager outreach and contract",
        body: "The Market Manager reached out to the hotel's Revenue Manager and established a contract. This was the only entry point — there was no self-initiated path for hotels.",
      },
      {
        title: "Revenue Manager creates an Airbnb account",
        body: "Once a contract was in place, the Revenue Manager created their Airbnb account — an account not built for hotels, requiring separate follow-up to configure for hotel-specific needs.",
      },
      {
        title: "Market Manager collects hotel data",
        body: "The Market Manager manually collected key property data from the Revenue Manager — a lot of back and forth to get all the required documents in order.",
      },
      {
        title: "Contractor manually builds listings",
        body: "A contractor built the hotel's listings inside their own personal Airbnb account. Not the hotel's account. Not an internal tool. A workaround.",
      },
      {
        title: "Contractor transfers listings to the hotel",
        body: "Once built, the contractor transferred the listings to the Revenue Manager's account — a second manual operation to undo the first.",
      },
      {
        title: "Revenue Manager reviews and publishes",
        body: "The Revenue Manager reviewed the listings for errors and published them. Only then was the inventory live and bookable on Airbnb.",
      },
    ],
    caption: "[PLACEHOLDER — process diagram of the six-step inherited flow]",
    expandedPoints: [
      {
        label: "Market Manager outreach and contract",
        text: "The Market Manager reached out to the hotel's Revenue Manager and established a contract. This was the only entry point — there was no self-initiated path for hotels. A lot of the steps in this flow were inherited directly from HotelTonight, which required heavy handholding from the sales team.",
      },
      {
        label: "Revenue Manager creates an Airbnb account",
        text: "Once a contract was in place, the Revenue Manager created their Airbnb account. The existing flow wasn't designed with hotels in mind — it didn't account for room-type listing, state and locally mandated information, or the level of professionalism hotels expected in the way questions were asked.",
      },
      {
        label: "Market Manager collects hotel data",
        text: "The Market Manager manually collected key property data from the Revenue Manager. A lot of back and forth between the hotel and the ops team to get all required documents in order before the next step could begin.",
      },
      {
        label: "Contractor manually builds listings",
        text: "A contractor built the hotel's listings in their own personal Airbnb account — not the hotel's account, not an internal tool designed for this. This was an inherited workaround, not a system.",
      },
      {
        label: "Contractor transfers listings to the hotel",
        text: "Once built, the contractor transferred the listings to the Revenue Manager's Airbnb account. A second manual operation to reverse the improvisation of the first.",
      },
      {
        label: "Revenue Manager reviews and publishes",
        text: "The Revenue Manager reviewed the listings for errors and published them. Only then was the inventory live and bookable on Airbnb. For many hotels, this entire sequence took weeks.",
      },
    ],
  },

  // 4. Research
  {
    kind: "section",
    sectionNumber: "03",
    eyebrow: "GROUNDING THE WORK",
    title: "Research",
    body: "Three parallel workstreams informed the redesign: a competitive audit to understand the market baseline, a systems audit to find reusable Airbnb infrastructure, and three rounds of user testing with hotels across multiple cities.",
    bullets: [
      {
        title: "Competitive audit — Expedia, Booking.com, AGODA",
        body: "Three competitors, analyzed for the same three things: the sequence of tasks in initial onboarding versus later property setup, the level of professionalism in the language used with hotels, and the complexity of required tasks. The goal was to understand what the self-service bar actually looked like in the market.",
      },
      {
        title: "Systems audit — Airbnb Signup, Luxury Retreats, Hubble",
        body: "Three existing Airbnb systems could be adapted rather than rebuilt. Airbnb Signup (Trust and Safety's flow) broke steps down without overwhelming users. Luxury Retreats handled contracts, commissions, and save-and-exit for complex multi-step onboarding. Hubble let account managers manage assigned properties. All three became structural components of the new flow.",
      },
      {
        title: "User testing — three rounds, 5–10 hotels per round",
        body: "A year-long project, three rounds across multiple cities, property sizes, types, and locations. Users ranged from Revenue Managers and Front Desk Agents to Marketing Managers — it mattered to get feedback from all roles, not just the primary account contact.",
      },
    ],
    caption:
      "[PLACEHOLDER — research artifacts, systems diagram, or user testing session]",
    expandedPoints: [
      {
        label: "Competitive audit — Expedia, Booking.com, AGODA",
        text: "Three competitor sites reviewed and analyzed for three questions: What is the sequence of tasks in initial onboarding versus later property setup? How professional is the language? How complex are the required tasks? The answers shaped which parts of the inherited flow needed updating versus a full overhaul.",
      },
      {
        label: "Systems audit — Airbnb Signup, Luxury Retreats, Hubble",
        text: "Airbnb Signup: intuitive UI built by Trust and Safety, broke down steps without overwhelming users, carried the brand through high-quality imagery. Luxury Retreats: stepped flow showing progress, already handled contracts and commissions, had contact support and save-and-exit for information-heavy flows. Hubble: the account manager tool built by the Luxury Retreats team, for searching, editing, and managing assigned properties. All three became building blocks — one early gap identified: Hubble didn't store signed contracts, which would have been a large engineering undertaking if built from scratch.",
      },
      {
        label: "User testing — three rounds, 5–10 hotels per round",
        text: "Three rounds over a year-long project, testing a working prototype against a structured script. Goals: understand hotels' ability to set up their account, identify time-intensive steps requiring additional documentation, and surface missing information. Key findings: the welcome email felt cold and didn't reflect the existing relationship from Hotel Tonight; embedding a support feature gave hotels ease and trust; hotels not yet onboarded were confused about being asked for room type and tax information upfront; hotels who had previously gone through the old process said the new experience felt 'way more professional than the Google form.'",
      },
    ],
  },

  // 5a–5c. Design principles — pull-quote style
  {
    kind: "quote",
    text: "Keep it simple.",
    attribution:
      "Design principle 01 — minimize handoffs between hotels and the ops team. Re-use existing tools. Don't build what already exists.",
  },
  {
    kind: "quote",
    text: "Hotels are professionals.",
    attribution:
      "Design principle 02 — always present hotels as a professional business and their staff as highly capable.",
  },
  {
    kind: "quote",
    text: "Set clear expectations.",
    attribution: "Design principle 03",
  },

  // 6. Key decisions
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "CHOICES THAT SHAPED THE PRODUCT",
    title: "Key Decisions",
    body: "Four decisions defined the final shape of the flow — each a fork where a more obvious path existed and was set aside for a specific reason.",
    bullets: [
      {
        title: "Extended Hubble instead of building new infrastructure",
        body: "The Hotels team extended Hubble — already the account manager tool — to create Host Accounts, track property progress through the flow, manage commission rates and contracts, and let account managers build a Property Details page per hotel. Saved months of engineering and design. Also integrated Rookery into Hubble so the ops team could trigger templated, branded emails automatically instead of sending manual plain-text messages.",
      },
      {
        title: "Replaced full support with a Hotels FAQ link",
        body: "User testing showed that embedding a support feature gave hotels ease and trust. The team couldn't ship real-time support in this flow. The next best option: a Hotels-specific FAQ with articles relevant to each step. The form fields were also pre-populated with data already collected by account managers in Hubble, reducing the manual burden significantly.",
      },
      {
        title: "Replaced the Google Form — and moved complex tasks after account creation",
        body: "Room information, taxes and fees, and property photos had all been collected via a Google Form — unprofessional and against Airbnb's brand. More practically: the person doing account creation was often not the person who had tax or room-type data, making those steps a bottleneck. Complex tasks moved to the property dashboard, available post-account-creation, where partners could work through them at their own pace with the right team members.",
      },
      {
        title: "Migrated to Airbnb's new Design Language System mid-project",
        body: "When the project kicked off, the previous DLS was being deprecated in favor of a new version — but the team wasn't permitted to use it yet. Once released, the designs were migrated to the new patterns. [PLACEHOLDER — add detail on timing, scope, and whether the mid-project migration added net cost or accelerated the final UI quality.]",
      },
    ],
    caption:
      "[PLACEHOLDER — flow diagram, prototype frames, or before/after comparison]",
    expandedPoints: [
      {
        label: "Extended Hubble instead of building new",
        text: "The Hotels team extended Hubble — the account manager tool built by the Luxury Retreats team — to create Host Accounts for hotels, track property progress through the onboarding flow, manage commission rates and contracts, and let account managers build a Property Details page per hotel. This saved months of engineering and design resources. The team also integrated a system called Rookery into Hubble so the ops team could trigger templated, branded emails automatically — replacing manually written plain-text messages and making the trigger step scalable.",
      },
      {
        label: "Replaced full support with a Hotels FAQ link",
        text: "Research showed that embedding a support feature gave hotels ease and trust. The team knew before testing that they couldn't ship real-time support in this flow. Rather than omitting it entirely, they linked to a Hotels-specific FAQ page with articles directly relevant to what partners were being asked to do at each step. Form fields were also pre-populated with data already gathered by account managers in Hubble, reducing the burden of account creation significantly.",
      },
      {
        label: "Replaced the Google Form — and moved complex tasks out of the critical path",
        text: "Room information, taxes and fees, and property photos had all been collected via a Google Form. It felt unprofessional and went against Airbnb's brand. User testing confirmed the bigger issue: the person completing account creation was often not the person who had tax or room-type information — making those form fields a bottleneck that stopped the whole flow. Moving complex tasks to the post-account-creation property dashboard let hotels complete the critical path quickly and return to detailed setup with the right people.",
      },
      {
        label: "Migrated to the new Design Language System mid-project",
        text: "When the project started, the previous DLS version was being deprecated in favor of a new one — but the Hotels team didn't have permission to use it yet. Once the new DLS was released, the designs were migrated to the new patterns. [PLACEHOLDER — add specific detail on what changed, what the migration cost in terms of rework, and the retrospective view on whether the timing added friction or ultimately improved the final output.]",
      },
    ],
  },

  // 7. Outcome — honest, no softening
  {
    kind: "closing",
    heading: "Outcome",
    body: [
      "V1 of the Account Creation and Onboarding flow launched Q1 2020. Hotels could now set up their account through a structured, brand-consistent self-service flow — with form fields pre-populated from Hubble data, a progress bar signaling scope, and complex property setup tasks moved to a dashboard accessible after account creation.",
      "In Q2 2020, Airbnb drastically reshaped the company in response to COVID-19. The entire Hotels team was deprioritized. Mass layoffs followed. The new flow had no meaningful time in the market before the vertical went into maintenance mode.",
      "There is no post-launch usage data. The team was unable to collect data about the project's successes or areas for improvement. That is the honest end of this project.",
    ],
    stats: [
      {
        value: "3",
        label:
          "Rounds of user testing — 5–10 hotels per round across multiple cities, property sizes, and user roles",
      },
      {
        value: "3",
        label:
          "Existing Airbnb systems leveraged: Airbnb Signup, Luxury Retreats onboarding, and Hubble",
      },
      {
        value: "0",
        label:
          "Post-launch usage data — Hotels team deprioritized after COVID-19 before metrics could be gathered",
      },
    ],
  },
];
