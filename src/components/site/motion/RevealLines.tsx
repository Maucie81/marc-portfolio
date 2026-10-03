import { Fragment, type ElementType } from "react";
import { MOTION, rv } from "@/lib/motion";

/**
 * A heading set as masked lines (.rv-line), one block span per line,
 * `stagger` ms apart from `start`. The spaces between the spans keep the
 * text reading as one phrase. `trigger` makes the heading its own
 * data-reveal="view" trigger; otherwise it plays with its nearest one.
 */
export default function RevealLines({
  lines,
  as: Tag = "p",
  start = 0,
  stagger = MOTION.stagger,
  dur,
  trigger = false,
  lineClassName = "",
  ...props
}: {
  lines: string[];
  as?: ElementType;
  start?: number;
  stagger?: number;
  dur?: number;
  trigger?: boolean;
  lineClassName?: string;
  id?: string;
  className?: string;
}) {
  return (
    <Tag {...props} data-reveal={trigger ? "view" : undefined}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span className={`rv-line block ${lineClassName}`} style={rv(start + i * stagger, { dur })}>
            {line}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
