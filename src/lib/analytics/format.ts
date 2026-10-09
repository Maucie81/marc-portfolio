import { RANGES, TIME_ZONE, type Report, type Row, type TimeStats } from "./metrics";

/**
 * Formatting and small HTML pieces shared by the /analytics dashboard
 * (dashboard.ts) and its printable report (report-page.ts), so both show
 * the same numbers the same way. Every stored value is escaped: paths,
 * referrers and UTM tags arrive from browsers, so they're untrusted text.
 */

export const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const fmt = (n: number) => n.toLocaleString("en-US");

export const pct = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : "—";

export const plural = (n: number, word: string) => `${fmt(n)} ${word}${n === 1 ? "" : "s"}`;

/** 42s · 1m 18s · 4m 03s · 1h 05m */
export function duration(ms: number) {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${String(secs % 60).padStart(2, "0")}s`;
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

export const median = (t: TimeStats) => (t ? duration(t.median) : "—");
export const mean = (t: TimeStats) => (t ? duration(t.mean) : "—");

/** "40% (4)": the share and the count it's out of, so small groups read
 * as small. */
export const share = (part: number, whole: number) =>
  whole ? `${pct(part, whole)} <span class="muted">(${fmt(part)})</span>` : "—";

/** A deepest milestone in words. */
export const depthLabel = (m: number | null) =>
  m === null ? "—" : m === 100 ? "Fits on screen" : m >= 90 ? "Bottom" : m === 0 ? "Under 25%" : `${m}%`;

export function bar(part: number, whole: number) {
  const width = whole ? Math.max(part ? 1.5 : 0, (part / whole) * 100) : 0;
  return `<span class="track"><span class="fill" style="width:${width.toFixed(1)}%"></span></span>`;
}

export const empty = (text = "Nothing in this period yet.") => `<p class="muted">${esc(text)}</p>`;

/** `optional` columns drop out on phone widths, where they'd squeeze the
 * labels instead; `extra` adds a class per column (e.g. "fit", "grow"). */
export function table(
  head: string[],
  rows: string[][],
  numeric: boolean[],
  optional: boolean[] = [],
  extra: string[] = [],
) {
  const cls = (i: number) => {
    const names = [numeric[i] && "num", optional[i] && "opt", extra[i]].filter(Boolean).join(" ");
    return names ? ` class="${names}"` : "";
  };
  const th = head.map((h, i) => `<th${cls(i)}>${esc(h)}</th>`).join("");
  const body = rows
    .map((cells) => `<tr>${cells.map((c, i) => `<td${cls(i)}>${c}</td>`).join("")}</tr>`)
    .join("");
  return `<div class="scroll"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** "Thing → visits, share" with a bar under each label, top `limit` rows. */
export function ranked(
  title: string,
  rows: Row[],
  total: number,
  opts: { limit?: number; note?: string; heading?: 2 | 3 } = {},
) {
  const { limit = 10, note, heading = 3 } = opts;
  const max = rows[0]?.[1] ?? 0;
  const body = rows.length
    ? table(
        ["", "Visits", "Share"],
        rows
          .slice(0, limit)
          .map(([label, n]) => [`${esc(label)}${bar(n, max)}`, fmt(n), pct(n, total)]),
        [false, true, true],
      ) + (rows.length > limit ? `<p class="muted small">+ ${rows.length - limit} more</p>` : "")
    : empty();
  return `<section class="block"><h${heading}>${esc(title)}</h${heading}>${note ? `<p class="muted small">${note}</p>` : ""}${body}</section>`;
}

const eastern = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...opts });

export const timeOf = (ms: number | string) =>
  eastern({ month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ms));

/** 3:12:04 PM — for steps inside one visit, which are often seconds apart. */
export const clockOf = (ms: number | string) =>
  eastern({ hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(ms));

export const dayOf = (ms: number) =>
  eastern({ month: "short", day: "numeric", year: "numeric" }).format(ms);

/** 2026-10-07, in Eastern time. */
export const isoDay = (ms: number) =>
  eastern({ year: "numeric", month: "2-digit", day: "2-digit" }).format(ms).replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2");

/** "7 days · Oct 1 – Oct 7, 2026"; All time starts at the first pageview. */
export function rangeText(report: Report) {
  const from = report.range === "all" ? report.firstPageviewMs : report.startMs;
  const label = RANGES[report.range].label;
  if (from === null) return label;
  const a = dayOf(from);
  const b = dayOf(report.nowMs);
  return a === b ? `${label} · ${b}` : `${label} · ${a} – ${b}`;
}

/** How many of the range's visits had engaged time and scroll depth
 * measured — both started Oct 7, 2026, so earlier visits are out of those
 * figures rather than zeros. */
export function coverage(report: Report) {
  const n = report.visits;
  return {
    timed: n - report.untimedVisits,
    scrolled: n - report.unscrolledVisits,
    total: n,
  };
}
