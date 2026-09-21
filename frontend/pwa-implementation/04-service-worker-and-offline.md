# Service Worker Strategy for the PWA

This implementation is intentionally conservative. It should not break the app’s current backend or API flow.

## Recommended service worker responsibilities

- Cache static shell assets for fast reloads
- Serve the app shell and core routes when offline
- Use network-first strategy for APIs and dynamic data
- Keep the landing page available in the web app, but do not force it inside the installed app
- Allow the installed app to open product screens without depending on the web marketing shell

## Minimal safe strategy

```js
const CACHE_NAME = "minglee-shell-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/match-poster.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
```

## Important principle

Do not cache everything aggressively. For a social/event platform, dynamic data can change fast and the app must not cache stale state incorrectly.

Use these rules:

- static assets: cache aggressively
- API calls: network-first
- marketing pages: cache lightly
- authenticated content: do not over-cache in a dangerous way

## Offline behavior

For the browser web experience:

- show landing page when offline if cached; this is acceptable
- show install banner when there is network access
- keep install CTA available when online

For the standalone app:

- open the regular app route flow
- skip the landing page shell
- rely on the product flow rather than the marketing route

## Recommended future upgrade

When the app is more mature, add:

- route-level offline fallback for product pages
- background sync for event registration and profile updates
- notification registration
- stale-while-revalidate for content-heavy pages

But this should be done only after the product flow is stable.
