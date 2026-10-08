import { ACTIONS } from "./events";
import { duration } from "./format";
import { QUICK_BOTTOM_MS, SMALL_GROUP, shortLabel, type Report } from "./metrics";

/**
 * The few observations worth reading first, picked by fixed rules from a
 * finished report — no model, nothing random, so the dashboard and the PDF
 * always say the same thing about the same range.
 *
 * Each rule has its own floor: a rate needs MIN_BASE visits behind it, and
 * a comparison needs SMALL_GROUP visits on each side, a gap of at least
 * MIN_GAP points, and a two-proportion z-test past Z_MIN (roughly 90%
 * confidence) — so a 2-of-3 against 1-of-4 never becomes a headline. Count
 * facts ("most opened") only need a clear leader. Rules run in priority
 * order and the first MAX_INSIGHTS that qualify are shown.
 */

export type Insight = { text: string; basis: string };

const MAX_INSIGHTS = 5;
/** Visits behind any single rate. */
const MIN_BASE = 20;
/** Percentage points two groups must differ by. */
const MIN_GAP = 10;
const Z_MIN = 1.645;
/** A count leader needs at least this many. */
const MIN_LEAD = 3;
/** Visits with a bottom reached and engaged time, before calling skims. */
const MIN_SKIM_BASE = 5;

const rate = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Whether a/n vs b/m is more than noise, by a pooled two-proportion
 * z-test; false whenever it can't be computed. */
function differs(a: number, n: number, b: number, m: number) {
  if (n < SMALL_GROUP || m < SMALL_GROUP) return false;
  if (Math.abs(rate(a, n) - rate(b, m)) < MIN_GAP) return false;
  const p = (a + b) / (n + m);
  const se = Math.sqrt(p * (1 - p) * (1 / n + 1 / m));
  return se > 0 && Math.abs(a / n - b / m) / se >= Z_MIN;
}

const visits = (n: number) => `${n.toLocaleString("en-US")} visit${n === 1 ? "" : "s"}`;

/** High-intent actions as they read mid-sentence. */
const ACTION_NAMES: Record<string, string> = {
  [ACTIONS.resume]: "resume",
  [ACTIONS.linkedin]: "LinkedIn",
  [ACTIONS.email]: "email",
  [ACTIONS.phone]: "phone",
  [ACTIONS.contact_form]: "the contact form",
};

const capitalized = (text: string) => text[0].toUpperCase() + text.slice(1);

type Rule = (r: Report) => Insight | null;

