// Renders the link-preview card (src/app/opengraph-image.jpg + twitter-image.jpg)
// from the live homepage hero, so the share image always matches the site.
//
//   node scripts/share-card/capture.mjs [baseUrl=http://localhost:3000] [hero=2]
//
// Headless Chrome at 1200×630 (2x, then downscaled), everything but the hero
// hidden, the hero board centered on its own paper colour.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.argv[2] || "http://localhost:3000";
const HERO = process.argv[3] || "2";
const W = 1200, H = 630, DPR = 2, PORT = 9361;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "share-card-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-color-profile=srgb",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
let ver;
for (let i = 0; i < 100 && !ver; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) ver = await r.json(); } catch {} if (!ver) await sleep(200); }
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } };
const raw = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await raw("Target.createTarget", { url: "about:blank" });
const { sessionId } = await raw("Target.attachToTarget", { targetId, flatten: true });
const send = (m, p) => raw(m, p, sessionId);
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: false });
await send("Page.navigate", { url: `${BASE}/?hero=${HERO}` });
await sleep(4000);

const r = await send("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const hero = document.querySelector("#hero");
  const ed = hero.querySelector('.hero-edition[data-edition="${HERO}"]');
  const bg = ed.querySelector(".hero-board").style.background;
  const css = document.createElement("style");
  css.textContent = \`
    body > *:not(main):not(.noise-overlay), main > *:not(#hero) { display: none !important; }
    html, body { background: \${bg} !important; overflow: hidden !important; }
    #hero { position: fixed !important; inset: 0 !important; width: 100vw !important; margin: 0 !important;
      padding: 0 !important; display: grid !important; align-content: center !important; background: \${bg}; z-index: 1; }
    .noise-overlay { position: fixed !important; inset: 0 !important; z-index: 2 !important; }
  \`;
  document.head.append(css);
  await document.fonts.ready;
  await Promise.all([...ed.querySelectorAll("img")].map((i) => i.decode().catch(() => {})));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return bg;
})()` });
const { data } = await send("Page.captureScreenshot", { format: "png" });
ws.close(); chrome.kill(); await sleep(500);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

const jpg = await sharp(Buffer.from(data, "base64")).resize(W, H).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
for (const f of ["src/app/opengraph-image.jpg", "src/app/twitter-image.jpg"]) fs.writeFileSync(f, jpg);
console.log("bg", r.result.value, "→", jpg.length, "bytes");
