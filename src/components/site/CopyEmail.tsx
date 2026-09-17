"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The email address in the bottom band's campaign badge, as a button that
 * copies the address to the clipboard. The address itself never changes —
 * hovering it floats a small "Copy address" tooltip above the text (same
 * bordered white label as ProofLayer's placing hint), which reads "Copied"
 * for a moment after a click. If neither clipboard path works it opens a
 * mailto: instead, so the click never dead-ends.
 * Inherits `.t-frame-mono` from the badge so it's indistinguishable from
 * the surrounding text apart from the underline.
 */

/** Clipboard API first; if it's missing or the permission is denied
 * (embedded webviews, some privacy modes), fall back to the legacy
 * execCommand path, which only needs the user gesture we're already in. */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setCopied(false);
  }

  async function copy() {
    if (!(await writeClipboard(email))) {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      onMouseLeave={reset}
      onBlur={reset}
      aria-label={`Copy email address ${email}`}
      className="group pointer-events-auto relative inline cursor-pointer appearance-none border-0 bg-transparent p-0 font-[inherit] text-[length:inherit] leading-[inherit] tracking-[inherit] text-inherit [text-transform:inherit] underline decoration-line underline-offset-2 transition-colors hover:text-accent hover:decoration-current focus-visible:text-accent focus-visible:decoration-current focus-visible:outline-none"
    >
      {email}
      {/* Tooltip — floats above the address, centered on it. Hidden until
          hover/focus; flips to "Copied" after a click and resets when the
          pointer leaves so the next hover reads "Copy address" again.
          Fixed width isn't needed: the label sits outside the badge's
          flow (absolute), so its text swap can't shift the badge.
          Tiny 6px caret is a rotated square sharing the box's border. */}
      <span
        role="tooltip"
        aria-live="polite"
        className="t-frame-mono pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap border border-line bg-white px-2.5 py-0.5 opacity-0 shadow-[0_2px_8px_rgba(0,0,0,.08)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {copied ? "Copied" : "Copy address"}
        <span
          aria-hidden
          className="absolute left-1/2 top-full size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-line bg-white"
        />
      </span>
    </button>
  );
}
