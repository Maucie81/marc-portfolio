import type { Metadata } from "next";
import Link from "next/link";
import HorizontalTrack from "@/components/case-study/HorizontalTrack";
import ExpandCollapse from "@/components/case-study/ExpandCollapse";
import { blocks, meta, sidebar, type Block, type ImageSpec } from "@/lib/ypp";

export const metadata: Metadata = {
  title: `${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

const RESUME_URL =
  "https://drive.google.com/file/d/1eH-USxlLh24SYEIUtEZJGOLgwV_v7qrQ/view?usp=share_link";

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

/** Placeholder for a future screen recording — an empty white canvas behind a
 * minimal app-chrome header (menu, wordmark, search, avatar) so it reads as
 * the portal rather than a blank box. Sized to Figma's literal 857×609
 * "Overview - Default Brand" placeholder frame (node 319:61359) — fixed at
 * that size in every section, quote-bearing or not, rather than stretching
 * to fill leftover space. */
function MediaPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex aspect-[857/609] w-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-28px_rgba(25,23,19,0.45)] ${className}`}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-line/70 px-4 py-3">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
          <path
            d="M0 1h16M0 6h16M0 11h16"
            stroke="#111111"
            strokeWidth="1.4"
          />
        </svg>
        <span className="text-sm font-bold leading-none text-[#5D5EFF]">
          partner<span className="font-normal">portal</span>
        </span>
        <div className="ml-auto flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5" stroke="#111111" strokeWidth="1.3" />
            <path
              d="M9.8 9.8L13 13"
              stroke="#111111"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#5D5EFF] text-[10px] font-semibold leading-none text-[#5D5EFF]">
            JD
          </span>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}

/** Persistent top bar: back link + breadcrumb on the left, site nav on the
 * right — the same links/styling as the homepage header. */
function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-line bg-bg/95 px-6 backdrop-blur min-[901px]:h-16 min-[901px]:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/#work"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2 transition-colors hover:text-accent"
        >
          <ArrowIcon className="mt-0 rotate-180 text-current" />
          Back
        </Link>
        <span aria-hidden className="h-3 w-px bg-line" />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent">
          Yahoo Partner Portal
        </span>
      </div>
      <nav className="hidden gap-8 text-xs leading-[18px] text-ink min-[901px]:flex">
        <Link href="/#hero" className="transition-colors hover:text-accent">
          Home
        </Link>
        <Link href="/#work" className="transition-colors hover:text-accent">
          Work
        </Link>
        <Link href="/#contact" className="transition-colors hover:text-accent">
          Contact
        </Link>
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-accent"
        >
          Resume
        </a>
      </nav>
    </header>
  );
}

/** Three static, decorative dots fixed to the viewport's left edge for the
 * whole case study, spread across the full height below the top bar — a
 * background-filled column so horizontally scrolling content never shows
 * through behind them. */
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

/** A persistent rule at the very bottom of the viewport, mirroring the top
 * bar's border to frame the whole case study. */
function BottomRule() {
  return (
    <div aria-hidden className="fixed inset-x-0 bottom-0 z-30 border-t border-line" />
  );
}

/** Small right-pointing arrow marking each metadata group — a stand-in for
 * the Figma "ArrowRight" icon component. */
