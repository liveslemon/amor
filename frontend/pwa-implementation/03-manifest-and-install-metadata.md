# Manifest and Install Metadata Setup

This file describes the standard metadata required for a browser install prompt in a production app.

## Required fields

```json
{
  "name": "Minglee",
  "short_name": "Minglee",
  "description": "Minglee helps you connect through events and curated social experiences.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0a0f1a",
  "theme_color": "#ff6b9d",
  "id": "/",
  "lang": "en",
  "dir": "ltr",
  "icons": [
    {
      "src": "/match-poster.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [],
  "categories": ["social", "lifestyle"],
  "shortcuts": [
    {
      "name": "Browse events",
      "short_name": "Events",
      "description": "Open upcoming events",
      "url": "/events",
      "icons": [
        {
          "src": "/match-poster.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ]
    }
  ]
}
```

## App Router metadata pattern

```tsx
import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://minglee.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Minglee",
  title: "Minglee | Get a match every Friday",
  description: "Find your next real connection through curated events and personalized matches.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Minglee",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/match-poster.png",
    shortcut: "/match-poster.png",
    apple: "/match-poster.png",
  },
  formatDetection: {
    telephone: false,
  },
};
```

## Required head tags

```tsx
<head>
  <meta name="theme-color" content="#ff6b9d" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Minglee" />
</head>
```

## Why this matters

The browser install prompt is triggered by the presence of a valid manifest, a matching icon, and a secure origin. The web app is not installable without this metadata layer.

## Production requirements

- Use HTTPS in production.
- Use a valid PNG icon with a minimum size of 512x512.
- Ensure the manifest is served at `/manifest.webmanifest`.
- Ensure the app metadata points to the real production domain.
- Do not mix marketing and app metadata in a way that creates conflicting launch URLs.

## Recommended install logic

The install flow should be:

1. web page loads
2. `beforeinstallprompt` fires if supported
3. banner appears above the fold
4. user taps install
5. browser installs the app
6. app opens in standalone mode
7. standalone mode routes to product screens instead of marketing landing screens

This is the correct user experience for a marketing-first web app with an app-first product experience.
