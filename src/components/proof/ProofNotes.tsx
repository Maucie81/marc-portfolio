"use client";

import { usePathname } from "next/navigation";
import { hasPerimeterFrame } from "@/lib/page-titles";
import ProofLayer from "./ProofLayer";
import ProofPanel from "./ProofPanel";
import ProofTrigger from "./ProofTrigger";

/** Routes wrapped in the perimeter frame already hold the CMYK lockup in
 * the frame's left rail (see PersistentHeader); everywhere else gets the
 * floating version. */
export default function ProofNotes() {
  const pathname = usePathname();
  return (
    <>
      {hasPerimeterFrame(pathname) ? null : <ProofTrigger variant="floating" />}
      <ProofLayer />
      <ProofPanel />
    </>
  );
}
