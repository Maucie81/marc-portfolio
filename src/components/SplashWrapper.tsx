"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "./SplashScreen";
import { HarrisonLayoutContent } from "./HarrisonLayoutContent";

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      {!showSplash && (
        <HarrisonLayoutContent>{children}</HarrisonLayoutContent>
      )}
    </>
  );
}
