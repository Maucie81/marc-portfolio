/**
 * The portfolio actions /analytics counts — deliberately few, each one a
 * step a hiring manager or recruiter takes on purpose. Shared by the browser
 * tracker (VisitTracker.tsx), /api/event and the dashboard, so the list is
 * the whole event model. Case-study opens and Contact-page views aren't here:
 * they're pageviews, already recorded.
 */
export const ACTIONS = {
  resume: "Opened resume",
  linkedin: "Opened LinkedIn",
  email: "Email clicked or copied",
  phone: "Phone number tapped",
  contact_form: "Contact form sent",
  project_nav: "Next case study (closing links)",
  additional_work: "Additional work link",
  library: "Reference library photo opened",
  proof_notes: "Proof notes opened",
  partner_portal: "Partner Portal CTA clicked",
} as const;

export type ActionType = keyof typeof ACTIONS;

export const isAction = (value: unknown): value is ActionType =>
  typeof value === "string" && Object.hasOwn(ACTIONS, value);

/** The hiring funnel's last step: resume, LinkedIn or a way to get in touch. */
export const HIRING_ACTIONS: ActionType[] = [
  "resume",
  "linkedin",
  "email",
  "phone",
  "contact_form",
];

export const CONTACT_ACTIONS: ActionType[] = ["email", "phone", "contact_form"];

/** High intent, but about the product rather than getting in touch — kept
 * out of the hiring funnel. */
export const PRODUCT_ACTIONS: ActionType[] = ["partner_portal"];

/**
 * What came into view, not what someone did: the homepage hero edition on
 * screen, a homepage section, a Recent work card. Recorded once per visit
 * per target, only after it has been meaningfully on screen (see
 * exposure.ts), and stored alongside actions — same endpoint, same record —
 * but never counted as one.
 */
export const EXPOSURES = {
  hero: "Hero edition shown",
  section: "Homepage section seen",
  card: "Recent work card seen",
} as const;

export type ExposureType = keyof typeof EXPOSURES;

export const isExposure = (value: unknown): value is ExposureType =>
  typeof value === "string" && Object.hasOwn(EXPOSURES, value);

export type EventType = ActionType | ExposureType;

/** Homepage sections whose reach is measured, by their data-track-section
 * id (page.tsx), in page order. */
export const SECTIONS = {
  "recent-work": "Recent work",
  experience: "Where I’ve been (experience)",
  "reference-library": "Reference library",
  contact: "Footer contact",
} as const;

export type SectionId = keyof typeof SECTIONS;

/** Hero editions as recorded: "hero-1" … "hero-6", from <html data-hero>
 * (see hero-editions.ts). */
export const HERO_ID = /^hero-[1-6]$/;

/** Random session id: base64url, 16 chars. */
export const SESSION_ID = /^[A-Za-z0-9_-]{16}$/;
