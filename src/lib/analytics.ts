const TRACKED_KEY_PREFIX = "falcon.tracked.";

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(name, { props });
  }
}

export function trackOnce(name: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const key = TRACKED_KEY_PREFIX + name;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");
  trackEvent(name, props);
}
