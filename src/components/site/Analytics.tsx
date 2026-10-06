"use client";

import { useSyncExternalStore } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics, minus the owner's own browsers. Visiting /owner (see
 * src/app/owner/route.ts) sets an `excludeAnalytics=true` cookie; any browser
 * carrying it never mounts <Analytics />, so no script loads and no page
 * views are sent. Everyone else gets the stock component.
 *
 * The cookie is read on the client rather than in the layout so the site
 * stays statically rendered. Vercel's component renders nothing on the server
 * and does all its work in effects, so mounting it right after hydration
 * tracks exactly as before. No subscription: the cookie only changes on
 * /owner, which is a plain HTML response outside the app, so the next app
 * page is always a fresh load.
 *
 * To remove owner mode, mount <VercelAnalytics /> directly in layout.tsx and
 * delete this file and src/app/owner.
 */
const noop = () => () => {};
const isOwner = () =>
  /(?:^|;\s*)excludeAnalytics=true(?:;|$)/.test(document.cookie);

export default function Analytics() {
  // Server snapshot is "excluded" so nothing renders until the real cookie
  // has been checked in the browser.
  const excluded = useSyncExternalStore(noop, isOwner, () => true);
  return excluded ? null : <VercelAnalytics />;
}
