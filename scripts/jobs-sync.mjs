#!/usr/bin/env node
/**
 * jobs-sync — derive the private /jobs snapshot from the markdown files in
 * ~/Documents/JobSearch (the source of truth) and publish it.
 *
 *   npm run jobs:sync            parse, write .jobs-data/snapshot.json, push to Redis if configured
 *   npm run jobs:sync -- --dry   parse and print a summary only (writes nothing)
 *
 * Env: JOBSEARCH_DIR (default ~/Documents/JobSearch). Redis credentials are
 * read from KV_REST_API_URL/KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_*) in the
 * environment, .env.production.local, or .env.local. Pull them once with:
 *   npx vercel env pull .env.production.local --environment=production
 * The snapshot is NEVER committed (public repo): .jobs-data/ is git-ignored.
 * This script only reads markdown and writes the snapshot. It sends nothing.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");
const dir = process.env.JOBSEARCH_DIR || path.join(os.homedir(), "Documents", "JobSearch");
const KEY = "jobs:snapshot";
const FILE_CAP = 20000;

const read = (f) => {
  try {
    return fs.readFileSync(path.join(dir, f), "utf8");
  } catch {
    return "";
  }
};
const clean = (s) => (s ?? "").replace(/\*\*/g, "").trim();
const dash = (s) => {
  const v = clean(s);
  return !v || v === "—" || v === "-" ? null : v;
};
const slug = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Split markdown into { heading, level, lines[] } sections. */
function sections(md) {
  const out = [];
  let cur = { heading: "", level: 0, lines: [] };
  for (const line of md.split("\n")) {
    const m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) {
      out.push(cur);
      cur = { heading: m[2].trim(), level: m[1].length, lines: [] };
    } else cur.lines.push(line);
  }
  out.push(cur);
  return out;
}

const bullets = (lines) =>
  lines
    .map((l) => l.trim())
    .filter((l) => /^([-*]|\d+\.)\s+/.test(l))
    .map((l) => clean(l.replace(/^([-*]|\d+\.)\s+/, "")))
    .filter((l) => l && !/^(none|nothing)\b/i.test(l));

/* ---------- applications/ ---------- */
function materialsFor(pathStr, status) {
  const empty = { resume: "Not started", cover: "Not started", outreach: "Not started" };
  if (!pathStr) return { materials: empty, files: [] };
  const abs = path.join(dir, pathStr.replace(/\/$/, ""));
  let names = [];
  try {
    names = fs.readdirSync(abs).filter((n) => n.endsWith(".md")).sort();
  } catch {
    return { materials: empty, files: [] };
  }
  const files = names.map((name) => {
    let content = null;
    try {
      content = fs.readFileSync(path.join(abs, name), "utf8").slice(0, FILE_CAP);
    } catch {}
    return { name, exists: true, content };
  });
  const find = (re) => files.find((f) => re.test(f.name));
  const reviewed = (f) => !!f?.content && /REVIEWED BY MARC/i.test(f.content);
  const resume = find(/resume/i);
  const cover = find(/cover/i);
  const outreach = find(/outreach|recruiter|linkedin/i);
  const m = { ...empty };
  if (resume) m.resume = reviewed(resume) ? "Reviewed" : "Draft ready";
  if (cover) {
    m.cover = /no cover letter recommended/i.test(cover.content ?? "")
      ? "Not needed"
      : reviewed(cover)
        ? "Reviewed"
        : "Draft ready";
  }
  if (outreach) m.outreach = /^Outreach sent$/i.test(status) ? "Sent" : "Draft ready";
  return { materials: m, files };
}

