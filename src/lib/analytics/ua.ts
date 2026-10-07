import type { Device } from "./store";

/**
 * Device, browser and OS from the User-Agent string — a handful of regexes
 * rather than a parsing library, coarse on purpose. Only the three labels
 * are stored, never the string itself. iPads ask for desktop sites and send
 * a Mac user agent, so the tracker passes `touch` (more than one touch
 * point) to tell them apart.
 */

export function deviceOf(ua: string, mobileHint: string | null, touch: boolean): Device {
  // Android tablets drop "Mobile" from the UA; phones keep it.
  if (
    /iPad|Tablet|PlayBook|Silk|Kindle|Android(?!.*Mobile)/i.test(ua) ||
    (touch && /Macintosh/.test(ua))
  ) {
    return "tablet";
  }
  if (mobileHint === "?1" || /Mobi|iPhone|iPod|Android/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

// First match wins: in-app browsers and Chromium forks before Chrome, and
// Chrome before Safari (every Chromium UA also says "Safari").
const BROWSERS: [RegExp, string][] = [
  [/LinkedInApp/i, "LinkedIn app"],
  [/Instagram/i, "Instagram app"],
  [/FBAN|FBAV/i, "Facebook app"],
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox|FxiOS/, "Firefox"],
  [/Chrome|CriOS|Chromium/, "Chrome"],
  [/Safari/, "Safari"],
];

export function browserOf(ua: string): string | null {
  return BROWSERS.find(([pattern]) => pattern.test(ua))?.[1] ?? null;
}

export function osOf(ua: string, touch: boolean): string | null {
  if (/iPad/.test(ua) || (touch && /Macintosh/.test(ua))) return "iPadOS";
  if (/iPhone|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return null;
}
