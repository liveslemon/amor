# PWA Implementation Roadmap for Amor

This folder contains the implementation plan and production-quality code templates for a web-first, app-second PWA model.

## Business goal

- Keep the landing experience on the web only.
- Once users install the PWA, the app should open directly into the product experience instead of the landing page.
- Show a strong install prompt at the top of the web app on first visit and in recurring sessions when the app is not yet installed.
- Make the installed PWA behave like a dedicated app, while the web version remains a discovery and conversion surface.

## Core product rule

The web app is a funnel.
The installed PWA is the product.

This means:

- `/` on the web should remain marketing/landing content.
- The install banner must appear before any product content in the web app and remain visible until dismissed or installed.
- When the PWA launch URL is opened inside the standalone app, it should skip landing pages and go straight to the authenticated app experience.
- The app should detect whether it is running as a standalone PWA and adjust its entry flow accordingly.

## Recommended architecture

1. Keep all marketing content in the web app shell.
2. Detect PWA mode via `window.matchMedia('(display-mode: standalone)')` and `navigator.standalone`.
3. Use a lightweight `PWAInstallPrompt` component placed at the top of the site shell.
4. Use an app entry guard that redirects from `/` to `/events` or `/dashboard` when installed as a PWA and user is authenticated.
5. Keep the PWA manifest, install metadata, and service worker separate from the marketing layer.

## Why this is the correct split

A standard PWA is often implemented as “web app behaves like installed app,” but for a conversion-focused experience, the web should still act as the landing and promotion surface. This is common for SaaS and event/community products that want both a discoverable website and an app-like product experience.

The key distinction is:

- web = acquisition + discovery
- standalone app = onboarding + engagement + product usage

---

## Implementation principles

- Keep install UI at the very top of the web app, above hero or nav.
- Do not force add-to-home-screen prompts in the installed app.
- Use a dismissible banner that is not intrusive.
- Store user dismissal state in localStorage with a cooldown period.
- On the PWA side, skip marketing UI entirely.
- Use route guards instead of conditionals in the page components when possible.

## Acceptance criteria

- Users on the browser web app see an install banner at the top of the page.
- The banner is the first visible element on the web page.
- Users who have not installed the app continue seeing the banner until dismissal or install.
- Users who install the PWA launch into the app experience instead of the landing page.
- Browser web visits continue to show the landing page normally.
- App visits in standalone mode do not render the landing page hero or marketing shell.

## Recommended file map

See the rest of this folder for the concrete implementation files:

- `01-install-banner-prompt.tsx` — top-of-page install notice
- `02-web-vs-pwa-routing.md` — route split strategy
- `03-manifest-and-install-metadata.ts` — manifest + metadata setup
- `04-service-worker-and-offline.ts` — SW rules for the app shell
- `05-pwa-entry-guard.tsx` — redirect logic for installed app
- `06-implementation-checklist.md` — final QA checklist

The code in this folder is intended to be adapted into the real app, not used blindly without checking the project’s routes and auth flow.
