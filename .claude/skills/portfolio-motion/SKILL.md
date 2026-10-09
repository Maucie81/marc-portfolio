---
name: portfolio-motion
description: The portfolio's established motion and interaction system, extracted from the code. Use before adding, changing or reviewing any animation, reveal, transition, page-load sequence, scroll behavior, case-study track behavior, hover/focus/touch state, timing or easing in this repo. The implementation is the source of truth; never replace its values with generic motion guidelines.
---

# Portfolio motion system

This documents what's already built. It is not a proposal. When this file and the code disagree, the code wins: re-read it and fix this file.

**Read these first. They're authoritative:**
- `src/lib/motion.ts`: the model (header comment), `MOTION`, `HERO_SEQUENCE`, `FURNITURE`, `READING`, `READING_ROLES`, the head script (`HOLD_MAX`, `SHOWN_DELAY`, `FAILSAFE`)
- `src/app/globals.css`, section "Motion system": the `--motion-*` tokens, the `.rv-*` keyframes, and the hold/play/done rules
- `src/components/site/motion/RevealObserver.tsx`: trigger lines, opening-screen steps, image waits, `retire()`
- `src/components/case-study/ReadingMotion.tsx` and `HorizontalTrack.tsx`: case-study triggers and the pinned track
- Per-component constants: `RecentWork.tsx`, `AdditionalWork.tsx`, `CareerHistory.tsx`, `ReferenceLibrary.tsx`, `app/page.tsx` (library title, footer), `ExpandGlyph.tsx`, `ExpandCollapse.tsx`, `PersistentHeader.tsx`

**Out of scope:** `lab/*` (comix, riso, scroll-strip), Harrison's app (`/harrison`, `/work/harrisons-app`) and the proof-notes tool UI. These have their own behavior and aren't part of this system.

## Philosophy

- **The page is typeset into place, not flown in.** Motion carries hierarchy. It's strongest in the hero, controlled on cards, and nearly absent in quiet sections.
- **The shell never moves.** Paper, printer's marks, CMYK lockup, perimeter frame, header/nav, logo and the white page are all there at first paint. Only content inside the shell animates.
- **One entrance does most of the work: the soft reveal (`.rv-soft`).** A substantial card or content block softly becomes visible as one unit: an 8px rise as it fades in, over 850ms, on a soft ease-out with a long tail. No mask, no wipe, no overshoot. It should read as becoming visible, not sliding into position. Reference: the work-sample cards on gabrielehernandez.com. Only the homepage hero board and the band fills that arrive with it keep the bigger settle (28px, 750ms) — they're part of the hero's opening.
- **Text stays quieter than the cards around it.** It moves a few px, or only fades.
- **Every reveal plays once and leaves nothing behind.** Keyframes fill backwards only, so the finished page is exactly the static page and animation never changes the final layout.
- **The homepage hero is expressive; everything else is calm, soft and editorial.** Motion should be noticed only subconsciously: err toward less travel and longer easing. A case study is for reading: the same reveals run there, and content softly appears.

## Existing mechanism

- **How an element arrives:** a reveal class.
  - `.rv-soft` is the default for cards and content blocks: lift `--rv-lift` (8px) and a fade, both over the full 850ms, as two animations on two curves.
  - `.rv-settle` is the hero board's settle (also the band fills on the opening screen): lift 28px and a fade over 80% of 750ms. Nothing else uses it.
  - `.rv-line` is a masked line: type rises out of a fixed mask under its own baseline.
  - `.rv-clip` opens through the element's own clip-path. Only the hero portrait uses it.
  - `.rv-rise` is opacity plus a small rise (`--rv-y`, 8px by default).
  - `.rv-fade` is opacity only.
- **When it plays:** the nearest trigger.
  - `data-reveal="load"`: the hero.
  - `data-reveal="view"`: plays once on entering view.
  - `data-reveal="open"`: band fills (`data-reveal-fill`) and section furniture. These animate only on the opening screen and are otherwise static, never animating on scroll.
  - `data-reveal-group` (with `rvGroup(stagger)`): staggers sibling triggers that arrive together, in DOM/reading order.
  - `data-reveal-quiet`: triggers earlier.
- **Whether anything moves:** `<html data-motion>`. If it's absent, everything is static. `"hold"` keeps everything paused on frame one. `"play"` runs.
- **Helpers:** homepage code uses `rv(delay, {dur, y, lift, ease})` and `rvGroup()`. Case-study blocks use `useReading().reveal(role)` with the roles from `READING_ROLES`.
- **Animated properties:** only `transform`, `opacity` and `clip-path` move in reveals.

