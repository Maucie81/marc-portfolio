// Records a scripted walkthrough of a web prototype as a 60fps webm with a
// Mac-style cursor, in headless Chrome. The page runs on a virtual clock
// (inpage.js), so each frame can take as long as it needs to capture while the
// output still plays at true speed. See README.md.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Default capture size: matches the hand-made case-study recordings, which were
 * taken on a scaled Mac display (1444x1027 CSS px at ~1.73 device px each =
 * 2496x1774 video). Keeping this means new clips sit in the same media boxes
 * at the same text size as the old ones.
 */
export const VIEWPORT = { width: 1444, height: 1027, dpr: 2496 / 1444 };

/** ffmpeg from $FFMPEG, the PATH, or the copy bundled with Python's imageio-ffmpeg. */
function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return execFileSync("which", ["ffmpeg"], { encoding: "utf8" }).trim(); } catch {}
  const pyRoot = path.join(os.homedir(), "Library", "Python");
  for (const ver of fs.existsSync(pyRoot) ? fs.readdirSync(pyRoot) : []) {
    const dir = path.join(pyRoot, ver, "lib", "python", "site-packages", "imageio_ffmpeg", "binaries");
    const bin = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => f.startsWith("ffmpeg"));
    if (bin) return path.join(dir, bin);
  }
  throw new Error("ffmpeg not found: install it, or set FFMPEG=/path/to/ffmpeg");
}
export const FFMPEG = findFfmpeg();

