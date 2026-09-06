import { Anton, Barlow_Condensed, Permanent_Marker } from "next/font/google";
import "./comix-theme.css";

/**
 * Three faces, one role each — no fourth font, matching the palette's own
 * four-color discipline:
 *  - Anton: the splash/masthead voice. Condensed, ultra-heavy, built for
 *    magazine-cover confidence — irregularity comes from layout (rotation,
 *    baseline jitter in HandLetter.tsx), not the letterforms themselves.
 *  - Permanent Marker: the ONLY hand-lettered face, reserved for captions,
 *    stamps, plate numbers, and signature marks — genuinely brush/marker
 *    inked, never used for body-length copy or it stops reading as a mark
 *    and starts reading as a gimmick.
 *  - Barlow Condensed: dense, tight panel-copy body text. Legible at small
 *    sizes, which the hand and display faces are not — this is what keeps
 *    a hiring manager able to actually read the case-study content.
 */
const anton = Anton({
  variable: "--font-comix-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-comix-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-comix-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function ComixLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${anton.variable} ${permanentMarker.variable} ${barlowCondensed.variable} bg-comix-paper`}
    >
      {children}
    </div>
  );
}
