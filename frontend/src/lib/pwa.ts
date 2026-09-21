export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches;
}

export function isInstallableBrowser(): boolean {
  if (typeof window === "undefined") return false;

  return "BeforeInstallPromptEvent" in window || "serviceWorker" in navigator;
}

export function getPwaEntryRoute(isAuthenticated: boolean): string {
  return isAuthenticated ? "/events" : "/login";
}
