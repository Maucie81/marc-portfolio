import ScrollStrip, { type StripImage } from "@/components/site/ScrollStrip";
import { ORDERED_INTERESTS } from "@/lib/interests";

function humanize(file: string) {
  return file
    .replace(/\.[a-z]+$/i, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

// Adapts the real interest photos (already category-diversified, each carrying
// its intrinsic width/height) to the generic ScrollStrip. See ScrollStrip.tsx
// for the interaction; /lab/scroll-strip is the isolated placeholder demo.
const IMAGES: StripImage[] = ORDERED_INTERESTS.map((it) => ({
  src: `/interests/${it.file}`,
  aspect: it.width / it.height,
  alt: humanize(it.file),
}));

export default function InterestGallery() {
  return <ScrollStrip images={IMAGES} />;
}
