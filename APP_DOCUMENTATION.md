# Minglee (Amor) — Comprehensive App & System Architecture Documentation

> **Tagline:** *"Get a match every Friday"*  
> **Platform Classification:** Progressive Web App (PWA), Event-Based Campus Matchmaking & Social Discovery  
> **Primary Audience:** University students and young singles (Pan-Atlantic University / PAU, UNILAG, and Nigerian campus ecosystem)  
> **Repository Root:** `/Users/macbook/Documents/Uni stuff/PAU/amor`

---

## Table of Contents

1. [Executive Summary & Core Concept](#1-executive-summary--core-concept)
2. [The Problem & The Minglee Solution](#2-the-problem--the-minglee-solution)
3. [Technology Stack & Architectural Overview](#3-technology-stack--architectural-overview)
4. [User Journeys & Application Modules](#4-user-journeys--application-modules)
   - [4.1 Authentication & WhatsApp Identity](#41-authentication--whatsapp-identity)
   - [4.2 The Two-Phase Onboarding Flow](#42-the-two-phase-onboarding-flow)
   - [4.3 Matchmaking Algorithm (Gale-Shapley / Stable Marriage)](#43-matchmaking-algorithm-gale-shapley--stable-marriage)
   - [4.4 The "My Date" Reveal Experience](#44-the-my-date-reveal-experience)
   - [4.5 Campus & Nightlife Events Hub](#45-campus--nightlife-events-hub)
   - [4.6 Progressive Web App (PWA) Architecture](#46-progressive-web-app-pwa-architecture)
   - [4.7 Push Notification Subsystem (WebPush / VAPID)](#47-push-notification-subsystem-webpush--vapid)
   - [4.8 Meta WhatsApp Business API Integration](#48-meta-whatsapp-business-api-integration)
   - [4.9 Admin Command Center & Telemetry](#49-admin-command-center--telemetry)
5. [Database Architecture & Schema Reference](#5-database-architecture--schema-reference)
6. [Complete REST API Specification](#6-complete-rest-api-specification)
7. [Design System, UX & Visual Aesthetics](#7-design-system-ux--visual-aesthetics)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [Operational Workflows & Scheduling](#9-operational-workflows--scheduling)
10. [Summary Checklist](#10-summary-checklist)

---

## 1. Executive Summary & Core Concept

**Minglee** (internally code-named **Amor**) is a modern, intentional matchmaking platform designed specifically for university students and young professionals.

Unlike conventional dating apps built around endless swiping, superficial snap judgments, and "ghosting culture," Minglee operates on an **event-driven, weekly release model**:

1. **One Curated Match Every Friday**: Every Friday morning, users unlock a single, high-compatibility match vetted by an algorithmic matching engine.
2. **Real-Life Event Integration**: Minglee connects digital romance with physical campus events (e.g., *WET WARS 2.0 Pool Party*, *RAVE DISTRICT Date Night*, brunch mixers). Users can register for events, see guestlists, and break the ice in real life.
3. **WhatsApp-First Connectivity**: Recognizing communication habits in Nigeria and West Africa, Minglee uses phone numbers (`+234...`) as primary IDs and offers frictionless 1-tap WhatsApp chat links to spark conversations immediately.
4. **App Store Freedom via PWA**: Built as an installable Progressive Web App (PWA) with service workers, native push notifications, offline resilience, and an adaptive layout that hides landing pages once installed on a user’s home screen.

---

## 2. The Problem & The Minglee Solution

| Traditional Dating Apps (Tinder, Bumble, Badoo) | The Minglee Approach |
| :--- | :--- |
| **Swipe Fatigue**: Endless decks of profiles reduce people to playing cards; users burn out without going on dates. | **Scarcity & Anticipation**: Exactly *one* curated match every Friday. Users value their match and invest real effort. |
| **Unresponsive Matches**: Thousands of matches sit dormant in inboxes with zero messages exchanged. | **Direct WhatsApp Handoff**: 1-tap transition from match reveal directly into WhatsApp with an icebreaker. |
| **Disconnect from Real Life**: Purely virtual interactions rarely translate into meeting in person safely. | **Event-Driven Chemistry**: Partnered with campus events, pool parties, and parties where singles naturally congregate. |
| **Superficial Signals**: Matching based almost purely on photos with minimal personal alignment. | **Gale-Shapley Stable Marriage**: Hard dealbreakers (age, height, build) plus soft psychological alignment (conflict style, relationship goals, academic/career priorities). |

---

## 3. Technology Stack & Architectural Overview

The Minglee platform is organized as a decoupled monorepo consisting of an Express.js backend and a Next.js frontend.

```
amor/
├── backend/                  # Node.js Express REST API & Cron Jobs
│   ├── src/
│   │   ├── controllers/      # Route handlers (auth, onboarding, matches, events, admin, etc.)
│   │   ├── services/         # Business logic (matching, push notifications, WhatsApp, etc.)
│   │   ├── routes/           # Express router endpoints
│   │   ├── validators/       # Zod schemas for input validation
│   │   ├── jobs/             # Node-cron background schedulers
│   │   ├── middleware/       # JWT auth & error interceptors
│   │   └── supabase.js       # Supabase Postgres & Storage client
├── frontend/                 # Next.js 15+ (React 19 / TypeScript / Tailwind CSS)
│   ├── public/               # Static assets, Web Manifest, Service Worker (sw.js)
│   ├── src/
│   │   ├── app/              # Next.js App Router (Landing, legal, offline fallbacks)
│   │   ├── pages/            # Next.js Pages Router (Dynamic app views: /date, /events, /admin, etc.)
│   │   ├── components/       # Reusable UI components (pwa, sections, layout, ui)
│   │   ├── store/            # Zustand persistent client stores (Auth store)
│   │   └── api/              # Axios HTTP client wrappers
```

### Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v3, Framer Motion (micro-animations), Lucide React (icons), Zustand (state management), Service Worker API & Cache Storage API.
- **Backend**: Node.js (ES Modules), Express.js, `web-push` (VAPID push notifications), `node-cron` (weekly matching schedule), `bcryptjs` (password hashing), `jsonwebtoken` (JWT bearer tokens), `multer` (file buffer processing).
- **Database & Storage**: Supabase PostgreSQL (relational tables, foreign keys, unique constraints) & Supabase Storage Bucket (`user-photos`).
- **External Integrations**: Meta WhatsApp Cloud API (Graph API v18.0 Webhooks & Messages), Web Push protocol, external ticketing platforms (Tix.africa, Cliqss).

---

## 4. User Journeys & Application Modules

### 4.1 Authentication & WhatsApp Identity
- **Registration (`/signup`)**: Users enter their Full Name, Nigerian WhatsApp number (`+234...`), and a secure password (minimum 8 characters).
- **Authentication (`/login`)**: JWT-based session management. Passwords are encrypted using `bcryptjs` with salt rounds. Tokens are stored client-side in `localStorage` and managed via Zustand (`useAuthStore`).
- **Account Recovery & State Sync**: Profile fetching (`GET /me/profile`) validates session tokens on page reload and hydrates user progress (`onboarding_completed`, `current_step`).

---

### 4.2 The Two-Phase Onboarding Flow
Minglee collects psychological and physical attributes to ensure high compatibility without making the process tedious.

#### Phase 1: Contact & Credentials
- Full name, WhatsApp phone number, and password.

#### Phase 2: Detailed Personal Profile & Preferences
1. **Physical Attributes**:
   - Gender: `Male`, `Female`
   - Age: Integer (18+)
   - Height: Stored internally in total inches, captured in feet and inches (e.g., `5'11"`)
   - Body Build: `Slim`, `Petite`, `Athletic`, `Average`, `Muscular`, `Curvy`, `Plus-size`
   - Skin Tone: `Fair`, `Caramel`, `Brown`, `Dark`, etc.
2. **Lifestyle & Psychology**:
   - Relationship Goals: `Marriage bound`, `Long-term`, `Short-term`, `Just looking for fun`
   - Conflict Resolution Style: `Talk it out immediately`, `Need space then talk`, `Let it blow over`
   - Weekend Persona: Night out vs. chill indoors
   - Afternoon Activity & Habits (e.g. Gym, reading, gaming)
   - University / Life Focus (Multi-select, max 2):
     - *"Getting my degree and doing well"*
     - *"Building a business/project on the side"*
     - *"Balancing school and enjoying life"*
     - *"Still figuring things out"*
   - Social Handles: Instagram (`@handle`), TikTok (`@handle`)
3. **Partner Preferences (Filters)**:
   - Preferred Age Range (`preferred_min_age` to `preferred_max_age`)
   - Preferred Height Range (`preferred_min_height` to `preferred_max_height`)
   - Preferred Body Builds (Multi-select array)
4. **Photos**:
   - Minimum 2, maximum 3 photos (1 Profile avatar, up to 2 Gallery photos).
   - Validated server-side: MIME type check (JPEG, PNG, WebP), 5MB file cap, stored in Supabase Storage under `user-photos/{userId}/{timestamp}-{random}.ext`.
5. **Atomic Completion**:
   - `POST /onboarding/complete` performs an atomic transaction saving the profile, preferences, focuses, builds, and photos in one payload, setting `onboarding_completed: true`.

---

### 4.3 Matchmaking Algorithm (Gale-Shapley / Stable Marriage)

Minglee implements the Nobel-prize-winning **Gale-Shapley algorithm** (`backend/src/services/matchingService.js`), guaranteeing a **stable matching** where no two individuals would mutually prefer each other over their assigned partners.

```
       [ Eligible Users (onboarding_completed = true) ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
       [ Male Pool ]              [ Female Pool ]
             │                           │
             └─────────────┬─────────────┘
                           ▼
              [ Calculate Match Score ]
              ├── 1. Hard Filters (Dealbreakers) -> Pass/Fail
              └── 2. Soft Filters (Affinity 50-100 pts)
                           │
                           ▼
          [ Preference List Sorting (Excluding Past Pairs) ]
                           │
                           ▼
              [ Gale-Shapley Stable Match Loop ]
                           │
                           ▼
         [ Expire Prior Week Matches -> Status: 'expired' ]
                           │
                           ▼
       [ Insert New Matches (Status: 'pending', match_week) ]
                           │
                           ▼
        [ Dispatch Push Notifications: "Match is Ready!" ]
```

#### Step 1: Hard Filters (Zero Tolerance)
If any of these fail, the match score drops to **0**, and the pair is never matched:
- **Age Bounds**: Male must be within female's age preference, and female within male's.
- **Height Bounds**: Male must fall within female's preferred height interval, and vice versa.
- **Build Preferences**: Male's body type must match female's preferred builds, and vice versa.

#### Step 2: Soft Filters & Affinity Scoring (50 to 100 Points)
Pairs passing all hard filters start with a base score of **50 points**, supplemented by:
- **Focus Overlap**: **+10 points** per shared life focus (up to +20 points).
- **Relationship Goal Alignment**: **+10 points** if both seek the same commitment level (e.g., both "Long-term").
- **Conflict Style Match**: **+5 points** if conflict approaches align.
- **Social Persona Match**: **+5 points** if social energy matches (e.g., both "Outgoing").
- **Weekend Type Match**: **+5 points** if leisure styles align.
- Final score is capped at **100**.

#### Step 3: Gale-Shapley Execution
- Male and female preference lists are constructed, skipping previously matched pairs (`pastPairs`).
- Free men propose to their highest-ranked available female.
- Engaged females trade up if a proposing male holds a higher affinity score than their current suitor.
- The process repeats until a stable equilibrium is reached.

#### Step 4: Expiration & Weekly Rotation
- Background Cron Job triggers every Friday at **12:00 AM WAT** (`node-cron`: `0 0 * * 5`, `Africa/Lagos`).
- Past active matches are transitioned to `status = 'expired'`.
- New matches are recorded under `match_week` (Monday date key).
- Web Push notifications dispatch immediately to both devices.

---

### 4.4 The "My Date" Reveal Experience
Located at `/date`, this is the user's primary weekly destination:
- **Countdown Timer**: Displays an animated countdown to Friday 8:00 AM WAT when the next match drops.
- **Dossier Card**:
  - High-res photo gallery with navigation controls.
  - Partner details: Name, verified badge, age, height, body build, lifestyle habits.
  - Psychological synergy: Shared focuses, conflict style, relationship intentions, Instagram handle.
- **One-Tap WhatsApp Button**: Opens WhatsApp directly with a pre-filled message:
  > *"Hey [Partner Name], I got you as my Friday match on Minglee! 😊"*
- **Safety Tips**: Reminder of campus meeting points, public date guidelines, and zero-tolerance harassment policies.

---

### 4.5 Campus & Nightlife Events Hub
Accessible at `/events` and `/events/[slug]`:
- Curated physical experiences tailored for singles to connect in person (e.g., *WET WARS 2.0 Pool Party*, *RAVE DISTRICT Date Night*).
- **Guestlist Registration**:
  - Direct RSVP stored in `event_attendees` table.
  - Real-time attendee counter ("142 singles attending").
  - Seamless inline sign-up/login modal so unregistered visitors can reserve tickets without losing context.
- **Third-Party Ticket Integrations**: Deep links to ticketing providers (Tix.africa, Cliqss).

---

### 4.6 Progressive Web App (PWA) Architecture
Minglee is configured to run as a native-feeling mobile app without needing native app store downloads:
- **Web App Manifest (`public/manifest.webmanifest`)**:
  - `display: standalone`
  - Portrait orientation lock
  - Custom brand colors: Background `#0a0f1a`, Theme Accent `#ff6b9d`
  - App icons with maskable support
- **Smart App Shell (`PWAAppShell.tsx`)**:
  - Automatically detects `window.matchMedia('(display-mode: standalone)')`.
  - **No Landing Page in Installed Mode**: If opened as an installed app, users bypass the promotional landing page and land directly on `/date` (if logged in) or `/login`.
  - Persistent bottom/top app navigation with real-time notification indicator.
- **Service Worker (`public/sw.js`)**:
  - Pre-caches core offline shells.
  - Offline fallback route (`/offline`).
  - Background push notification handler listening for `push` events and triggering `showNotification`.
  - Notification click listener deep-linking to `/date` or `/events`.

---

### 4.7 Push Notification Subsystem (WebPush / VAPID)
- Built on standard RFC 8291 Web Push using public/private VAPID key pairs.
- Subscription lifecycle:
  1. Frontend requests browser permission (`Notification.requestPermission()`).
  2. Service Worker registers push subscription with browser push service (FCM / Apple APNs).
  3. Subscription endpoint and encryption keys (`p256dh`, `auth`) are synced to backend via `POST /notifications/subscribe`.
  4. Backend dispatches push packets via `web-push`. If a browser returns HTTP 404 or 410 (Gone), the dead endpoint is purged from the database automatically.
- Multi-channel alerts:
  - Match Drop Alerts: *"❤️ Your Friday Match is Ready!"*
  - Admin Announcements & Event reminders.

---

### 4.8 Meta WhatsApp Business API Integration
- Integrated with Meta Graph API (`v18.0`).
- **Webhook Endpoint (`/whatsapp/webhook`)**:
  - GET verification using `hub.mode`, `hub.challenge`, and `hub.verify_token`.
  - POST receiver with HMAC-SHA256 signature verification (`x-hub-signature-256`) using `META_APP_SECRET`.
  - Automated message handler (`whatsappService.js`) capable of processing incoming WhatsApp messages and replying automatically.

---

### 4.9 Admin Command Center & Telemetry
Located at `/admin` and secured via header `x-admin-secret` or admin role:
- **Live KPI Dashboard**:
  - Total registered users
  - Onboarded / profile-complete users
  - Active push notification subscribers
  - Total matches generated to date
- **Manual Match Engine Trigger**: Execute the Gale-Shapley matching run on demand with instant diagnostic reporting.
- **Broadcast & Targeted Push Dispatcher**: Send immediate push notifications to all users or a specific user ID with custom title, body, and action URL.
- **Audit Table**: Real-time view of recent matches, partner IDs, match scores, and timestamps.

---

## 5. Database Architecture & Schema Reference

The platform uses Supabase PostgreSQL. Below is the relational structure:

```
                  ┌──────────────────────┐
                  │        users         │
                  ├──────────────────────┤
                  │ id (UUID, PK)        │
                  │ name                 │
                  │ whatsapp_number (UQ) │
                  │ password_hash        │
                  │ role                 │
                  │ onboarding_completed │
                  │ current_step         │
                  └──────────┬───────────┘
                             │ 1:1 / 1:N
       ┌─────────────────────┼─────────────────────┬─────────────────────┐
       ▼                     ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ user_profiles │     │  preferences  │     │ user_focuses  │     │  user_photos  │
├───────────────┤     ├───────────────┤     ├───────────────┤     ├───────────────┤
│ user_id (FK)  │     │ user_id (FK)  │     │ user_id (FK)  │     │ user_id (FK)  │
│ gender        │     │ pref_min_age  │     │ focus_option  │     │ image_url     │
│ age           │     │ pref_max_age  │     └───────────────┘     │ photo_type    │
│ height (in)   │     │ pref_min_hght │                           │ upload_order  │
│ build         │     │ pref_max_hght │                           └───────────────┘
│ skin_tone     │     └───────────────┘
│ weekend_type  │
│ conflict_style│
│ relation_goal │
└───────────────┘
       │
       ├───────────────────────────────────────────┐
       ▼                                           ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│          matches          │         │    push_subscriptions     │
├───────────────────────────┤         ├───────────────────────────┤
│ id (UUID, PK)             │         │ id (UUID, PK)             │
│ user1_id (FK -> users)    │         │ user_id (FK -> users)     │
│ user2_id (FK -> users)    │         │ endpoint (UQ)             │
│ match_score (INT, 50-100) │         │ p256dh                    │
│ match_week (DATE)         │         │ auth                      │
│ status (pending/expired)  │         │ user_agent                │
└───────────────────────────┘         └───────────────────────────┘
```

### Table Details

1. **`users`**:
   - `id`: UUID Primary Key (`gen_random_uuid()`)
   - `name`: Text
   - `whatsapp_number`: Text, Unique
   - `password_hash`: Text
   - `role`: Text (`user` | `admin`)
   - `onboarding_completed`: Boolean (default `false`)
   - `current_step`: Integer (default `1`)
   - `created_at`, `updated_at`: Timestamps

2. **`user_profiles`**:
   - `user_id`: UUID Foreign Key -> `users.id` (Unique)
   - `gender`: Text (`Male` | `Female`)
   - `age`: Integer
   - `height`: Integer (stored as total inches)
   - `build`: Text (`Slim`, `Petite`, `Athletic`, `Average`, `Muscular`, `Curvy`, `Plus-size`)
   - `skin_tone`, `personal_style`, `social_persona`, `weekend_type`, `afternoon_activity`, `habits`
   - `conflict_style`: Text (`Talk it out immediately`, `Need space then talk`, `Let it blow over`)
   - `relationship_goal`: Text (`Marriage bound`, `Long-term`, `Short-term`, `Just looking for fun`)
   - `green_flag`, `instagram`, `tiktok`: Text

3. **`preferences`**:
   - `user_id`: UUID Foreign Key -> `users.id` (Unique)
   - `preferred_min_age`, `preferred_max_age`: Integer
   - `preferred_min_height`, `preferred_max_height`: Integer (stored as total inches)

4. **`preferred_builds`**:
   - `id`: UUID Primary Key
   - `user_id`: UUID Foreign Key -> `users.id`
   - `preferred_build`: Text

5. **`user_focuses`**:
   - `id`: UUID Primary Key
   - `user_id`: UUID Foreign Key -> `users.id`
   - `focus_option`: Text

6. **`user_photos`**:
   - `id`: UUID Primary Key
   - `user_id`: UUID Foreign Key -> `users.id`
   - `image_url`: Text
   - `photo_type`: Text (`Profile` | `Gallery`)
   - `upload_order`: Integer (1, 2, 3)

7. **`matches`**:
   - `id`: UUID Primary Key
   - `user1_id`: UUID Foreign Key -> `users.id` (Male in GS)
   - `user2_id`: UUID Foreign Key -> `users.id` (Female in GS)
   - `match_score`: Integer (50 to 100)
   - `match_week`: Date (Monday anchor)
   - `status`: Text (`pending` | `expired` | `accepted` | `rejected`)
   - `created_at`: Timestamp

8. **`events` & `event_attendees`**:
   - `events`: `id`, `event_name`, `event_picture`, `event_day`, `created_at`
   - `event_attendees`: `id`, `event_id` (FK), `user_id` (FK), `created_at` (Unique pair constraint)

9. **`push_subscriptions` & `notifications`**:
   - `push_subscriptions`: `user_id`, `endpoint` (Unique), `p256dh`, `auth`, `user_agent`
   - `notifications`: `user_id` (nullable for broadcasts), `title`, `body`, `url`, `type`, `is_read`, `created_at`

---

## 6. Complete REST API Specification

Base URL: `http://localhost:4000` (Local) / Cloud Production  
Header for Authenticated Endpoints: `Authorization: Bearer <access_token>`

### 6.1 Authentication (`/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | No | Register new user with name, WhatsApp number, and password. |
| `POST` | `/auth/login` | No | Authenticate with WhatsApp number and password, returns JWT token. |

### 6.2 Onboarding & Profile (`/`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/onboarding/complete`| Yes | **Atomic onboarding save**: saves profile, preferences, focuses, builds, and photos simultaneously. |
| `POST` | `/profile` | Yes | Update individual personal profile fields. |
| `POST` | `/preferences` | Yes | Update age and height partner preferences. |
| `POST` | `/focuses` | Yes | Set life focuses (max 2). |
| `POST` | `/preferred-builds` | Yes | Set preferred partner body builds. |
| `POST` | `/photos` | Yes | Set ordered photo URLs. |
| `POST` | `/photos/upload` | Yes | Upload image binary (`multipart/form-data`) to Supabase bucket. |
| `GET` | `/me/profile` | Yes | Retrieve full profile, photos, preferences, and onboarding status. |

### 6.3 Matchmaking (`/matches`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/matches/current` | Yes | Fetch active weekly match with full partner profile, photos, and score. |
| `GET` | `/matches/history` | Yes | Fetch user's historical match records. |

### 6.4 Campus Events (`/events`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/events` | No | List all upcoming events with attendee counts. |
| `POST` | `/events` | Yes/Admin | Create a new campus event. |
| `POST` | `/events/register` | Yes | RSVP / register user for a specific event. |

### 6.5 Push Notifications (`/notifications`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/notifications/subscribe` | Yes | Register browser VAPID push subscription. |
| `GET` | `/notifications` | Yes | Fetch user in-app notification center feed. |
| `POST` | `/notifications/test` | Yes | Dispatch test notification to current user. |

### 6.6 Admin Command Center (`/admin`)
Requires `x-admin-secret` header or `admin` user role.
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | Admin Secret | Telemetry overview: total users, subscriptions, matches, and audit log. |
| `POST` | `/admin/run-matching` | Admin Secret | Manually trigger the Gale-Shapley matching cycle immediately. |
| `POST` | `/admin/send-notification` | Admin Secret | Broadcast or target custom push notification to users. |

### 6.7 Meta WhatsApp Webhooks (`/whatsapp`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/whatsapp/webhook` | No | Meta verification challenge handshake (`hub.challenge`). |
| `POST` | `/whatsapp/webhook` | Signature | Inbound WhatsApp message receiver with HMAC verification. |

---

## 7. Design System, UX & Visual Aesthetics

Minglee's visual presentation is crafted to deliver a modern, premium experience:

- **Color Palette**:
  - Midnight Canvas: `#0a0f1a`, Deep Navy `#0c1220`, Card Surface `#141c2e`
  - Romantic Accents: Vibrant Neon Pink `#ff6b9d`, Rose Quartz `#f43f5e`, Coral Glow
  - Typography: Serif header elements paired with ultra-clean sans-serif (Inter / Geist)
- **Visual Effects & Micro-Interactions**:
  - Glassmorphic panels with subtle frosted borders (`backdrop-blur-xl`, `border-white/10`)
  - Smooth Framer Motion transitions across multistep onboarding cards
  - Dynamic ZigZag aesthetic divider bands separating landing page sections
  - Custom pulsating countdown clock for match reveals

---

## 8. Configuration & Environment Variables

### Backend (`backend/.env`)
```env
PORT=4000
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_USER_PHOTOS_BUCKET=user-photos
JWT_SECRET=<strong-random-jwt-secret>
ADMIN_SECRET=minglee_admin_secret_2026

# Web Push (VAPID) Keys
VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_SUBJECT=mailto:support@minglee.app

# Meta WhatsApp Cloud API
META_APP_SECRET=<facebook-app-secret>
META_VERIFY_TOKEN=<custom-verify-token>
META_ACCESS_TOKEN=<system-user-access-token>
META_PHONE_NUMBER_ID=<whatsapp-phone-number-id>
META_GRAPH_VERSION=v18.0
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<matching-vapid-public-key>
```

---

## 9. Operational Workflows & Scheduling

```
Every Friday 12:00 AM WAT (Cron: '0 0 * * 5')
 │
 ├── 1. Filter: Fetch users where onboarding_completed = true
 ├── 2. Partition: Split into Male and Female cohorts
 ├── 3. Filter Deals: Discard pairs violating hard bounds (age, height, build)
 ├── 4. Score: Compute affinity scores (50-100) on psychological & lifestyle traits
 ├── 5. Stable Match: Execute Gale-Shapley equilibrium
 ├── 6. Expire: Update past pending matches to 'expired'
 ├── 7. Persist: Insert new matches for match_week
 └── 8. Notify: Dispatch Web Push notification to matched users
         │
         ▼
Every Friday 8:00 AM WAT
 └── Countdown expires on frontend -> Users open /date -> 1-tap WhatsApp chat
```

---

## 10. Summary Checklist

| Capability | Status / Implementation |
| :--- | :--- |
| **Phone-first WhatsApp Auth** | Complete (+234 format, bcrypt passwords, JWT) |
| **Two-Step Onboarding** | Complete (physical traits, lifestyle, conflict style, photos) |
| **Stable Marriage Matching** | Complete (Gale-Shapley algorithm, hard/soft scoring, deduplication) |
| **Weekly Scheduled Drops** | Complete (`node-cron` every Friday 12:00 AM WAT) |
| **Partner Reveal & Chat** | Complete (Photo gallery, compatibility breakdown, WhatsApp redirect) |
| **Campus Event Hub** | Complete (Guestlist registration, RSVPs, ticket links) |
| **PWA Installation** | Complete (Web manifest, standalone mode, app shell, offline caching) |
| **Push Notifications** | Complete (VAPID web-push, in-app notification center, admin broadcasts) |
| **Admin Control Room** | Complete (Telemetry, on-demand match trigger, custom push sender) |
| **Meta WhatsApp Bot** | Complete (HMAC signature verification, webhook receiver, graph dispatcher) |

---
*Documentation compiled for Minglee (Amor). Maintained in the repository root.*
