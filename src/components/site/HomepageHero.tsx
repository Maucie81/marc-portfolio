import { Fragment, type CSSProperties, type ElementType } from "react";
import Image from "next/image";
import {
  HERO_EDITIONS,
  HERO_META_LINES,
  HERO_STATEMENT,
  type HeroEdition,
  type HeroText,
} from "@/lib/hero-editions";
import { HERO_SEQUENCE as SEQ, MOTION, rv } from "@/lib/motion";

/**
 * The homepage hero — one component, six editions (Figma 254:273243). Every
 * edition is rendered into the HTML and CSS shows the one <html data-hero>
 * names (set before first paint by HERO_EDITION_SCRIPT in layout.tsx), so
 * the choice never flickers and never differs between server and client.
 *
 * ≥768px: the Figma board itself, 1376 × 566, with every layer at its
 * Figma position in board units (--hu = one Figma px at the board's current
 * width), so the whole composition scales as one piece.
 * <768px: the same edition stacked — its eyebrow / name / divider /
 * portrait cluster cut from the board, then the statement, subline and
 * metadata as flowing text below it.
 *
 * Motion (src/lib/motion.ts): the hero section is a data-reveal="load"
 * trigger and the slowest, most deliberate reveal on the page. The board
 * itself settles in first (28px, 750ms); then the eyebrow
 * and name set as masked lines, the portrait is uncovered top to bottom
 * through its own crop, the statement follows line by line, the subline
 * rises in and the edition metadata fades up last — HERO_SEQUENCE.
 */

const BOARD_W = 1376;
// A pre-sized WebP served as-is: through the image optimizer the hero's
// <img> intermittently never finished loading and the portrait went missing.
const PORTRAIT_SRC = "/marc/hero-illustration-2026.webp";
const PORTRAIT_ALT = "Illustrated portrait of Marc Favro";

const u = (n: number) => `calc(${n} * var(--hu))`;

/** How a text layer arrives: as masked lines `stagger` ms apart, or as one
 * rising block. */
type Reveal = { kind: "line"; start: number } | { kind: "rise"; start: number };

