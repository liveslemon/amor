# PWA Implementation Checklist

## Goal

This checklist ensures the app behaves correctly for both the web landing experience and the standalone PWA app experience.

## Must-have checks

### 1. Web landing experience

- [ ] The landing page remains the primary public marketing experience.
- [ ] A top install banner appears before the hero content or main navigation.
- [ ] The banner is dismissed locally after a user chooses to ignore it.
- [ ] Users can still browse the website normally without the banner blocking the page.

### 2. Installed app experience

- [ ] The app recognizes `display-mode: standalone`.
- [ ] PWA launch redirects away from `/` or marketing shells.
- [ ] Authenticated users are directed to the product flow such as `/events`.
- [ ] Unauthenticated users are directed to `/login` or onboarding.
- [ ] No marketing content is rendered inside the installed app.

### 3. Installability

- [ ] Manifest is available at `/manifest.webmanifest`.
- [ ] Icons are present and valid.
- [ ] App has theme color and mobile metadata.
- [ ] Site is served over HTTPS in production.
- [ ] Browser install prompt is triggered when supported.

### 4. Offline/resilience

- [ ] Service worker is registered.
- [ ] Static shell resources are cached.
- [ ] API requests use a safe network-first strategy.
- [ ] App does not break when offline.
- [ ] Standalone app does not crash when landing page content is missing.

### 5. Production quality

- [ ] There is no route flicker from landing to app route on first load in installed mode.
- [ ] The install prompt is not shown in the standalone app.
- [ ] Banner is not shown repeatedly forever after dismissal.
- [ ] App metadata names and descriptions match product branding.

## Recommended QA steps

1. Open the web app in browser and confirm the install banner is at the top.
2. Dismiss the banner and confirm it stays hidden for the configured session or localStorage duration.
3. Open the site on mobile or emulator and install the PWA.
4. Check that the installed app opens into the app route, not the landing page.
5. Open the site in standalone mode and confirm no marketing hero appears.
6. Use offline mode and verify the app shell still loads safely.
7. Validate the manifest and installability in DevTools.

## Final rule

The web is for acquisition.
The app is for engagement.

This split is essential for a clean user journey and an install-first product strategy.
