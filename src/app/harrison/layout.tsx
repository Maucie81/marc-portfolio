import type { Metadata, Viewport } from "next";
import "./harrison.css";
import { SplashWrapper } from "@/components/SplashWrapper";

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
};

export default function HarrisonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="harrison-app min-h-screen">
      <SplashWrapper>{children}</SplashWrapper>
    </div>
  );
}
