import HorizontalTrack from "@/components/case-study/HorizontalTrack";
import ExpandCollapse from "@/components/case-study/ExpandCollapse";
import CaseStudyClosing from "@/components/case-study/CaseStudyClosing";
import ArrowIcon from "@/components/site/ArrowIcon";
import type { Block, ImageSpec } from "@/lib/ypp";

/**
 * Shared shell + block renderers for every horizontal-scroll case study
 * (Airbnb Hotels, Headspace Admin Portal, Yahoo Partner Portal). Previously
 * each page.tsx duplicated this entire file with only the brand chrome and
 * data source differing — three copies that had already drifted from each
 * other. Living in one place now so a type/color update only has to happen
 * once. Headspace — Unified Enrollment has a deliberately smaller block set
 * (no stats, no expand/collapse) and keeps its own page.tsx, but reuses the
 * shared type roles below.
 */

export type Meta = {
  title: string;
  subtitle: string;
  company: string;
  years: string;
};

export type SidebarGroup = { label: string; items: string[] };
export type Sidebar = {
  groups: SidebarGroup[];
  highlights: string[];
  highlightsLabel?: string;
};

/** Standard media-area aspect ratio, shared by every placeholder and every
 * real "plain" recording, so a section's shape doesn't shift the moment a
 * placeholder gets swapped for real footage. Was 7:5 to match
 * `MediaPlaceholder`'s old 857:609 (≈1.407, an arbitrary crop-derived
 * fraction), but every real recording so far was captured at ~1440:905
 * (≈1.59) — close to 857:609 in name only. 7:5 (1.4) cropped a real ~12%
 * off each side of the actual footage (buttons and labels at the edges
 * got cut off). 16:10 (1.6, also a standard, widely-held ratio — most
 * laptop/monitor screens, which is what these were captured on) is a
 * near-exact match to the real source instead, so object-cover barely
 * crops anything. */
const MEDIA_ASPECT = "aspect-[16/10]";

/** Mock browser-chrome brand mark shown inside every MediaPlaceholder. */
export type Brand = {
  bold: string;
  normal?: string;
  initials: string;
  color: string;
};

function Frame({ image }: { image: ImageSpec }) {
  return (
    <figure>
      <div className="cs-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="eager"
          decoding="async"
        />
      </div>
      <figcaption className="cs-caption">{image.caption}</figcaption>
    </figure>
  );
}

