import type { Block, Bullet, ImageSpec } from "@/lib/ypp";

/**
 * Airbnb Account Creation & Onboarding — case-study content.
 *
 * Source of truth: Figma "Portfolio-2026", node 917:129463 ("Airbnb Case
 * Study", the 2026-09-28 rewrite). This version replaces the earlier
 * Research / Design principles / Key decisions / Outcome structure with a
 * walk through the shipped system — Hubble, then each step of the hotel's
 * own flow. Copy is Figma's, with headings in sentence case per the site's
 * casing rules. Figma numbers both Welcome and Account creation "04"; the
 * numbers here run in sequence instead.
 *
 * Media are the walkthrough recordings in /public/airbnb/videos, cropped to
 * the prototype frame (Figma's presentation toolbar, slide arrows and file
 * switcher painted or trimmed out), plus one still for Room types. They
 * share one shape, a little taller than the standard media box, so the
 * box takes their shape at the shared 609px height — see SectionImage.
 */

/** Every recording/still here is 2496×1822 — see the header note. */
const MEDIA_ASPECT = "2496/1822";

/** The same points drive the expand-to-read list and the plain fallback,
 * as on the Yahoo sections. */
function points(list: Bullet[]) {
  return {
    bullets: list,
    expandedPoints: list.map((p) => ({ label: p.title, text: p.body })),
  };
}

export const meta = {
  // Lowercase per direct request, scoped to this cover only — same
  // reasoning as Headspace UMD's meta.title (headspace-umd.ts): the hero
  // reads "Airbnb" / "account creation & onboarding" as one continuous
  // phrase, not two independently-capitalized lines. This field has no
  // other consumer besides the hero and the tab title (`${company} |
  // ${title}`); the breadcrumb, homepage card, and case-studies.ts entry
  // each carry their own separately-cased "Airbnb account creation &
  // onboarding" string.
  title: "account creation & onboarding",
  subtitle:
    "Airbnb's acquisition of HotelTonight brought hotels onto a platform built for individual hosts. Getting a single hotel live took seven steps, three people and a Google Form. I redesigned it as one onboarding system: account managers set each hotel up in Hubble, an existing Airbnb tool, and hotels finished their own signup in a guided flow.",
  company: "Airbnb",
  years: "2019 — 2020",
  // The outlined opening's title, one line each (uppercased by CSS).
  heroLines: ["account creation", "& onboarding"],
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
        "Hotel revenue managers, general managers and front desk staff",
        "Airbnb account managers and Content Ops",
      ],
    },
    {
      label: "Areas of influence",
      items: [
        "End-to-end onboarding system across Hubble and the hotel flow",
        "Account creation and onboarding UX",
        "Competitive and systems audit",
        "Usability testing, three rounds",
        "Design Language System migration",
      ],
    },
  ],
  highlights: [
    "Removed the contractor from onboarding",
    "One flow built for both managed and self-starting hotels",
  ],
};

export { type Block, type ImageSpec };

