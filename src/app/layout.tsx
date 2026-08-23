import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";
import PageTransition from "@/components/site/PageTransition";
import "./globals.css";

// Google Sans Flex isn't in next/font/google's generated catalog yet, even
// though the Google Fonts API now serves it — self-hosted here from the same
// CDN (fonts.gstatic.com) instead. It's a true variable font (weight axis
// 300–800 in one file), matching the Figma reference's GRAD/ROND/wdth axes.
// Every text layer in the Figma file uses this typeface — including nav,
// labels, and links (--font-alt) — so --font-alt is aliased to it in
// globals.css rather than loading a second (mono) font.
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
        className={`${googleSansFlex.variable} ${dmSans.variable} antialiased`}
      >
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
