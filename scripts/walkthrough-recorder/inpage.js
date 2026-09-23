// Injected before any page script. Puts the page on a virtual clock that only
// advances when the recorder steps it, so every animation, timer and chart
// transition plays at true speed in the output no matter how long each frame
// takes to capture. Also draws a Mac-style cursor the recorder positions.
(() => {
  if (window.__rec) return;
  const RealDate = Date;
  const realRAF = window.requestAnimationFrame.bind(window);
  const epoch = RealDate.now();
  const perfBase = performance.now();
  let vt = 0;
  let nextId = 1;
  const timers = new Map();
  const rafs = new Map();

  window.setTimeout = (fn, ms, ...args) => { const id = nextId++; timers.set(id, { at: vt + Math.max(0, Number(ms) || 0), fn, args, every: 0 }); return id; };
  window.setInterval = (fn, ms, ...args) => { const id = nextId++; const every = Math.max(1, Number(ms) || 0); timers.set(id, { at: vt + every, fn, args, every }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (cb) => { const id = nextId++; rafs.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => { rafs.delete(id); };
  window.requestIdleCallback = (cb) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1);
  window.cancelIdleCallback = (id) => window.clearTimeout(id);
  performance.now = () => perfBase + vt;
  class VDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(epoch + vt); else super(...a); }
    static now() { return epoch + vt; }
  }
  window.Date = VDate;

  const tracked = new WeakMap();
  function syncAnimations() {
    for (const a of document.getAnimations()) {
      let start = tracked.get(a);
      if (start === undefined) {
        start = vt - 1000 / 60; // began during the frame that just ended
        tracked.set(a, start);
        try { a.pause(); } catch {}
      }
      const timing = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
      const local = vt - start;
      if (timing && Number.isFinite(timing.endTime) && local >= timing.endTime) { try { a.finish(); } catch {} continue; }
      try { a.currentTime = local; } catch {}
    }
  }

  function step(dt) {
    const target = vt + dt;
    for (let guard = 0; guard < 5000; guard++) {
      let pick = null;
      for (const [id, t] of timers) if (t.at <= target && (!pick || t.at < pick[1].at)) pick = [id, t];
      if (!pick) break;
      const [id, t] = pick;
      vt = Math.max(vt, t.at);
      if (t.every) t.at += t.every; else timers.delete(id);
      try { if (typeof t.fn === "function") t.fn(...t.args); else (0, eval)(String(t.fn)); } catch (e) { console.error(e); }
    }
    vt = target;
    const cbs = [...rafs.values()];
    rafs.clear();
    for (const cb of cbs) { try { cb(performance.now()); } catch (e) { console.error(e); } }
    syncAnimations();
  }

  // ── Cursor ────────────────────────────────────────────────────────────────
  const SHAPES = {
    arrow: { w: 17, h: 25, hx: 1.5, hy: 1.5, svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="25" viewBox="0 0 17 25"><path d="M1.5 1.5 L1.5 19 L5.6 15.1 L8.7 22.2 L11.9 20.8 L8.8 13.9 L14.4 13.9 Z" fill="#000" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>` },
    hand: { w: 22, h: 26, hx: 8.2, hy: 1.2, svg: (() => {
      const shapes = `
        <rect x="6.4" y="1" width="3.6" height="14" rx="1.8"/>
        <rect x="10" y="8.2" width="3.3" height="7.5" rx="1.65"/>
        <rect x="13.3" y="9.2" width="3.2" height="6.8" rx="1.6"/>
        <rect x="16.5" y="10.6" width="3" height="6" rx="1.5"/>
        <rect x="6.4" y="12.4" width="13.1" height="9.8" rx="3.6"/>
        <rect x="8.2" y="18.5" width="9.6" height="6.3" rx="2"/>
        <rect x="1.4" y="11.2" width="3.4" height="8.6" rx="1.7" transform="rotate(-38 3.1 15.5)"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 22 26">
        <g fill="#000" stroke="#000" stroke-width="2.2" stroke-linejoin="round">${shapes}</g>
        <g fill="#fff">${shapes}</g>
        <g stroke="#000" stroke-width="0.9" stroke-linecap="round"><line x1="10" y1="11.2" x2="10" y2="15.2"/><line x1="13.3" y1="11.6" x2="13.3" y2="15.4"/><line x1="16.5" y1="12.6" x2="16.5" y2="15.8"/></g>
      </svg>`; })() },
    ibeam: { w: 9, h: 20, hx: 4.5, hy: 10, svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="20" viewBox="0 0 9 20"><path d="M1 1.2 H3.4 Q4.5 1.2 4.5 2.4 Q4.5 1.2 5.6 1.2 H8 M4.5 2.4 V17.6 M1 18.8 H3.4 Q4.5 18.8 4.5 17.6 Q4.5 18.8 5.6 18.8 H8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M1 1.2 H3.4 Q4.5 1.2 4.5 2.4 Q4.5 1.2 5.6 1.2 H8 M4.5 2.4 V17.6 M1 18.8 H3.4 Q4.5 18.8 4.5 17.6 Q4.5 18.8 5.6 18.8 H8" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round"/></svg>` },
  };
  let cursorEl = null, shape = "", hidden = false, cx = -100, cy = -100;
  function ensureCursor() {
    if (cursorEl && cursorEl.isConnected) return cursorEl;
    cursorEl = document.createElement("div");
    cursorEl.setAttribute("data-rec-cursor", "");
    cursorEl.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 1px 1.2px rgba(0,0,0,.38));will-change:transform;";
    document.documentElement.appendChild(cursorEl);
    shape = "";
    return cursorEl;
  }
  function isOverText(x, y) {
    const r = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
    if (!r || r.startContainer.nodeType !== 3) return false;
    const node = r.startContainer, len = node.textContent.length;
    for (const off of [r.startOffset - 1, r.startOffset]) {
      if (off < 0 || off >= len || !node.textContent[off].trim()) continue;
      const cr = document.createRange(); cr.setStart(node, off); cr.setEnd(node, off + 1);
      for (const b of cr.getClientRects()) if (x >= b.left - 1 && x <= b.right + 1 && y >= b.top - 1 && y <= b.bottom + 1) {
        const el = node.parentElement; return el && getComputedStyle(el).userSelect !== "none";
      }
    }
    return false;
  }
  function shapeAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return "arrow";
    const c = getComputedStyle(el).cursor;
    if (c === "pointer") return "hand";
    if (c === "text") return "ibeam";
    if (c === "auto") {
      if (el.closest("input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,[contenteditable=true]")) return "ibeam";
      if (el.closest("a[href]")) return "hand";
      return isOverText(x, y) ? "ibeam" : "arrow";
    }
    return "arrow";
  }
  function drawCursor() {
    const el = ensureCursor();
    if (hidden) { el.style.display = "none"; return; }
    el.style.display = "block";
    const s = shapeAt(cx, cy);
    if (s !== shape) { shape = s; el.innerHTML = SHAPES[s].svg; }
    const d = SHAPES[shape];
    el.style.transform = `translate(${cx - d.hx}px, ${cy - d.hy}px)`;
  }

  window.__rec = {
    step,
    now: () => vt,
    setCursor(x, y) { cx = x; cy = y; hidden = false; },
    hideCursor() { hidden = true; },
    drawCursor,
    paint: () => new Promise((res) => realRAF(() => realRAF(res))),
  };
})();
