"use client";

import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const installed = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed =
      localStorage.getItem("minglee-install-banner-dismissed") === "true";

    setIsInstalled(installed);
    setIsDismissed(dismissed);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem("minglee-install-banner-dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    const hasStandaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isStandalone = hasStandaloneMode;

    if (!isStandalone && !dismissed) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const shouldRender = useMemo(() => {
    if (isInstalled) return false;
    if (isDismissed) return false;
    return isVisible;
  }, [isInstalled, isDismissed, isVisible]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("minglee-install-banner-dismissed", "true");
  };

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full border-b border-pink-500/30 bg-[#111827] text-white"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/20 text-lg">
            📲
          </div>

          <div>
            <p className="text-sm font-semibold sm:text-base">
              Install Minglee
            </p>
            <p className="text-xs text-slate-300 sm:text-sm">
              Get the full app experience and faster access to events, matches,
              and updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-400"
          >
            Install app
          </button>

          <button
            type="button"
            aria-label="Dismiss install banner"
            onClick={handleDismiss}
            className="rounded-full border border-slate-600 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-400 hover:text-white"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallBanner;

/**
 * Recommended placement:
 *
 * Place this component as the very first element inside the main web app shell,
 * before the navbar or hero content, so it is always the first visible prompt.
 *
 * Example:
 *
 * export default function WebShell({ children }) {
 *   return (
 *     <>
 *       <PWAInstallBanner />
 *       <Navbar />
 *       {children}
 *     </>
 *   );
 * }
 */
