/**
 * Shape of the job-search snapshot behind the private /jobs page. The
 * markdown files in ~/Documents/JobSearch stay the source of truth;
 * scripts/jobs-sync.mjs derives this JSON from them. The snapshot is never
 * committed (this repo is public): production reads it from Redis, local
 * dev reads .jobs-data/snapshot.json.
 */

export type MaterialKey = "resume" | "cover" | "outreach";

export type Materials = {
  resume: string; // Not started | Draft ready | Reviewed
  cover: string; // Not started | Not needed | Draft ready | Reviewed
  outreach: string; // Not started | Draft ready | Sent
};

export type MaterialFile = { name: string; exists: boolean; content: string | null };

export type Role = {
  id: string;
  list: "active" | "closed";
  exception: boolean; // Cash App / Block confirmed-interest exception
  company: string;
  role: string;
  url: string | null;
  req: string | null;
  roleFit: number | null;
  interest: number | null;
  verification: string | null;
  status: string;
  discovered: string | null;
  applied: string | null;
  lastActivity: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  compensation: string | null;
  location: string | null;
  whyItFits: string | null;
  concerns: string | null;
  caseStudy: string | null;
  notes: string | null;
  materialsPath: string | null;
  materials: Materials;
  files: MaterialFile[];
  /* Set only when merged with manual data (src/lib/jobs/merge.ts); never in the snapshot. */
  source?: SourceKey;
  recruiter?: string | null;
  /** True when the Role Fit shown was entered by hand (never replaces an automated score). */
  manualFit?: boolean;
  /** Where edits to this card are saved: a manual record, or an overlay on an automated role. */
  edit?: { kind: "manual" | "overlay"; id: string; rev: number };
  /** Fields whose value comes from a manual edit rather than the automated snapshot. */
  overridden?: ManualField[];
  /** Overridden fields saved as dashboard edits (overlay), which "Use automated" can undo. */
  overlayFields?: ManualField[];
  /** Overridden fields the automation has changed since the edit was made. */
  conflicts?: { field: ManualField; auto: string | number | null }[];
  /** The automated value behind each overridden field (for the detail view). */
  autoValues?: Partial<Record<ManualField, string | number | null>>;
  /** Automated roles that might be the same opportunity, awaiting confirmation. */
  possible?: { id: string; company: string; role: string }[];
  /** A manual entry merged into this automated role. */
  mergedManualId?: string;
  /** An overlay whose automated role is no longer in the snapshot. */
  orphan?: boolean;
  /** Your call on the opportunity (null = undecided). Independent of recruiting status. */
  decision?: Decision | null;
  outreach?: OutreachKey | null;
  outreachUrl?: string | null;
  fitNote?: string | null;
  /** The routine's own notes from pipeline.md. `notes` holds only your notes. */
  researchNotes?: string | null;
  /** True when the next step was set by you; otherwise it's the routine's suggestion. */
  ownNext?: boolean;
  /** Earlier interest decisions, oldest first. */
  decisions?: DecisionEntry[];
};

/** Your interest, set on the dashboard. "not" archives the opportunity; reversible. */
export const DECISIONS = {
  interested: "Interested",
  undecided: "Undecided",
  not: "Not interested",
} as const;
export type Decision = keyof typeof DECISIONS;
export type DecisionEntry = { decision: Decision; at: string };

/** How an opportunity entered the pipeline. Independent of status. */
export const SOURCES = {
  automated: "Automated discovery",
  recruiter: "Recruiter outreach",
  interest: "Personal interest",
  network: "Personal network",
} as const;
export type SourceKey = keyof typeof SOURCES;

/** Fields a person can set by hand, on a manual entry or as an overlay on an automated role. */
export type ManualFields = {
  decision: Decision | null;
  source: SourceKey;
  status: string;
  url: string | null;
  location: string | null;
  compensation: string | null;
  recruiter: string | null;
  roleFit: number | null;
  interest: number | null;
  notes: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  /** Where the recruiter reached you, so you know where to reply. Separate from `source`. */
  outreach: OutreachKey | null;
  /** Link to that email thread or LinkedIn conversation, if you have one. */
  outreachUrl: string | null;
  /** Your short Role Fit assessment (the score itself is `roleFit`). */
  fitNote: string | null;
};
export type ManualField = keyof ManualFields;

export const OUTREACH = {
  email: "Email",
  linkedin: "LinkedIn",
  interest: "Personal interest",
  unknown: "Unknown",
} as const;
export type OutreachKey = keyof typeof OUTREACH;

/**
 * An opportunity added on the dashboard. Stored in Redis under jobs:manual:roles
 * (never written by jobs:sync). `rev` increments on every save (optimistic locking).
 */
export type ManualRole = ManualFields & {
  id: string; // "m-…"
  company: string;
  role: string;
  added: string; // YYYY-MM-DD, set on create
  updated: string; // ISO timestamp
  rev: number;
  /** Automated role confirmed as the same opportunity. */
  linkedTo?: string | null;
  /** Automated roles confirmed as NOT the same opportunity. */
  notSame?: string[];
  decisions?: DecisionEntry[];
};

/**
 * Sparse manual edits to an automated role, keyed by its snapshot id. Stored under
 * jobs:manual:overlays. `base` keeps the automated value at the time of each edit,
 * so a later automated change to an overridden field shows as a conflict.
 */
export type Overlay = {
  id: string;
  /** Company and role at the time of the edit: re-attaches the overlay if the role's id changes
   *  (e.g. pipeline.md moves it under Closed) and labels it if the role disappears. */
  label: { company: string; role: string };
  fields: Partial<ManualFields>;
  base: Partial<Record<ManualField, string | number | null>>;
  updated: string;
  rev: number;
  decisions?: DecisionEntry[];
};

export type ManualData = { roles: ManualRole[]; overlays: Record<string, Overlay> };

export type WatchRow = {
  company: string;
  role: string;
  score: number | null;
  verification: string;
  notes: string;
};

export type Snapshot = {
  generatedAt: string;
  doNow: string[];
  thisWeek: string[];
  waiting: string[];
  ignore: string[];
  newChanged: string[];
  roles: Role[];
  watchlist: WatchRow[];
  passive: string[];
};

export const STATUSES = [
  "Discovered",
  "Reviewing",
  "Preparing",
  "Applied",
  "Outreach drafted",
  "Outreach sent",
  "Recruiter response",
  "Interviewing",
  "Offer",
  "Follow-up due",
  "Rejected",
  "Declined",
  "Closed",
  "Withdrawn",
] as const;

/**
 * Display names. Internal values stay as pipeline.md writes them, so history and the
 * routine keep working: "Recruiter response" covers inbound and outbound conversations.
 */
export const statusLabel = (status: string) =>
  status === "Recruiter response" ? "Recruiter conversation" : status;

/** Statuses that move a card into Closed when set on the dashboard. */
export const END_STATUSES = new Set(["Rejected", "Declined", "Closed", "Withdrawn"]);

export type Tier = "APPLY NOW" | "STRONG PROSPECT" | "WATCH" | "SKIP";

export function tierOf(score: number | null): Tier | null {
  if (score === null) return null;
  if (score >= 85) return "APPLY NOW";
  if (score >= 70) return "STRONG PROSPECT";
  if (score >= 55) return "WATCH";
  return "SKIP";
}
