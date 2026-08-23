import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is a stray package.json in the home directory, so Next infers a
  // workspace root above this project and intermittently fails to resolve
  // `tailwindcss` (CSS silently drops out on some loads). Pin it here.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  outputFileTracingRoot: path.resolve(process.cwd()),
  devIndicators: false,
  // Confirmed via two separate `next build && next start` runs: the
  // homepage → case-study page transition fades in cleanly exactly once in
  // production. In `next dev`, React 18 StrictMode deliberately
  // double-invokes render (a dev-only diagnostic, normally invisible), but
  // Framer Motion's declarative `animate` prop triggers directly off that
  // render pass with no cancel-first guard, so the second render pass
  // genuinely starts a second overlapping enter animation on top of the
  // first — visible as a fade-in that disappears and reappears. That never
  // reaches production, but it's what local dev testing was actually
  // showing. Off here so what you see in `next dev` matches production.
  reactStrictMode: false,
};

export default nextConfig;
