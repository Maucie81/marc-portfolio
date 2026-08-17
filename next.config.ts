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
};

export default nextConfig;
