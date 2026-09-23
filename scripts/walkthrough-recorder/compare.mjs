// Side-by-side stills of two videos at six evenly spaced moments — handy for
// checking a re-recording against the clip it replaces.
//
//   node scripts/walkthrough-recorder/compare.mjs <original.webm> <new.webm> [out.png]
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FFMPEG } from "./engine.mjs";

const [a, b, out = path.join(os.tmpdir(), `compare-${path.basename(b, ".webm")}.png`)] = process.argv.slice(2);
if (!a || !b) { console.error("usage: node compare.mjs <original.webm> <new.webm> [out.png]"); process.exit(1); }
const probe = spawnSync(FFMPEG, ["-i", a], { encoding: "utf8" }).stderr;
const [, h, m, s] = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
const dur = +h * 3600 + +m * 60 + +s;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "compare-"));
const inputs = [];
for (let k = 1; k <= 6; k++) {
  const t = String((dur * (k - 0.5)) / 6);
  for (const [src, tag] of [[a, "a"], [b, "b"]]) {
    const f = path.join(tmp, `${tag}${k}.png`);
    execFileSync(FFMPEG, ["-v", "error", "-y", "-ss", t, "-i", src, "-frames:v", "1", "-vf", "scale=640:-1", f]);
    inputs.push("-i", f);
  }
}
const rows = [1, 2, 3, 4, 5, 6].map((k) => `[${(k - 1) * 2}][${(k - 1) * 2 + 1}]hstack[r${k}]`).join(";");
execFileSync(FFMPEG, ["-v", "error", "-y", ...inputs, "-filter_complex", `${rows};[r1][r2][r3][r4][r5][r6]vstack=inputs=6`, out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(out);
