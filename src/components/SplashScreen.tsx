"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!exiting && (
        <motion.div
          key="splash"
          exit={{ y: "-100vh" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FCFDF0",
            zIndex: 9999,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 5, -3, 3, 0] }}
              transition={{
                delay: 0.4,
                duration: 1.2,
                ease: "easeInOut",
                times: [0, 0.15, 0.3, 0.45, 0.6, 0.72, 0.86, 1],
              }}
              style={{ transformOrigin: "bottom center" }}
            >
              <Image
                src="/harrison/harrison-portrait.png"
                alt="Harrison"
                width={314}
                height={288}
                style={{ display: "block" }}
              />
            </motion.div>
          </motion.div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            {["Harrison's", "on the", "mend!"].map((word, i) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6 + i * 0.25,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                style={{
                  fontFamily: "'Airbnb Cereal', sans-serif",
                  fontWeight: "700",
                  fontSize: "82px",
                  lineHeight: 0.95,
                  letterSpacing: "-2.46px",
                  color: "#56440F",
                }}
              >
                {word}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
