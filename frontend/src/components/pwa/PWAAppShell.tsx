"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, User, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationModal from "./NotificationModal";
import NotificationCenter from "./NotificationCenter";
import { APP_CONFIG } from "@/config/app";

interface PWAAppShellProps {
  children: React.ReactNode;
}

export function PWAAppShell({ children }: PWAAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isStandalone, setIsStandalone] = useState(false);
  const safePathname = pathname ?? "/";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    // "No landing in the app" - immediately redirect away from landing page in standalone mode
    if (standalone) {
      if (safePathname === "/" || safePathname === "/Landing") {
        router.replace(user ? "/home" : "/login");
      }
    }
  }, [safePathname, router, user]);

  if (!isStandalone) {
    return (
      <>
        <NotificationModal />
        {children}
      </>
    );
  }

  // Standalone PWA view: never render landing page
  if (safePathname === "/" || safePathname === "/Landing") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#000B1A] text-white flex flex-col">
      <NotificationModal />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#000B1A]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={user ? "/home" : "/login"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white">
              <Heart className="h-4 w-4 text-[#FFB6C1]" />
            </div>
            <span className="text-xl font-normal tracking-wide font-[family-name:var(--font-marker)]">
              {APP_CONFIG.name}
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm text-slate-200">
            {user && (
              <>
                <Link
                  href="/home"
                  className={`rounded-full px-3.5 py-2 transition flex items-center gap-1.5 ${
                    safePathname.startsWith("/home")
                      ? "bg-white/10 text-white font-medium"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span>Home</span>
                </Link>

                <Link
                  href="/dates"
                  className={`rounded-full px-3.5 py-2 transition flex items-center gap-1.5 ${
                    safePathname.startsWith("/date")
                      ? "bg-white/10 text-white font-medium"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB6C1]" />
                  <span>Dates</span>
                </Link>

                <Link
                  href="/events"
                  className={`rounded-full px-3.5 py-2 transition ${
                    safePathname.startsWith("/events")
                      ? "bg-white/10 text-white font-medium"
                      : "hover:bg-white/5"
                  }`}
                >
                  Events
                </Link>

                <NotificationCenter />

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  title="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}

            {!user && (
              <Link
                href="/login"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0a0f1a] hover:bg-white/90 transition-colors"
              >
                Log In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

export default PWAAppShell;
