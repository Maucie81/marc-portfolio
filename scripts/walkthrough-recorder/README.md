# Walkthrough recorder

## What this is

A robot that makes the screen-recording videos for the case studies.

Instead of you recording your screen by hand, it opens a prototype in an
invisible copy of Chrome and follows a written script: move here, click
that, type this, scroll down, pause. It draws a Mac-style cursor, films every
frame, and saves a finished video straight into the portfolio.

Because it follows a script, a video can be re-made any time the prototype
changes, and it comes out the same every time. The Yahoo case study's nine
videos were made this way in September 2026, copying the order and timing of
the original hand-made recordings.

To record videos for another prototype, Claude writes a new script file for
it in `projects/` (one per case study) and runs it.

## Running it

1. **Start the prototype as a production build.** Not the dev server: dev
   mode shows a small "N" badge in the corner. For the Yahoo prototype there is
   a preview entry, `ypp-prototype-prod`, in `.claude/launch.json` (run
   `npm run build` in the prototype first).
2. **Try a quick preview.** It takes seconds, is low-res, and never touches the
   real videos:
   ```
   npm run record -- ypp Search --preview
   ```
   It prints where the preview video and a contact sheet (a grid of stills
   every 2 seconds) were saved.
3. **Record for real** — one clip, or every clip in a project:
   ```
   npm run record -- ypp Search
   npm run record -- ypp all --parallel 3
   ```
   Each clip takes about 5–10 minutes. Finished videos overwrite the files in
   the project's `outputDir` (for Yahoo: `public/ypp/videos/`).
4. **Check it against the old version** before committing:
   ```
   node scripts/walkthrough-recorder/compare.mjs <old.webm> <new.webm>
   ```

Needs: Google Chrome and ffmpeg. ffmpeg is found on the PATH, via `$FFMPEG`,
or in the copy that ships with Python's `imageio-ffmpeg` (which is where this
Mac has it).

## Writing a project file

`projects/<name>.mjs` exports:

| Export | What it is |
|---|---|
| `baseUrl` | where the prototype is running, e.g. `http://localhost:3101` |
| `outputDir` | where videos go, relative to the portfolio root |
| `clips` | `{ ClipName: async (r) => { … } }`; the name becomes the file name |
| `TARGET` | optional: seconds each clip should last (e.g. the old recording's length) |
| `STRETCH` | optional: per-clip multiplier on pauses to hit `TARGET`; each run prints the value to use |
| `viewport` | optional: `{ width, height, dpr }`; defaults to the Yahoo recordings' 1444×1027 at ~1.73 (2496×1774 video) |

A clip is a script. Every step films as it goes:

```js
async Search(r) {
  await r.open("/overview");              // load a page (fresh storage); not filmed
  r.place({ x: 1342, y: 141 });           // where the cursor starts
  r.start(r.outDir);                      // filming starts here
  await r.wait(1.3);                      // pause (seconds)
  await r.moveClick({ sel: "[aria-label='Open search']" });
  await r.type("Storm", { cps: 4.5 });    // typing hides the pointer, like macOS
  await r.scroll(190, { dur: 0.9 });      // trackpad-style scroll under the cursor
  await r.move({ text: "Dwell", exact: false, within: "[role=dialog]" });
  await r.key("Escape");
  await r.until("location.pathname === '/feed-health'"); // keep filming until a page change lands
}
```

Anything done before `r.start()` (setting a date range, picking a business)
is set-up and isn't filmed.

**Targets** can be `{ x, y }`, `{ text }` (the element's own text, any case),
`{ text, exact: false }`, `{ re: "regex" }`, or `{ sel: "css" }`. Narrow them
with `within` (a CSS scope; the last visible match wins, so
`"[role=dialog]"` means the top-most dialog), `inRow` (the table row
containing some text), `after` (only matches after the element with this
text, e.g. a card title), and `nth`. Aim inside the box with `ax`/`ay`
(0–1, default centre) or `dx`/`dy` (px). Only visible, uncovered elements
count. Something hidden under a sticky header is skipped.

If a target isn't found, the run stops and saves a screenshot plus a list of
the text on screen to the temp folder, so the fix is usually obvious.

## Why it works the way it does

- **Virtual clock.** `inpage.js` takes over the page's timers, animation
  frames and CSS animations, and advances them exactly 1/60 s per frame. A
  frame can take 100 ms to capture and the video still plays at real speed,
  including dropdown transitions, chart animations and "Searching…" delays.
- **Warm-up pass.** A full run plays the whole clip once unfilmed first, so
  every image is already loaded when filming starts. No grey placeholders.
- **Drawn cursor.** Arrow, pointing hand, or I-beam, chosen from what's under
  the pointer (same rules as Chrome). Moves follow a slightly curved, eased
  path so they read as a person, not a robot.
- **Same look as the originals.** VP9 webm at 60fps with bt709 colour, the
  same as the hand-made recordings, so old and new clips sit side by side
  without a visible shift.
