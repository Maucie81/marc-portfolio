import type { Block, ImageSpec } from "@/lib/ypp";

/**
 * Airbnb Account Creation & Onboarding — case-study content.
 *
 * Source of truth: Figma "Portfolio-2026", node 511:56659 ("Airbnb Case
 * Study"). Copy is pulled directly from that frame's text layers — see the
 * PR/commit notes for the handful of open items still unresolved in the
 * Figma file itself (Design Principles section content, a stray "six" vs
 * "7" handoff count). [PLACEHOLDER] marks the image/media captions only,
 * same convention as the YPP and Headspace case studies — those slots can't
 * be built out until the surrounding structure is locked.
 */

export const meta = {
  title: "Account Creation & Onboarding",
  subtitle:
    "Airbnb's acquisition of HotelTonight brought a new class of partner onto the platform: professional hospitality businesses with onboarding needs the existing host flow wasn't built for. Getting a single hotel live required six manual handoffs across account managers, contractors, and ops teams. I redesigned that process into a self-service flow built entirely on existing Airbnb infrastructure — no net-new engineering required.",
  company: "Airbnb",
  years: "2019 — 2020",
};

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: ["Lead designer, account creation and onboarding"],
    },
    {
      label: "Timeline",
      items: ["2019 — 2020, launched Q1 2020"],
    },
    {
      label: "Audience",
      items: [
        "Hotel Revenue Managers, General Managers, Front Desk Agents",
        "Airbnb Market Managers and Ops team",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "Account creation and onboarding UX",
        "Competitive and systems audit",
        "Research synthesis and question development",
        "Design Language System migration",
      ],
    },
  ],
  highlights: [
    "Built on existing Airbnb infrastructure — no net-new engineering",
    "Launched Q1 2020",
  ],
};

export { type Block, type ImageSpec };