function BoardText({
  spec,
  as: Tag = "p",
  className = "",
  reveal,
}: {
  spec: HeroText;
  as?: ElementType;
  className?: string;
  reveal?: Reveal;
}) {
  const lineReveal = reveal?.kind === "line" ? reveal.start : null;
  return (
    <Tag
      className={`hero-text ${reveal?.kind === "rise" ? "rv-rise" : ""} ${className}`}
      style={{
        ...(reveal?.kind === "rise" ? rv(reveal.start, { dur: SEQ.sublineDur }) : null),
        zIndex: spec.z,
        color: spec.color,
        fontSize: u(spec.size),
        fontWeight: spec.weight,
        lineHeight: spec.lineHeight ? u(spec.lineHeight) : 1.26,
        // Bold display lines: −0.8% brings the self-hosted font's line
        // lengths onto Figma's, which sets these sizes with a tighter
        // optical size than the file here carries.
        letterSpacing: `${spec.tracking ?? (spec.weight === 700 ? -0.008 : 0)}em`,
        mixBlendMode: spec.blend,
      }}
    >
      {spec.lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span
            className={lineReveal === null ? "hero-line" : "hero-line rv-line"}
            style={{
              ...(lineReveal === null ? null : rv(lineReveal + i * MOTION.heroStagger)),
              ...(line.anchor === "right"
                ? { right: u(BOARD_W - line.x), top: u(line.y), textAlign: "right" }
                : { left: u(line.x), top: u(line.y) }),
            }}
          >
            {line.text}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

const polygon = (pts: [number, number][]) =>
  `polygon(${pts.map(([x, y]) => `${u(x)} ${u(y)}`).join(", ")})`;

function Portrait({ edition, sizes }: { edition: HeroEdition; sizes: string }) {
  const p = edition.portrait;
  // The crop is listed top-left, top-right, bottom-right, bottom-left; the
  // reveal starts with its bottom edge folded up onto its top one, so the
  // bottom corners travel down the crop's own sides (Hero 2's slant too).
  const [tl, tr] = p.clip;
  return (
    <div
      className="hero-portrait rv-clip"
      style={{
        ...rv(SEQ.portrait, { dur: SEQ.portraitDur }),
        ["--rv-clip-from" as string]: polygon([tl, tr, tr, tl]),
        zIndex: p.z,
        clipPath: polygon(p.clip),
        mixBlendMode: p.blend,
      }}
    >
      <Image
        src={PORTRAIT_SRC}
        alt={PORTRAIT_ALT}
        width={1268}
        height={1241}
        sizes={sizes}
        unoptimized
        // Eager, not `priority`: all six editions (desktop and stacked) are
        // in the HTML, so a preload would fetch candidates the visible tree
        // never uses. The hidden tree's `sizes` resolves to 1px.
        loading="eager"
        className="absolute max-w-none"
        style={{
          left: u(p.x),
          top: u(p.y),
          width: u(p.w),
          height: u(p.h),
          transformOrigin: "0 0",
          transform: `matrix(${p.matrix.join(", ")}, 0, 0)`,
        }}
      />
    </div>
  );
}

function Rules({ edition }: { edition: HeroEdition }) {
  return edition.rules.map((r, i) => (
    <span
      key={i}
      aria-hidden
      className="hero-rule absolute"
      style={{
        zIndex: r.z,
        left: u(r.x),
        top: u(r.y),
        width: u(r.w),
        height: u(r.h),
        background: r.color,
        transform: r.rotate ? `rotate(${r.rotate}deg)` : undefined,
      }}
    />
  ));
}

function Meta({ edition, style, className = "" }: { edition: HeroEdition; style?: CSSProperties; className?: string }) {
  return (
    <p
      aria-hidden
      className={`hero-meta rv-fade ${className}`}
      style={{ ...rv(SEQ.meta, { dur: SEQ.metaDur }), color: edition.meta.color, ...style }}
    >
      {HERO_META_LINES(edition).map((line, i) => (
        <Fragment key={line}>
          {i > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </p>
  );
}

function DesktopBoard({ edition }: { edition: HeroEdition }) {
  const meta = (
    <Meta
      edition={edition}
      style={{
        // Same corner on every edition: 20px in from the right and bottom
        // (the last line's baseline), regardless of the Figma placement.
        zIndex: edition.meta.z,
        right: 20,
        bottom: 20,
        marginBottom: "-0.27em",
        fontSize: `max(9px, ${u(11)})`,
      }}
    />
  );
  const statement = <BoardText spec={edition.statement} reveal={{ kind: "line", start: SEQ.statement }} />;

  return (
    <div
      className="hero-board rv-settle"
      style={
        {
          ...rv(SEQ.board),
          background: edition.background,
          ["--lockup-x" as string]: edition.center?.x,
          ["--lockup-y" as string]: edition.center?.y,
        } as CSSProperties
      }
    >
      {edition.texture ? (
        <div
          aria-hidden
          className="hero-texture"
          style={{
            left: u(edition.texture.x),
            top: u(edition.texture.y),
            width: u(edition.texture.w),
            height: u(edition.texture.h),
            mixBlendMode: edition.texture.blend,
          }}
        />
      ) : null}
      {/* DOM order is reading order (eyebrow, name, statement, subline);
          the Figma stacking comes from each layer's z-index. */}
      <BoardText spec={edition.eyebrow} reveal={{ kind: "line", start: SEQ.eyebrow }} />
      <BoardText spec={edition.name} as="h1" reveal={{ kind: "line", start: SEQ.name }} />
      {edition.clip ? (
        // Hero 4's oversized statement is masked to the board's inner rect,
        // exactly like the Figma mask group.
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            clipPath: `inset(${u(edition.clip.y)} ${u(BOARD_W - edition.clip.x - edition.clip.w)} calc(100% - ${u(edition.clip.y + edition.clip.h)}) ${u(edition.clip.x)})`,
          }}
        >
          {statement}
        </div>
      ) : (
        statement
      )}
      <BoardText spec={edition.subline} reveal={{ kind: "rise", start: SEQ.subline }} />
      <Portrait edition={edition} sizes="(min-width: 768px) 30vw, 1px" />
      <Rules edition={edition} />
      {meta}
    </div>
  );
}

/** <768px: the edition's name/portrait cluster, then the copy as text. */
/** The edition with its `stack` tweaks applied, for the stacked layout. */
function stackEdition(edition: HeroEdition): HeroEdition {
  const t = edition.stack;
  if (!t) return edition;
  const shift = (spec: HeroEdition["name"]) =>
    t.nameShift ? { ...spec, lines: spec.lines.map((l) => ({ ...l, y: l.y + t.nameShift! })) } : spec;
  return {
    ...edition,
    eyebrow: shift(edition.eyebrow),
    name: shift(edition.name),
    portrait: t.portraitShift
      ? {
          ...edition.portrait,
          y: edition.portrait.y + t.portraitShift,
          clip: edition.portrait.clip.map(([x, y]) => [x, y + t.portraitShift!] as [number, number]),
        }
      : edition.portrait,
    rules: t.ruleH ? edition.rules.map((r, i) => (i === 0 ? { ...r, h: t.ruleH! } : r)) : edition.rules,
    cluster: t.clusterH ? { ...edition.cluster, h: t.clusterH } : edition.cluster,
  };
}

function StackedHero({ edition: base }: { edition: HeroEdition }) {
  const edition = stackEdition(base);
  const c = edition.cluster;
  return (
    <div
      className="hero-stack rv-settle"
      style={{ ...rv(SEQ.board), background: edition.background, ["--cluster-w" as string]: c.w } as CSSProperties}
    >
      {edition.texture ? (
        <div aria-hidden className="hero-texture-fill" style={{ mixBlendMode: edition.texture.blend }} />
      ) : null}
      {/* Cluster, statement and subline as one lockup, centered as a whole
          (see .hero-lockup), each part centered inside it. */}
      <div className="hero-lockup">
        <div className="hero-cluster" style={{ aspectRatio: `${c.w} / ${c.h}` }}>
          <div
            className="absolute"
            style={{ left: u(-c.x), top: u(-c.y), width: u(BOARD_W), height: u(566) }}
          >
            <BoardText spec={edition.eyebrow} reveal={{ kind: "line", start: SEQ.eyebrow }} />
            <BoardText spec={edition.name} as="h1" reveal={{ kind: "line", start: SEQ.name }} />
            <Portrait edition={edition} sizes="(max-width: 767px) 70vw, 1px" />
            <Rules edition={edition} />
          </div>
        </div>
        <p
          className="hero-stack-statement"
          style={{ color: edition.mobileStatementColor }}
        >
          {/* Desktop's own four lines, never re-wrapped (see the CSS). */}
          {HERO_STATEMENT.map((line, i) => (
            <Fragment key={line}>
              {i > 0 ? " " : null}
              <span className="rv-line block whitespace-nowrap" style={rv(SEQ.statement + i * MOTION.heroStagger)}>
                {line}
              </span>
            </Fragment>
          ))}
        </p>
        <p
          className="hero-stack-subline rv-rise"
          style={{ ...rv(SEQ.subline, { dur: SEQ.sublineDur }), color: edition.subline.color }}
        >
          {edition.subline.lines.map((l) => l.text).join(" ")}
        </p>
      </div>
    </div>
  );
}

export default function HomepageHero() {
  return HERO_EDITIONS.map((edition) => (
    <div key={edition.id} className="hero-edition" data-edition={edition.id}>
      <div className="hero-desktop hidden md:block">
        <DesktopBoard edition={edition} />
      </div>
      <div className="md:hidden">
        <StackedHero edition={edition} />
      </div>
    </div>
  ));
}