export const blocks: Block[] = [
  // 1. Cover
  { kind: "cover" },

  // 2. The problem — no pull quote in this version, just the stat
  {
    kind: "intro-stack",
    sectionNumber: "01",
    heading: "The problem",
    body: [
      "Airbnb acquired HotelTonight in 2019 and, with it, a new kind of partner: hotels. Airbnb's onboarding was built for individual hosts renting out a room or a home. Hotels are run by revenue managers who sell dozens of room types across fifteen to twenty booking channels at once. They needed to list those room types, supply state and local tax details, and be treated like the businesses they were.",
      "Every hotel that went live on Airbnb passed through an account manager, a contractor and a Google Form. That worked for a handful of properties. It couldn't scale as more hotels signed on.",
    ],
    stat: {
      value: "3",
      label: "People needed to get a single hotel room live: an account manager, a contractor and the hotel",
    },
  },

  // 3. The inherited flow — illustrated two-column steps (Figma 917:130955)
  {
    kind: "section",
    sectionNumber: "02",
    eyebrow: "",
    title: "The inherited flow",
    body: "Every hotel went through the same sequence before a single room could be booked. Seven steps and three people: no way in without an account manager, and no way to finish without a contractor.",
    bullets: [],
    caption: "",
    steps: [
      {
        title: "Step 1: Establish contract",
        body: "The account manager reached out to the hotel's revenue manager and established a contract. This was the only way in. Hotels had no path to start on their own.",
        icon: { src: "/airbnb/steps/step-1-contract.svg", width: 76.7564, height: 74.7446 },
      },
      {
        title: "Step 2: Create account",
        body: "The revenue manager created an Airbnb account through a flow built for individual hosts. It had no way to list room types, capture state and local requirements, or speak to hotels as the businesses they were.",
        icon: { src: "/airbnb/steps/step-2-account.svg", width: 97.9077, height: 74 },
      },
      {
        title: "Step 3: Collect data",
        body: "The account manager collected room types, amenities and other listing details through a Google Form. Hotels often didn't know where to find their tax ID or what some of the required numbers meant.",
        icon: { src: "/airbnb/steps/step-3-collect.svg", width: 56.1172, height: 74 },
      },
      {
        title: "Step 4: Create listings",
        body: "A contractor built the hotel's listings by hand in the contractor's own personal Airbnb account.",
        icon: { src: "/airbnb/steps/step-4-listings.svg", width: 74.0144, height: 74 },
      },
      {
        title: "Step 5: Transfer listings",
        body: "The contractor transferred the finished listings to the revenue manager's account. The new flow removed this step entirely.",
        icon: { src: "/airbnb/steps/step-5-transfer.svg", width: 72.7553, height: 39.9567, labels: ["A.", "B."] },
      },
      {
        title: "Step 6: Review listings",
        body: "The revenue manager reviewed every listing, checked for errors, edited prices and published.",
        icon: { src: "/airbnb/steps/step-6-review.svg", width: 89.7788, height: 74 },
      },
      {
        title: "Step 7: Ready to publish",
        body: "Inventory was live and bookable on Airbnb.",
        icon: { src: "/airbnb/steps/step-7-publish.svg", width: 69.8267, height: 73.9999 },
      },
    ],
  },

  // 4. Hubble — the account manager's side of the system
  {
    kind: "section",
    sectionNumber: "03",
    eyebrow: "No invite until the setup is done",
    title: "Hubble",
    body: "HotelTonight's account managers tracked every hotel in a Google spreadsheet. We moved them onto Hubble, an existing Airbnb tool, and I designed one system across both sides: set the hotel up first, then send the invite.",
    ...points([
      {
        title: "The rate travels with the invite",
        body: "Manual forms meant wrong rates and missed updates. Now every hotel arrives with its terms attached, and Airbnb has a record of each acceptance.",
      },
      {
        title: "One flow, two kinds of hotel",
        body: "Managed hotels arrive with their details filled in while smaller hotels filled them in manually. This path was held back at launch, but the flow was built for it.",
      },
    ]),
    caption: "The new journey, showing where the account manager's setup in Hubble hands off to the hotel's onboarding.",
    image: {
      src: "/airbnb/videos/Hubble.webm",
      alt: "Setting up a hotel host in Hubble: host details, agreement template, commission rates, then the invitation",
      frame: "plain",
      type: "video",
      aspect: MEDIA_ASPECT,
    },
  },

  // 5. Welcome — the invite email and landing page
  {
    kind: "section",
    sectionNumber: "04",
    eyebrow: "A continuation, not an introduction",
    title: "Welcome",
    body: "Once setup was done, Hubble sent the hotel its invite. In testing, early versions of that email read like a cold introduction to hotels that already had a relationship with HotelTonight. The final email and landing page picked up where that relationship left off and told hotels what the next few steps would ask of them.",
    ...points([
      {
        title: "An invite nobody had to type",
        body: "Hubble couldn't send email, so the ops team would have written every invite by hand as plain text. Connecting Hubble to Airbnb's email system meant each hotel got a branded invite automatically the moment its setup was finished.",
      },
    ]),
    caption: "The invite email and landing page: what hotels saw first, and what they'd be asked for next.",
    image: {
      src: "/airbnb/videos/Welcome.webm",
      alt: "The Welcome to Airbnb invite email, then the onboarding landing page it opens",
      frame: "plain",
      type: "video",
      aspect: MEDIA_ASPECT,
    },
  },

  // 6. Account creation
  {
    kind: "section",
    sectionNumber: "05",
    eyebrow: "The form already knew them",
    title: "Account creation",
    body: "Hotels started by creating a business account and confirming their business details. Everything the account manager had entered in Hubble arrived already filled in, so hotels checked their information instead of typing it again. A progress bar showed from the first screen that the flow was short.",
    ...points([
      {
        title: "Support we couldn't ship",
        body: "Testing showed that a built-in support option put hotels at ease, but real-time support wasn't possible in this release. Instead, each step linked to a Hotels FAQ written for exactly what that step asked of them.",
      },
    ]),
    caption: "Business account and business details, pre-filled from the account manager's setup in Hubble.",
    image: {
      src: "/airbnb/videos/AccountCreation.webm",
      alt: "Creating the business account with pre-filled details, then reviewing the business details step",
      frame: "plain",
      type: "video",
      aspect: MEDIA_ASPECT,
    },
  },

  // 7. Room types — a still, not a recording
  {
    kind: "section",
    sectionNumber: "06",
    eyebrow: "What we stopped asking",
    title: "Room types",
    body: "Hotels listed the room types they wanted to sell on the platform, and the flow created a field for each one. Tax details came out of the hotel's signup entirely, and photos, pricing and calendars moved to the property dashboard, where hotels could return to after their account was live.",
    ...points([
      {
        title: "The wrong person had the answers",
        body: "In testing, the person creating the account often wasn't the one who knew the property's tax details. Asking for them during signup stopped the whole flow. Taking them out let hotels finish and bring in the right colleague later.",
      },
    ]),
    caption: "Room type setup: hotels name their room types, and the flow builds a field for each.",
    image: {
      src: "/airbnb/RoomTypes.webp",
      alt: "The room types step: a count of room types, a name and max occupancy field for each, and a channel manager picker",
      frame: "plain",
      aspect: MEDIA_ASPECT,
    },
  },

  // 8. Agreements
  {
    kind: "section",
    sectionNumber: "07",
    eyebrow: "Declining isn't a dead end",
    title: "Agreements",
    body: "The last steps were agreements: Airbnb's Community Commitment, which every host signs, and the hotel's partnership terms, including the commission rate set in Hubble. Signing led straight to the property dashboard, where the rest of setup was waiting.",
    ...points([
      {
        title: "A decline with a warning",
        body: "If a hotel declined the terms, a modal explained what declining meant before anything changed, then returned them to the start of the flow.",
      },
    ]),
    caption: "Community Commitment, partnership terms, and the confirmation that hands hotels to their property dashboard.",
    image: {
      src: "/airbnb/videos/Agreements.webm",
      alt: "Accepting the hotel terms of service and the commission rate agreement, then landing on the property page handoff",
      frame: "plain",
      type: "video",
      aspect: MEDIA_ASPECT,
    },
  },

  // 9. Learnings
  {
    kind: "closing",
    sectionNumber: "08",
    heading: "Learnings",
    body: [
      "The first version of the account creation and onboarding flow launched in Q1 2020. Hotels could now set up their account through a structured, brand-consistent flow, with fields pre-filled from Hubble, a progress bar signaling scope, and complex property setup moved to a dashboard they could return to after signup.",
      "Airbnb laid off 25% of its staff in May 2020, and the Hotels vertical was among the first casualties. The new flow had been live for weeks, not months, so there is no post-launch data on what it changed.",
      "What it did establish: professional hospitality businesses could onboard onto Airbnb without a contractor building their listings for them. Hotels completed their own signup, and the path for smaller hotels to start without an account manager was already built. For a platform that had never built for that audience, that was the proof of concept.",
    ],
    stats: [],
  },
];