export const blocks: Block[] = [
  // 1. Cover
  { kind: "cover" },

  // 2. The Problem
  {
    kind: "intro-stack",
    sectionNumber: "01",
    heading: "The Problem",
    body: [
      "Airbnb acquired HotelTonight in early 2019 and inherited something its platform wasn't designed for: professional hospitality businesses. Revenue managers, directors of operations, COOs. People who ran their properties across 15 to 20 OTA channels simultaneously through purpose-built PMS and channel management systems. They expected extranet parity. They expected to be treated like the operators they were.",
      "What they got was a flow built for individual hosts. The onboarding process had six steps and required a human handoff at every one of them. No hotel could get a single room live on Airbnb without going through an account manager, a contractor, and back again. The Google Form sitting at the center of that process wasn't just inefficient. It was the wrong signal to send to a partner you were asking to trust you with their inventory.",
    ],
    stat: {
      value: "7",
      label:
        "Manual handoffs from initial outreach to a property going live, none self-service",
    },
    quote: {
      text: "It doesn't feel like we are already in a relationship. It feels like we are just starting one.",
      attribution: "Michael, Director of Revenue Management, Paligroup Hotels",
    },
  },

  // 3. The Inherited Flow — now seven steps, not six
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "",
    title: "The Inherited Flow",
    body: "Every hotel went through the same sequence before a single room could be booked. Seven steps, seven handoffs, no way in without a Market Manager and no way to finish without a contractor.",
    bullets: [],
    caption: "",
    steps: [
      {
        title: "Step 1: Establish contract",
        body: "The Market Manager reached out to the hotel's Revenue Manager and established a contract. This was the only entry point. There was no self-initiated path for hotels.",
      },
      {
        title: "Step 2: Create account",
        body: "The Revenue Manager created an Airbnb account through a flow built for individual hosts. It didn't account for room-type listing, state and locally mandated information, or the level of professionalism hotels expected.",
      },
      {
        title: "Step 3: Collect data",
        body: "The Market Manager collected key hotel data from the Revenue Manager — room types, property amenities, and other listing details. Hotels often didn't know where to find their EI number or how to input random numbers required by the form.",
      },
      {
        title: "Step 4: Create listings",
        body: "A contractor manually built the hotel's listings inside the hotel's personal Airbnb account. Features needed included multiple room types within a single property and editable property-level content.",
      },
      {
        title: "Step 5: Transfer listings",
        body: "The contractor transferred the completed listings to the Revenue Manager's Airbnb account. Ideally this step would be removed from the flow entirely.",
      },
      {
        title: "Step 6: Review listings",
        body: "The Revenue Manager reviewed all listings, checked for errors, edited prices, and published.",
      },
      {
        title: "Step 7: Ready to publish",
        body: "Inventory was now live and bookable on Airbnb.",
      },
    ],
  },

  // 4. Research — group heading, then one panel-item per audit, each with
  // its own placeholder image (matches Figma's three separate panels).
  {
    kind: "copy",
    sectionNumber: "03",
    heading: "Research",
    eyebrow: "What the Market Already Knew",
    body: [],
  },
  {
    kind: "panel-item",
    number: "01",
    title: "Competitive audit",
    body: "Expedia, Booking.com, and Agoda audited against three questions: how they sequenced onboarding versus ongoing property setup, how professional their language was, and how they handled task complexity. Every mature OTA already treated hotels as operators. That became the baseline.",
    caption: "[PLACEHOLDER — competitive audit artifact]",
  },
  {
    kind: "panel-item",
    number: "02",
    title: "Systems audit",
    body: "Three internal tools reviewed: the Trust and Safety signup flow, Luxury Retreats' stepped onboarding, and Hubble, the account manager tool the Luxury Retreats team had built. All three became direct building blocks. One early constraint: Hubble didn't store signed contracts, which would have required net-new engineering to solve.",
    caption: "[PLACEHOLDER — systems audit diagram]",
  },
  {
    kind: "panel-item",
    number: "03",
    title: "User testing",
    body: "Three rounds over the course of the project, five to ten hotels per round. Two findings drove the most consequential decisions: hotels were confused and frustrated when asked for room type and tax information upfront, and the welcome email felt like a cold introduction rather than a continuation of their existing HotelTonight relationship.",
    caption: "[PLACEHOLDER — user testing session]",
  },

  // 5. Design Principles — the dark full-bleed panel now matches Figma's
  // structure (518:70506) exactly: sectionNumber, heading, and intro
  // paragraph are real Figma copy. The three item titles/bodies in Figma
  // are still a verbatim, unedited duplicate of the Research panel copy
  // above (same "Competitive audit / Systems audit / User testing" text) —
  // that's unresolved on the Figma side, not a structural gap, so these
  // stay placeholder until real principle copy exists.
  {
    kind: "principles",
    sectionNumber: "04",
    heading: "Design Principles",
    intro:
      "Developing principles served as a constant reminder of our priorities, allowing us to course-correct quickly if we began to stray from our objectives or misrepresent our end users.",
    items: [
      {
        number: "01",
        title: "[PLACEHOLDER — principle 01 title]",
        body: "[PLACEHOLDER — principle 01 supporting copy]",
      },
      {
        number: "02",
        title: "[PLACEHOLDER — principle 02 title]",
        body: "[PLACEHOLDER — principle 02 supporting copy]",
      },
      {
        number: "03",
        title: "[PLACEHOLDER — principle 03 title]",
        body: "[PLACEHOLDER — principle 03 supporting copy]",
      },
    ],
  },

  // 6. Key Decisions — now three decisions, not four. Same group-heading +
  // per-item-panel pattern as Research; Figma numbers these items 02–04
  // (01 is the group heading's own slot in that panel layout).
  {
    kind: "copy",
    sectionNumber: "05",
    heading: "Key Decisions",
    eyebrow: "Choices that shaped the flow",
    body: [
      "Three decisions defined the final shape of the flow — each a fork where a more obvious path existed and was set aside for a specific reason.",
    ],
  },
  {
    kind: "panel-item",
    number: "02",
    title: "Extended Hubble instead of building new",
    body: "The Hotels team extended Hubble — the account manager tool built by the Luxury Retreats team — to create host accounts for hotels, track property progress through onboarding, manage commission rates and contracts, and let account managers build a property details page per hotel. The team also integrated Rookery into Hubble so the ops team could trigger templated, branded emails automatically, replacing manually written plain-text messages and making the trigger step scalable.",
    caption: "[PLACEHOLDER — Hubble property details page]",
  },
  {
    kind: "panel-item",
    number: "03",
    title: "Replaced full support with a Hotels FAQ",
    body: "Research showed that embedding a support feature gave hotels ease and trust. The team knew before testing that real-time support wasn't shippable in this flow. Rather than omitting it entirely, they linked to a Hotels-specific FAQ with articles directly relevant to what partners were being asked to do at each step. Form fields were also pre-populated with data already gathered by account managers in Hubble.",
    caption: "[PLACEHOLDER — Hotels FAQ / pre-populated form fields]",
  },
  {
    kind: "panel-item",
    number: "04",
    title: "Moved complex tasks out of the critical path",
    body: "Room information, taxes and fees, and property photos had all been collected upfront via Google Form. User testing confirmed the bigger issue: the person completing account creation was often not the person who had that information, making those fields a bottleneck that stopped the whole flow. Moving complex tasks to the post-account-creation property dashboard let hotels complete the critical path quickly and return to detailed setup with the right people.",
    caption: "[PLACEHOLDER — before/after: Google Form vs. property dashboard]",
  },

  // 7. Outcome — no stats in this version of the design
  {
    kind: "closing",
    heading: "Outcome",
    body: [
      "V1 of the account creation and onboarding flow launched Q1 2020. Hotels could now set up their account through a structured, brand-consistent self-service flow — form fields pre-populated from Hubble data, a progress bar signaling scope, and complex property setup tasks moved to a post-account-creation dashboard.",
      "Airbnb laid off 25% of its staff in May 2020. The Hotels vertical was among the first casualties. The new flow had been live for weeks, not months.",
      "What it did establish: that professional hospitality businesses could onboard onto Airbnb without a human in the loop. For a platform that had never built for that audience, that was the proof of concept.",
    ],
    stats: [],
    caption: "[PLACEHOLDER — journey map or final flow screenshots]",
  },
];
