// Builds public/reference-library/full/<slug>.webp — the high-resolution
// copies the enlarged view shows — from the original Figma image fills.
//
//   node scripts/reference-library/build-full.mjs <dir>
//
// <dir> holds map.txt ("x y assetId" per tile, positions from the Figma
// Photos frame) and src/<assetId>.png (the fills, downloaded from the Figma
// MCP asset URLs). Some fills are stored sideways and rotated by Figma, so
// every rotation × crop is tried and the one that best matches the tile's
// existing (correctly oriented) thumbnail wins.
import sharp from "sharp";
import fs from "node:fs";

const S = process.argv[2];
const OUT = "public/reference-library/full";
const LONG = 1800;
const tiles = JSON.parse(fs.readFileSync("scripts/reference-library/tiles.json", "utf8")).tiles;
const map = fs
  .readFileSync(`${S}/map.txt`, "utf8")
  .trim()
  .split("\n")
  .map((l) => {
    const [x, y, id] = l.split(" ");
    return { x: +x, y: +y, id };
  });

function region(W, H, t, crop) {
  let x0, y0, x1, y1;
  if (crop) [x0, y0, x1, y1] = [crop[0] * W, crop[1] * H, crop[2] * W, crop[3] * H];
  else {
    const r = t.w / t.h;
    if (W / H > r) {
      const cw = H * r;
      [x0, x1, y0, y1] = [(W - cw) / 2, (W + cw) / 2, 0, H];
    } else {
      const ch = W / r;
      [x0, x1, y0, y1] = [0, W, (H - ch) / 2, (H + ch) / 2];
    }
  }
  const left = Math.max(0, Math.round(x0));
  const top = Math.max(0, Math.round(y0));
  return { left, top, width: Math.min(W - left, Math.round(x1 - x0)), height: Math.min(H - top, Math.round(y1 - y0)) };
}

const PW = 48, PH = 48;
const probe = (input) => sharp(input).flatten({ background: "#fff" }).resize(PW, PH, { fit: "fill" }).removeAlpha().raw().toBuffer();

const sizes = {};
for (const t of tiles) {
  const m = map.reduce((b, c) => (Math.hypot(c.x - t.x, c.y - t.y) < Math.hypot(b.x - t.x, b.y - t.y) ? c : b));
  const ref = await probe(`public/reference-library/${t.slug}.webp`);
  let best = null;
  for (const angle of [0, 90, 180, 270]) {
    const rotated = await sharp(`${S}/src/${m.id}.png`).rotate(angle).png().toBuffer();
    const { width: W, height: H } = await sharp(rotated).metadata();
    for (const crop of t.crop ? [t.crop, null] : [null]) {
      const r = region(W, H, t, crop);
      if (r.width < 2 || r.height < 2) continue;
      const px = await probe(await sharp(rotated).extract(r).png().toBuffer());
      let err = 0;
      for (let i = 0; i < px.length; i++) err += (px[i] - ref[i]) ** 2;
      if (!best || err < best.err) best = { err, angle, r, rotated };
    }
  }
  const s = Math.min(1, LONG / Math.max(best.r.width, best.r.height));
  const fw = Math.round(best.r.width * s), fh = Math.round(best.r.height * s);
  await sharp(best.rotated).extract(best.r).resize(fw, fh).flatten({ background: "#fff" }).webp({ quality: 80 }).toFile(`${OUT}/${t.slug}.webp`);
  sizes[t.slug] = [fw, fh];
  console.log(`${t.slug} rot=${best.angle} err=${Math.round(best.err / (PW * PH * 3))} ${fw}x${fh}`);
}
fs.writeFileSync(`${S}/full-sizes.json`, JSON.stringify(sizes));
