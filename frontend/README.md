# Minglee — Frontend

Next.js (Pages Router + App Router hybrid) Progressive Web App for Minglee. See the root [README.md](../README.md) and [APP_DOCUMENTATION.md](../APP_DOCUMENTATION.md) for product/architecture context — this file covers running and working on the frontend specifically.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev
```

Runs on `http://localhost:3000`. The dev server talks to the backend at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000` locally).

### Environment variables (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-side reads). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key for Web Push subscriptions. |

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Structure

- `src/pages/` — route pages (Pages Router)
- `src/app/` — PWA shell, root layout, and service worker registration (App Router)
- `src/components/` — UI components, grouped by domain (`ui/`, `layout/`, `sections/`, `pwa/`)
- `src/api/` — thin wrappers around backend endpoints (axios)
- `src/store/` — Zustand state (auth, etc.)
- `src/lib/` — shared client-side utilities

## PWA

The install flow, service worker, and offline app shell live in `src/app/register-pwa.tsx` and `src/components/pwa/`. Test installability with a production build (`npm run build && npm run start`) rather than `next dev`, since install prompts behave differently in dev mode.
