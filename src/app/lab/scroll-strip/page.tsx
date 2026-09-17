import ScrollStrip, { type StripImage } from "@/components/site/ScrollStrip";

// ~20 portrait placeholders with deliberately varied aspect ratios, so the
// per-image peak (each card magnifies toward its OWN ratio) is visible. Real
// images get swapped in later — the component only needs {src, aspect}.
const ASPECTS = [
  0.66, 0.75, 0.55, 0.7, 0.62, 0.8, 0.5, 0.68, 0.72, 0.58,
  0.64, 0.77, 0.53, 0.69, 0.6, 0.74, 0.56, 0.71, 0.65, 0.79,
];

const IMAGES: StripImage[] = ASPECTS.map((aspect, i) => {
  const h = 900;
  const w = Math.round(h * aspect);
  return {
    src: `https://picsum.photos/seed/strip-${i}/${w}/${h}`,
    aspect,
    alt: `Placeholder ${i + 1}`,
  };
});

export default function ScrollStripLabPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-[#f4f4f2]">
      <ScrollStrip images={IMAGES} />
      <p className="mt-6 px-8 font-mono text-sm uppercase tracking-wide text-ink-2">
        Scroll Strip
      </p>
    </main>
  );
}