function MediaPlaceholder({
  brand,
  className = "",
}: {
  brand: Brand;
  className?: string;
}) {
  return (
    <div
      className={`flex ${MEDIA_ASPECT} w-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-28px_rgba(25,23,19,0.45)] ${className}`}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-line/70 px-4 py-3">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
          <path d="M0 1h16M0 6h16M0 11h16" stroke="#111111" strokeWidth="1.4" />
        </svg>
        <span className="text-sm font-bold leading-none" style={{ color: brand.color }}>
          {brand.bold}
          {brand.normal ? <span className="font-normal">{brand.normal}</span> : null}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5" stroke="#111111" strokeWidth="1.3" />
            <path d="M9.8 9.8L13 13" stroke="#111111" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold leading-none"
            style={{ borderColor: brand.color, color: brand.color }}
          >
            {brand.initials}
          </span>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}

/** A single interaction, staged on its own dark canvas — one component,
 * generous negative space, no browser chrome. Same gallery move as
 * `StepsPanel` (a dark card standing out against the light page) but for
 * a recording instead of text; --ink is the site's warm near-black, not
 * true black. Distinct from `MediaPlaceholder` (mock browser chrome) and
 * `Frame` (bordered card + caption for standalone `image` blocks). */
function IsolatedMedia({
  image,
  className = "",
}: {
  image: { src: string; alt: string };
  className?: string;
}) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-lg bg-ink px-6 py-10 min-[901px]:px-14 min-[901px]:py-14 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        loading="eager"
        decoding="async"
        className="max-w-full rounded-md shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}

/** Full-bleed rounded image, just a drop shadow — no canvas, no chrome.
 * Figma's Search treatment (node 302:51676): a large, already-dense
 * recording reads fine on its own; it doesn't need the --ink pedestal
 * `IsolatedMedia` gives a small/odd-shaped crop. */
function PlainMedia({
  image,
  className = "",
}: {
  image: { src: string; alt: string };
  className?: string;
}) {
  return (
    <div
      className={`${MEDIA_ASPECT} w-full overflow-hidden rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} loading="eager" decoding="async" className="size-full object-cover" />
    </div>
  );
}

/** Dark step-by-step panel — Figma's "Steps" component (519:71878),
 * replacing the media placeholder for sections with no product to show
 * (e.g. the inherited manual flow, before any UI existed). Sized to match
 * Figma exactly: 500px background, 100px padding each side, 300px content
 * column (500 - 100*2 = 300, so content just fills the padded box rather
 * than needing its own width). The list scrolls internally once it
 * outgrows the panel — bounded to the same ~687px content-height budget
 * every other section's media panel honors, so it never grows past what
 * the pinned viewport actually shows. Relies on native scroll chaining (no
 * custom wheel handling): the browser scrolls this element first and only
 * hands scroll off to the page once this hits its own bottom, so the
 * page's horizontal-scroll-jacking in HorizontalTrack is untouched. */
function StepsPanel({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <div className="flex w-full flex-col gap-10 overflow-y-auto rounded-lg bg-ink/80 px-8 py-10 text-bg min-[901px]:w-[calc(500px*var(--cs-scale,1))] min-[901px]:max-h-[calc(687.3px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:px-[calc(100px*var(--cs-scale,1))] min-[901px]:py-16">
      {steps.map((step) => (
        <div key={step.title} className="flex flex-col gap-3">
          <p className="text-xl font-semibold leading-[26px] [font-family:var(--font-display)]">{step.title}</p>
          <p className="text-base leading-[27px]">{step.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Full-bleed dark chapter panel — Figma's "Design Principles" section
 * (518:70506). The whole block goes dark edge-to-edge (not just a media
 * panel like `StepsPanel`), so it overrides `.cs-track`'s default
 * vertical centering with `self-stretch` to fill the pinned viewport
 * height, then paints that full height `bg-ink`. */
function PrinciplesBlock({
  sectionNumber,
  heading,
  intro,
  items,
}: {
  sectionNumber?: string;
  heading: string;
  intro: string;
  items: { number: string; title: string; body: string }[];
}) {
  return (
    <div
      className="cs-block cs-anchor-687 relative bg-ink"
      style={{ ["--w" as string]: "calc(109.4375rem * var(--cs-scale, 1))" }}
    >
      {/* Extends the same dark fill to the full pinned-viewport height on
          desktop, independent of cs-anchor-687's push-down — see globals.css. */}
      <div aria-hidden className="cs-principles-bg bg-ink" />

      <div className="relative flex w-full flex-col gap-10 px-6 py-14 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))] min-[901px]:px-[calc(100px*var(--cs-scale,1))] min-[901px]:py-0">
        <div className="flex w-full flex-col gap-3 min-[901px]:w-[calc(19rem*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="relative">
            {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" /> : null}
            <h2 className="display text-[28px] leading-none text-bg min-[901px]:text-[40px]">{heading}</h2>
          </div>
          <p className="text-[20px] font-semibold leading-[26px] text-bg [font-family:var(--font-display)]">
            {intro}
          </p>
        </div>

        <div className="flex w-full flex-col min-[901px]:w-[calc(25.5rem*var(--cs-scale,1))]">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`flex gap-6 py-8 ${i < items.length - 1 ? "border-b border-bg/20" : ""}`}
            >
              <p className="display shrink-0 text-[40px] leading-none text-accent">{item.number}</p>
              <div className="flex flex-col gap-3 pt-[10px]">
                <p className="text-[20px] font-semibold leading-[26px] text-bg [font-family:var(--font-display)]">
                  {item.title}
                </p>
                <p className="text-sm leading-[22px] text-bg/85">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RailDots() {
  return (
    <div
      aria-hidden
      className="fixed bottom-0 left-0 top-16 z-40 hidden w-14 flex-col items-center justify-between bg-bg py-14 min-[901px]:flex"
    >
      <span className="rail-dot" />
      <span className="rail-dot" />
      <span className="rail-dot" />
    </div>
  );
}

function BottomRule() {
  return <div aria-hidden className="fixed inset-x-0 bottom-0 z-30 border-t border-line" />;
}

/** Small orange section number ("01", "02", ...) beside a section's title.
 * Positioned against the title's first line only via an explicit
 * `titleLineHeight`, not the ancestor's full height, so a two-line title
 * doesn't pull the number down to the block's center. */
function SectionNum({ number, titleLineHeight }: { number: string; titleLineHeight: string }) {
  return (
    <span
      aria-hidden
      className="cs-kicker hidden w-10 -translate-y-1/2 min-[901px]:absolute min-[901px]:-left-16 min-[901px]:block"
      style={{ top: `calc((${titleLineHeight}) / 2 + 1.3px)` }}
    >
      {number}
    </span>
  );
}

/**
 * Case-study hero background grid — a genuine fixed-dimension design canvas,
 * not a box that hugs whatever text happens to sit on top of it. Same
 * technique as the homepage hero's own `--hero-scale` canvas (page.tsx):
 * the grid is authored at its real Figma pixel size and uniformly scaled
 * down (via a local, self-contained container-query) to fit whatever box
 * it's dropped into — it never stretches or distorts, it only shrinks.
 *
 * Dimensions/texture confirmed via the Figma MCP against fileKey
 * AWMKNoAFrxViMhBaGRfWbZ, node 679:59867 ("Background grid", child of the
 * Yahoo Partner Portal hero frame 594:122022 → "Frame 74" → this node):
 *   - 714×914, cells 30px + 1px gap = 31px pitch (get_metadata XML)
 *   - cell fill #e4e4df / gap color #b0b0b0 (get_design_context on a single
 *     row, id 679:59868: `bg-[#b0b0b0] ... gap-px`, children `bg-[#e4e4df]`)
 *     — exact matches for this file's existing --bg/--line tokens, so the
 *     already-coded repeating-linear-gradient texture is correct as-is.
 *   - ~8px outer corner radius — NOT a directly-pulled token: the frame's
 *     own get_design_context call exceeded the tool's size limit (714×914
 *     of individual cells is too large to render), so this is measured off
 *     the rendered screenshot's corner antialiasing arc instead, and it
 *     matches the homepage grid's own 8px exactly.
 *
 * Airbnb and Headspace have no equivalent hero frame of their own in this
 * Figma file (their "Case Studies" page entries are flat legacy reference
 * screenshots, not editable frames), so all three case studies share these
 * same 714×914 numbers via CoverBlock below — width/height are still props
 * so a real per-case-study frame can override them later.
 */
function CaseStudyHeroGrid({
  width = 714,
  height = 914,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute hidden [container-type:inline-size] min-[901px]:block ${className}`}
    >
      <div
        className="origin-top-left overflow-hidden rounded-[8px] border border-line"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(min(1, calc(100cqi / ${width}px)))`,
          backgroundImage: [
            "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 31px)",
            "repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px 31px)",
          ].join(","),
        }}
      />
    </div>
  );
}

function CoverBlock({ meta, sidebar }: { meta: Meta; sidebar: Sidebar }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "calc(76rem * var(--cs-scale, 1))" }}>
      <div className="flex flex-col gap-16 min-[901px]:flex-row min-[901px]:items-center min-[901px]:gap-0">
        <div className="relative w-full min-[901px]:w-[calc(591px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <CaseStudyHeroGrid className="inset-0" />
          <div className="relative flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              {/* Eyebrow is now the project's year range (meta.years) per
                  the Figma redesign — was meta.company, which is folded
                  into the h1 alongside the title instead. Matches the
                  "Quotes/Stats" type role (.cs-quote's values, applied
                  directly rather than via the class itself — .cs-quote is
                  unlayered CSS and would beat a Tailwind text-accent
                  override regardless of source order), not the shared
                  .cs-kicker role (16px/24px SemiBold) also used by the
                  "01"-style section numbers elsewhere on this page — those
                  weren't part of this spec. */}
              <p className="text-xl font-semibold leading-6 text-accent [font-family:var(--font-body)]">
                {meta.years}
              </p>
              <h1 className="display text-[2.5rem] leading-none min-[901px]:text-[60px] min-[901px]:leading-none">
                {meta.company} {meta.title}
              </h1>
            </div>
            <p className="max-w-[calc(571px*var(--cs-scale,1))] text-sm leading-[20px] text-ink-2">
              {meta.subtitle}
            </p>
            <p className="cs-only-horizontal mt-10 flex items-center gap-3 text-sm text-ink-2">
              <span className="inline-block h-px w-10 bg-accent" />
              Scroll to move through the story
            </p>
          </div>
        </div>

        <div className="w-full min-[901px]:ml-[calc(300px*var(--cs-scale,1))] min-[901px]:w-[calc(295px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <dl className="flex flex-col gap-5">
            {sidebar.groups.map((group) => (
              <div key={group.label} className="flex gap-[calc(21px*var(--cs-scale,1))]">
                <ArrowIcon />
                <div className="flex flex-1 flex-col gap-2">
                  <dt className="cs-label">{group.label}</dt>
                  <dd className="flex flex-col gap-2 cs-meta">
                    {group.items.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </dd>
                </div>
              </div>
            ))}
            <div className="flex gap-[calc(21px*var(--cs-scale,1))]">
              <ArrowIcon />
              <div className="flex flex-1 flex-col gap-2">
                <dt className="cs-label">{sidebar.highlightsLabel ?? "Highlights"}</dt>
                <dd className="flex flex-col gap-2 cs-meta">
                  {sidebar.highlights.map((h) => (
                    <p key={h}>{h}</p>
                  ))}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function CopyBlock({
  heading,
  eyebrow,
  body,
  width,
  accent,
  sectionNumber,
}: {
  heading?: string;
  eyebrow?: string;
  body: string[];
  width?: string;
  accent?: boolean;
  sectionNumber?: string;
}) {
  // A sectionNumber means this copy block is standing in as a numbered
  // section header (e.g. the Research/Key Decisions group heading) — give
  // it the same cs-anchor-687 treatment and 40px title size every other
  // numbered header uses, so titles land on the same row while scrolling.
  return (
    <div
      className={`cs-block ${accent ? "border-l-2 border-accent pl-5" : ""} ${
        sectionNumber ? "cs-anchor-687" : ""
      }`}
      style={{ ["--w" as string]: width ?? "27rem" }}
    >
      {heading ? (
        <div className="relative mb-5">
          {sectionNumber ? (
            <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" />
          ) : null}
          <h2
            className={`display ${
              sectionNumber ? "text-[2rem] min-[901px]:text-[40px]" : "text-[clamp(1.6rem,2.4vw,2.25rem)]"
            } ${accent ? "text-accent" : "text-ink"}`}
          >
            {heading}
          </h2>
          {eyebrow ? <p className="cs-section-title mt-2">{eyebrow}</p> : null}
        </div>
      ) : null}
      <div className="space-y-4 text-sm leading-[20px] text-ink-2">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/** One numbered item in a repeating text+own-image group (Block kind
 * "panel-item") — Figma's per-item panels in Research and Key Decisions. */
function PanelItemBlock({
  number,
  title,
  body,
  caption,
  brand,
}: {
  number: string;
  title: string;
  body: string;
  caption: string;
  brand: Brand;
}) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "calc(81.25rem * var(--cs-scale, 1))" }}>
      <div className="flex flex-col gap-6 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))]">
        <div className="flex w-full flex-col gap-[18px] min-[901px]:w-[calc(19rem*var(--cs-scale,1))] min-[901px]:shrink-0">
          <p className="display text-[40px] leading-none text-accent">{number}</p>
          <p className="cs-section-title">{title}</p>
          <p className="text-sm leading-[20px] text-ink-2">{body}</p>
        </div>
        <div className="flex w-full flex-col gap-6 min-[901px]:w-[calc(53.5rem*var(--cs-scale,1))]">
          <MediaPlaceholder
            brand={brand}
            className="min-[901px]:w-[calc(1080px*var(--cs-scale,1))] min-[901px]:shrink-0"
          />
          <p className="cs-caption text-center">{caption}</p>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "24rem" }}>
      <p className="display text-[clamp(4rem,9vw,7rem)] leading-none text-accent">{value}</p>
      <p className="cs-quote mt-5">{label}</p>
      {note ? (
        <p className="mt-5 border-t border-line pt-5 text-xs leading-4 text-muted">{note}</p>
      ) : null}
    </div>
  );
}

