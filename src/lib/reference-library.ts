// The reference-library contact sheet, tile for tile as the Figma lays it
// out (Photos frame 263:280507, Portfolio-Playground): 1124 Figma px wide and
// SHEET_HEIGHT tall, scrolled vertically inside its window. Positions come
// from scripts/reference-library/tiles.json, which also holds each photo's
// crop; the files in public/reference-library/ are those crops at 2x these
// sizes. Listed top to bottom, left to right — the reading order; `z` is
// the paint order.

export type LibraryTile = {
  slug: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Stacking order — the tile's Figma layer index. Some tiles overlap
   * their neighbours, and each one's white outline paints over whatever
   * sits below it, exactly as the Figma stacks them. */
  z: number;
};

export const SHEET_WIDTH = 1124;
/** Figma: every tile has an 11.315px white stroke outside its edge. */
export const TILE_OUTLINE = 11.315;

export const SHEET_HEIGHT = 4461.11;

export const LIBRARY_TILES: LibraryTile[] = [
  { slug: "badlands", alt: "Eroded desert badlands ridges in warm afternoon light", x: 0, y: 0, w: 372.15, h: 234.24, z: 1 },
  { slug: "richter-overpainted-photo", alt: "Gerhard Richter overpainted photograph, smeared orange, yellow and green over a landscape", x: 384.72, y: 0, w: 173.82, h: 124.81, z: 2 },
  { slug: "riso-master-roller", alt: "Risograph ME-9450 master roller print with a robot illustration", x: 568.6, y: 0, w: 175.39, h: 265.91, z: 71 },
  { slug: "superman-protest", alt: "Protester dressed as Superman holding an anti-fascism sign in Times Square", x: 756.25, y: 0, w: 256.25, h: 341.66, z: 17 },
  { slug: "blue-bull-riso", alt: "Risograph print of a blue bull in blue, pink and yellow", x: 1014.62, y: 0, w: 109.38, h: 341.35, z: 31 },
  { slug: "cape-buffalo", alt: "Cape buffalo grazing in tall grass beside white egrets", x: 383.78, y: 136.73, w: 173.5, h: 97.12, z: 7 },
  { slug: "dungeon-crawler-carl", alt: "Dungeon Crawler Carl by Matt Dinniman, book cover", x: 0, y: 246.11, w: 225.37, h: 339.46, z: 4 },
  { slug: "robyn-honey", alt: "Robyn, Honey album cover", x: 236.68, y: 246.11, w: 320.11, h: 143.55, z: 29 },
  { slug: "cochemea", alt: "Cochemea album cover with a red saxophone and roses", x: 570.49, y: 277.23, w: 173.82, h: 173.82, z: 5 },
  { slug: "de-kooning", alt: "Willem de Kooning abstract painting in orange, pink and green", x: 757.19, y: 354.55, w: 366.81, h: 230.08, z: 6 },
  { slug: "refinery-dusk", alt: "Refinery lights glowing against a pink and blue dusk sky", x: 236.68, y: 400.76, w: 320.6, h: 184.82, z: 9 },
  { slug: "open-road", alt: "Two-lane road curving across open plains toward distant mountains", x: 568.6, y: 462.99, w: 175.39, h: 122.58, z: 12 },
  { slug: "snow-hut", alt: "Dark wooden structure half-buried in snow on a hillside", x: 0, y: 597.83, w: 218.75, h: 206.52, z: 8 },
  { slug: "riso-swatches", alt: "Risograph color swatch chart in green, pink and yellow", x: 229.14, y: 597.83, w: 325.01, h: 206.71, z: 42 },
  { slug: "printed-book-spreads", alt: "Two spreads from a printed book with orange and green plates", x: 566.28, y: 597.83, w: 557.72, h: 181.85, z: 33 },
  { slug: "just-kids", alt: "Just Kids by Patti Smith, book cover", x: 946.72, y: 760.96, w: 177.15, h: 270.82, z: 3 },
  { slug: "golden-gate-dog", alt: "Black-and-white photo of a dog on a beach with the Golden Gate Bridge behind", x: 566.71, y: 790.19, w: 368.7, h: 206.51, z: 11 },
  { slug: "overpass", alt: "Black-and-white view looking up at curving highway overpasses", x: 0, y: 816.6, w: 566.72, h: 338.52, z: 10 },
  { slug: "family-portrait", alt: "Large family portrait outdoors among palm trees", x: 566.71, y: 1008.96, w: 362.09, h: 246.11, z: 41 },
  { slug: "screw-magazine", alt: "Screw magazine cover with a black-and-white portrait", x: 942.01, y: 1037.25, w: 181.99, h: 215.94, z: 70 },
  { slug: "canyon-road", alt: "Car driving down a dirt road through a rocky canyon", x: 0, y: 1167.38, w: 372.15, h: 248.13, z: 13 },
  { slug: "house-illustration", alt: "Illustration of a small orange house under a large yellow sun", x: 385.67, y: 1167.38, w: 169.73, h: 169.73, z: 14 },
  { slug: "fleet-foxes", alt: "Fleet Foxes, Helplessness Blues album cover", x: 566.71, y: 1267.33, w: 312.12, h: 330.03, z: 15 },
  { slug: "triple-a-poster", alt: "Framed poster of three stretched lowercase a letterforms fading to purple", x: 890.15, y: 1268.27, w: 233.57, h: 326.65, z: 34 },
  { slug: "fruit-fly", alt: "Fruit Fly by Josh Silver, book cover", x: 385.67, y: 1348.42, w: 169.83, h: 261.98, z: 16 },
  { slug: "mad-magazine", alt: "MAD magazine cover art of caricatured figures", x: 0, y: 1427.63, w: 372.46, h: 248.94, z: 32 },
  { slug: "glacial-lake", alt: "Glacial lake beneath snow-dusted mountains and low clouds", x: 566.71, y: 1608.68, w: 557.29, h: 340.41, z: 19 },
  { slug: "dog-on-stairs", alt: "Brown dog smiling on a carpeted staircase", x: 385.67, y: 1622.82, w: 169.73, h: 252.71, z: 18 },
  { slug: "coneflowers", alt: "White coneflowers in bloom", x: 0, y: 1688.83, w: 372.94, h: 186.94, z: 35 },
  { slug: "camper-night", alt: "Camper van under a starry night sky", x: 0, y: 1887.79, w: 338.52, h: 298.92, z: 57 },
  { slug: "half-dome-postcard", alt: "Vintage postcard of Half Dome seen from Glacier Point", x: 349.84, y: 1887.79, w: 205.56, h: 298.92, z: 56 },
  { slug: "mountain-highway", alt: "Semi truck on a highway with a snow-capped mountain behind", x: 566.71, y: 1960.4, w: 222.54, h: 166.9, z: 20 },
  { slug: "magnetic-fields", alt: "The Magnetic Fields, Love at the Bottom of the Sea album cover", x: 801.51, y: 1960.4, w: 166.9, h: 166.9, z: 36 },
  { slug: "standing-desk-cartoon", alt: "Cartoon of two chained galley rowers captioned “You were right—I do feel more productive standing.”", x: 981.61, y: 1962.29, w: 142.39, h: 165.02, z: 37 },
  { slug: "market-street", alt: "Narrow market street lined with signs and awnings", x: 567.66, y: 2138.62, w: 556.34, h: 413.01, z: 23 },
  { slug: "marsh-sunset", alt: "Orange sunset reflected in a marsh", x: 0, y: 2198.02, w: 89.42, h: 67.07, z: 38 },
  { slug: "evergreen-sky", alt: "Clouds and blue sky framed by dark evergreen branches", x: 100.9, y: 2198.02, w: 245.92, h: 386.91, z: 39 },
  { slug: "line-figure", alt: "Black line illustration of a figure in a suit", x: 357.38, y: 2198.02, w: 197.99, h: 386.67, z: 28 },
  { slug: "masked-face-poster", alt: "Poster illustration of a masked face with fruit and fangs in red, green and pink", x: 0, y: 2276.29, w: 89.74, h: 188.27, z: 40 },
  { slug: "neil-young", alt: "Neil Young with Crazy Horse, Everybody Knows This Is Nowhere album cover", x: 0, y: 2477.14, w: 89.58, h: 107.5, z: 55 },
  { slug: "flycatcher", alt: "Illustration of an olive-sided flycatcher on orange paper", x: 566.71, y: 2562.95, w: 248.94, h: 211.22, z: 44 },
  { slug: "bonsai", alt: "Bonsai tree in dappled light", x: 799.62, y: 2562.95, w: 324.2, h: 367.95, z: 43 },
  { slug: "dog-library", alt: "Red Dog Library box of books on a sidewalk", x: 413.01, y: 2584.63, w: 142.27, h: 189.69, z: 21 },
  { slug: "wooden-troll", alt: "Carved wooden troll sculpture in a forest", x: 184.82, y: 2592.18, w: 211.22, h: 338.52, z: 22 },
  { slug: "babe-the-blue-ox", alt: "Statue of a giant blue ox with white horns", x: 0, y: 2597.84, w: 172.56, h: 211.22, z: 24 },
  { slug: "red-label", alt: "Hand holding a red printed label with a white circle mark", x: 414.9, y: 2786.43, w: 400.76, h: 144.27, z: 45 },
  { slug: "dog-in-car", alt: "Dog peeking out from behind houseplants in a car", x: 0, y: 2822.26, w: 172.56, h: 231.02, z: 27 },
  { slug: "patchwork-fields", alt: "Aerial view of patchwork farm fields", x: 184.82, y: 2942.96, w: 327.23, h: 245.15, z: 25 },
  { slug: "bo-kaap", alt: "Pink and green row houses with parked cars on the street", x: 527.11, y: 2942.96, w: 327.02, h: 245.31, z: 26 },
  { slug: "concert", alt: "Concert crowd under red stage lights", x: 863.74, y: 2942.96, w: 260.26, h: 195.19, z: 46 },
  { slug: "behance-screenshot", alt: "Phone screenshot of a Behance portfolio with pastel device mockups", x: 0, y: 3065.54, w: 172.56, h: 246.11, z: 49 },
  { slug: "demon-copperhead", alt: "Demon Copperhead by Barbara Kingsolver, book cover", x: 863.74, y: 3149.46, w: 260.26, h: 389.44, z: 47 },
  { slug: "famous-monsters", alt: "Wheat-pasted Famous Monsters magazine posters", x: 185.76, y: 3199.44, w: 254.6, h: 339.46, z: 50 },
  { slug: "reservoir-painting", alt: "Aerial painting of a white reservoir surrounded by fields", x: 429.04, y: 3199.44, w: 425.24, h: 339.49, z: 48 },
  { slug: "axe-illustration", alt: "Illustration of a person swinging an axe while sitting on a tree branch", x: 0, y: 3323.91, w: 172.69, h: 130.03, z: 51 },
  { slug: "say-nothing", alt: "Say Nothing by Patrick Radden Keefe, book cover", x: 0, y: 3466.3, w: 199.85, h: 299.01, z: 30 },
  { slug: "port-cranes", alt: "Shipping cranes at a port under a blue sky", x: 750.59, y: 3550.22, w: 372.94, h: 215.27, z: 52 },
  { slug: "citrus-juicer", alt: "Green citrus juicer on a blue background", x: 185.76, y: 3551.16, w: 320.6, h: 214.06, z: 54 },
  { slug: "all-things-must-pass", alt: "George Harrison, All Things Must Pass album cover", x: 518.62, y: 3551.16, w: 219.71, h: 214.05, z: 53 },
  { slug: "lighthouse", alt: "Lighthouse on a misty coastal bluff", x: 0, y: 3777.47, w: 448.11, h: 298.78, z: 61 },
  { slug: "back-to-the-beach", alt: "Back to the Beach movie poster", x: 460.16, y: 3777.47, w: 239.71, h: 359.91, z: 63 },
  { slug: "yosemite-map", alt: "Illustrated map of Yosemite Valley", x: 707.21, y: 3777.47, w: 218.8, h: 167.82, z: 59 },
  { slug: "at-home-comic", alt: "Black-and-white comic page titled At Home", x: 937.3, y: 3777.47, w: 186.71, h: 245.17, z: 58 },
  { slug: "open-comic-book", alt: "Hands holding an open comic book against a blue background", x: 712.87, y: 3957.57, w: 212.16, h: 180.1, z: 64 },
  { slug: "tomorrow-and-tomorrow", alt: "Tomorrow, and Tomorrow, and Tomorrow by Gabrielle Zevin, book cover", x: 936.91, y: 4034.9, w: 187.09, h: 284.18, z: 60 },
  { slug: "risograph-test-chart", alt: "Risograph test chart with color swatches", x: 0, y: 4088.64, w: 232.08, h: 372.29, z: 62 },
  { slug: "giraffe", alt: "Giraffe against a cloudy sky", x: 243.28, y: 4088.64, w: 203.66, h: 185.77, z: 65 },
  { slug: "risograph-portrait-poster", alt: "Risograph poster of a person in a red bucket hat", x: 460.16, y: 4148.99, w: 464.88, h: 312.12, z: 66 },
  { slug: "owl-guide", alt: "Oregon Caves National Monument owl guide with ink illustrations", x: 243.28, y: 4286.66, w: 204.7, h: 174.38, z: 67 },
  { slug: "mountain-print", alt: "Blue print of a mountain valley on cream paper", x: 1037.25, y: 4331.65, w: 86.57, h: 129.46, z: 69 },
  { slug: "dog-on-trail", alt: "Brown dog in a harness standing on a forest trail", x: 936.35, y: 4331.72, w: 90.38, h: 129.39, z: 68 },
];
