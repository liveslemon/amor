# Full App Audit — Security, Data Layer, Architecture, Repo Hygiene

A production-readiness pass across the whole app (`backend/` Node/Express API, `frontend/` Next.js PWA, Supabase/Postgres). Complements [frontend/UI_IMPROVEMENTS.md](frontend/UI_IMPROVEMENTS.md), which covers UI/UX only. Everything below was verified directly against the code, running processes, or `npm audit` output — not generic checklist items.

Severity key: 🔴 critical/high · 🟡 medium · 🟢 low/informational

---

## Top 5 blockers before calling this production-ready

1. 🔴 **Next.js is on a version with dozens of disclosed CVEs, including unauthenticated RCE.** Installed: `16.2.4`. Patched: `16.4.4` (same major, no breaking-change risk expected). `npm audit` lists 24 frontend vulnerabilities, 1 critical — all from this single outdated dependency.
2. 🔴 **CORS is effectively wide open.** `cors({ origin: true, credentials: true })` reflects *any* request's `Origin` header and allows credentials — any website can make authenticated requests to this API from a victim's browser.
3. 🔴 **No rate limiting anywhere in the backend.** Login, signup, and the admin-secret check all accept unlimited attempts — brute-forceable.
4. 🔴 **A critical `proxy-addr` dependency vulnerability (IP spoofing)** plus high-severity `multer`, `body-parser`, `ws`, and `zod` vulnerabilities in the backend — `npm audit` shows 8 backend vulnerabilities, 1 critical, 4 high.
5. 🟡 **Signup has no phone-number verification (no OTP).** Anyone can register claiming any WhatsApp number as their own — there's no proof of ownership before an account is created under that number.

---

## 1. Backend architecture — what's actually live

Clarifying this first because the repo structure is genuinely confusing:

- **`backend/src/`** is the one live Express app (`node --watch src/index.js`). This is what the frontend talks to.
- **`backend/backend/{ads,notifications,payments}/`** are *not* a separate backend — they're live JS modules that `backend/src/routes/index.js` imports directly (`import { adRoutes } from "../../backend/ads/index.js"`). Confusing path, but real, running code.
- **`backend/backend/app/`** (Python/FastAPI, `requirements.txt`, SQLAlchemy models, its own routers) is a **genuinely orphaned, unused prototype** — nothing in `src/routes/index.js` imports it, and there's no script that runs `uvicorn`. It's dead code sitting in the repo with its own idea of the schema, which risks a future contributor editing the wrong backend or assuming it's authoritative. **Recommendation: delete it, or move it to a clearly-labeled `/legacy` or separate archive repo** — keeping a second full backend implementation around invites exactly the kind of confusion that caused the original "two backends" assumption earlier in this session.
- **`backend/backend/migrations/*.sql`** and **`backend/backend/schema.sql`** are plain SQL applied manually to Supabase — independent of either app layer, this part is fine.

## 2. Security findings

