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
      className={`flex aspect-[857/609] w-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-28px_rgba(25,23,19,0.45)] ${className}`}
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

function CoverBlock({ meta, sidebar }: { meta: Meta; sidebar: Sidebar }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "calc(76rem * var(--cs-scale, 1))" }}>
      <div className="flex flex-col gap-16 min-[901px]:flex-row min-[901px]:items-center min-[901px]:gap-0">
        <div className="flex w-full flex-col gap-2 min-[901px]:w-[calc(591px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="flex flex-col gap-2">
            {/* 503:55564 — company name, not the timeline. Its own styling
                (14px/18px Bold), not the shared .cs-kicker role (16px/24px
                SemiBold) also used by the "01"-style section numbers
                elsewhere on this page — those weren't part of this spec. */}
            <p className="text-[14px] font-bold uppercase leading-[18px] text-accent [font-family:var(--font-alt)]">
              {meta.company}
            </p>
            <h1 className="display text-[2.5rem] leading-[1.1] min-[901px]:text-[60px] min-[901px]:leading-[1.1]">
              {meta.title}
            </h1>
          </div>
          <p className="max-w-[calc(571px*var(--cs-scale,1))] text-sm leading-[24px] text-ink-2">
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
            <SectionNum number={sectionNumber} titleLineHeight="clamp(1.6rem, 2.4vw, 2.25rem) * 1.04" />
          ) : null}
          <h2
            className={`display text-[clamp(1.6rem,2.4vw,2.25rem)] ${accent ? "text-accent" : "text-ink"}`}
          >
            {heading}
          </h2>
        </div>
      ) : null}
      <div className="space-y-4 text-sm leading-[24px] text-ink-2">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
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
            <p className="mt-3 text-sm leading-[24px] text-ink-2">{stat.label}</p>
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
}: {
  heading: string;
  body: string[];
  stats: { value: string; label: string }[];
}) {
  const hasStats = stats.length > 0;
  return (
    <div
      className="cs-block cs-anchor-687"
      style={{
        ["--w" as string]: hasStats
          ? "calc(88.3125rem * var(--cs-scale, 1))"
          : "calc(35rem * var(--cs-scale, 1))",
      }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(293px*var(--cs-scale,1))]">
        <div className="flex w-full flex-col gap-4 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <h2 className="display text-[28px] leading-none min-[901px]:text-[40px]">{heading}</h2>
          <div className="flex flex-col text-sm leading-[24px] text-ink-2">
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
        <figcaption className="mt-6 pl-6 text-sm leading-[24px] text-ink-2">{attribution}</figcaption>
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
            {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="41.6px" /> : null}
            <h2 className="display text-[28px] leading-none min-[901px]:text-[40px]">{heading}</h2>
          </div>
          <div className="text-sm leading-[24px] text-ink-2">
            {body.map((p, i) => (
              <p key={i} className={i === 0 ? "mb-4" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 border-y border-line py-5">
          <p className="display -translate-y-[2.6px] shrink-0 text-[44px] leading-none text-accent min-[901px]:text-[60px]">
            {stat.value}
          </p>
          <p className="cs-quote flex-1">{stat.label}</p>
        </div>

        <div className="flex flex-col gap-2">
          <blockquote>
            <p className="cs-quote">{'"' + quote.text + '"'}</p>
          </blockquote>
          <p className="text-sm leading-[24px] text-ink-2">— {quote.attribution}</p>
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
  sectionNumber?: string;
  expandedPoints?: { label: string; text: string }[];
  brand: Brand;
}) {
  const position = pullQuotePosition ?? "bottom";
  const hasQuotes = Boolean(pullQuotes?.length);

  const renderQuotes = () =>
    pullQuotes?.map((pq) => (
      <div key={pq.quote} className="flex flex-col gap-2">
        <blockquote className="w-full border-l-2 border-accent pl-6 min-[901px]:w-[calc(375px*var(--cs-scale,1))]">
          <p className="cs-quote">{'"' + pq.quote + '"'}</p>
        </blockquote>
        <p className="w-full pl-6 text-sm leading-[24px] text-ink-2 min-[901px]:w-[calc(375px*var(--cs-scale,1))]">
          — {pq.attribution}
        </p>
      </div>
    ));

  const justifyClass =
    position === "top" ? "justify-start" : position === "bottom" ? "justify-end" : "justify-center";

  const renderPanelArea = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 min-[901px]:flex-row min-[901px]:items-stretch">
        <MediaPlaceholder
          brand={brand}
          className="min-[901px]:w-[calc(857px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:self-start"
        />
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
          <div className="-mt-2 flex flex-col gap-3 text-sm leading-[24px] text-ink-2">
            {(Array.isArray(body) ? body : [body]).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {expandedPoints ? (
            <ExpandCollapse points={expandedPoints} />
          ) : (
            <div className="flex flex-col gap-4">
              {bullets.map((bullet) => (
                <div key={bullet.title}>
                  <p className="cs-sub-label">{bullet.title}</p>
                  <p className="mt-1 text-sm leading-[24px] text-ink-2">{bullet.body}</p>
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

function renderBlock(block: Block, i: number, brand: Brand) {
  switch (block.kind) {
    case "cover":
      return null; // rendered separately by CaseStudyPage, which owns meta/sidebar
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
          sectionNumber={block.sectionNumber}
          expandedPoints={block.expandedPoints}
          brand={brand}
        />
      );
    case "closing":
      return <ClosingBlock key={i} heading={block.heading} body={block.body} stats={block.stats} />;
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
