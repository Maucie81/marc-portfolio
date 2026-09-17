export type InterestCategory =
  | "art"
  | "book"
  | "album"
  | "nature"
  | "people"
  | "pet"
  | "urban"
  | "illustration"
  | "misc"
  | "movie";

export type InterestImage = {
  file: string;
  category: InterestCategory;
  width: number;
  height: number;
};

/** Sourced from `/Users/marcfavro/Documents/Design/Portfolio (2026)/Personal
 * Intrest Images`, resized to 480px tall (2x export for a 240px display
 * height) with variable width — no crop, no pad. Files live in
 * `public/interests`. Categorized by eye so the strip below can keep
 * same-category images from landing back to back. */
const INTERESTS: InterestImage[] = [
  { file: "richter-abstract.jpg", category: "art", width: 668, height: 480 },
  { file: "just-kids.jpg", category: "book", width: 314, height: 480 },
  { file: "demon-copperhead.jpg", category: "book", width: 319, height: 480 },
  { file: "zabriskie-point.jpg", category: "nature", width: 720, height: 480 },
  { file: "all-things-must-pass.jpg", category: "album", width: 480, height: 480 },
  { file: "ace-cover.jpg", category: "book", width: 318, height: 480 },
  { file: "cochemea.jpg", category: "album", width: 480, height: 480 },
  { file: "de-kooning.jpg", category: "art", width: 615, height: 480 },
  { file: "family-portrait.jpg", category: "people", width: 720, height: 480 },
  { file: "water-buffalo.jpg", category: "nature", width: 720, height: 480 },
  { file: "giraffe-snow.jpg", category: "nature", width: 312, height: 480 },
  { file: "snow-shelter.jpg", category: "nature", width: 600, height: 480 },
  { file: "port-cranes.jpg", category: "urban", width: 815, height: 480 },
  { file: "refinery-dusk.jpg", category: "urban", width: 672, height: 480 },
  { file: "highway-overpass.jpg", category: "urban", width: 790, height: 480 },
  { file: "golden-gate-dog.jpg", category: "pet", width: 853, height: 480 },
  { file: "desert-road.jpg", category: "nature", width: 720, height: 480 },
  { file: "coastal-lighthouse.jpg", category: "nature", width: 720, height: 480 },
  { file: "ridge-sunset.jpg", category: "nature", width: 720, height: 480 },
  { file: "canyon-road.jpg", category: "nature", width: 720, height: 480 },
  { file: "night-camper.jpg", category: "nature", width: 720, height: 480 },
  { file: "house-illustration.jpg", category: "illustration", width: 480, height: 480 },
  { file: "fleet-foxes.jpg", category: "album", width: 480, height: 480 },
  { file: "fruit-fly.jpg", category: "book", width: 311, height: 480 },
  { file: "street-mural.jpg", category: "people", width: 360, height: 480 },
  { file: "dog-stairs.jpg", category: "pet", width: 344, height: 480 },
  { file: "robot-pet-comic.jpg", category: "illustration", width: 421, height: 480 },
  { file: "glacier-lake.jpg", category: "nature", width: 640, height: 480 },
  { file: "dog-forest.jpg", category: "pet", width: 360, height: 480 },
  { file: "wing-view.jpg", category: "misc", width: 640, height: 480 },
  { file: "marsh-sunset.jpg", category: "nature", width: 640, height: 480 },
  { file: "mountain-drive.jpg", category: "nature", width: 640, height: 480 },
  { file: "bonsai.jpg", category: "nature", width: 423, height: 480 },
  { file: "forest-peak.jpg", category: "nature", width: 360, height: 480 },
  { file: "coneflowers.jpg", category: "nature", width: 853, height: 480 },
  { file: "aaa-design.jpg", category: "misc", width: 360, height: 480 },
  { file: "tiny-library.jpg", category: "misc", width: 360, height: 480 },
  { file: "garden-gnome.jpg", category: "misc", width: 270, height: 480 },
  { file: "track-aerial.jpg", category: "urban", width: 601, height: 480 },
  { file: "night-market.jpg", category: "people", width: 360, height: 480 },
  { file: "blue-bull-statue.jpg", category: "misc", width: 395, height: 480 },
  { file: "farmland-aerial.jpg", category: "nature", width: 641, height: 480 },
  { file: "colorful-houses.jpg", category: "urban", width: 640, height: 480 },
  { file: "dog-car.jpg", category: "pet", width: 360, height: 480 },
  { file: "spiral-staircase.jpg", category: "urban", width: 360, height: 480 },
  { file: "concert-lights.jpg", category: "people", width: 640, height: 480 },
  { file: "abstract-macro.jpg", category: "misc", width: 270, height: 480 },
  { file: "walking-illustration.png", category: "illustration", width: 221, height: 480 },
  { file: "magnetic-fields.jpg", category: "album", width: 480, height: 480 },
  { file: "movie-poster.jpg", category: "movie", width: 350, height: 480 },
  { file: "neil-young.jpg", category: "album", width: 471, height: 480 },
  { file: "bad-ideas-illustration.jpg", category: "illustration", width: 686, height: 480 },
  { file: "red-rising.jpg", category: "book", width: 319, height: 480 },
  { file: "robyn-honey.jpg", category: "album", width: 1070, height: 480 },
  { file: "say-nothing.jpg", category: "book", width: 320, height: 480 },
  { file: "sin-titulo.jpg", category: "art", width: 270, height: 480 },
  { file: "thiebaud-painting.jpg", category: "art", width: 409, height: 480 },
  { file: "newyorker-happiness.jpg", category: "illustration", width: 720, height: 480 },
  { file: "tomorrow-x3.jpg", category: "book", width: 316, height: 480 },
];

/** Deterministic PRNG (mulberry32) — fixed seed so the shuffle below is
 * identical on every render, server and client. A real Math.random() shuffle
 * would desync SSR from hydration. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Orders images so the same category never lands two-in-a-row (no outdoor
 * shots back to back, no two book covers back to back, etc). Greedy: always
 * place from whichever remaining category has the most images left, skipping
 * only the category just placed. That's guaranteed to succeed as long as no
 * single category exceeds half the total — true here by a wide margin
 * (nature, the biggest bucket, is 16 of 59).
 */
function diversify(items: InterestImage[]): InterestImage[] {
  const shuffled = seededShuffle(items, 42);
  const buckets = new Map<InterestCategory, InterestImage[]>();
  for (const item of shuffled) {
    const bucket = buckets.get(item.category);
    if (bucket) bucket.push(item);
    else buckets.set(item.category, [item]);
  }

  const order: InterestImage[] = [];
  let last: InterestCategory | null = null;

  for (let i = 0; i < shuffled.length; i++) {
    const candidates = [...buckets.entries()]
      .filter(([, arr]) => arr.length > 0)
      .sort((a, b) => b[1].length - a[1].length);

    const [category, bucket] =
      candidates.find(([cat]) => cat !== last) ?? candidates[0];

    order.push(bucket.shift()!);
    last = category;
  }

  return order;
}

export const ORDERED_INTERESTS: InterestImage[] = diversify(INTERESTS);
