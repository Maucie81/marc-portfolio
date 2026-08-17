"use client";

import { useRef, useState, useCallback } from "react";

interface Props {
  points: Array<{ label: string; text: string }>;
}

export default function ExpandCollapse({ points }: Props) {
  const [expanded, setExpanded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const animRef = useRef<Animation | null>(null);

  const handleClick = useCallback(() => {
    const next = !expanded;
    setExpanded(next);

    // Cancel any in-progress spin before starting a new one
    animRef.current?.cancel();

    // Open:  0° → 405° (one full CW spin landing at 45° = ×)
    // Close: 45° → -360° (one full CCW spin landing at 0° = +)
    animRef.current = btnRef.current?.animate(
      [
        { transform: next ? "rotate(0deg)" : "rotate(45deg)" },
        { transform: next ? "rotate(405deg)" : "rotate(-360deg)" },
      ],
      {
        duration: 480,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        // fill:"none" so CSS takes over seamlessly after the spin —
        // 405° lands at 45° visually (×), -360° lands at 0° (+)
        fill: "none",
      }
    ) ?? null;
  }, [expanded]);

  return (
    <div className="-mt-2">
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        aria-expanded={expanded}
        className={`expand-glyph ${expanded ? "is-open" : ""}`}
      >
        <span className="expand-glyph-pulse">+</span>
      </button>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-[350ms] ease-out"
        style={{
          maxHeight: expanded ? "500px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="flex flex-col gap-4 pt-4">
          {points.map((point) => (
            <div key={point.label}>
              <p className="text-sm font-bold leading-[22px] text-ink">
                {point.label}
              </p>
              <p className="mt-1 text-sm leading-[22px] text-ink-2">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Color: no delay on close, delayed on open so it lands near end of spin */
        .expand-glyph {
          display: inline-block;
          font-size: 1.25rem;
          line-height: 1;
          font-weight: 500;
          color: var(--ink);
          transform-origin: center;
          transition: color 150ms ease;
        }

        .expand-glyph.is-open {
          transform: rotate(45deg);
          color: #ef5c2d;
          transition: color 150ms ease 330ms;
        }

        .expand-glyph-pulse {
          display: inline-block;
          animation: expand-glyph-pulse 2.2s ease-in-out infinite;
        }

        .expand-glyph:hover .expand-glyph-pulse,
        .expand-glyph.is-open .expand-glyph-pulse {
          animation-play-state: paused;
        }

        @keyframes expand-glyph-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}
