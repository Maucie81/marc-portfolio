/**
 * Personal-interests photo mosaic — Figma 499:52421. Ten tiles collaged at
 * exact pixel positions within a 1196×297 reference frame (converted to
 * percentages here so it scales fluidly with the section's own column
 * width instead of a fixed px size). All ten are still placeholder boxes
 * in Figma itself — bg #eaeae5, border #b0b0b0 (--line), radius 2px, no
 * image, no label — swap the `src` in each tile once real photos are ready.
 *
 * Below `lg` the collage would shrink past legibility (the frame is ~4:1),
 * so mobile/tablet gets a simple 2-column grid of the same tile styling
 * instead of the exact desktop geometry.
 */

type Tile = { left: number; top: number; width: number; height: number };

const TILES: Tile[] = [
  { left: 3.679, top: 47.475, width: 7.191, height: 52.525 },
  { left: 10.786, top: 0, width: 19.565, height: 100 },
  { left: 33.945, top: 47.475, width: 8.445, height: 52.525 },
  { left: 30.267, top: 78.451, width: 3.762, height: 21.549 },
  { left: 0, top: 86.532, width: 3.762, height: 13.468 },
  { left: 42.308, top: 17.172, width: 13.629, height: 82.828 },
  { left: 55.853, top: 45.455, width: 7.023, height: 54.545 },
  { left: 62.792, top: 70.034, width: 14.632, height: 29.966 },
  { left: 77.341, top: 21.212, width: 13.88, height: 78.788 },
  { left: 91.137, top: 39.057, width: 8.863, height: 60.943 },
];

const TILE_STYLE = "absolute rounded-[2px] border border-line bg-[#eaeae5]";

export default function InterestGallery() {
  return (
    <>
      <div
        aria-hidden
        className="relative hidden w-full lg:block"
        style={{ aspectRatio: "1196 / 297" }}
      >
        {TILES.map((tile, i) => (
          <div
            key={i}
            className={TILE_STYLE}
            style={{
              left: `${tile.left}%`,
              top: `${tile.top}%`,
              width: `${tile.width}%`,
              height: `${tile.height}%`,
            }}
          />
        ))}
      </div>

      <div aria-hidden className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
        {TILES.map((_, i) => (
          <div key={i} className={`${TILE_STYLE} static`} style={{ aspectRatio: "1 / 1" }} />
        ))}
      </div>
    </>
  );
}
