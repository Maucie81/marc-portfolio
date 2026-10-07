import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto_Mono } from "next/font/google";
import PageTransition from "@/components/site/PageTransition";
import PersistentHeader from "@/components/site/PersistentHeader";
import NoiseOverlay from "@/components/site/NoiseOverlay";
import Analytics from "@/components/site/Analytics";
import VisitTracker from "@/components/site/VisitTracker";
import ProofNotes from "@/components/proof/ProofNotes";
import { ProofProvider } from "@/components/proof/ProofProvider";
import { HERO_EDITION_SCRIPT } from "@/lib/hero-editions";
import { MOTION_SCRIPT } from "@/lib/motion";
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
  // iOS Safari otherwise turns the phone number (and anything that looks
  // like a date, address or email) into a link before React hydrates; the
  // HTML no longer matches, React re-creates the page, and <html> loses the
  // data-hero / data-motion the head scripts set — no motion, always Hero 2.
  formatDetection: { telephone: false, date: false, address: false, email: false },
};

const CHROME_MOBILE_SCRIPT = `if(/CriOS\\/|Android.+Chrome\\/.+Mobile/.test(navigator.userAgent))document.documentElement.dataset.browser="chrome-mobile"`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: HERO_EDITION_SCRIPT and MOTION_SCRIPT set
    // data-hero / data-motion on this element before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Picks the homepage hero edition before first paint — see
            src/lib/hero-editions.ts. Runs on every route so the session's
            edition is fixed no matter which page it starts on. */}
        <script dangerouslySetInnerHTML={{ __html: HERO_EDITION_SCRIPT }} />
        {/* Turns the homepage motion on (or leaves the page static) before
            first paint — see src/lib/motion.ts. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
        {/* Flags Chrome on phones (iOS CriOS or Android), which docks its
            address bar along the bottom edge — see .footer-credit in
            globals.css. */}
        <script dangerouslySetInnerHTML={{ __html: CHROME_MOBILE_SCRIPT }} />
      </head>
      <body
        className={`${googleSansFlex.variable} ${robotoMono.variable} antialiased`}
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
        {/* Vercel Web Analytics, skipped in browsers that opened /owner —
            see src/components/site/Analytics.tsx. */}
        <Analytics />
        {/* Private visit log (city, page, source) behind /analytics — see
            src/components/site/VisitTracker.tsx. */}
        <VisitTracker />
      </body>
    </html>
  );
}
