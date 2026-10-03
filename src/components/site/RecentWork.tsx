import Image from "next/image";
import Link from "next/link";
import CtaArrow from "@/components/site/CtaArrow";
import type { Project } from "@/lib/home";

/* Panel geometry · Figma "Mockup" 215:210133 — 714 × 412, 12px corners.
   The graph paper is 23 × 15 cells (30 × 26.5 + 1px #ccc57c rules), so it's
   drawn as a fraction of the panel rather than a fixed pitch: the cell
   count stays the design's at every width. The halftone sheet sits over it
   at 40% multiply, turned 180° and softened 0.5px, as in the Figma. */
const PANEL_W = 714;
const PANEL_H = 412;
const GRID_LINE = "#ccc57c";

function MockupPanel({ project, eager }: { project: Project; eager: boolean }) {
  const { mockup } = project;
  const { box } = mockup;
  return (
    <div
      className="product-media relative isolate overflow-hidden rounded-[12px] bg-bg"
      style={{
        aspectRatio: `${PANEL_W} / ${PANEL_H}`,
        backgroundImage: [
          `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
        ].join(","),
        backgroundSize: "calc(100% / 23) calc(100% / 15)",
        boxShadow: `inset 0 0 0 1px ${GRID_LINE}`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rotate-180 opacity-40 mix-blend-multiply blur-[0.5px]"
        style={{ background: "url(/additional-work-texture.webp) center / cover no-repeat" }}
      />
      <Image
        src={mockup.src}
        alt={mockup.alt}
        width={mockup.width}
        height={mockup.height}
        // Served as exported: the optimizer's re-encode softens small UI type.
        unoptimized
        // The first card's panel is in the opening viewport at 1440 × 1024.
        priority={eager}
        className="absolute block max-w-none"
        style={{
          left: `${(box.x / PANEL_W) * 100}%`,
          top: `${(box.y / PANEL_H) * 100}%`,
          width: `${(box.w / PANEL_W) * 100}%`,
          height: `${(box.h / PANEL_H) * 100}%`,
          // The bezel's own 14px corners; the export's corners outside
          // them carry the page paper, so they're clipped off.
          borderRadius: `${(14.04 / box.w) * 100}% / ${(14.04 / box.h) * 100}%`,
        }}
      />
    </div>
  );
}

/** Platform design • Research • … — Roboto Mono 10/20 in accent with a
 * Google Sans 14px "•" between, under the panel (215:210859). Right-aligned
 * under a right-hand panel, left-aligned under a left-hand one. */
function SkillTags({
  skills,
  align,
  overhang,
}: {
  skills: string[];
  align: "start" | "end";
  overhang: boolean;
}) {
  return (
    <ul
      aria-label="Project focus"
      className={`flex flex-wrap items-center gap-x-2.5 pb-1 pt-2 ${align === "end" ? "lg:justify-end" : ""} ${
        overhang ? "lg:-mb-2.5" : ""
      }`}
    >
      {skills.map((skill, i) => (
        <li key={skill} className="flex items-center gap-2.5">
          {i > 0 ? (
            <span aria-hidden className="text-[14px] leading-none text-accent">
              •
            </span>
          ) : null}
          <span className="whitespace-nowrap text-[10px] leading-5 text-accent [font-family:var(--font-mono),ui-monospace,monospace]">
            {skill}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProjectCta({ project, className }: { project: Project; className: string }) {
  return project.href ? (
    <Link href={project.href} className={`cta self-start justify-self-start ${className}`}>
      Project Preview
      <CtaArrow />
    </Link>
  ) : null;
}

/* The Figma's own line breaks, from 1280px up — the width its columns are
   drawn at. Narrower, the lines run on and wrap to the column. */
function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <span key={i} className="xl:block">
      {i > 0 ? " " : null}
      {line}
    </span>
  ));
}

/**
 * One Recent work card · Figma "Project Card" 215:210119 / 215:210869 /
 * 215:211653. 379px of copy and a 714px panel with a 32px gutter, the
 * panel alternating sides card to card. Copy is ~25–30% of the row.
 */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const mediaLeft = project.media === "left";
  const panel = <MockupPanel project={project} eager={index === 0} />;

  return (
    <article
      id={`work-${project.company.toLowerCase()}`}
      className={`grid scroll-mt-[116px] gap-y-5 lg:scroll-mt-[90px] lg:gap-x-8 lg:gap-y-0 ${
        mediaLeft
          ? "lg:grid-cols-[minmax(0,714fr)_minmax(0,379fr)]"
          : "lg:grid-cols-[minmax(0,379fr)_minmax(0,714fr)]"
      }`}
    >
      {/* Project Info · 215:210120 — company 16 Medium, title 20 Bold,
          description 14/22, 20px to the CTA — one lockup at every width
          (above the panel when stacked). The first card's copy tops
          out against its panel; the others center on their 402px info box
          — the panel's height less 10px, i.e. 32px clear of the bottom of
          their 434px frame (see the tag row's overhang below). */}
      <div
        className={`flex flex-col gap-5 lg:row-start-1 ${
          mediaLeft ? "lg:col-start-2" : "lg:col-start-1"
        } ${project.copyAlign === "center" ? "lg:mb-8 lg:self-center" : "lg:self-start"}`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-medium tracking-[-0.01em] text-muted">
              {project.company}
            </p>
            <h3 className="text-[20px] font-bold tracking-[-0.01em] text-ink-deep">
              {project.title}
            </h3>
          </div>
          <p className="max-w-[375px] text-[14px] leading-[22px] text-ink-2">
            <Lines lines={project.description} />
          </p>
        </div>
        <ProjectCta project={project} className="inline-flex mb-3 lg:mb-0" />
      </div>

      {/* Panel + its metadata row. The whole panel opens the case study. */}
      <div className={`lg:row-start-1 ${mediaLeft ? "lg:col-start-1" : "lg:col-start-2"}`}>
        {project.href ? (
          <Link
            href={project.href}
            aria-label={`Open the ${project.company} ${project.title} case study`}
            className="block rounded-[12px] transition-opacity hover:opacity-90"
          >
            {panel}
          </Link>
        ) : (
          panel
        )}
        {/* Figma's second and third card frames are 434px tall, so their
            32px tag row overhangs the frame by 10px — and the next card
            and the section's bottom padding are measured from the frame. */}
        <SkillTags
          skills={project.skills}
          align={mediaLeft ? "start" : "end"}
          overhang={index > 0}
        />
      </div>
    </article>
  );
}

export default function RecentWork({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col gap-20 lg:gap-[160px]">
      {projects.map((project, i) => (
        <ProjectCard key={project.company + project.title} project={project} index={i} />
      ))}
    </div>
  );
}
