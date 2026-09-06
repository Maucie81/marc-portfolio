import type { CSSProperties, ElementType } from "react";

/**
 * A heavy condensed display face (Anton) reads as confident but perfectly
 * mechanical on its own — the "hand-cut, slightly unhinged" masthead
 * quality in the brief comes from irregular per-word placement, not the
 * letterforms. Rotation/baseline jitter is a fixed sequence keyed off word
 * index (not random per render) so server and client markup match exactly.
 */
const JITTER = [-2.2, 1.6, -0.8, 2.4, -1.4, 0.6, -2.8, 1.2];

export default function HandLetter({
  text,
  as: Tag = "span",
  className = "",
  jitterAmount = 1,
  style,
  ...rest
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** 0 = perfectly square (use for a word that must stay legible/aligned), 1 = full jitter. */
  jitterAmount?: number;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} style={style} {...rest}>
      {words.map((word, i) => {
        const rotate = JITTER[i % JITTER.length] * jitterAmount;
        const wordStyle: CSSProperties = {
          display: "inline-block",
          transform: `rotate(${rotate}deg)`,
        };
        // The trailing space is a plain sibling text node, not content
        // inside the inline-block span — a space at the end of an
        // inline-block's own content gets trimmed by the browser (it reads
        // as "end of line" inside that box), which was silently collapsing
        // "MARC FAVRO" into "MARCFAVRO".
        return (
          <span key={i}>
            <span style={wordStyle}>{word}</span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