const RULES: Rule[] = [
  // Device gap in reaching the work.
  (r) => {
    const [mobile, desktop] = r.devices.groups;
    if (!differs(mobile.viewedOne, mobile.visits, desktop.viewedOne, desktop.visits)) return null;
    const m = rate(mobile.viewedOne, mobile.visits);
    const d = rate(desktop.viewedOne, desktop.visits);
    return {
      text: `Mobile case-study open rate is ${Math.abs(d - m)} points ${m < d ? "lower" : "higher"} than desktop (${m}% vs ${d}%).`,
      basis: `${visits(mobile.visits)} on mobile, ${visits(desktop.visits)} on desktop`,
    };
  },

  // How many homepage arrivals go on to the work.
  (r) => {
    if (r.startedOnHome < MIN_BASE) return null;
    const p = rate(r.homeToCaseStudy, r.startedOnHome);
    return {
      text:
        p < 50
          ? `Only ${p}% of visits that start on the homepage go on to open a case study.`
          : `${p}% of visits that start on the homepage go on to open a case study.`,
      basis: `${visits(r.startedOnHome)} started on the homepage`,
    };
  },

  // Which source sends visits that act (or, failing that, that open work).
  (r) => {
    const big = r.sources.filter((s) => s.name !== "Returning or new tab" && s.visits >= SMALL_GROUP);
    for (const [key, what] of [
      ["hiring", "reach resume, LinkedIn or contact"],
      ["caseStudy", "open a case study"],
    ] as const) {
      const byRate = [...big].sort((a, b) => b[key] / b.visits - a[key] / a.visits);
      const best = byRate[0];
      const worst = byRate.at(-1);
      if (!best || !worst || best === worst) continue;
      if (!differs(best[key], best.visits, worst[key], worst.visits)) continue;
      return {
        text: `${best.name} visits ${what} more often than ${worst.name} visits (${rate(best[key], best.visits)}% vs ${rate(worst[key], worst.visits)}%).`,
        basis: `${visits(best.visits)} from ${best.name}, ${visits(worst.visits)} from ${worst.name}`,
      };
    }
    return null;
  },

  // The most-opened project, when one clearly leads.
  (r) => {
    const [top, next] = r.caseStudies;
    if (!top || top.visits < MIN_LEAD || (next && next.visits >= top.visits)) return null;
    return {
      text: `${shortLabel(top.path)} is the most-opened case study${r.visits >= MIN_BASE ? `, reaching ${rate(top.visits, r.visits)}% of visits` : ""}.`,
      basis: `${visits(top.visits)}${next ? `; next is ${shortLabel(next.path)} with ${next.visits}` : ""}`,
    };
  },

  // Which case study gets read to the end, against the runner-up.
  (r) => {
    const measured = r.caseStudies
      .filter((c) => c.depth.n >= SMALL_GROUP)
      .sort((a, b) => b.depth.r90 / b.depth.n - a.depth.r90 / a.depth.n);
    const [top, next] = measured;
    if (!top || !next || !differs(top.depth.r90, top.depth.n, next.depth.r90, next.depth.n)) return null;
    return {
      text: `${shortLabel(top.path)} has the highest bottom-reach rate: ${rate(top.depth.r90, top.depth.n)}% of visits scroll to the end, against ${rate(next.depth.r90, next.depth.n)}% for ${shortLabel(next.path)}.`,
      basis: `${visits(top.depth.n)} and ${visits(next.depth.n)} with scroll depth recorded`,
    };
  },

  // Bottoms reached too fast to have been read.
  (r) => {
    const skimmed = r.caseStudies
      .filter((c) => c.depth.bottomTimed >= MIN_SKIM_BASE && c.depth.bottomQuick * 2 > c.depth.bottomTimed)
      .sort((a, b) => b.depth.bottomQuick / b.depth.bottomTimed - a.depth.bottomQuick / a.depth.bottomTimed)[0];
    if (!skimmed) return null;
    const { bottomQuick: q, bottomTimed: t } = skimmed.depth;
    return {
      text: `${q} of ${t} visits that reached the bottom of ${shortLabel(skimmed.path)} spent under ${Math.round(QUICK_BOTTOM_MS / 1000)}s on it — more skimming than reading.`,
      basis: `visits with both scroll depth and engaged time`,
    };
  },

  // One page and gone.
  (r) => {
    if (r.visits < MIN_BASE || r.singlePage * 2 <= r.visits) return null;
    return {
      text: `${rate(r.singlePage, r.visits)}% of visits see only one page.`,
      basis: visits(r.visits),
    };
  },

  // The high-intent step people take most.
  (r) => {
    const ranked = r.actions
      .filter((a) => a.hiring && ACTION_NAMES[a.label])
      .sort((a, b) => b.visits - a.visits);
    const [top, next] = ranked;
    if (!top || top.visits < MIN_LEAD || (next && next.visits >= top.visits)) return null;
    return {
      text: `${capitalized(ACTION_NAMES[top.label])} is the most common high-intent action${next?.visits ? `, ahead of ${ACTION_NAMES[next.label]}` : ""}.`,
      basis: `${visits(top.visits)}${next?.visits ? ` vs ${next.visits}` : ""}`,
    };
  },

  // How quickly homepage arrivals commit to a project.
  (r) => {
    const t = r.timing.toCaseStudy;
    if (!t || t.n < SMALL_GROUP) return null;
    return {
      text: `Homepage visitors who open a case study do so after a median of ${duration(t.median)}.`,
      basis: visits(t.n),
    };
  },
];

export function insightsFor(report: Report) {
  const items: Insight[] = [];
  for (const rule of RULES) {
    const found = rule(report);
    if (found) items.push(found);
    if (items.length === MAX_INSIGHTS) break;
  }
  const note = !report.visits
    ? "No visits in this period yet."
    : report.visits < MIN_BASE
      ? `${visits(report.visits)} in this period — rates and comparisons need at least ${MIN_BASE}, so most insights are held back. A longer range shows more.`
      : !items.length
        ? "No clear standouts in this period: no gap is large enough, on enough visits, to call."
        : null;
  return { items, note };
}
