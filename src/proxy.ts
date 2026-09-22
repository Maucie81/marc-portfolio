import { NextResponse, type NextRequest } from "next/server";

/**
 * Private-preview gate for case studies that are still being written.
 *
 * Each route in HIDDEN is live in the codebase and deployed, but the public
 * (and search engines) get redirected to the site's "Coming soon" page for
 * it — the same one the not-yet-written additionalWork projects already
 * use, so the homepage card, the closing "Want to see more?" pill and the
 * UMD closing links can all keep pointing at the real URL.
 *
 * Unlocking: open the page once with `?key=<PREVIEW_KEY>` and a cookie is
 * set for a year; every later visit (and every other hidden route) just
 * works. `next dev` never gates anything, so local work is unaffected.
 * With no PREVIEW_KEY set in production the routes stay hidden — the gate
 * fails closed rather than open.
 *
 * To publish a case study, delete its entry here. To hide another one, add
 * it — the `?p=` value must match a project slug comingSoonTitle() knows
 * (page-titles.ts) so the coming-soon page shows the right breadcrumb.
 */
const HIDDEN: Record<string, string> = {
  "/work/airbnb-hotels": "/coming-soon?p=airbnb-hotels",
  "/work/harrisons-app": "/coming-soon?p=harrisons-app",
};

const COOKIE = "mf-preview";
const YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const fallback = HIDDEN[pathname];
  if (!fallback || process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const key = process.env.PREVIEW_KEY;
  const supplied = searchParams.get("key");

  if (key && supplied === key) {
    // Drop the key from the address bar so it isn't shared by accident,
    // then remember the unlock.
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("key");
    const res = NextResponse.redirect(clean);
    res.cookies.set(COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: YEAR,
    });
    return res;
  }

  if (key && request.cookies.get(COOKIE)?.value === key) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(fallback, request.url));
}

export const config = {
  matcher: ["/work/airbnb-hotels", "/work/harrisons-app"],
};
