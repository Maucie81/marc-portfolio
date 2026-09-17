import BackLink from "@/components/site/BackLink";
import ArrowIcon from "@/components/site/ArrowIcon";

/** The case-study "← Back" row, placed inside the content column on the
 * contact page instead of in the fixed header. (Coming-soon used to use it
 * too; that page now gets PersistentHeader's case-study top bar.) */
export default function BackBar({
  title,
  fallbackHref,
}: {
  title?: string;
  fallbackHref?: string;
}) {
  return (
    <div className="flex items-center gap-6 border-b border-line pb-3">
      <BackLink
        fallbackHref={fallbackHref}
        className="group flex items-center gap-1.5 text-sm font-medium leading-4 text-ink-strong transition-colors hover:text-accent [font-family:var(--font-display)]"
      >
        <ArrowIcon className="mt-0 rotate-180 text-current transition-transform group-hover:-translate-x-0.5" />
        Back
      </BackLink>
      {title ? (
        <span className="text-sm font-medium leading-4 text-accent [font-family:var(--font-display)]">
          {title}
        </span>
      ) : null}
    </div>
  );
}