## Page-load choreography (homepage)

1. **Before first paint,** `MOTION_SCRIPT` in `<head>` sets `data-motion="hold"`. It skips this, leaving the page static, for reduced motion and for Back/Forward arrivals.
2. **Hold** until Google Sans Flex 700 has loaded and the current edition's portrait has decoded. The hold lasts at most `HOLD_MAX` (700ms).
   - If the page is hidden (background tab, Safari top-hit preload), it holds until visible, then waits `SHOWN_DELAY` (150ms) more.
   - If the page never hydrates, it drops to static after `FAILSAFE` (8s).
3. **Release (t=0):** the hero board settles (750ms, 28px). Any band fill on the opening screen settles on the board's own clock: same frame, synced by `inStepWithBoard`.
4. **Hero type (`HERO_SEQUENCE`):**

   | Time | Element | Reveal |
   |---|---|---|
   | 200ms | eyebrow | masked lines |
   | 300ms | name | masked lines |
   | 450ms | portrait | clip, 900ms |
   | 600ms | statement | masked lines, 100ms apart, 800ms each |
   | 1100ms | subline | rise, 500ms, 8px |
   | 1450ms | edition metadata | fade, 250ms |

   About 1.7s end to end. This is the slowest, most deliberate thing on the site.
5. **Handoff at 200ms:** everything else on the opening screen starts together with the hero's type, so the screen assembles as one piece.
   - Content steps down the screen `OPENING_STAGGER` (120ms) at a time. A step is a section's furniture run, one card, or one whole group.
   - What's on screen is measured by IntersectionObserver after layout. It's never hardcoded.
6. **Below the opening screen,** section furniture and band fills are simply static.

