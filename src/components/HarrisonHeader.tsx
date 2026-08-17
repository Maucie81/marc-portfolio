"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { DoseCounter } from "./DoseCounter";
import { HarrisonInlineNav } from "./HarrisonInlineNav";

export const HarrisonHeader = forwardRef<HTMLDivElement>(function HarrisonHeader(_, ref) {
  return (
    <div
      ref={ref}
      className="border-b border-[#d3d4c5] pb-5 pt-14"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#FCFDF0",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="h-[146px] w-[159px] shrink-0">
          <Image src="/harrison/harrison-portrait.png" alt="" width={159} height={146} className="h-full w-full object-contain" priority />
        </div>
        <h1 className="harrison-display text-center text-[92px] font-bold leading-[1] tracking-[-2.76px] text-[#56440f]">
          Harrison!
        </h1>
      </div>
      <DoseCounter />
      <div className="mt-4 w-full">
        <HarrisonInlineNav />
      </div>
    </div>
  );
});
