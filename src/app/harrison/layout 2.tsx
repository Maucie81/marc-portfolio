import type { Metadata, Viewport } from "next";
import "./harrison.css";

export const viewport: Viewport = {
  themeColor: "#FCFDF0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Harrison",
  description: "Post-operative medication tracker and care reference",
  manifest: "/harrison/manifest.json",
};

export default function HarrisonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="harrison-app min-h-screen">
      {children}
    </div>
  );
}
