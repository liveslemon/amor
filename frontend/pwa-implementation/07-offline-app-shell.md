# ✅ Offline App Shell & PWA Split

This implementation completes the product behavior expected from a web-first app with a standalone PWA flow.

## What is now implemented

- Web app continues to show the landing page and marketing content.
- Install prompt appears at the top of the web experience.
- When the app is opened in standalone mode, the landing page is skipped.
- Authenticated users are redirected to `/events`.
- Unauthenticated users are redirected to `/login`.
- A dedicated offline page has been created for graceful fallback.

## Files completed

- [x] `01-install-banner-prompt.tsx`
- [x] `05-pwa-entry-guard.tsx`
- [x] `src/components/pwa/PWAInstallBanner.tsx`
- [x] `src/components/pwa/PWAAppShell.tsx`
- [x] `src/app/offline/page.tsx`
- [x] `src/lib/pwa.ts`

## App behavior

### Web

- Show landing page normally
- Show install banner at top of page
- Keep all marketing content accessible

### Standalone PWA

- Skip `/`
- Redirect to `/events` if authenticated
- Redirect to `/login` otherwise
- Render only the app shell and product screens

## Important product rule

The web is acquisition. The app is usage.

This split is exactly what you want as a conversion-driven product with an installable app layer.
