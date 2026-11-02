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

export type PwaDeviceType = "ios" | "android" | "desktop";

export function getPwaDeviceType(): PwaDeviceType {
  if (typeof navigator === "undefined") return "desktop";

  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export interface PwaInstallInstructions {
  label: string;
  description: string;
  steps: string[];
}

export function getPwaInstallInstructions(
  deviceType: PwaDeviceType,
): PwaInstallInstructions {
  if (deviceType === "ios") {
    return {
      label: "iPhone / iPad",
      description: "The app can be added to your home screen in Safari.",
      steps: [
        "Tap the Share button at the bottom of the screen.",
        "Scroll and choose Add to Home Screen.",
        "Tap Add in the top-right corner to finish installing.",
      ],
    };
  }

  if (deviceType === "android") {
    return {
      label: "Android",
      description: "Use the browser menu to install the app directly on your device.",
      steps: [
        "Tap the three-dot menu in the top-right corner.",
        "Select Install app or Add to Home screen.",
        "Confirm the install and open it from your home screen.",
      ],
    };
  }

  return {
    label: "Desktop",
    description: "Install it from your browser for a faster, app-like experience.",
    steps: [
      "Open the browser menu in Chrome or Edge.",
      "Choose Install app or Create shortcut.",
      "Confirm the install and launch it from your desktop.",
    ],
  };
}
