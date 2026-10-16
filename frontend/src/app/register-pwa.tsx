"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { Smartphone, X } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}


export default function RegisterPWA() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);

  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDevelopment = process.env.NODE_ENV === "development";

    const register = async () => {
      if (isDevelopment) {
        return;
      }

      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
              updateViaCache: "none",
            },
          );

          registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (!installing) return;

            installing.addEventListener("statechange", () => {
              if (
                installing.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.info("PWA update available");
              }
            });
          });
        }
      } catch (error) {
        console.warn("PWA registration skipped:", error);
      }
    };

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    setIsStandalone(standalone);
    setDeviceType(isIOS ? "ios" : isAndroid ? "android" : "desktop");

    if (standalone) {
      const shouldRedirectToAppHome =
        pathname === "/" || pathname === "/Landing";
      if (shouldRedirectToAppHome) {
        router.replace(currentUser ? "/events" : "/login");
      }
      return;
    }

    const appNameLower = APP_CONFIG.name.toLowerCase();
    const hasBeenDismissed =
      localStorage.getItem(`${appNameLower}-install-banner-dismissed`) === "true";

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      if (!hasBeenDismissed) {
        setShowInstallBanner(true);
      }
    };

    const onAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem(`${appNameLower}-install-banner-dismissed`, "true");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    if (!hasBeenDismissed) {
      setShowInstallBanner(true);
    }

    register();

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [currentUser, pathname, router]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      return;
    }

    setShowInstallGuide(true);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowInstallGuide(false);
    const appNameLower = APP_CONFIG.name.toLowerCase();
    localStorage.setItem(`${appNameLower}-install-banner-dismissed`, "true");
  };

  const getInstallMeta = () => {
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
  };

  if (isStandalone) return null;

  if (!showInstallBanner && !showInstallGuide) return null;

  const installMeta = getInstallMeta();

  return (
    <section
      role="status"
      aria-live="polite"
      className="relative z-40 w-full bg-[#0a0f1a] px-4 pt-36 sm:pt-40 md:pt-44 pb-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="relative flex flex-col gap-5 rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c1220] p-5 sm:p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex min-w-0 items-start gap-4 pr-8 sm:items-center sm:pr-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
              <Smartphone className="h-5 w-5 text-[#ff69b4]" />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-white/50">
                  {showInstallGuide ? "Install Guide" : "App Access"}
                </p>
                {showInstallGuide && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-white/70">
                    {installMeta.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl tracking-tight text-white sm:text-3xl">
                  {showInstallGuide ? (
                    "How to install on this device"
                  ) : (
                    <>
                      Install{" "}
                      <span className="font-[family-name:var(--font-marker)] text-[#ff69b4] inline-block -rotate-2 ml-1 font-normal tracking-wide">
                        {APP_CONFIG.name}
                      </span>
                    </>
                  )}
                </h2>
              </div>

              <p className="mt-1 max-w-xl font-sans text-sm text-white/60 leading-relaxed">
                {showInstallGuide
                  ? installMeta.description
                  : "Keep the full experience close at hand for faster dates, better access, and a smoother way to meet people in your community."}
              </p>

              {showInstallGuide && (
                <ol className="mt-3 list-decimal space-y-1 pl-5 font-sans text-sm text-white/70">
                  {installMeta.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:shrink-0">
            <button
              type="button"
              aria-label="Dismiss install banner"
              onClick={handleDismiss}
              className="h-11 cursor-pointer rounded-full border border-white/15 bg-white/5 px-5 font-sans text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:border-white/25 hover:text-white active:scale-[0.98]"
            >
              Not now
            </button>

            <button
              type="button"
              onClick={handleInstall}
              className="h-11 cursor-pointer rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              {showInstallGuide ? "Try again" : "Install app"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
