import type { Metadata } from "next";
import Link from "next/link";
import HorizontalTrack from "@/components/case-study/HorizontalTrack";
import { context, meta, sidebar } from "@/lib/headspace-umd";

export const metadata: Metadata = {
  title: `${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

const RESUME_URL =
  "https://drive.google.com/file/d/1eH-USxlLh24SYEIUtEZJGOLgwV_v7qrQ/view?usp=share_link";

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
          Headspace — Unified Enrollment
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
  return (
    <div aria-hidden className="fixed inset-x-0 bottom-0 z-30 border-t border-line" />
  );
}

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

function CoverBlock() {
  return (
    <div
      className="cs-block"
      style={{ ["--w" as string]: "calc(76rem * var(--cs-scale, 1))" }}
    >
      <div className="flex flex-col gap-16 min-[901px]:flex-row min-[901px]:items-center min-[901px]:gap-0">
        <div className="flex w-full flex-col gap-2 min-[901px]:w-[calc(591px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="flex flex-col gap-2">
            <p className="cs-kicker">{meta.years}</p>
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
              <div
                key={group.label}
                className="flex gap-[calc(21px*var(--cs-scale,1))]"
              >
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
                <dt className="cs-label">Highlights</dt>
                <dd className="flex flex-col gap-2 cs-meta">
                  {sidebar.highlights.map((h) => (
                    <p key={h}>{h}</p>
                  ))}
                </dd>
              </div>
            </div>
            <div className="flex gap-[calc(21px*var(--cs-scale,1))]">
              <ArrowIcon />
              <div className="flex flex-1 flex-col gap-2">
                <dt className="cs-label">Prototype</dt>
                <dd className="flex flex-col gap-2 cs-meta">
                  <a
                    href={sidebar.prototype.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent"
                  >
                    {sidebar.prototype.text}
                  </a>
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
}: {
  heading?: string;
  body: string[];
  width?: string;
}) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: width ?? "27rem" }}>
      {heading ? (
        <div className="relative mb-5">
          <h2
            className="display text-[clamp(1.6rem,2.4vw,2.25rem)]"
            style={{ fontWeight: 700 }}
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

function PrototypeEmbedBlock({ href }: { href: string }) {
  const embedSrc = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(href)}`;
  return (
    <div className="cs-block flex flex-col gap-4" style={{ ["--w" as string]: "52rem" }}>
      <p className="cs-section-title">Try the prototype</p>
      <iframe
        title="Headspace — Unified Enrollment prototype"
        src={embedSrc}
        className="aspect-[1440/900] w-full rounded-lg border border-line bg-white shadow-[0_18px_40px_-28px_rgba(25,23,19,0.45)]"
        allowFullScreen
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
      >
        Open in Figma →
      </a>
    </div>
  );
}

function ThankYouBlock() {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "26rem" }}>
      <p className="cs-kicker">The End</p>
      <h2
        className="display mt-2 whitespace-nowrap text-[28px] leading-none min-[901px]:text-[40px]"
        style={{ fontWeight: 700 }}
      >
        Thank you for reading.
      </h2>
      <div className="mt-6 flex flex-col gap-4 whitespace-nowrap text-xs font-extrabold uppercase text-ink-2">
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
  );
}

export default function HeadspaceUmdPage() {
  return (
    <main className="bg-bg">
      <TopBar />

      <RailDots />

      <BottomRule />

      <HorizontalTrack>
        <CoverBlock />
        <CopyBlock heading="Context" body={context} width="34rem" />
        <PrototypeEmbedBlock href={sidebar.prototype.href} />
        <ThankYouBlock />
      </HorizontalTrack>
    </main>
  );
}
