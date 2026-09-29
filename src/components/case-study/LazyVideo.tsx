"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Autoplaying, muted, looping recording that only downloads once it's about a
 * screen away, and pauses while off screen. A case study stacks up to eight
 * of these (~3.5MB each); as plain autoplay <video>s they all downloaded on
 * page load. The margin is a full viewport on every side because the
 * horizontal track slides sections in sideways — IntersectionObserver sees
 * the transformed position, so a clip starts loading a screen before it
 * arrives from either direction.
 */
export default function LazyVideo({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "100% 100% 100% 100%" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // playsInline is required for autoplay to actually fire on iOS Safari.
  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