/* ---------- pipeline.md ---------- */
function parsePipeline(md) {
  const roles = [];
  let exception = false;
  let area = "";
  for (const s of sections(md)) {
    if (s.level === 2) {
      area = s.heading;
      exception = /confirmed-interest/i.test(s.heading);
      if (/^closed/i.test(s.heading)) {
        for (const b of bullets(s.lines)) {
          const m = /^(.+?)\s+—\s+(.+?):\s*(CLOSED.*|WITHDRAWN.*|REJECTED.*)$/i.exec(b);
          const company = m ? m[1] : b.split(":")[0];
          const role = m ? m[2] : "";
          roles.push({
            id: slug(`closed-${company}-${role || roles.length}`),
            list: "closed",
            exception: false,
            company,
            role,
            url: null,
            req: null,
            roleFit: null,
            interest: null,
            verification: m ? m[3] : "CLOSED",
            status: "Closed",
            discovered: null,
            applied: null,
            lastActivity: null,
            nextAction: null,
            nextActionDate: null,
            compensation: null,
            location: null,
            whyItFits: null,
            concerns: null,
            caseStudy: null,
            notes: null,
            materialsPath: null,
            materials: { resume: "Not started", cover: "Not started", outreach: "Not started" },
            files: [],
          });
        }
      }
      continue;
    }
    if (s.level !== 3 || /^closed|^waiting/i.test(area)) continue;
    const [company, ...rest] = s.heading.split(" — ");
    const r = {
      id: slug(s.heading),
      list: "active",
      exception,
      company: clean(company),
      role: clean(rest.join(" — ")),
      url: null, req: null, roleFit: null, interest: null, verification: null,
      status: "Discovered", discovered: null, applied: null, lastActivity: null,
      nextAction: null, nextActionDate: null, compensation: null, location: null,
      whyItFits: null, concerns: null, caseStudy: null, notes: null, materialsPath: null,
    };
    let matLine = "";
    for (const raw of s.lines) {
      const line = raw.trim().replace(/^[-*]\s+/, "");
      if (!line) continue;
      if (/^Materials:/i.test(line)) { matLine = line.replace(/^Materials:\s*/i, ""); continue; }
      if (/^Notes:/i.test(line)) { r.notes = dash(line.replace(/^Notes:\s*/i, "")); continue; }
      for (const seg of line.split(" · ")) {
        let m;
        const t = seg.trim();
        if ((m = /^URL:\s*(\S+)/i.exec(t))) r.url = m[1];
        else if ((m = /^Req:\s*(.+)$/i.exec(t))) r.req = dash(m[1]);
        else if ((m = /^Role Fit\s+(\d+)/i.exec(t))) r.roleFit = Number(m[1]);
        else if ((m = /^Interest\s+(\d+)/i.exec(t))) r.interest = Number(m[1]);
        else if (/^(VERIFIED OPEN|PROBABLY OPEN|UNVERIFIED|PROBABLY CLOSED|CLOSED)/.test(t)) r.verification = t;
        else if ((m = /^Status:\s*(.+)$/i.exec(t))) r.status = clean(m[1]);
        else if ((m = /^Discovered\s+(.+)$/i.exec(t))) r.discovered = dash(m[1]);
        else if ((m = /^Applied\s+(.+)$/i.exec(t))) r.applied = dash(m[1]);
        else if ((m = /^Last activity\s+(.+)$/i.exec(t))) r.lastActivity = dash(m[1]);
        else if ((m = /^Next action:\s*(.+)$/i.exec(t))) r.nextAction = dash(m[1]);
        else if ((m = /^Next-action date:\s*(.+)$/i.exec(t))) r.nextActionDate = dash(m[1]);
        else if ((m = /^Comp(?:ensation)?:\s*(.+)$/i.exec(t))) r.compensation = dash(m[1]);
        else if ((m = /^Location:\s*(.+)$/i.exec(t))) r.location = dash(m[1]);
        else if ((m = /^Why it fits:\s*(.+)$/i.exec(t))) r.whyItFits = dash(m[1]);
        else if ((m = /^Concerns:\s*(.+)$/i.exec(t))) r.concerns = dash(m[1]);
        else if ((m = /^Lead with:\s*(.+)$/i.exec(t))) r.caseStudy = dash(m[1]);
      }
    }
    const pm = /applications\/[^\s,)`]+/.exec(matLine);
    r.materialsPath = pm ? pm[0] : null;
    Object.assign(r, materialsFor(r.materialsPath, r.status));
    roles.push(r);
  }
  return roles;
}

/* ---------- weekly-actions.md ---------- */
function parseWeekly(md) {
  const out = { doNow: [], thisWeek: [], waiting: [], ignore: [], newChanged: [] };
  for (const s of sections(md)) {
    if (s.level !== 2) continue;
    const h = s.heading.toLowerCase();
    const key = h.startsWith("do now") ? "doNow"
      : h.startsWith("this week") ? "thisWeek"
      : h.startsWith("waiting") ? "waiting"
      : h.startsWith("ignore") ? "ignore"
      : /new/.test(h) && /changed/.test(h) ? "newChanged"
      : null;
    if (key) out[key] = bullets(s.lines);
  }
  return out;
}

/* ---------- aligned-companies.md ---------- */
function parseAligned(md) {
  const watchlist = [];
  let passive = [];
  for (const s of sections(md)) {
    if (s.level !== 2) continue;
    if (/^watchlist/i.test(s.heading)) {
      for (const l of s.lines) {
        if (!l.trim().startsWith("|") || /^\|\s*-/.test(l.trim()) || /^\|\s*Company\s*\|/i.test(l.trim())) continue;
        const c = l.trim().replace(/^\||\|$/g, "").split("|").map((x) => clean(x));
        if (c.length < 5) continue;
        const n = Number(c[2]);
        watchlist.push({
          company: c[0], role: c[1],
          score: Number.isFinite(n) && c[2] !== "" ? n : null,
          verification: c[3], notes: c.slice(4).join(" | "),
        });
      }
    } else if (/^passive/i.test(s.heading)) passive = bullets(s.lines);
  }
  return { watchlist, passive };
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  ...parseWeekly(read("weekly-actions.md")),
  roles: parsePipeline(read("pipeline.md")),
  ...parseAligned(read("aligned-companies.md")),
};

const active = snapshot.roles.filter((r) => r.list === "active").length;
console.log(
  `Parsed ${snapshot.roles.length} roles (${active} active), ${snapshot.watchlist.length} watchlist rows, ` +
    `${snapshot.doNow.length} do-now, ${snapshot.waiting.length} waiting, ${snapshot.newChanged.length} new/changed.`,
);
if (!active) {
  console.error("No active roles parsed — refusing to publish an empty snapshot.");
  process.exit(1);
}
if (dry) {
  for (const r of snapshot.roles.filter((x) => x.list === "active"))
    console.log(`  ${r.roleFit ?? "–"}  ${r.company} — ${r.role} [${r.status}] ${r.verification ?? ""}`);
  console.log("--dry: nothing written.");
  process.exit(0);
}

const outDir = path.join(root, ".jobs-data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "snapshot.json"), JSON.stringify(snapshot, null, 2));
console.log("Wrote .jobs-data/snapshot.json");

function loadEnv() {
  const env = { ...process.env };
  for (const f of [".env.production.local", ".env.local"]) {
    try {
      for (const line of fs.readFileSync(path.join(root, f), "utf8").split("\n")) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
  return env;
}
const env = loadEnv();
const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.log("No Redis credentials found — local snapshot only. For production run:\n  npx vercel env pull .env.production.local --environment=production");
  process.exit(0);
}
const { Redis } = await import("@upstash/redis");
await new Redis({ url, token }).set(KEY, JSON.stringify(snapshot));
console.log(`Pushed snapshot to Redis key ${KEY}.`);
