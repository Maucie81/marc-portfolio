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

/** Random session id: base64url, 16 chars. */
export const SESSION_ID = /^[A-Za-z0-9_-]{16}$/;
