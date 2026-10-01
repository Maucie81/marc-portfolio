import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DM_Sans, Roboto_Mono } from "next/font/google";
import PageTransition from "@/components/site/PageTransition";
import PersistentHeader from "@/components/site/PersistentHeader";
import NoiseOverlay from "@/components/site/NoiseOverlay";
import ProofNotes from "@/components/proof/ProofNotes";
import { ProofProvider } from "@/components/proof/ProofProvider";
import "./globals.css";

// Google Sans Flex isn't in next/font/google's generated catalog yet, even
// though the Google Fonts API now serves it — self-hosted here from the same
// CDN (fonts.gstatic.com) instead. It's a true variable font (weight axis
// 300–800 in one file), matching the Figma reference's GRAD/ROND/wdth axes.
// Most text layers in the Figma file use this typeface — nav, labels, links
// (--font-alt) — but not all of them: body copy (499:54547) and the meta-data
// role (543:114278, tag/skill lists) are set in Roboto Mono, confirmed via
// get_design_context on both nodes. Loaded separately below as --font-mono
// and consumed by .t-body/.t-meta-sm in globals.css.
const googleSansFlex = localFont({
  src: "./fonts/google-sans-flex.woff2",
  variable: "--font-display",
  weight: "300 800",
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  // 700 for the hero ledger's company labels (Figma 106:209338).
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// The address share-card links are built on. www is the primary domain on
// Vercel (marcfavro.com 308s to it), so production names it outright —
// Vercel's own VERCEL_PROJECT_PRODUCTION_URL picks the shortest domain,
// which is the redirecting apex.
const SITE_URL =
  process.env.VERCEL_ENV === "production"
    ? "https://www.marcfavro.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

// Link previews: the card image is opengraph-image.jpg / twitter-image.jpg
// beside this file (source + render script in scripts/og-card). No title or
// description here on purpose — Next fills both from each page's own, so a
// shared case study previews under its own name.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Marc Favro — Principal Product Designer",
  description:
    "Principal Product Designer working on enterprise and B2B platforms — partner portals, legacy modernization, and systems built to last.",
  openGraph: {
    type: "website",
    siteName: "Marc Favro",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// iMessage paints the caption bar under the link-preview image in the
// page's theme-color; without one it samples the card image and comes out
// coral. --ink-strong, so the bar reads as black.
export const viewport: Viewport = {
  themeColor: "#1a1512",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${googleSansFlex.variable} ${dmSans.variable} ${robotoMono.variable} antialiased`}
      >
        {/* Proof notes (Figma-style comments a visitor can pin anywhere)
            wrap everything so the CMYK lockup in PersistentHeader's rail
            and the pin layer share one state. */}
        <ProofProvider>
          <PersistentHeader />
          <PageTransition>{children}</PageTransition>
          <ProofNotes />
        </ProofProvider>
        <NoiseOverlay />
      </body>
    </html>
  );
}
