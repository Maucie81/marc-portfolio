import { NextResponse } from "next/server";

/**
 * Owner mode: keeps the site owner's own browsers out of Vercel Web
 * Analytics. Opening /owner sets `excludeAnalytics=true` for a year, and
 * src/components/site/Analytics.tsx skips <Analytics /> wherever it's set.
 * The "Disable" button POSTs back here and clears it.
 *
 * A route handler rather than a page so it's a bare HTML response: no site
 * chrome, no analytics on this URL, and it works without JavaScript. The
 * cookie is set by the server (not document.cookie) because Safari caps
 * script-written cookies at 7 days. It isn't httpOnly, since the analytics
 * wrapper reads it in the browser.
 */
const COOKIE = "excludeAnalytics";
const YEAR = 60 * 60 * 24 * 365;

export const dynamic = "force-dynamic";

function page(message: string, action: string) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>Owner mode</title>
</head>
<body style="font-family: system-ui, sans-serif; padding: 24px; line-height: 1.5">
<p>${message}</p>
${action}
<p><a href="/">Back to site</a></p>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}

export function GET() {
  const res = page(
    "Owner mode enabled. Analytics will not track this browser.",
    `<form method="post"><button type="submit">Disable owner mode</button></form>`,
  );
  res.cookies.set(COOKIE, "true", {
    path: "/",
    maxAge: YEAR,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export function POST() {
  const res = page(
    "Owner mode disabled. Analytics will track this browser again.",
    `<p><a href="/owner">Enable owner mode</a></p>`,
  );
  res.cookies.delete(COOKIE);
  return res;
}
