# Comix System — Component Index

Live at: **http://localhost:3000/lab/comix**

## Palette & Tokens
- **[palette.ts](./palette.ts)** — Four-color system (ink, paper, rust, indigo) + plate shift vector
- **[comix-theme.css](../lab/comix/comix-theme.css)** — Tailwind `@theme` block with Anton/Permanent Marker/Barlow Condensed fonts

## Filters & Textures
- **[ComixDefs.tsx](./ComixDefs.tsx)** — SVG `<defs>`: `comix-duotone` (2-flat-ink threshold) + `comix-roughen` (feTurbulence for hand-stroke wobble)
- **[texture.tsx](./texture.tsx)** — `CrosshatchDef`, `StippleField`, `usePatternId` — crosshatch/stipple marks built as SVG patterns

## Core Primitives
- **[InkRect.tsx](./InkRect.tsx)** — Hand-jittered border (two independently-wobbled passes + optional rust ghost layer) using `vectorEffect="non-scaling-stroke"`
- **[InkRule.tsx](./InkRule.tsx)** — Single horizontal hand-drawn rule (used in nav divider)
- **[PanelBorder.tsx](./PanelBorder.tsx)** — Wrapper that applies `InkRect` (outer + double inner) — the main structural container
- **[RegistrationMark.tsx](./RegistrationMark.tsx)** — Crosshair target with rust offset (true plate misregistration, not decoration)
- **[CaptionBox.tsx](./CaptionBox.tsx)** — Deadpan caption/stat callout (paper-on-ink default, or rust/indigo spot-color fills)

## Typography
- **[HandLetter.tsx](./HandLetter.tsx)** — Per-word rotation jitter (Anton display) — each word rotates by a fixed sequence so "MARC FAVRO" reads as hand-cut, not mechanical. Space is a sibling text node to avoid inline-block trimming.
- **[motion.ts](./motion.ts)** — `MECHANICAL` easing curve + `panelReveal` (clip-path wipe) / `stepIn` (hard opacity cut) variants

## Components
- **[Hero.tsx](./Hero.tsx)** — Splash page: portrait (duotone filter), masthead (with rust shadow), tagline (roughen filter), caption box, registration marks, colophon, density strip
- **[ComixNav.tsx](./ComixNav.tsx)** — Nav bar with hand-drawn divider rule and registration mark
- **[DensityStrip.tsx](./DensityStrip.tsx)** — Calibration bar (paper → crosshatch) — structural proof of tonal system, not decoration

## Page
- **[src/app/lab/comix/page.tsx](../app/lab/comix/page.tsx)** — Mounts nav + hero
- **[src/app/lab/comix/layout.tsx](../app/lab/comix/layout.tsx)** — Loads fonts, wraps in theme CSS

---

## Design Decisions

### Palette (seeded, not random)
- **#241D11** (ink) — warm near-black, walnut/sepia
- **#EEECE0** (paper) — aged cream, matches portrait ground
- **#CE532E** (rust) — burnt sienna, echoes portrait skin crosshatch
- **#4D3F86** (dusty indigo) — echoes portrait hair crosshatch

### Duotone Portrait Filter
`feColorMatrix` (grayscale) → `feComponentTransfer` (4-step discrete transfer per channel) = true two-flat-ink output, not a smooth gradient.

### Hand-Jittered Borders
`InkRect` uses a PRNG (mulberry32, seeded) to wobble each corner + midpoint of the path independently, so the same panel never draws twice the same way. Two passes (thick + thin) simulate ink re-tracing; optional rust ghost offset simulates true plate misregistration (not CSS shadow).

### Typography Strategy
- Anton = masthead (mechanical face, jitter via layout not letterforms)
- Permanent Marker = captions/stamps only (genuinely brush-script, reserved for marks)
- Barlow Condensed = body (legible at small sizes, never hand-lettered)

### Motion
No spring, no bounce. `MECHANICAL` cubic-bezier `[0.83, 0, 0.17, 1]` reads as a press coming down. `panelReveal` uses `clip-path: inset()` (page turn) not fade.

### Overprint & Blend Modes
Currently NOT implemented — the critic flagged this as missing (red over black should go maroon-black via multiply). Next iteration will move from composited sRGB to SVG `mix-blend-mode="multiply"` so the palette actually interacts on top of itself.

---

## Critic Feedback (Round 2)

**Comix authenticity: 4/10** — Built as press-proof pastiche, not true comix (no panels, balloons, or hand-lettered copy grammar). Key issues:
1. Mis-registration reads as flat CSS shadow, not true drift
2. Spot colors don't overprint/multiply
3. "PRESS PROOF" captions over-explain the costume

**Professional legibility: 6/10** — Content is readable but:
1. Role line ("PRINCIPAL PRODUCT DESIGNER") is same size/weight as decorative "PRESS PROOF" label
2. No project/company/metrics above fold — entire screen is persona, no evidence
3. Nav is 2020s Swiss-editorial; plate is 1968 press floor — visible seam

---

## Next Iteration Checklist

- [ ] Apply `mix-blend-mode="multiply"` to rust plate layers so overprint works
- [ ] Promote role line to unmissable prominence (demotion plate number to genuine margin)
- [ ] Add one real project above fold (client, problem, scale, outcome)
- [ ] Align nav to same universe as plate (hand-jittered type, or full plate system)
- [ ] Fix "Systems that hold weight" / "M" colliding with "S" descender
- [ ] Build case-study card system (three distinct plates, each with own tonal/compositional character)
- [ ] Interior page system (editorial, dense, panel-to-panel progression)