function ArrowIcon({ className = "text-muted" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`mt-px shrink-0 ${className}`}
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small orange section number ("01", "02", ...) placed to the left of a
 * section's title — same pattern as the homepage's SectionNumber, adapted
 * for the horizontal-scroll case study (static, no scroll-spy). Positioned
 * against the title's FIRST line only (via an explicit `titleLineHeight`,
 * not the relative ancestor's full height), so a two-line title doesn't
 * pull the number down to the block's center. The +1.3px nudge corrects an
 * optical mismatch: Playfair Display's ink sits ~1.2–1.7px below its own
 * line-box center while DM Sans digits sit almost exactly on theirs, so
 * pure box-centering reads as the number sitting slightly high. */
function SectionNum({
  number,
  titleLineHeight,
}: {
  number: string;
  titleLineHeight: string;
}) {
  return (
    <span
      aria-hidden
      className="hidden w-10 -translate-y-1/2 text-sm font-bold text-accent min-[901px]:absolute min-[901px]:-left-16 min-[901px]:block"
      style={{ top: `calc((${titleLineHeight}) / 2 + 1.3px)` }}
    >
      {number}
    </span>
  );
}

/** Title and metadata sidebar together as one opening screen. The title
 * column sits flush against the track's own left padding — same as every
 * other block (Overview, Top Content, etc.) — rather than adding its own
 * extra indent on top of it, which is what was pushing it too far from the
 * rail dots. The metadata column's gap/width (300px / 295px) are the Figma
 * cover frame's literal pixel values, not scaled down — a narrower column
 * wraps the copy onto extra lines, which is what made it read as less
 * compact than the source. */
function CoverBlock() {
  return (
    <div
      className="cs-block"
      style={{ ["--w" as string]: "calc(76rem * var(--cs-scale, 1))" }}
    >
      <div className="flex flex-col gap-16 min-[901px]:flex-row min-[901px]:items-center min-[901px]:gap-0">
        <div className="flex w-full flex-col gap-2 min-[901px]:w-[calc(591px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold uppercase leading-[18px] text-accent">
              {meta.years}
            </p>
            <h1 className="display text-[2.75rem] leading-[1.1] text-ink min-[901px]:text-[4.875rem] min-[901px]:leading-[1.064]">
              {meta.title}
            </h1>
          </div>
          <p className="max-w-[calc(571px*var(--cs-scale,1))] text-lg leading-[29px] text-ink">
            {meta.subtitle}
          </p>
          <p className="cs-only-horizontal mt-10 flex items-center gap-3 text-sm text-ink-2">
            <span className="inline-block h-px w-10 bg-accent" />
            Scroll to move through the story
          </p>
        </div>

        <div className="w-full min-[901px]:ml-[calc(300px*var(--cs-scale,1))] min-[901px]:w-[calc(295px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <dl className="flex flex-col gap-5">
            {sidebar.groups.map((group) => (
              <div
                key={group.label}
                className="flex gap-[calc(21px*var(--cs-scale,1))]"
              >
                <ArrowIcon />
                <div className="flex flex-1 flex-col gap-2">
                  <dt className="text-xs font-extrabold uppercase leading-4 text-ink">
                    {group.label}
                  </dt>
                  <dd className="flex flex-col gap-2 text-xs leading-4 text-ink">
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
                <dt className="text-xs font-extrabold uppercase leading-4 text-ink">
                  Highlights
                </dt>
                <dd className="flex flex-col gap-2 text-xs leading-4 text-ink">
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
  body,
  width,
  accent,
  sectionNumber,
}: {
  heading?: string;
  body: string[];
  width?: string;
  accent?: boolean;
  sectionNumber?: string;
}) {
  return (
    <div
      className={`cs-block ${accent ? "border-l-2 border-accent pl-5" : ""}`}
      style={{ ["--w" as string]: width ?? "27rem" }}
    >
      {heading ? (
        <div className="relative mb-5">
          {sectionNumber ? (
            <SectionNum
              number={sectionNumber}
              titleLineHeight="clamp(1.6rem, 2.4vw, 2.25rem) * 1.04"
            />
          ) : null}
          <h2
            className={`display text-[clamp(1.6rem,2.4vw,2.25rem)] ${
              accent ? "text-accent" : "text-ink"
            }`}
            style={{ fontWeight: 700 }}
          >
            {heading}
          </h2>
        </div>
      ) : null}
      <div className="space-y-4 text-sm leading-[22px] text-ink-2">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function StatBlock({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "24rem" }}>
      <p className="display text-[clamp(4rem,9vw,7rem)] leading-none text-accent">
        {value}
      </p>
      <p className="mt-5 text-lg leading-snug text-ink">{label}</p>
      {note ? (
        <p className="mt-5 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function StatGroupBlock({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "44rem" }}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-10">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="display text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-accent">
              {stat.value}
            </p>
            <p className="mt-3 text-sm leading-snug text-ink">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The retrospective copy, the closing stats, and the outro combined into
 * one screen — matching the Figma layout exactly (three columns, no
 * section number). The columns share a vertical center via `items-center`
 * on the row itself, rather than replicating Figma's own canvas-specific
 * padding (which existed only to center content within its much taller
 * source frame — this track already centers each block automatically). */
function ClosingBlock({
  heading,
  body,
  stats,
}: {
  heading: string;
  body: string[];
  stats: { value: string; label: string }[];
}) {
  return (
    <div
      className="cs-block cs-anchor-687"
      style={{ ["--w" as string]: "calc(134.8125rem * var(--cs-scale, 1))" }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(293px*var(--cs-scale,1))]">
        <div className="flex w-full flex-col gap-4 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <h2
            className="display text-[28px] leading-none text-ink min-[901px]:text-[40px]"
            style={{ fontWeight: 700 }}
          >
            {heading}
          </h2>
          <div className="flex flex-col text-sm leading-[22px] text-ink-2">
            {body.map((p, i) => (
              <p key={i} className={i < body.length - 1 ? "mb-3" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex items-center gap-6 border-line py-5 ${i === 0 ? "border-y" : "border-b"}`}
            >
              <p className="flex-1 text-lg font-bold leading-[26px] text-ink">
                {stat.label}
              </p>
              <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[78px]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col min-[901px]:w-[calc(451px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="relative">
            <p className="absolute bottom-full mb-2 whitespace-nowrap text-sm font-bold uppercase text-accent">
              End of case study
            </p>
            <h2
              className="display text-[28px] leading-none text-ink min-[901px]:text-[40px]"
              style={{ fontWeight: 700 }}
            >
              Thank you for reading.
            </h2>
          </div>
          <div className="mt-4 flex flex-col gap-4 text-xs font-extrabold uppercase text-ink-2">
            <Link
              href="/"
              className="underline decoration-1 underline-offset-2 transition-colors hover:text-accent"
            >
              Back to homepage
            </Link>
            <a
              href="mailto:marcfavro@gmail.com"
              className="underline decoration-1 underline-offset-2 transition-colors hover:text-accent"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteBlock({
  text,
  attribution,
}: {
  text: string;
  attribution: string;
}) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "31rem" }}>
      <figure>
        <blockquote className="border-l-2 border-accent pl-6">
          <p className="display text-[clamp(1.5rem,2.3vw,2rem)] leading-[1.25] text-ink">
            {'"' + text + '"'}
          </p>
        </blockquote>
        <figcaption className="mt-6 pl-6 text-[0.8125rem] leading-relaxed text-muted">
          {attribution}
        </figcaption>
      </figure>
    </div>
  );
}

/** The Problem's copy, the 41% stat and the New York Post quote as one
 * vertical stack occupying a single stop on the horizontal track, rather
 * than three separate side-by-side stops. */
function IntroStackBlock({
  heading,
  body,
  stat,
  quote,
  sectionNumber,
}: {
  heading: string;
  body: string[];
  stat: { value: string; label: string };
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
            {sectionNumber ? (
              <SectionNum number={sectionNumber} titleLineHeight="41.6px" />
            ) : null}
            <h2
              className="display text-[28px] leading-none text-ink min-[901px]:text-[40px]"
              style={{ fontWeight: 700 }}
            >
              {heading}
            </h2>
          </div>
          <div className="text-sm leading-[22px] text-ink-2">
            {body.map((p, i) => (
              <p key={i} className={i === 0 ? "mb-4" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 border-y border-line py-5">
          <p className="flex-1 text-lg font-bold leading-[26px] text-ink">
            {stat.label}
          </p>
          <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[78px]">
            {stat.value}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <blockquote>
            <p className="text-lg font-bold leading-[26px] text-ink">
              {'"' + quote.text + '"'}
            </p>
          </blockquote>
          <p className="text-sm leading-[22px] text-ink-2">
            — {quote.attribution}
          </p>
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
  sectionNumber,
  expandedPoints,
}: {
  eyebrow: string;
  title: string;
  subhead?: string;
  body: string;
  bullets: { title: string; body: string }[];
  caption: string;
  pullQuotes?: { quote: string; attribution: string }[];
  pullQuotePosition?: "top" | "middle" | "bottom";
  sectionNumber?: string;
  expandedPoints?: { label: string; text: string }[];
}) {
  const position = pullQuotePosition ?? "bottom";
  const hasQuotes = Boolean(pullQuotes?.length);

  const renderQuotes = () =>
    pullQuotes?.map((pq) => (
      <div key={pq.quote} className="flex flex-col gap-2">
        <blockquote className="w-full border-l-2 border-accent pl-6 min-[901px]:w-[calc(375px*var(--cs-scale,1))]">
          <p className="text-sm font-semibold leading-snug text-ink">
            {'"' + pq.quote + '"'}
          </p>
        </blockquote>
        <p className="w-full pl-6 text-sm leading-[22px] text-ink-2 min-[901px]:w-[calc(375px*var(--cs-scale,1))]">
          — {pq.attribution}
        </p>
      </div>
    ));

  // Quotes always sit beside the panel, in their own fixed-width column —
  // never above or below it, and never affecting the panel's own size.
  // `pullQuotePosition` only controls where in that column they land
  // vertically: top-aligned, centered, or bottom-aligned.
  const justifyClass =
    position === "top"
      ? "justify-start"
      : position === "bottom"
        ? "justify-end"
        : "justify-center";

  // The panel is a fixed size — never flex-1 — so it stays identical
  // whether or not quotes are present, matching Figma's literal 857×609
  // placeholder frame exactly.
  const renderPanelArea = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 min-[901px]:flex-row min-[901px]:items-stretch">
        <MediaPlaceholder className="min-[901px]:w-[calc(857px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:self-start" />
        {hasQuotes ? (
          <div
            className={`flex flex-col gap-10 min-[901px]:w-[calc(907px*var(--cs-scale,1))] min-[901px]:shrink-0 ${justifyClass}`}
          >
            {renderQuotes()}
          </div>
        ) : null}
      </div>
      <div className="flex w-full justify-center min-[901px]:w-[calc(857px*var(--cs-scale,1))]">
        <p className="cs-caption text-center">{caption}</p>
      </div>
    </div>
  );

  return (
    <div
      className="cs-block cs-anchor-687"
      style={{
        ["--w" as string]: hasQuotes
          ? "calc(121.25rem * var(--cs-scale, 1))"
          : "calc(108.75rem * var(--cs-scale, 1))",
      }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))]">
        <div className="flex w-full flex-col gap-5 min-[901px]:w-[calc(19rem*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              {sectionNumber ? (
                <SectionNum number={sectionNumber} titleLineHeight="2.75rem * 1.04" />
              ) : null}
              <h2
                className="display text-[2rem] text-ink min-[901px]:text-[2.75rem]"
                style={{ fontWeight: 700 }}
              >
                {title}
              </h2>
            </div>
            <p className="pt-2 text-sm font-bold uppercase leading-snug tracking-wide text-ink">
              {eyebrow}
            </p>
          </div>
          {subhead ? (
            <p className="text-sm font-bold uppercase tracking-wide text-ink">
              {subhead}
            </p>
          ) : null}
          <p className="text-sm leading-[22px] text-ink-2">{body}</p>
          {expandedPoints ? (
            <ExpandCollapse points={expandedPoints} />
          ) : (
            <div className="flex flex-col gap-4">
              {bullets.map((bullet) => (
                <div key={bullet.title}>
                  <p className="text-sm font-medium text-ink">{bullet.title}</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-ink-2">
                    {bullet.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex w-full flex-col gap-6 ${hasQuotes ? "min-[901px]:w-[calc(99.25rem*var(--cs-scale,1))]" : "min-[901px]:w-[calc(86.75rem*var(--cs-scale,1))]"}`}
        >
          {renderPanelArea()}
        </div>
      </div>
    </div>
  );
}

function OutroBlock() {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "26rem" }}>
      <p className="eyebrow">End of case study</p>
      <p
        className="display mt-5 text-[clamp(1.75rem,3vw,2.5rem)] text-ink"
        style={{ fontWeight: 700 }}
      >
        Thanks for reading.
      </p>
      <div className="mt-8 flex flex-col gap-3 text-sm">
        <Link
          href="/#work"
          className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
        >
          Back to all work
        </Link>
        <a
          href="mailto:marcfavro@gmail.com"
          className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
        >
          Get in touch
        </a>
      </div>
    </div>
  );
}

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case "cover":
      return <CoverBlock key={i} />;
    case "copy":
      return (
        <CopyBlock
          key={i}
          heading={block.heading}
          body={block.body}
          width={block.width}
          accent={block.accent}
          sectionNumber={block.sectionNumber}
        />
      );
    case "stat":
      return (
        <StatBlock
          key={i}
          value={block.value}
          label={block.label}
          note={block.note}
        />
      );
    case "stat-group":
      return <StatGroupBlock key={i} stats={block.stats} />;
    case "quote":
      return (
        <QuoteBlock key={i} text={block.text} attribution={block.attribution} />
      );
    case "image":
      return (
        <div
          key={i}
          className="cs-block"
          style={{ ["--w" as string]: block.image.w }}
        >
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
          sectionNumber={block.sectionNumber}
          expandedPoints={block.expandedPoints}
        />
      );
    case "outro":
      return <OutroBlock key={i} />;
    case "closing":
      return (
        <ClosingBlock
          key={i}
          heading={block.heading}
          body={block.body}
          stats={block.stats}
        />
      );
  }
}

export default function YahooPartnerPortalPage() {
  return (
    <main className="bg-bg">
      <TopBar />

      <RailDots />

      <BottomRule />

      <HorizontalTrack>{blocks.map(renderBlock)}</HorizontalTrack>
    </main>
  );
}
