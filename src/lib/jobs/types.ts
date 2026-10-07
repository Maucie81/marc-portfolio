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
};

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
  "Follow-up due",
  "Rejected",
  "Closed",
  "Withdrawn",
] as const;

export type Tier = "APPLY NOW" | "STRONG PROSPECT" | "WATCH" | "SKIP";

export function tierOf(score: number | null): Tier | null {
  if (score === null) return null;
  if (score >= 85) return "APPLY NOW";
  if (score >= 70) return "STRONG PROSPECT";
  if (score >= 55) return "WATCH";
  return "SKIP";
}