export async function createRecorder({ baseUrl, fps = 60, viewport = VIEWPORT, scale = viewport.dpr, port = 9350, seed = 7 }) {
  const W = viewport.width, H = viewport.height;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "walkthrough-recorder-profile-"));
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--disable-smooth-scrolling",
    "--force-color-profile=srgb", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
  let ver;
  for (let i = 0; i < 100 && !ver; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) ver = await r.json(); } catch {} if (!ver) await sleep(200); }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = new Set();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); if (m.error) rej(new Error(`${m.error.message} ${m.error.data || ""}`)); else res(m.result); } else listeners.forEach((l) => l(m)); };
  const raw = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { targetId } = await raw("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await raw("Target.attachToTarget", { targetId, flatten: true });
  const send = (m, p) => raw(m, p, sessionId);
  listeners.add((m) => { if (m.sessionId === sessionId && m.method === "Runtime.exceptionThrown") console.error("  page error:", m.params.exceptionDetails?.exception?.description?.split("\n")[0]); });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: scale, mobile: false });
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: fs.readFileSync(path.join(HERE, "inpage.js"), "utf8") });

  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };

  // Small deterministic PRNG so cursor paths vary naturally but repeatably.
  let s = seed >>> 0;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  let x = W * 0.75, y = H * 0.2, cursorHidden = false;
  let capturing = false, frameNo = 0, outDir = null, idleFrames = 0, started = false;

  async function frame({ moved = false } = {}) {
    if (moved || ++idleFrames % 10 === 0) {
      if (moved) idleFrames = 0;
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
    }
    await ev(`(async () => { ${cursorHidden ? "__rec.hideCursor()" : `__rec.setCursor(${x}, ${y})`}; __rec.step(${1000 / fps}); __rec.drawCursor(); await __rec.paint(); })()`);
    if (!capturing) return;
    const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 93, optimizeForSpeed: true });
    fs.writeFileSync(path.join(outDir, `f${String(frameNo++).padStart(5, "0")}.jpg`), Buffer.from(data, "base64"));
  }
  const frames = async (n) => { for (let i = 0; i < n; i++) await frame(); };
  const secs = (t) => Math.max(1, Math.round(t * fps));

  /**
   * Resolve a target to a point on screen. Forms (see README for examples):
   *   { x, y }                         an exact point
   *   { text }                         element whose own text equals this (case-insensitive)
   *   { text, exact: false }           ...or contains it
   *   { re }                           ...or matches this regex
   *   { sel }                          CSS selector
   * Narrowing: within (CSS scope), inRow (table row containing text),
   * after (only matches after the element with this text), nth.
   * Position in the box: ax/ay (0..1, default centre), dx/dy (px offset).
   * Only visible, uncovered matches count.
   */
  async function locate(t) {
    if (typeof t === "string") t = { text: t };
    if (t.x !== undefined && t.sel === undefined && t.text === undefined) return { x: t.x, y: t.y };
    const r = await ev(`(() => {
      const t = ${JSON.stringify(t)};
      const scope = t.inRow ? [...document.querySelectorAll("tbody tr")].filter(tr => tr.getClientRects().length && tr.innerText.includes(t.inRow)).shift()
        : t.within ? [...document.querySelectorAll(t.within)].filter(e => e.getClientRects().length).pop() : document;
      if (!scope) return null;
      let els;
      if (t.sel) els = [...scope.querySelectorAll(t.sel)];
      else {
        const want = (t.text || "").toLowerCase();
        const re = t.re ? new RegExp(t.re, "i") : null;
        els = [...scope.querySelectorAll("body *")].filter(e => {
          if (e.closest("[data-rec-cursor]")) return false;
          const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join("").trim().toLowerCase();
          const all = (e.innerText || "").trim().toLowerCase();
          if (re) return re.test(own);
          return t.exact === false ? (own.includes(want)) : (own === want || (all === want && e.children.length <= 3));
        });
      }
      els = els.filter(e => !els.some(o => o !== e && e.contains(o)));
      if (t.after) {
        const want = t.after.toLowerCase();
        const anchor = [...document.querySelectorAll("body *")].filter(a => [...a.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().toLowerCase() === want) && a.getClientRects().length).pop();
        if (!anchor) return null;
        els = els.filter(c => anchor.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING);
      }
      const shown = (el) => { for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const s = getComputedStyle(a); if (s.opacity === "0" || s.visibility === "hidden" || s.display === "none") return false; } return true; };
      const vis = els.filter(e => { const b = e.getBoundingClientRect(); return b.width >= 4 && b.height >= 4 && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth && shown(e); });
      // Skip anything covered by another layer (sticky bars, overlays) at the point we'd use.
      const open = vis.filter(e => {
        if (t.sel && /canvas/.test(t.sel)) return true;
        const b = e.getBoundingClientRect();
        const px = b.left + b.width * (t.ax ?? 0.5), py = b.top + b.height * (t.ay ?? 0.5);
        const hit = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, px)), Math.min(innerHeight - 1, Math.max(0, py)));
        return hit && (e.contains(hit) || hit.contains(e));
      });
      const e = open[t.nth ?? 0];
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { x: b.left + b.width * (t.ax ?? 0.5) + (t.dx ?? 0), y: b.top + b.height * (t.ay ?? 0.5) + (t.dy ?? 0) };
    })()`);
    if (!r) throw new Error(`target not found: ${JSON.stringify(t)}`);
    return r;
  }

  const api = {
    ev, send, locate,
    get pos() { return { x, y }; },
    dry: false,
    async open(urlPath, { warm = 1.2, fresh = true } = {}) {
      started = false; api.waited = 0;
      const go = async () => {
        const loaded = new Promise((res) => { const l = (m) => { if (m.sessionId === sessionId && m.method === "Page.loadEventFired") { listeners.delete(l); res(); } }; listeners.add(l); setTimeout(res, 20000); });
        await send("Page.navigate", { url: baseUrl + urlPath });
        await loaded;
      };
      await go();
      if (fresh) { await ev("sessionStorage.clear(), localStorage.clear(), true"); await go(); }
      await ev("document.fonts.ready.then(() => true)");
      await sleep(1500); // let JS chunks load and hydrate before stepping the clock
      const was = capturing; capturing = false;
      await frames(secs(warm));
      capturing = was;
    },
    /** Start writing frames to `dir` (emptied first). */
    start(dir) { started = true; if (api.dry) return; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); outDir = dir; frameNo = 0; capturing = true; },
    stop() { capturing = false; return frameNo; },
    place(p) { x = p.x; y = p.y; },
    stretch: 1,
    waited: 0,
    /** Pause; `stretch` scales pauses so a clip can be tuned to the original's length. */
    async wait(t) { const d = t * api.stretch; if (started) api.waited += d; await frames(secs(d)); },
    /** Glide the cursor to a target along a gently curved, eased path. */
    async move(target, { dur, curve = 0.08 } = {}) {
      const to = await locate(target);
      const fx = x, fy = y, dx = to.x - fx, dy = to.y - fy, dist = Math.hypot(dx, dy);
      if (dist < 0.5) { await frame(); return; }
      const d = dur ?? Math.min(1.1, 0.32 + dist / 1400);
      const n = secs(d);
      const bend = (rand() < 0.5 ? -1 : 1) * curve * dist * (0.6 + rand() * 0.8);
      const nx = -dy / dist, ny = dx / dist;
      cursorHidden = false;
      for (let i = 1; i <= n; i++) {
        const u = i / n;
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; // ease in-out cubic
        const arc = Math.sin(Math.PI * e) * bend;
        x = fx + dx * e + nx * arc; y = fy + dy * e + ny * arc;
        await frame({ moved: true });
      }
      x = to.x; y = to.y;
    },
    async click({ hold = 0.08 } = {}) {
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
      await frames(secs(hold));
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
      await frame();
    },
    /** Keep filming until a page condition holds (e.g. a route change landed), up to `max` seconds of video. */
    async until(expr, { max = 3 } = {}) {
      for (let i = 0; i < secs(max); i++) { if (await ev(`!!(${expr})`)) return; await frame(); await sleep(15); }
    },
    async key(k) {
      const codes = { Escape: 27, Enter: 13, Tab: 9 };
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code: k, windowsVirtualKeyCode: codes[k] });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code: k, windowsVirtualKeyCode: codes[k] });
      await frame();
    },
    async moveClick(target, opts = {}) { await api.move(target, opts); await api.wait(opts.pause ?? 0.18); await api.click(); },
    /** Type like a person: per-key gaps with a little jitter; the pointer hides while typing, as on macOS. */
    async type(text, { cps = 7 } = {}) {
      cursorHidden = true;
      for (const ch of text) {
        if (ch === "\n") { await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); }
        else { await send("Input.dispatchKeyEvent", { type: "keyDown", key: ch, text: ch, unmodifiedText: ch }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: ch }); }
        await frames(secs((1 / cps) * (0.7 + rand() * 0.6)));
      }
    },
    /** Trackpad-style scroll: a burst of wheel events that eases out. Positive dy scrolls down. */
    async scroll(dy, { dur = 0.7 } = {}) {
      const n = secs(dur); let done = 0;
      for (let i = 1; i <= n; i++) {
        const u = i / n, e = 1 - Math.pow(1 - u, 3);
        const want = Math.round(dy * e), step = want - done; done = want;
        if (step) await send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY: step });
        await frame();
      }
    },
    async close() { ws.close(); chrome.kill(); await sleep(300); fs.rmSync(profile, { recursive: true, force: true }); },
  };
  return api;
}

/** Encode captured JPEG frames to a VP9 webm like the originals. */
export function encode(dir, out, { fps = 60, crf = 33 } = {}) {
  return new Promise((res, rej) => {
    const p = spawn(FFMPEG, ["-v", "error", "-y", "-framerate", String(fps), "-i", path.join(dir, "f%05d.jpg"),
      "-vf", "crop=trunc(iw/2)*2:trunc(ih/2)*2:0:0,scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
      "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-an", out], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
  });
}
