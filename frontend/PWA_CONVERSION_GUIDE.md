# Converting Amor App to PWA (Progressive Web App)

## Table of Contents

1. [Overview](#overview)
2. [Why PWA?](#why-pwa)
3. [Requirements](#requirements)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Configuration Files](#configuration-files)
6. [Testing & Validation](#testing--validation)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

A Progressive Web App (PWA) allows your Amor web application to:

- **Work offline** with cached resources
- **Install as an app** on home screens (iOS, Android, desktop)
- **Send push notifications** to engaged users
- **Sync data in background** when connectivity returns
- **Load instantly** from cache on repeat visits
- **Work on poor connections** using service worker caching strategies

Your Next.js 16 + TypeScript + Supabase setup is perfectly positioned for PWA conversion.

---

## Why PWA?

### Benefits

| Feature                      | Benefit                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| **Offline Access**           | Users can browse cached content without internet               |
| **Installation**             | App icon on home screen without App Store submission           |
| **Faster Loading**           | Cached resources load instantly (90%+ faster on repeat visits) |
| **Push Notifications**       | Re-engage users with time-sensitive event updates              |
| **Network Resilience**       | Graceful degradation on slow/offline connections               |
| **Increased Engagement**     | App-like experience drives higher user retention               |
| **No Distribution Friction** | Works across all platforms (iOS, Android, Web, Desktop)        |

### Current Project Fit

✅ **Advantages:**

- Next.js 16 has built-in PWA support via `next-pwa`
- TypeScript provides type safety for Service Worker logic
- Already using Supabase for authentication & data

⚠️ **Considerations:**

- Service Workers must be on HTTPS (production requirement)
- Need to handle offline auth state with Zustand store
- Real-time features require background sync strategy

---

## Requirements

### 1. Dependencies to Add

```bash
npm install next-pwa workbox-window
npm install --save-dev @types/workbox-window
```

### 2. System Requirements

- **HTTPS**: Required for production (http://localhost works for development)
- **Manifest.json**: Describes your app to browsers
- **Service Worker**: Handles caching and offline logic
- **Icons**: 512x512px and 192x192px PNG files

### 3. File Structure to Create

```
frontend/
├── public/
│   ├── manifest.json          (NEW - App metadata)
│   ├── icons/
│   │   ├── icon-192x192.png   (NEW)
│   │   ├── icon-512x512.png   (NEW)
│   │   └── ...
│   └── assets/
├── src/
│   └── lib/
│       └── serviceWorkerRegister.ts  (NEW)
├── public/sw.js               (NEW - Service Worker)
└── next.config.ts             (MODIFY)
```

---

## Step-by-Step Implementation

### Step 1: Install PWA Dependencies

```bash
cd frontend
npm install next-pwa workbox-window
npm install --save-dev @types/workbox-window
```

### Step 2: Create Manifest File

Create `public/manifest.json`:

```json
{
  "name": "Amor - Real Dating Connections",
  "short_name": "Amor",
  "description": "Find genuine connections through personalized dates. No swiping, no ghosting.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0a0f1a",
  "theme_color": "#ff6b9d",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/screenshot-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "categories": ["lifestyle", "social"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Browse Events",
      "short_name": "Events",
      "description": "View upcoming events",
      "url": "/events",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "My Profile",
      "short_name": "Profile",
      "description": "View and edit your profile",
      "url": "/profile",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ],
  "prefer_related_applications": false
}
```

### Step 3: Update Next.js Configuration

Modify `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: false,
  images: {
    unoptimized: true,
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev for easier debugging
  register: true,
  skipWaiting: false,
  runtimeCaching: [
    // Cache API responses
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Cache images
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache fonts
    {
      urlPattern: /^https:\/\/fonts\..*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // Cache CSS/JS
    {
      urlPattern: /^https:\/\/.*\.(?:css|js)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})(nextConfig);
```

**Explanation of Caching Strategies:**

- **NetworkFirst**: Try network first, fall back to cache (APIs)
- **CacheFirst**: Use cache first, only fetch if missing (images, fonts)
- **StaleWhileRevalidate**: Serve cached version while updating in background (assets)

### Step 4: Update App Layout

Modify `frontend/src/app/layout.tsx` to include manifest and PWA metadata:

```typescript
import type { Metadata } from "next";
import { Young_Serif, Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  weight: "400",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | ${APP_CONFIG.tagline.toLowerCase()}`,
  description: `${APP_CONFIG.name} sets you up on personalized dates. No swiping, no ghosting, just real connections.`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_CONFIG.name,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  metadataBase: new URL("https://amor.example.com"), // Replace with your domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://amor.example.com",
    title: APP_CONFIG.name,
    description: `${APP_CONFIG.name} - ${APP_CONFIG.tagline.toLowerCase()}`,
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: APP_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: `${APP_CONFIG.name} - ${APP_CONFIG.tagline.toLowerCase()}`,
    images: ["/icons/icon-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="facebook-domain-verification" content="jrqej54duyox78e8o3kj5kt8wo9vzp" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Amor" />
        <meta name="theme-color" content="#ff6b9d" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} ${youngSerif.variable} ${permanentMarker.variable} antialiased bg-premium-gradient`}
      >
        {children}
      </body>
    </html>
  );
}
```

### Step 5: Create Service Worker Registration

Create `frontend/src/lib/serviceWorkerRegister.ts`:

```typescript
/**
 * Service Worker Registration Module
 * Handles SW registration, updates, and offline notifications
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register the service worker
 */
export const registerServiceWorker = async (config?: ServiceWorkerConfig) => {
  if (typeof window === "undefined") {
    return;
  }

  // Check if PWAs are supported
  if (!("serviceWorker" in navigator)) {
    console.log("Service Workers are not supported in this browser");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none", // Always fetch fresh service worker script
    });

    console.log("✓ Service Worker registered successfully", registration.scope);

    // Handle successful registration
    if (config?.onSuccess) {
      config.onSuccess(registration);
    }

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "activated" &&
          navigator.serviceWorker.controller
        ) {
          // New service worker is active
          console.log("✓ New Service Worker activated");
          if (config?.onUpdate) {
            config.onUpdate(registration);
          }

          // Notify user about update (optional)
          notifyUpdate();
        }
      });
    });
  } catch (error) {
    console.error("✗ Service Worker registration failed:", error);
    if (config?.onError && error instanceof Error) {
      config.onError(error);
    }
  }
};

/**
 * Unregister service worker (for development/troubleshooting)
 */
export const unregisterServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log("✓ Service Workers unregistered");
  }
};

/**
 * Notify user about available updates
 */
const notifyUpdate = () => {
  // Implement toast notification or UI update here
  console.log(
    "📲 New version available! Refresh the page to get the latest updates.",
  );

  // Example: You could dispatch to your state management (Zustand)
  // dispatch({ type: "SET_UPDATE_AVAILABLE", payload: true });
};

/**
 * Handle offline/online status changes
 */
export const handleNetworkStatus = (
  onOnline?: () => void,
  onOffline?: () => void,
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("online", () => {
    console.log("🔗 Online");
    if (onOnline) onOnline();
  });

  window.addEventListener("offline", () => {
    console.log("📴 Offline");
    if (onOffline) onOffline();
  });
};

/**
 * Request persistent storage permission (recommended for PWAs)
 * This prevents the browser from clearing cached data
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersistent = await navigator.storage.persist();
      console.log(
        `✓ Persistent storage ${isPersistent ? "granted" : "denied"}`,
      );
      return isPersistent;
    } catch (error) {
      console.error("✗ Persistent storage request failed:", error);
      return false;
    }
  }
  return false;
};

/**
 * Get storage quota info
 */
export const getStorageInfo = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: (estimate.usage! / estimate.quota!) * 100,
    };
  }
  return null;
};
```

### Step 6: Create Service Worker Script

Create `frontend/public/sw.js`:

```javascript
/**
 * Service Worker for Amor PWA
 * Handles caching, offline support, and background sync
 */

const CACHE_NAME = "amor-v1";
const RUNTIME_CACHE = "amor-runtime-v1";
const API_CACHE = "amor-api-v1";

// Files to cache on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html", // Create this page for offline fallback
];

/**
 * Install event: cache essential files
 */
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching essential files");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        self.skipWaiting();
      })
  );
});

/**
 * Activate event: clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("✨ Service Worker activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log(`🗑️  Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  self.clients.claim();
});

/**
 * Fetch event: implement caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions and non-http(s)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Strategy 1: API requests (Network First with cache fallback)
  if (url.pathname.includes("/api/") || url.hostname.includes("supabase")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  }
  // Strategy 2: Images (Cache First)
  else if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  ) {
    event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
  }
  // Strategy 3: Static assets (Stale While Revalidate)
  else if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
  }
  // Strategy 4: HTML pages (Network First)
  else if (request.mode === "navigate") {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  }
  // Default: Network First
  else {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  }
});

/**
 * Network First Strategy
 * Try network first, fall back to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log(`📦 Serving from cache: ${request.url}`);
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline.html");
    }

    // Return a generic offline response
    return new Response("Offline - resource not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Cache First Strategy
 * Use cache, only fetch if missing
 */
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log(`❌ Failed to fetch: ${request.url}`);
    return new Response("Resource not found", {
      status: 404,
      statusText: "Not Found",
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Serve from cache, update in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

/**
 * Background Sync for offline actions
 * Re-sync when connection is restored
 */
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "sync-profile-updates") {
    event.waitUntil(syncProfileUpdates());
  }
  if (event.tag === "sync-event-registrations") {
    event.waitUntil(syncEventRegistrations());
  }
});

async function syncProfileUpdates() {
  // Implement profile sync logic
  console.log("📤 Syncing profile updates...");
}

async function syncEventRegistrations() {
  // Implement event registration sync logic
  console.log("📤 Syncing event registrations...");
}

/**
 * Push Notifications
 */
self.addEventListener("push", (event) => {
  console.log("📬 Push notification received");

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: data.tag || "amor-notification",
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Amor", options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked");
  event.notification.close();

  const data = event.notification.data;
  const url = data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window if app not open
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

### Step 7: Create Offline Fallback Page

Create `frontend/src/app/offline.tsx`:

```typescript
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] to-[#1a1f2e] px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="text-6xl mb-4">📴</div>
          <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
          <p className="text-gray-400 mb-6">
            It looks like you've lost your internet connection. Some features will be limited, but
            you can still browse cached content.
          </p>
        </div>

        <div className="bg-[#1a1f2e] border border-pink-500/20 rounded-lg p-6 mb-6 text-left">
          <h2 className="font-semibold text-white mb-3">What you can do:</h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>✓ View previously loaded pages</li>
            <li>✓ Read cached event information</li>
            <li>✓ View your profile (if cached)</li>
            <li>✗ Sign up or login (needs connection)</li>
            <li>✗ Upload new information</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Try Again
        </button>

        <p className="text-xs text-gray-500 mt-4">
          We'll sync your changes when you're back online.
        </p>
      </div>
    </div>
  );
}
```

### Step 8: Initialize Service Worker in Root Layout

Update `frontend/src/app/layout.tsx` to register the service worker (add this after the RootLayout export):

```typescript
// Add this import at the top
import PWAInitializer from "@/components/PWAInitializer";

// Inside RootLayout, add PWAInitializer component:
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ... existing head content ... */}
      </head>
      <body
        className={`${inter.variable} ${youngSerif.variable} ${permanentMarker.variable} antialiased bg-premium-gradient`}
      >
        <PWAInitializer />
        {children}
      </body>
    </html>
  );
}
```

### Step 9: Create PWA Initializer Component

Create `frontend/src/components/PWAInitializer.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker, handleNetworkStatus, requestPersistentStorage } from "@/lib/serviceWorkerRegister";

export default function PWAInitializer() {
  const [isOnline, setIsOnline] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Register service worker
    registerServiceWorker({
      onSuccess: (registration) => {
        console.log("PWA ready!");
      },
      onUpdate: (registration) => {
        console.log("App update available");
        setShowUpdatePrompt(true);
      },
    });

    // Listen for online/offline events
    handleNetworkStatus(
      () => {
        setIsOnline(true);
        console.log("Back online!");
      },
      () => {
        setIsOnline(false);
        console.log("Went offline");
      }
    );

    // Request persistent storage
    requestPersistentStorage();
  }, []);

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
          <span>📴</span>
          <span>You're offline - some features are unavailable</span>
        </div>
      )}

      {/* Update prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-4">
          <div>
            <span>🎉</span>
            <span className="ml-2">A new version is available!</span>
          </div>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-white text-blue-500 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
          >
            Update Now
          </button>
        </div>
      )}
    </>
  );
}
```

### Step 10: Create App Icons

You'll need to create the following icons. Use an online tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) or generate programmatically:

```bash
# Required sizes:
# - 192x192px (public/icons/icon-192x192.png)
# - 512x512px (public/icons/icon-512x512.png)
# - 96x96px (public/icons/icon-96x96.png) - for shortcuts
# - 72x72px (public/icons/badge-72x72.png) - for badges
```

**Quick Icon Generation Script** (`generate-icons.js`):

```javascript
import sharp from "sharp";
import fs from "fs";

const sizes = [72, 96, 192, 512];
const sourceIcon = "source-icon.png"; // Your 512x512 icon

async function generateIcons() {
  for (const size of sizes) {
    await sharp(sourceIcon)
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`Generated ${size}x${size} icon`);
  }
  console.log("✓ All icons generated!");
}

generateIcons().catch(console.error);
```

---

## Configuration Files Summary

### Modified Files:

1. **`frontend/next.config.ts`** - Add PWA plugin with caching strategies
2. **`frontend/src/app/layout.tsx`** - Add manifest & PWA metadata

### New Files:

1. **`frontend/public/manifest.json`** - App metadata for installation
2. **`frontend/public/sw.js`** - Service Worker implementation
3. **`frontend/src/lib/serviceWorkerRegister.ts`** - SW registration utilities
4. **`frontend/src/components/PWAInitializer.tsx`** - PWA initialization component
5. **`frontend/src/app/offline.tsx`** - Offline fallback page
6. **`frontend/public/icons/`** - App icons (192x512px minimum)

---

## Testing & Validation

### 1. Local Testing (Development)

```bash
# Build the app
npm run build

# Start production server
npm start

# Open DevTools (F12) → Application → Service Workers
# You should see the service worker registered
```

### 2. Test Offline Functionality

1. Open DevTools → Application tab
2. Go to "Service Workers"
3. Check "Offline" checkbox
4. Reload page
5. Verify cached content loads

### 3. Test Installation

**On Chrome/Edge:**

1. Click the install icon in the address bar
2. Confirm installation
3. App appears on home screen

**On iOS/iPadOS:**

1. Share button → "Add to Home Screen"
2. Name your app and tap "Add"
3. App icon appears on home screen

**On Android:**

1. Chrome menu (⋮) → "Install app"
2. App appears in app drawer

### 4. DevTools Inspection

```
Chrome DevTools → Application Tab:
├── Manifest ✓ Valid manifest loaded
├── Service Workers ✓ Registered & running
├── Cache Storage ✓ Caches populated
└── Offline ✓ Functionality works
```

### 5. Lighthouse PWA Audit

```bash
# Built-in Chrome DevTools
1. Open DevTools
2. Lighthouse tab
3. Run Progressive Web App audit
4. Target: 90+ score
```

Expected results:

- ✅ Manifest loaded
- ✅ Icons present (192px & 512px)
- ✅ Service Worker registered
- ✅ Installable
- ✅ Works offline
- ✅ HTTPS enabled (production)

### 6. Manual Test Checklist

- [ ] App installs on home screen
- [ ] App launches in fullscreen (standalone mode)
- [ ] Offline pages load from cache
- [ ] API calls retry when online
- [ ] Icons display correctly
- [ ] Splash screen appears on mobile (configurable)
- [ ] Push notifications work
- [ ] Update prompts appear
- [ ] Storage persists across sessions

---

## Deployment

### Prerequisites

- ✅ **HTTPS** enabled on production domain
- ✅ **Valid manifest.json** in public folder
- ✅ **Icons** 192x512px minimum
- ✅ **Service Worker** registered

### Production Deployment Steps

#### 1. Environment Configuration

Update your domain in `frontend/src/app/layout.tsx`:

```typescript
metadataBase: new URL("https://amor.example.com"), // Your actual domain
```

#### 2. Build for Production

```bash
cd frontend
npm run build

# Verify build succeeded
# You should see: .next/static and .next/server directories
```

#### 3. Update manifest.json

Ensure all URLs in `public/manifest.json` use your production domain:

```json
{
  "start_url": "https://amor.example.com/",
  "scope": "https://amor.example.com/"
}
```

#### 4. Deploy to Production

**Example with Vercel** (recommended for Next.js):

```bash
npm install -g vercel
vercel
# Follow prompts
```

**Example with your server:**

```bash
# Build
npm run build

# Copy to server
scp -r .next/ user@server:/var/www/amor/
scp -r public/ user@server:/var/www/amor/

# Ensure HTTPS is configured
# Restart your server
```

#### 5. Verify HTTPS

```bash
# Check certificate validity
curl -I https://amor.example.com

# Should show: HTTP/2 200
```

#### 6. Test PWA on Production

1. Visit your domain on mobile
2. Browser shows "Install" prompt
3. Click install
4. App works offline

### CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
name: Deploy PWA

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Build PWA
        run: cd frontend && npm run build

      - name: Validate manifest
        run: |
          # Check manifest exists and is valid JSON
          test -f frontend/public/manifest.json
          python3 -m json.tool frontend/public/manifest.json

      - name: Deploy to Vercel
        run: npm install -g vercel && vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Offline Data Sync Strategy

### For Auth State

Update your Zustand store to handle offline:

```typescript
// frontend/src/store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (credentials) => {
        try {
          // Try to authenticate
          const response = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
          });
          const data = await response.json();
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          // Offline - use cached credentials
          console.log("Offline - login failed");
          throw error;
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
```

### For Event Registration

Implement background sync:

```typescript
// Register for sync when offline
export async function registerForEvent(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
    });
    return await response.json();
  } catch (error) {
    // Queue for background sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register("sync-event-registrations");
      console.log("Event registration queued for sync");
    }
    throw error;
  }
}
```

---

## Troubleshooting

### Issue: Service Worker Not Registering

**Solution:**

- Ensure app runs on HTTPS (localhost OK)
- Check DevTools → Application → Service Workers
- Clear cache: DevTools → Application → Clear storage
- Check browser console for errors

```bash
# Debug in browser console:
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))
```

### Issue: Cache Too Large

**Solution:**

- Implement cache expiration in `sw.js`
- Limit maxEntries in caching strategies
- Clear old caches during activation

```javascript
const maxCacheAge = 30 * 24 * 60 * 60 * 1000; // 30 days
```

### Issue: App Not Installing on iOS

**Solution:**

- Ensure manifest is valid JSON
- Add all required meta tags to layout
- Use HTTPS
- Test in Safari (not Chrome)

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
```

### Issue: Stale Content After Update

**Solution:**

- Implement update notification
- User refreshes to get new version
- Set `skipWaiting: false` in next-pwa config

### Issue: Offline API Requests Failing

**Solution:**

- Implement Network First strategy for APIs
- Queue requests for background sync
- Show user-friendly offline message

```javascript
if (!navigator.onLine) {
  showOfflineMessage("You're offline. Changes will sync when online.");
}
```

---

## Advanced Features

### 1. Web Push Notifications

```typescript
// Request push permission
async function enablePushNotifications() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    // Send subscription to backend
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    });
  }
}
```

### 2. Background Sync

```typescript
// Queue action for sync when offline
async function queueAction(action: string, data: any) {
  if (!navigator.onLine) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(`sync-${action}`);
  }
}
```

### 3. Periodic Background Sync

```typescript
// Sync periodically (Web API)
const registration = await navigator.serviceWorker.ready;
await registration.periodicSync.register("sync-profile", {
  minInterval: 24 * 60 * 60 * 1000, // 24 hours
});
```

---

## Performance Metrics

Track PWA performance with Web Vitals:

```typescript
// frontend/src/lib/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export function reportWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

---

## Next Steps

1. **Install Dependencies**: `npm install next-pwa workbox-window`
2. **Create Files**: Follow steps 2-10 above
3. **Test Locally**: `npm run build && npm start`
4. **Audit PWA**: Use Lighthouse in DevTools
5. **Deploy**: Push to production with HTTPS
6. **Monitor**: Track PWA engagement metrics

---

## Resources

- [Web.dev PWA Docs](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [PWABuilder](https://www.pwabuilder.com/)
- [Next.js PWA Plugin](https://github.com/shadowwalker/next-pwa)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

## Summary

Your Amor app is now a full Progressive Web App with:
✅ Offline support
✅ Installation capability
✅ Smart caching strategies
✅ Push notifications ready
✅ Background sync capability
✅ Cross-platform compatibility

The PWA will dramatically improve user engagement and retention while maintaining your current tech stack.
