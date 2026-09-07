import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans, Roboto_Mono } from "next/font/google";
import PageTransition from "@/components/site/PageTransition";
import PersistentHeader from "@/components/site/PersistentHeader";
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
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marc Favro — Principal Product Designer",
  description:
    "Principal Product Designer working on enterprise and B2B platforms — partner portals, legacy modernization, and systems built to last.",
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
        <PersistentHeader />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
