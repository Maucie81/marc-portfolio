/**
 * Shared SVG filter defs, mounted once per page. Two filters:
 *
 * `comix-duotone` — collapses a continuous-tone image to true two-flat-ink
 * duotone (grayscale, then a 4-step DISCRETE transfer function per channel
 * from ink to paper — discrete steps are flat color bands with hard edges,
 * the opposite of a gradient, which is exactly how a two-color press
 * reproduces a photo/illustration). Used on the portrait so the one
 * continuous-tone asset on the page still complies with the system's own
 * "no screen tint" rule instead of contradicting it.
 *
 * `comix-roughen` — feTurbulence + feDisplacementMap, warps a clean vector
 * edge (a font glyph, a straight rule) into something closer to a wobbling
 * hand stroke. Applied sparingly (hand-lettered text, ink rules) — overused
 * it turns to mush.
 */
export default function ComixDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <filter id="comix-duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.141 0.405 0.669 0.933" />
            <feFuncG type="discrete" tableValues="0.114 0.384 0.654 0.925" />
            <feFuncB type="discrete" tableValues="0.067 0.337 0.608 0.878" />
          </feComponentTransfer>
        </filter>

        <filter id="comix-roughen" x="-15%" y="-40%" width="130%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06 0.14"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
      </defs>
    </svg>
  );
}
