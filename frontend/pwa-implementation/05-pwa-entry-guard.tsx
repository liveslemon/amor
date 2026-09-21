"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface PWAEntryGuardProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export function PWAEntryGuard({
  isAuthenticated,
  children,
}: PWAEntryGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (!isStandalone) return;

    const shouldRedirectToAppHome = pathname === "/" || pathname === "/Landing";

    if (!shouldRedirectToAppHome) return;

    if (isAuthenticated) {
      router.replace("/events");
      return;
    }

    router.replace("/login");
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}

export default PWAEntryGuard;

/**
 * Standard usage:
 *
 * export default function RootLayout({ children }) {
 *   const isAuthenticated = useAuthState();
 *   return (
 *     <html>
 *       <body>
 *         <PWAEntryGuard isAuthenticated={isAuthenticated}>
 *           {children}
 *         </PWAEntryGuard>
 *       </body>
 *     </html>
 *   );
 * }
 */

/**
 * This is the cleanest approach when the web app should remain the landing experience
 * while the installed app should jump directly into app flow.
 */
