"use client";

import { usePathname } from "next/navigation";
import ProofLayer from "./ProofLayer";
import ProofPanel from "./ProofPanel";
import ProofTrigger from "./ProofTrigger";

/** Routes that render the homepage perimeter frame, whose left rail already
 * holds the CMYK lockup (see PersistentHeader). Everywhere else gets the
 * floating version. Keep in sync with PersistentHeader's HomeHeader routes. */
const FRAME_ROUTES = new Set(["/", "/coming-soon", "/contact"]);

export default function ProofNotes() {
  const pathname = usePathname();
  return (
    <>
      {FRAME_ROUTES.has(pathname) ? null : <ProofTrigger variant="floating" />}
      <ProofLayer />
      <ProofPanel />
    </>
  );
}