function StatGroupBlock({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "44rem" }}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-10">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="display text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-accent">{stat.value}</p>
            <p className="mt-3 text-sm leading-[20px] text-ink-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClosingBlock({
  heading,
  body,
  stats,
  caption,
  brand,
}: {
  heading: string;
  body: string[];
  stats: { value: string; label: string }[];
  caption?: string;
  brand: Brand;
}) {
  const hasStats = stats.length > 0;
  const hasCaption = Boolean(caption);
  return (
    <div
      className="cs-block cs-anchor-687"
      style={{
        ["--w" as string]:
          hasStats || hasCaption
            ? "calc(88.3125rem * var(--cs-scale, 1))"
            : "calc(35rem * var(--cs-scale, 1))",
      }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(293px*var(--cs-scale,1))]">
        <div className="flex w-full flex-col gap-4 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <h2 className="display text-[28px] leading-none min-[901px]:text-[40px]">{heading}</h2>
          <div className="flex flex-col text-sm leading-[20px] text-ink-2">
            {body.map((p, i) => (
              <p key={i} className={i < body.length - 1 ? "mb-3" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {hasStats ? (
          <div className="flex w-full flex-col gap-5 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex items-center gap-6 border-line py-5 ${i === 0 ? "border-y" : "border-b"}`}
              >
                <p className="cs-quote flex-1">{stat.label}</p>
                <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[60px]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : hasCaption ? (
          <div className="flex w-full flex-col gap-6 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
            <MediaPlaceholder brand={brand} />
            <p className="cs-caption text-center">{caption}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuoteBlock({ text, attribution }: { text: string; attribution: string }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "31rem" }}>
      <figure>
        <blockquote className="border-l-2 border-accent pl-6">
          <p className="cs-quote">{'"' + text + '"'}</p>
        </blockquote>
        <figcaption className="mt-6 pl-6 text-sm leading-[20px] text-ink-2">{attribution}</figcaption>
      </figure>
    </div>
  );
}

function IntroStackBlock({
  heading,
  body,
  stat,
  quote,
  sectionNumber,
}: {
  heading: string;
  body: string[];
  stat?: { value: string; label: string };
  quote: { text: string; attribution: string };
  sectionNumber?: string;
}) {
  return (
    <div
      className="cs-block cs-anchor-687 cs-problem-inset min-[901px]:pl-[calc(3rem*var(--cs-scale,1))]"
      style={{ ["--w" as string]: "calc(38rem * var(--cs-scale, 1))" }}
    >
      <div className="flex w-full flex-col gap-8 min-[901px]:w-[calc(560px*var(--cs-scale,1))]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="41.6px" /> : null}
            <h2 className="display text-[28px] leading-none min-[901px]:text-[40px]">{heading}</h2>
          </div>
          <div className="text-sm leading-[20px] text-ink-2">
            {body.map((p, i) => (
              <p key={i} className={i === 0 ? "mb-4" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {stat ? (
          <div className="flex items-center gap-6 border-y border-line py-5">
            <p className="display -translate-y-[2.6px] shrink-0 text-[44px] leading-none text-accent min-[901px]:text-[60px]">
              {stat.value}
            </p>
            <p className="cs-quote flex-1">{stat.label}</p>
          </div>
        ) : (
          <div className="border-t border-line" />
        )}

        <div className="flex flex-col gap-2">
          <blockquote>
            <p className="cs-quote">{'"' + quote.text + '"'}</p>
          </blockquote>
          <p className="text-sm leading-[20px] text-ink-2">— {quote.attribution}</p>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  eyebrow,
  title,
  subhead,
  body,
  bullets,
  caption,
  pullQuotes,
  pullQuotePosition,
  stats,
  sectionNumber,
  expandedPoints,
  steps,
  image,
  brand,
}: {
  eyebrow: string;
  title: string;
  subhead?: string;
  body: string | string[];
  bullets: { title: string; body: string }[];
  caption: string;
  pullQuotes?: { quote: string; attribution: string }[];
  pullQuotePosition?: "top" | "middle" | "bottom";
  stats?: { value: string; label: string }[];
  sectionNumber?: string;
  expandedPoints?: { label: string; text: string }[];
  steps?: { title: string; body: string }[];
  image?: { src: string; alt: string; frame?: "canvas" | "plain" };
  brand: Brand;
}) {
  const position = pullQuotePosition ?? "bottom";
  const hasQuotes = Boolean(pullQuotes?.length);
  const hasStats = Boolean(stats?.length);
  const hasSteps = Boolean(steps?.length);
  const hasImage = Boolean(image);
  const isPlainImage = hasImage && image!.frame === "plain";

  const renderQuotes = () =>
    pullQuotes?.map((pq) => (
      <div key={pq.quote} className="flex flex-col gap-2">
        <blockquote className="w-full border-l-2 border-accent pl-6 min-[901px]:w-[calc(375px*var(--cs-scale,1))]">
          <p className="cs-quote">{'"' + pq.quote + '"'}</p>
        </blockquote>
        <p className="w-full pl-6 text-sm leading-[20px] text-ink-2 min-[901px]:w-[calc(375px*var(--cs-scale,1))]">
          — {pq.attribution}
        </p>
      </div>
    ));

  const renderStats = () => (
    <div className="flex flex-col min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:ml-[calc(200px*var(--cs-scale,1))] min-[901px]:self-center">
      {stats?.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex items-center gap-6 border-line py-5 ${i === 0 ? "border-y" : "border-b"}`}
        >
          <p className="cs-quote flex-1">{stat.label}</p>
          <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[60px]">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );

  const justifyClass =
    position === "top" ? "justify-start" : position === "bottom" ? "justify-end" : "justify-center";

  const renderPanelArea = () =>
    hasSteps ? (
      <StepsPanel steps={steps!} />
    ) : (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 min-[901px]:flex-row min-[901px]:items-stretch">
          {hasImage ? (
            isPlainImage ? (
              <PlainMedia
                image={image!}
                className="min-[901px]:w-[calc(1080px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:self-start"
              />
            ) : (
              <IsolatedMedia
                image={image!}
                className="min-[901px]:w-[calc(1080px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:self-start"
              />
            )
          ) : (
            <MediaPlaceholder
              brand={brand}
              className="min-[901px]:w-[calc(1080px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:self-start"
            />
          )}
          {hasQuotes ? (
            <div
              className={`flex flex-col gap-10 min-[901px]:w-[calc(907px*var(--cs-scale,1))] min-[901px]:shrink-0 ${justifyClass}`}
            >
              {renderQuotes()}
            </div>
          ) : hasStats ? (
            renderStats()
          ) : null}
        </div>
        <div className="flex w-full justify-center min-[901px]:w-[calc(1080px*var(--cs-scale,1))]">
          <p className="cs-caption text-center">{caption}</p>
        </div>
      </div>
    );

  return (
    <div
      className="cs-block cs-anchor-687"
      style={{
        ["--w" as string]: hasStats
          ? "calc(133.75rem * var(--cs-scale, 1))"
          : hasQuotes
          ? "calc(121.25rem * var(--cs-scale, 1))"
          : "calc(108.75rem * var(--cs-scale, 1))",
      }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))]">
        <div
          className="flex w-full flex-col gap-5 min-[901px]:w-[calc(19rem*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:pl-[calc(39px*var(--cs-scale,1))]"
        >
          <div className="flex flex-col gap-2">
            <div className="relative">
              {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" /> : null}
              <h2 className="display text-[2rem] min-[901px]:text-[40px]">{title}</h2>
            </div>
            <p className="cs-section-title">{eyebrow}</p>
          </div>
          {subhead ? <p className="cs-section-title">{subhead}</p> : null}
          <div className="-mt-2 flex flex-col gap-3 text-sm leading-[20px] text-ink-2">
            {(Array.isArray(body) ? body : [body]).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {hasSteps ? null : expandedPoints ? (
            <ExpandCollapse points={expandedPoints} />
          ) : (
            <div className="flex flex-col gap-4">
              {bullets.map((bullet) => (
                <div key={bullet.title}>
                  <p className="cs-sub-label">{bullet.title}</p>
                  <p className="mt-1 text-sm leading-[20px] text-ink-2">{bullet.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex w-full flex-col gap-6 ${hasStats ? "min-[901px]:w-[calc(111.75rem*var(--cs-scale,1))]" : hasQuotes ? "min-[901px]:w-[calc(99.25rem*var(--cs-scale,1))]" : "min-[901px]:w-[calc(86.75rem*var(--cs-scale,1))]"}`}
        >
          {renderPanelArea()}
        </div>
      </div>
    </div>
  );
}

function renderBlock(block: Block, i: number, brand: Brand) {
  switch (block.kind) {
    case "cover":
      return null; // rendered separately by CaseStudyPage, which owns meta/sidebar
    case "copy":
      return (
        <CopyBlock
          key={i}
          heading={block.heading}
          eyebrow={block.eyebrow}
          body={block.body}
          width={block.width}
          accent={block.accent}
          sectionNumber={block.sectionNumber}
        />
      );
    case "panel-item":
      return (
        <PanelItemBlock
          key={i}
          number={block.number}
          title={block.title}
          body={block.body}
          caption={block.caption}
          brand={brand}
        />
      );
    case "stat":
      return <StatBlock key={i} value={block.value} label={block.label} note={block.note} />;
    case "stat-group":
      return <StatGroupBlock key={i} stats={block.stats} />;
    case "quote":
      return <QuoteBlock key={i} text={block.text} attribution={block.attribution} />;
    case "image":
      return (
        <div key={i} className="cs-block" style={{ ["--w" as string]: block.image.w }}>
          <Frame image={block.image} />
        </div>
      );
    case "intro-stack":
      return (
        <IntroStackBlock
          key={i}
          heading={block.heading}
          body={block.body}
          stat={block.stat}
          quote={block.quote}
          sectionNumber={block.sectionNumber}
        />
      );
    case "section":
      return (
        <SectionBlock
          key={i}
          eyebrow={block.eyebrow}
          title={block.title}
          subhead={block.subhead}
          body={block.body}
          bullets={block.bullets}
          caption={block.caption}
          pullQuotes={block.pullQuotes}
          pullQuotePosition={block.pullQuotePosition}
          stats={block.stats}
          sectionNumber={block.sectionNumber}
          expandedPoints={block.expandedPoints}
          steps={block.steps}
          image={block.image}
          brand={brand}
        />
      );
    case "closing":
      return (
        <ClosingBlock
          key={i}
          heading={block.heading}
          body={block.body}
          stats={block.stats}
          caption={block.caption}
          brand={brand}
        />
      );
    case "principles":
      return (
        <PrinciplesBlock
          key={i}
          sectionNumber={block.sectionNumber}
          heading={block.heading}
          intro={block.intro}
          items={block.items}
        />
      );
  }
}

export function CaseStudyPage({
  navTitle,
  meta,
  sidebar,
  blocks,
  brand,
}: {
  /** Breadcrumb text in the fixed top bar, e.g. "Airbnb Hotels". */
  navTitle: string;
  meta: Meta;
  sidebar: Sidebar;
  blocks: Block[];
  brand: Brand;
}) {
  return (
    <main className="bg-bg">
      <RailDots />
      <BottomRule />
      <HorizontalTrack>
        <CoverBlock meta={meta} sidebar={sidebar} />
        {blocks.map((block, i) => renderBlock(block, i, brand))}
        <CaseStudyClosing />
      </HorizontalTrack>
    </main>
  );
}
