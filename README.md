# Minglee (Amor) 💖

> **Tagline:** *"Get a match every Friday"*  
> **Platform:** Progressive Web App (PWA) for intentional campus matchmaking & event discovery.

---

## 📖 Complete Documentation

A comprehensive, detailed architectural and system document is available in:
👉 **[APP_DOCUMENTATION.md](./APP_DOCUMENTATION.md)**

It covers in detail:
- **Core Concept & Problem Solved**: Solving swipe fatigue through weekly drops and campus events.
- **Tech Stack**: Next.js 15, Express.js, Supabase Postgres, WebPush, and Meta WhatsApp Cloud API.
- **Matchmaking Engine**: Mathematical Gale-Shapley (Stable Marriage) algorithm, hard dealbreakers, and affinity scoring.
- **User Flows**: Phone authentication, 2-phase psychological onboarding, Friday match reveals, and 1-tap WhatsApp chats.
- **Campus Events**: Guestlists, real-time RSVP counters, and ticket integrations.
- **PWA & Push Subsystem**: Service Worker, standalone app shell, and VAPID push notifications.
- **Database Schema**: Full PostgreSQL tables, foreign keys, and column breakdowns.
- **API Reference**: Complete directory of all backend endpoints.
- **Admin Command Center**: Telemetry, live stats, on-demand matching triggers, and push broadcaster.

---

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
# Configure .env using .env.example
npm run dev
```
Runs on `http://localhost:4000`.

### 2. Frontend
```bash
cd frontend
npm install
# Configure .env.local
npm run dev
```
Runs on `http://localhost:3000`.