### Auth & sessions
- Password hashing: `bcrypt.hash(password, 12)` — solid, no issue. ([authService.js:7](backend/src/services/authService.js#L7))
- `password_hash` is correctly stripped before returning user data — no leak.
- 🟡 **JWTs expire in 30 days with no refresh/rotation and no revocation mechanism** ([auth.js:10](backend/src/middleware/auth.js#L10)). A stolen token is valid for a full month with no way to invalidate it short of rotating `JWT_SECRET` (which would log out every user). Recommend a much shorter access-token lifetime plus a refresh-token flow, or at minimum a server-side revocation list for logout/"log out everywhere."
- 🔴 **No rate limiting on `/auth/login` or `/auth/signup`** — unlimited password-guessing attempts against any known WhatsApp number. No `express-rate-limit` or equivalent exists anywhere in the backend. This is the single highest-leverage fix in this whole audit relative to effort.
- 🟡 **No signup verification step.** `signup()` inserts a user row from a submitted `whatsapp_number` with no OTP/verification that the submitter actually controls that number ([authService.js:7-19](backend/src/services/authService.js#L7-L19)). Given the whole product identity model is "we text your match on WhatsApp," an unverified number is a real impersonation vector.

### Admin auth
- Timing-safe secret comparison is correctly implemented ([adminAuth.js](backend/src/middleware/adminAuth.js)) — good practice.
- 🟡 Same missing-rate-limit problem applies here: unlimited attempts against the shared `ADMIN_SECRET`.
- 🟢 Single shared secret (vs per-admin accounts) means there's no audit trail of *which* admin approved an ad or ran the matching cycle — fine for a small team today, worth individual accounts before the admin team grows.

### CORS & transport
- 🔴 `app.use(cors({ origin: true, credentials: true }))` ([app.js](backend/src/app.js)) reflects any origin and allows credentialed requests — functionally equivalent to `*` but worse because `credentials: true` means cookies/auth headers ride along. **Fix: explicit origin allowlist** (the known frontend domain(s)), not `origin: true`.
- `helmet()` is applied — good baseline header hygiene.

### WhatsApp webhook
- Signature verification is correctly implemented with `crypto.timingSafeEqual` ([whatsappController.js](backend/src/controllers/whatsappController.js)) — good.
- 🟡 **Fails open, not closed**: if `META_APP_SECRET` is unset, `verifySignature` returns `true` (skips verification) with only a `console.warn` ([whatsappController.js:10](backend/src/controllers/whatsappController.js#L10)). In this dev environment `META_APP_SECRET` is in fact unset. If that's ever true in production, anyone can POST forged webhook events. **Fix: throw/reject instead of allowing the request through when the secret is missing.**
- There's an explicit `WHATSAPP_SKIP_SIGNATURE_VERIFY` env escape hatch for local dev — fine that it exists (opt-in, not default-on), but it's undocumented in `.env.example` (see §4) and worth a loud comment that it must never be set in production.

### Input validation
- Zod schemas exist and are used for the main user-facing write paths (ads, matches, messages, safety). 🟢 **`adminPlatformController.js` and `whatsappController.js` have no schema validation at all** — lower risk since admin routes are secret-gated and the WhatsApp controller is signature-gated, but still worth adding basic shape validation as defense in depth (e.g. the notification-send endpoint takes a freeform `title`/`body`/`targetUserId` with no length/shape checks before hitting the DB and push service).
- No raw SQL string interpolation found anywhere — all queries go through the Supabase client's parameterized builder. No SQL injection risk identified.

### File uploads
- `backend/src/middleware/upload.js`: memory storage (no path-traversal risk from user-controlled filenames), 5MB size cap, single file, image-only `fileFilter`. Reasonable baseline. 🟢 The mimetype check trusts the client-supplied `Content-Type` rather than sniffing magic bytes — low-severity, since files land in Supabase Storage rather than being executed, but a determined user could upload a non-image with an `image/*` content-type header.

### Dependency vulnerabilities (`npm audit --omit=dev`)
**Backend** — 8 vulnerabilities (1 critical, 4 high, 3 moderate):
- 🔴 `proxy-addr` — critical, IP spoofing via IPv4-mapped IPv6 trust subnet.
- 🔴 `multer` — high, multiple DoS vectors (crafted field names, file-descriptor leaks, a fileFilter race that can bypass the size limit) — directly relevant since this app uses `multer` for all photo/image uploads.
- 🔴 `body-parser` — high, DoS via silently-disabled size limits.
- 🔴 `ws` — high, memory disclosure + DoS.
- 🔴 `zod` — high, memory exhaustion on oversized constrained collections.
- Run `npm audit fix` and re-test; most of these are transitive (via `express`) and should resolve with a routine dependency bump.

**Frontend** — 24 vulnerabilities (1 critical, 9 high, 11 moderate, 3 low), essentially all `next` itself (see Top 5 above). Upgrade to `16.4.4`+.

### Secrets hygiene
- No hardcoded credentials, API keys, or JWT-looking tokens found committed anywhere in tracked git history (checked backend, frontend, and the ad-hoc test/simulate scripts).
- `.env*` is correctly gitignored (with a sensible `!.env*.example` carve-out added this session).
- `ADMIN_SECRET` is handled like a dev secret today (plain string, pasted into a browser `<input>`, cached in `localStorage`) — acceptable for current scale, worth hardening (short-lived admin session token instead of the raw secret in `localStorage`) before wider admin team use.

## 3. Data layer (Supabase/Postgres)

- 🟡 **Row-Level Security is enabled on only 2 of 8 core tables** in `backend/backend/schema.sql` — `users`, `events`, `ads`, `notifications`, `payments`, and `tickets` have no RLS policies at all.
  - **Why this isn't currently critical**: verified the frontend's Supabase client (`frontend/src/lib/supabase.ts`, instantiated with the public anon key) is only ever used for `storage.from(...).getPublicUrl(...)` — a client-side URL construction, not a live query. There is no `supabase.from(...)` or `.rpc(...)` call anywhere in the frontend. All real data access goes through the Node API, which enforces its own auth.
  - **Why it's still worth fixing**: the anon-key Supabase client is already instantiated and ready to use. The moment anyone adds a direct `supabase.from("users").select(...)` call to the frontend — an easy, natural-looking shortcut — it becomes a live, unauthenticated read/write path into tables with zero RLS. This is a latent landmine, not an active one. Recommend enabling RLS with sensible default-deny policies on all 8 tables regardless of current exploitability, as defense in depth.
  - The backend's own writes go through the **service-role key**, which bypasses RLS entirely by design — that's expected and fine for a trusted server context.
- 🟢 `ads.reviewed_by` (and similarly-shaped admin-reference columns) reference `users(id)` with no explicit `ON DELETE` behavior, defaulting to `NO ACTION` — deleting an admin user account would be blocked by any ad they've reviewed. Low-severity edge case, but worth `ON DELETE SET NULL` for reviewer-type references.
- No hardcoded test credentials, emails, or phone numbers found in any `.sql` migration or schema file.

## 4. Documentation & env var gaps

- 🟡 `backend/docs/ENDPOINTS.md` has **zero mentions** of the matches/messages/safety (block/report) routes just added this session — it documents a meaningfully older surface than what's actually running.
- Env vars used in code but **missing from `backend/.env.example`**:
  - `FLUTTERWAVE_SECRET_KEY`, `PAYSTACK_SECRET_KEY` — payment-provider secrets used in `backend/backend/payments/paymentService.js`. Worth flagging doubly: not only undocumented, but payments is the most sensitive feature in the app to be running without any test coverage (see §5) or mention in setup docs.
  - `WHATSAPP_SKIP_SIGNATURE_VERIFY` — the dev-only signature bypass noted above; should be documented with an explicit "never set in production" warning.
  - `API_URL`, `RENDER_EXTERNAL_URL`, `NODE_ENV`, `DOTENV_CONFIG_PATH` — lower-stakes, but still worth adding for a contributor setting up the project from scratch.

## 5. Testing, CI/CD, and observability

- 🔴 **Zero automated test coverage in the entire monorepo.** No `*.test.js`/`*.spec.ts` files anywhere, no test runner in either `package.json` (no jest/vitest/mocha/playwright in devDependencies). The only "tests" that exist are six loose manual smoke-test scripts committed directly in `backend/backend/notifications/` (`testNotifications.js`, `testJwtAuthNotifications.js`, `simulateFrontendPolling.js`, etc.) — these look like local dev scratch files that happened to get committed rather than an intentional test suite, and they sit mixed in with production code rather than in a `scripts/` or `tests/` directory.
- 🔴 **No CI/CD pipeline** — no `.github/workflows/`, no other CI config found anywhere. Nothing currently runs `npm audit`, type-checks, or tests on a PR or push. This audit's findings (outdated Next.js, vulnerable deps) would have been caught automatically by even a minimal `npm audit` CI step.
- No error-tracking/observability tooling found (no Sentry, no structured logging beyond `console.*`) — worth adding before production traffic, since right now a production error's only trace is whatever's in server stdout.

## 6. Repo hygiene

- The orphaned Python backend (§1) is the single biggest hygiene item — recommend removing or clearly archiving it.
- Six manual test/simulate scripts in `backend/backend/notifications/` should move to a `scripts/` directory (or be deleted if truly obsolete) rather than sitting alongside production controllers/services.
- `backend/docs/ENDPOINTS.md` needs an update pass to reflect the current route surface (§4).

---

## Suggested order of attack

1. Upgrade `next` to `16.4.4`+ and run `npm audit fix` in both `frontend/` and `backend/` — highest severity, lowest effort, no code changes required.
2. Add rate limiting (`express-rate-limit` or similar) to `/auth/login`, `/auth/signup`, and the admin-secret check.
3. Fix the CORS config to an explicit origin allowlist.
4. Make the WhatsApp webhook fail closed when `META_APP_SECRET` is unset.
5. Delete or clearly archive the orphaned Python backend.
6. Enable RLS with default-deny policies on the 6 unprotected tables (defense in depth, not currently exploitable but a landmine).
7. Fill in the `.env.example` gaps, especially the two payment-provider secrets.
8. Stand up a minimal CI pipeline (type-check + `npm audit` + whatever tests exist) — even a one-job GitHub Actions workflow would have caught the dependency findings above automatically going forward.
9. Longer-term: real test coverage, shorter-lived JWTs with refresh/revocation, phone-number (OTP) verification on signup.
