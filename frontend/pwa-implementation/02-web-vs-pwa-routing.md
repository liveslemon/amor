# Web vs PWA Routing Strategy

## Goal

The web app should still behave like a marketing landing site, while the installed PWA should behave like an application.

## Standard route split

### Web route behavior

- `/` = landing page / marketing page
- `/login` = web login or app onboarding entry
- `/signup` = web signup flow
- `/privacy`, `/terms` = legal pages
- `/events` = public browsing when on web

### PWA route behavior

- Installed app should not render the landing page hero or promotional shell.
- If the user is authenticated, go directly to the product route, for example `/events` or `/dashboard`.
- If they are not authenticated, route them into the onboarding/sign-in flow without showing a landing page.

## Example rule

```tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AppEntryGate({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(window.navigator.standalone);

    if (!isStandalone) return;
    if (pathname === "/") {
      if (isAuthenticated) {
        router.replace("/events");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
```

## Key implementation principle

Do not hide the landing page through CSS only. Use route logic and navigation rules.

This is important because:

- users should not see the marketing shell inside the installed app;
- the browser app should keep the landing page intact;
- the PWA should feel like a dedicated product experience.

## Recommended app flow

### Web flow

1. User lands on `/`
2. They see the landing page and install banner at the top
3. They can browse marketing content
4. If they want to sign up, they proceed to `/signup` or `/login`

### PWA flow

1. App launches in standalone mode
2. Entry gate checks `display-mode: standalone`
3. App automatically redirects to the authenticated product route or login route
4. Marketing content is skipped

## Additional rules

- Keep the install banner only on the web route shell.
- Do not render `PWAInstallBanner` inside the standalone app.
- Do not include the landing hero in the standalone-only route shell.
- Use a consistent `isStandalone` helper in the app root to centralize this logic.

## Best practice for this codebase

Because the app already uses App Router, the cleanest place for this is in the root `layout.tsx` or a dedicated `PWAAppShell` file that decides whether to render:

- web marketing shell
- installed app shell

This avoids scattering `window.matchMedia` checks across components.
