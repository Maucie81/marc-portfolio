// Record case-study walkthrough videos from a running prototype.
//
//   npm run record -- <project> <clip|all> [--preview] [--parallel N]
//
//   <project>     a file in ./projects (e.g. ypp)
//   <clip|all>    one clip function name, or every clip in the project
//   --preview     quick low-res trial: 12fps at 1x, written to the temp folder
//                 with a contact sheet, never touching the real videos
//   --parallel N  with "all": record N clips at once (default 3)
//
// Full runs do an unrecorded warm-up pass first (so images are cached), then
// write <outputDir>/<clip>.webm in the portfolio. Work files live in the OS
// temp folder and are removed once a clip is encoded.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRecorder, encode, FFMPEG } from "./engine.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [project, which] = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--parallel");
const preview = flags.has("--preview");

if (!project || !which) {
  console.error("usage: npm run record -- <project> <clip|all> [--preview] [--parallel N]");
  process.exit(1);
}
const cfg = await import(pathToFileURL(path.join(HERE, "projects", `${project}.mjs`)).href);
const names = which === "all" ? Object.keys(cfg.clips) : [which];
for (const n of names) if (!cfg.clips[n]) { console.error(`no clip "${n}" in projects/${project}.mjs`); process.exit(1); }
const WORK = path.join(os.tmpdir(), "walkthrough-recorder", project);
fs.mkdirSync(WORK, { recursive: true });

// "all": fan out one child process per clip, N at a time.
if (names.length > 1) {
  const lanes = Number(args[args.indexOf("--parallel") + 1]) || 3;
  const queue = [...names];
  const runOne = (name) => new Promise((res) => {
    const child = spawn(process.execPath, [path.join(HERE, "record.mjs"), project, name, ...(preview ? ["--preview"] : [])], { stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    child.stdout.on("data", (d) => (log += d)); child.stderr.on("data", (d) => (log += d));
    child.on("exit", (code) => { console.log(`${code === 0 ? "✓" : "✗"} ${log.trim().split("\n").filter((l) => /video|FAILED|VISIBLE/.test(l)).join("\n  ")}`); res(); });
  });
  await Promise.all(Array.from({ length: Math.min(lanes, queue.length) }, async () => { while (queue.length) await runOne(queue.shift()); }));
  process.exit(0);
}

const name = names[0];
const fps = preview ? 12 : 60;
const r = await createRecorder({
  baseUrl: cfg.baseUrl, fps, viewport: cfg.viewport, scale: preview ? 1 : undefined,
  port: 9400 + Object.keys(cfg.clips).indexOf(name) * 3 + (preview ? 1 : 0),
});
r.stretch = cfg.STRETCH?.[name] ?? 1;
r.outDir = path.join(WORK, "frames", name + (preview ? "-preview" : ""));
const out = preview ? path.join(WORK, `${name}-preview.webm`) : path.join(ROOT, cfg.outputDir, `${name}.webm`);
const t0 = Date.now();
try {
  if (!preview) { r.dry = true; await cfg.clips[name](r); r.dry = false; }
  await cfg.clips[name](r);
  const n = r.stop();
  const got = n / fps, want = cfg.TARGET?.[name];
  const tune = want ? `; target ${want}s, STRETCH for exact length ≈ ${(r.stretch * (1 + (want - got) / r.waited)).toFixed(3)}` : "";
  console.log(`${name}: ${got.toFixed(2)}s of video in ${((Date.now() - t0) / 1000).toFixed(0)}s${tune}`);
  await encode(r.outDir, out, { fps });
  fs.rmSync(r.outDir, { recursive: true, force: true });
  if (preview) {
    const sheet = out.replace(/\.webm$/, "-sheet.png");
    await new Promise((res) => spawn(FFMPEG, ["-v", "error", "-y", "-i", out, "-vf", "fps=0.5,scale=480:-1,tile=5x8:padding=6:color=white", "-frames:v", "1", sheet]).on("exit", res));
    console.log(`preview: ${out}\ncontact sheet: ${sheet}`);
  } else console.log(`wrote ${path.relative(ROOT, out)}`);
} catch (err) {
  // Save what was on screen so a missed target is easy to diagnose.
  console.error("FAILED:", err.message.split("\n")[0]);
  const { data } = await r.send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
  const shot = path.join(WORK, `debug-${name}.jpg`);
  fs.writeFileSync(shot, Buffer.from(data, "base64"));
  const texts = await r.ev(`(() => { const shown = (el) => { for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const s = getComputedStyle(a); if (s.opacity === "0" || s.visibility === "hidden" || s.display === "none") return false; } return true; };
    const scope = [...document.querySelectorAll("[role=dialog],[role=listbox],[role=menu]")].filter(e => e.getClientRects().length && shown(e)).pop() || document.querySelector("main") || document.body;
    return [...new Set([...scope.querySelectorAll("*")].filter(e => e.getClientRects().length && e.children.length === 0 && (e.innerText || "").trim()).map(e => e.tagName.toLowerCase() + ":" + e.innerText.trim().slice(0, 50)))].slice(0, 60).join(" | "); })()`);
  console.error(`VISIBLE: ${texts}\nscreenshot: ${shot}`);
  process.exitCode = 1;
} finally { await r.close(); }