**Rejected before (don't reintroduce):**
- a 650ms handoff (it read as "a slight delay")
- Recent work's number and title staying static while the hero animates
- the cream band fill showing immediately
- the fill starting after the hero board

**Route changes have no transition.** A Framer Motion fade+slide was removed because it fought the GSAP pin. Routes swap instantly.
- A fresh visit plays motion.
- Back/Forward shows the page as it was left and restores scroll (`PageTransition.tsx`, `setMotionMode`).
- Smooth scrolling is on only for the homepage (`html:has(#home)`), for in-page anchors. Never make it global: it fights ScrollTrigger's pin.

## Scroll-triggered reveals

**Homepage:**
- A `view` trigger plays the first time its top clears the bottom 12% of the screen (`ROOT_MARGIN`).
- Quiet triggers play at 2% (`QUIET_MARGIN`), so the fade is mostly done before the eye arrives. The footer and the Skills block use this.

**Case studies:**
- The trigger line is 20% in from the edge content arrives from: the right on the sideways track, the bottom when stacked.
- Triggers sit on a section's parts (heading, copy, media, each quote), never on single paragraphs.
- Each section's columns form a group stepping `READING.stagger` (120ms), so a heading leads its copy and a recording leads its caption.

**Everywhere:**
- Lazy images are primed a screen ahead. A reveal waits up to `IMAGE_WAIT` (700ms) for on-screen images and videos to decode, so nothing settles in blank.
- Anything already scrolled past is marked done and shown as is.
- After playing, a reveal is retired (`data-revealed="done"` sets `animation: none`), so later display changes can't replay it.

### Homepage sections, by hierarchy

| Section | Level | What moves |
|---|---|---|
| Hero | expressive | board settle, then masked type, the portrait clip, subline, metadata (above) |
| Section furniture (rail, number, title), opening screen only | quiet | 4px rise / fade, 500ms, quiet ease (`FURNITURE`) |
| Recent work | soft | each card is one unit: its copy column, panel and tag row all carry the same soft reveal (8px/850ms) at the same moment. Nothing inside a card is on its own clock. The reveal sits on those three parts, not the article, so the z-39 panel is never inside an animating wrapper |
| Additional work | quiet | rows: 4px rise, 500ms, quiet, 110ms apart |
| Reference library | expressive (the second moment) | title: 3 masked lines, 720ms, 90ms apart (on phones, one 18px line whose words rise the same way)<br>copy: fade at 320ms (500ms, quiet)<br>whole panel: soft reveal as one, 250ms behind the title block<br>no tile animates on its own<br>then the sheet **drifts** down inside its window (see below) |
| Career | very quiet | heading: fade 500ms<br>roles: 3px rise, 500ms, 100ms apart, quiet |
| Skills | static-ish | one block fades, 350ms, quiet trigger |
| Footer | restrained | halftone fade 550ms<br>title and lockup fade 400ms at +60ms<br>contact line at +180ms<br>quiet trigger, no movement |

### Case-study roles (`READING_ROLES`)

| Role | Reveal |
|---|---|
| cover | label fade (0ms)<br>title masked line at 80ms on the sideways track (on phones, where it wraps, a 6px rise, 650ms, quiet)<br>copy 5px rise, 600ms, at 250ms<br>meta fade 600ms at 400ms<br>scroll hint fade 500ms at 550ms<br>about 1s total. Whatever else is on screen at load plays with the cover |
| heading | 6px rise, 650ms, quiet. Number, title and eyebrow each carry it and play together |
| visual | soft reveal (8px/850ms), on the media box itself — each card, mockup, panel or composition as one unit |
| callout (stats, quotes, illustrated steps) | soft reveal (8px/850ms) |
| body | the section's copy as one group (with its CTA): 5px rise, 600ms, quiet |
| meta (captions) | fade only, 500ms, quiet |

Case-study motion is per page: the `motion` prop on `CaseStudyPage` (Yahoo, Airbnb, Headspace Admin), or a direct `ReadingMotion` wrap (Headspace UMD). Harrison's app has none. Without motion, the track just fades in over 400ms after mount.

**Not yet wired with `useReading`:** StepsPanel, PrinciplesBlock, PanelGroupBlocks, IsolatedMedia, CopyBlock, StatBlock, QuoteBlock, Frame. When wiring one, pick an existing role. Don't invent a new one.

### Reference library drift (`useAutoDrift` in `ReferenceLibrary.tsx`)

Added on request (2026-10-08) so the window reads as having more in it. Not a reveal: it scrolls the window's own `scrollTop`.
- starts `AUTO_DELAY` (1200ms) after the window is 60% on screen, once the panel's reveal has finished
- speed: one window height every `AUTO_WINDOW_SECONDS` (25s), about 11px/s in the phone's shorter window, linear
- pauses while a mouse is over the window or it's off screen; resumes after
- stops for good at the bottom of the sheet, or on any wheel, touch, pointer-down or key in the window (opening a photo included)
- never runs with reduced motion

The deleted "sheet glide" was a reveal on the sheet; this is a different thing and is wanted.

## Case-study pinned track (`HorizontalTrack.tsx`)

- **Sideways mode:** `SIDEWAYS = (min-width: 901px) and (prefers-reduced-motion: no-preference)`. GSAP's `matchMedia`, the CSS media queries and the `sideways:` Tailwind variant must all switch at exactly this condition.
  - New block layout classes use `sideways:`, never `min-[901px]:`.
  - The bottom rule, the phone footer and the closing "Get in touch" deliberately stay on the width breakpoint.
- **Mapping:** the pinned section maps vertical scroll 1:1 onto horizontal track position.
  - The timeline is linear (`ease: "none"`), `scrub: 0.6`, with no snap points.
  - The track and the progress marker are two tweens on one timeline, so they can't drift apart.
- **Setup timing is load-bearing. Don't simplify it:**
  - waits `SETUP_DELAY_MS` (600ms), then for `scrollWidth` to hold steady (~100ms, max ~1.5s), then creates the trigger once
  - forces scroll back to the cover
  - the timeline is created `paused: true`
  - Each of these fixes a real visible flash (see the comments).
- **The pin restarts CSS animations.** The pin moves the track in the DOM, which cancels and restarts its CSS animations. `retire()` puts restarted reveals back on their original clock. Test any new reveal on the track against this.
- **Progress scrubber (`.cs-progress`):**
  - drag or click to scrub (pointer events, `touch-action: none`), pointer cursor
  - visibility fades over 260ms
  - pointer-only: it has no keyboard control. Keyboard users scroll the page, which drives the track.
- **Recordings (`LazyVideo`)** autoplay muted and looped, load about a screen away, and pause off screen.
- **Grain and media stacking:**
  - Product media and the library photos sit above the paper grain (z-39). The grain rides with whatever it covers (`.cs-track::after`).
  - A reveal class goes on the element that moves, and never on a wrapper that holds z-39 content (product media, coral type). While animating, that wrapper is its own stacking context: the child sits under the grain, then snaps crisp at the end.

## Mobile and responsive

- **Case studies at ≤900px or with reduced motion:** no pin, no sideways scrolling. Blocks stack in one column (7rem gap; 7rem − 20px on phones). No cover rail dots. At ≤900px the scrubber stands on end: a 14px strip down the right edge (inside the 20px story margin, under the 56px header) that follows the page's vertical scroll — 0 at the top, 1 when the story's last block meets the bottom of the screen, fading out over the footer — and tapping or dragging along it scrolls the page there (`STACKED_NARROW` in `HorizontalTrack.tsx`). Reduced motion on a wider screen has no scrubber.
  - Reveals keep their timing but travel 70% as far (`--rv-travel: 0.7` on `.cs-track`): soft reveal ≈ 5.6px, heading ≈ 4px, body 3.5px.
- **Homepage hero:** the six edition boards at ≥768px; below that, one fixed phone hero (`MobileHero`, Figma 337:2020) with no editions. It plays the same `HERO_SEQUENCE`: the sheet settles, the eyebrow and four statement lines rise from masks, the 51px portrait opens top to bottom (`rv-clip` from `inset(0 0 100% 0)`), and the subline rises. The head script's hold also waits on `.hero-m-portrait img`. Retiring stops a replay when the trees swap at the breakpoint.
- **Homepage reveals** use the same values at every width (no travel scaling).
- **Phone header (<640px):** no menu since 2026-10-08, just a Resume link; nothing in it animates.
- **iOS Safari:** keep `formatDetection` off in `layout.tsx`. Auto-linked phone numbers caused a hydration error that stripped `data-motion`, which killed all motion. `restoreHtmlAttrs()` is the safety net.

## Timing and easing

| Token | Value | Used for |
|---|---|---|
| `--motion-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | the default for `.rv-line`, `.rv-rise`, `.rv-fade` and `.rv-clip`: hero type, library title, cover title, hero subline and metadata. A long exponential settle, no overshoot |
| `--motion-ease-settle` | `cubic-bezier(0.3, 0.5, 0.2, 1)` | the lift of both the soft reveal and the settle. A long tail: about 60% gone by 200ms; the last px take the rest |
| `--motion-ease-settle-fade` | `cubic-bezier(0.25, 0.1, 0.25, 1)` (CSS `ease`) | the fade of both. The soft reveal runs it over its full 850ms; the settle over 80% of 750ms, so its last lift happens fully opaque |
| `--motion-ease-quiet` | `cubic-bezier(0.4, 0, 0.2, 1)` | quiet copy (`ease: "quiet"`). A soft start, so text becomes visible rather than popping in |

**Durations:**

| Token | Value | Used for |
|---|---|---|
| `--motion-soft` | 850ms | every card and content block (`.rv-soft`) |
| `--motion-settle` | 750ms | the hero board and opening-screen band fills (`.rv-settle`) |
| `--motion-hero` | 800ms | `.rv-line` default (hero type) |
| `--motion-major` | 700ms | `.rv-clip` default (the hero portrait overrides it to 900) |
| `--motion-standard` | 420ms | `.rv-rise`/`.rv-fade` default. Most uses override it |

`--motion-fast` (200), `--motion-stagger` (60) and the CSS `--motion-hero-stagger` (100) are defined but currently unused. `MOTION.heroStagger` (100) is used. Don't treat the tokens as a scale to fill in, and don't delete them without asking.

**Values differ on purpose.** Keep each where it is:
- **Hero type is the most deliberate thing on the page** (800ms masked lines). Cards and content blocks share one soft reveal (850ms/8px), longer but with far less travel. Text is quieter still (500–650ms, 3–6px). Captions only fade.
- **Staggers by context:**
  - hero lines: 100ms
  - library title lines: 90ms
  - opening-screen steps and case-study groups: 120ms
  - Additional work rows: 110ms
  - Career rows: 100ms
  - library title → panel: 250ms
  - Recent work copy: 90ms
- **Trigger lines by context:** homepage 12%, quiet 2%, case studies 20% from the arrival edge.
- **Distances by context:** homepage text moves ≤4px (the hero subline's 8px is part of the expressive hero). Case-study headings move 6px and body 5px, one block per section, never per paragraph.

## Maximum movement

| What | Distance |
|---|---|
| Hero board, opening-screen band fills | 28px |
| Cards, media, panels, callouts (soft reveal) | 8px (case studies stacked: ×0.7) |
| Case-study headings, phone cover title | 6px |
| Case-study body and cover copy | 5px |
| Hero subline | 8px |
| Homepage copy and section furniture | 4px |
| Career rows | 3px |
| Captions, metadata, Skills, footer, library copy | 0px (opacity only) |
| Masked lines (hero, library title, cover title) | travel about 1.15em, but under a fixed mask that holds still. They read as type rising from its baseline, not a block moving |
| Hover | 2px: only the arrow on Additional work's live links |

The only horizontal motion is the scroll-driven track itself and that 2px arrow.

## Hover

Hover changes color, opacity, a ring, or (CTAs only) a faint drop shadow. Things don't move or resize.

| Element | Behavior |
|---|---|
| `.cta` | 150ms color/background/box-shadow. Primary fill shifts to `--accent-hover` (#f24f39) and gains a faint drop shadow (`--cta-hover-shadow`); secondary's type and outline go to `--accent-hover` with the same shadow; tertiary text darkens to `--ink-strong`. The old 2px `--accent-deep` hover edge was removed on request |
| Nav links | color → accent (Tailwind's 150ms default). The current page is shown bold, not recolored |
| Additional work live links | color → `--accent-deep`, arrow nudges 2px right (`motion-reduce:transition-none`) |
| Career case-study links | underlined; color → `--ink-2` |
| Footer and case-study footer links | opacity → 75% |
| Copy email | text → accent; a "Copy address" tooltip fades in over 150ms. A click flips it to "Copied" for 1.6s; it resets on leave or blur |
| More/Less glyph | label fades in over 150ms, on hover only where hover is real (`@media (hover: hover)`) or on focus-visible. A click hides it until leave or blur, so the new word never flashes |
| Recent work panels | the whole panel is a link with no hover effect: no lift, no scale |
| Reference library | nothing moves or resizes on hover. Zoom-in cursor on tiles. Hovering the window pauses its drift. Viewer buttons go from white 12% to 22% |
| Scrubber | pointer cursor |

## Touch

- Hover-only reveals are gated with `@media (hover: hover)` so a tap doesn't leave them stuck open.
- Hover only adds emphasis; nothing can be reached only by hovering. Anything hover reveals (the CopyEmail tooltip, the More/Less label) also shows on focus-visible.
- The library scrolls natively (touch, wheel, trackpad).
- Case studies on touch-sized screens use the stacked layout. The scrubber's `touch-action: none` covers only its own strip — on phones the 14px column down the right edge.
- Proof notes are desktop only.

## Keyboard and focus

- **Global `:focus-visible`:** a 2px accent outline, 3px offset, 2px radius.
  - The library window draws it inside the white frame.
  - Contact fields replace it with a 2px accent bottom rule.
- **Hover equivalents:** every hover reveal has a focus-visible equivalent (CopyEmail tooltip, More/Less label).
- **Library:** the window is focusable and scrolls with the arrow keys. The viewer moves focus to its close button; ←/→ step through photos; Esc closes.
- **Case-study track:** no special keyboard handling. Page keys scroll the page, which drives the track.

## Reduced motion

- **Motion is opt-in, not killed afterwards.** `MOTION_SCRIPT` and `setMotionMode` never set `data-motion` under `prefers-reduced-motion: reduce`. The reveal CSS is also wrapped in `@media (prefers-reduced-motion: no-preference)`. Every reveal is simply static content.
- **Case studies** drop the pin and the sideways layout entirely and use the stacked layout (CSS and `gsap.matchMedia` share `SIDEWAYS`).
- **Transform transitions** carry `motion-reduce:transition-none` (the Additional work arrow). Color and opacity hovers stay.
- **Don't add** a global `* { animation-duration: 0.01ms !important }` kill switch. It would duplicate the opt-in model.
- **The reference library drift** checks `prefers-reduced-motion` itself and never starts.
- **The homepage logo** scrolls back to the top smoothly, or instantly with reduced motion (`toTop` in `PersistentHeader.tsx`).
- **Known gaps** (current behavior, not decisions; flag them to Marc rather than "fixing" silently):
  - `spinExpandGlyph` (a 480ms Web Animations rotation) runs under reduced motion.
  - `ExpandCollapse`'s 450ms height transition has no reduced-motion guard.
  - `LazyVideo` recordings autoplay under reduced motion.

## Intentionally avoided

From the code comments and from directions tried and rejected:
- **Wipes, hard masks or drift on cards.** `rv-wipe`, `rv-drift` and `rv-glide` were deleted, along with Recent work's hard wipe, its device drift, and the library sheet's glide.
- **Masked rises everywhere** (rejected as "abrupt and repetitive"). Masks are only for big display type: the hero, the library title and the case-study cover title.
- **Front-loaded expo-out curves on everything** (rejected as "too abrupt… more animated than elegant"). Fades on front-loaded curves read as pops.
- **Overshoot, bounce and springs.** Code comments say "no overshoot" for every reveal.
- **Animating the shell or chrome**, or route/page transitions.
- **Scroll snapping on the track.** No snap points: whatever is at the current progress is what's in view.
- **Hover lift or scale** on cards, panels or library tiles.
- **Tiles or list items animating individually** inside a panel that reveals as one, or a card's image, background, title, CTA or metadata on separate clocks.
- **The 28px card settle on content.** It read as sliding into position; cards and blocks use the soft reveal. Only the hero board and its band fills keep 28px.
- **Per-paragraph triggers** in case studies.
- **Replaying on re-entry.** Everything plays once.
- **Animating layout properties in reveals.** The existing exceptions are `ExpandCollapse` (grid rows) and the scrubber marker (`left` on desktop, `top` on the phone strip).
- **Global smooth scroll** (it fights the pin).

**Don't bring in external defaults.** That means Material or Apple motion specs, generic 100/200/300ms duration scales, spring physics, overshoot, squash and stretch, anticipation, particle or confetti effects, celebratory success animations, parallax, or "delight" moments. None of them are part of this site.

## Adding or changing motion

1. **Find the existing role first.** Ask what hierarchy level the thing is (expressive, card, quiet copy, very quiet, static), and reuse that level's class, values and trigger behavior. New things should look like they were always there.
2. **Use the existing mechanism by default:** a reveal class, a trigger and `rv()`/`rvGroup()` on the homepage; `useReading()` roles in case studies.
   - Opening-screen furniture uses `data-reveal="open"`, not `view`.
   - If a genuinely new interaction can't be built with these, propose it to Marc before adding a new mechanism (new keyframes, an animation library, a scripted or ad-hoc `transition` effect). Say what the interaction is and why the existing reveals don't cover it.
3. **Respect the limits:**
   - only `transform`, `opacity`, `clip-path`
   - stay within the distances above
   - play once, backwards fill
   - the finished state must be the static page
4. **Put the reveal on the element that moves,** never on a wrapper holding z-39 content. Group siblings that arrive together.
5. **Make sure it works with `data-motion` absent** (reduced motion, no JS, Back/Forward). The content must just be there.
6. **For a new case-study layout:** use `sideways:`, and test the GSAP pin's restart against it.
7. **New hover states** use color, opacity or a ring at ~150ms; gate them with `(hover: hover)` when they reveal something; give them a focus-visible equivalent; add `motion-reduce:transition-none` to any transform.
8. **Never "normalize"** existing values to round numbers or a shared scale, or swap in a curve from elsewhere. If something new truly needs a value no existing role has, propose it to Marc with the reason.

## Checklist before touching motion

- [ ] Read the `src/lib/motion.ts` header and the "Motion system" section of `globals.css`.
- [ ] Is this the shell or chrome? If so, it doesn't animate.
- [ ] Which existing role or section level does it match? Are you reusing its exact values?
- [ ] Is the travel within its limit, and the text quieter than the card around it?
- [ ] Is it a once-only reveal with no layout change, using only transform, opacity or clip-path?
- [ ] Is it static and visible under reduced motion, with no JS, and after Back/Forward?
- [ ] For case studies: is it wired through `useReading`, does it use `sideways:` classes, is the trigger on a part and not a paragraph, and does it travel 0.7× when stacked?
- [ ] Is the reveal on the element that moves, with no lifted (z-39) child under the grain?
- [ ] Do hover cues have a focus-visible twin, a `(hover: hover)` gate, and `motion-reduce` on transforms?
- [ ] Have you verified it on a fresh production build?
  - First make sure the running site reflects the latest code.
  - Use real-time probes and timed screenshots at 1440×900, 1440×1500 and 390×844, plus once with reduced motion.
  - For layout snapshots, force `.rv-*` `animation: none`.
- [ ] Does your completion summary explicitly call out any meaningful change to the motion system (a new or changed value, role, trigger rule, mechanism, or a change to reduced-motion behavior)?
