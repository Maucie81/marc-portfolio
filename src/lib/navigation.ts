const IN_APP_HISTORY_KEY = "mf:in-app-history";
const SCROLL_POSITIONS_KEY = "mf:scroll-positions";

type NavigationApi = { canGoBack: boolean };

function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** True when history.back() would land on another page of this site rather
 * than leave it (or do nothing). Prefers the Navigation API, which only
 * counts contiguous same-origin entries; older browsers fall back to a flag
 * set on the first client-side navigation of the session. */
export function canGoBackInApp(): boolean {
  const nav = (window as unknown as { navigation?: NavigationApi }).navigation;
  if (nav && typeof nav.canGoBack === "boolean") return nav.canGoBack;
  return safeSession()?.getItem(IN_APP_HISTORY_KEY) === "1";
}

export function markInAppNavigation() {
  safeSession()?.setItem(IN_APP_HISTORY_KEY, "1");
}

function readPositions(): Record<string, number> {
  try {
    const raw = safeSession()?.getItem(SCROLL_POSITIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveScrollPosition(pathname: string, y: number) {
  const positions = readPositions();
  positions[pathname] = y;
  safeSession()?.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
}

export function readScrollPosition(pathname: string): number | null {
  const y = readPositions()[pathname];
  return typeof y === "number" ? y : null;
}
