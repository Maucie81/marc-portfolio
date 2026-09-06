import type { ReactNode } from "react";
import { COMIX_INK, COMIX_RUST } from "./palette";
import InkRect from "./InkRect";

/**
 * The base panel unit of the whole system — a hand-drawn ink border (via
 * InkRect, not a CSS border-width), no rounded corners, no drop shadow (ink
 * doesn't cast one). The outer rule carries a rust misregistration ghost;
 * the inner rule is a second, independently-jittered pass — a real printed
 * panel gutter is two hand re-traced lines, not one rule offset inward.
 */
export default function PanelBorder({
  children,
  className = "",
  seed = 1,
  double = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  seed?: number;
  double?: boolean;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag className={`bg-comix-paper relative ${className}`}>
      <InkRect seed={seed} inset={9} wobble={6} color={COMIX_INK} ghostColor={COMIX_RUST} />
      {double && (
        <InkRect seed={seed + 1} inset={19} wobble={4} color={COMIX_INK} className="opacity-80" />
      )}
      {children}
    </Tag>
  );
}
