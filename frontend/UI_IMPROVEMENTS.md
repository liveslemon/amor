# UI/UX Improvements — Full App Audit

A page-by-page pass through the whole frontend (landing → onboarding → core app → events → business suite → admin → legal/utility pages), looking for visual inconsistency, unfinished UI, misleading states, and polish gaps. Each item names the file, what's wrong, and a concrete fix — not just "make it nicer."

Priority key: 🔴 high (misleading, broken, or off-brand) · 🟡 medium (visible inconsistency) · 🟢 low (nice-to-have)

---

## Top 5 if you only fix five things

1. ✅ ~~`registration-complete.tsx` is unreachable.~~ **Resolved: page deleted** (decision was to remove the dead page rather than wire it into the flow).
2. ✅ ~~Body-type picker is a plain `<select>`~~ **Resolved** — redesigned as icon pills, shared between signup and events RSVP. See section 2.
3. ✅ ~~`privacy.tsx` and `terms.tsx` have drifted~~ **Resolved** — merged into one shared component. See section 7.
4. ✅ ~~`offline.tsx` and `not-found.tsx` are off-brand~~ **Resolved** — re-skinned to match the rest of the app. See section 7.
5. 🟡 **Chat search input does nothing** ([chats.tsx:198-220](src/pages/chats.tsx#L198-L220)) — bound to state, filters nothing. Looks broken the moment a user has more than one thread.

---

## 1. Landing page (`src/app/page.tsx` + `src/components/sections/*`)

- 🟢 **Countdown has no unit labels** ([Hero.tsx:134-137](src/components/sections/Hero.tsx#L134-L137)) — `05:08:37:41` under "Next Match In" requires the visitor to infer days:hours:min:sec. Add tiny `D / H / M / S` labels under each pair, or a hairline separator style that reads more like a clock.
- 🟢 **Mobile vs. desktop CTA behavior is invisible to the user** — the same "Get Started"/"Download" button does a native install prompt on mobile but a plain link on desktop ([Hero.tsx:146-172](src/components/sections/Hero.tsx#L146-L172)). Not a bug, just worth a visual hint (small "Installs as an app" caption) since the button text already changes.
- 🟢 **`UpcomingEvents` section disappears entirely with no events** (confirmed earlier this session) — correct behavior now that the sticky-stack bug is fixed, but consider a lightweight "Events are back weekly — check back soon" placeholder instead of fully removing the section, so campus visitors know events exist as a feature even when none are scheduled.
- Landing's scroll-stack/zigzag system, `ZigZagSeparator`, and the `StickySection` mobile-offset bug were already reviewed and fixed earlier this session — no further issues found there.

## 2. Auth & Onboarding

### Sign up — body type picker (the specific ask)

**Current state** ([signup.tsx:299-309](src/pages/signup.tsx#L299-L309)): "Build" is a bare native `<select>` with plain text options (Slim, Petite, Athletic, Average, Muscular, Curvy, Plus-size). Two fields later, "Pref Body Type" ([signup.tsx:348-353](src/pages/signup.tsx#L348-L353)) renders the *same option list* as rounded pill buttons with the brand's pink accent (`bg-[#ff5fb8]/20 border-[#ff5fb8]/50`) — it already looks good. The inconsistency (plain system dropdown right next to a polished custom picker, for what is functionally the same data) is the actual complaint.

**✅ Done.** Implemented in a new shared component, [`src/components/profile/ProfileFieldsStep1.tsx`](src/components/profile/ProfileFieldsStep1.tsx):

- Build is now the same pill-button pattern as Pref Body Type, single-select (one active pill, click swaps selection, `role="radiogroup"`/`role="radio"` for a11y), each pill prefixed with a small (18px) abstract silhouette glyph — a filled head-circle + torso polygon whose shoulder/waist/hip widths vary per option (Slim/Petite narrow and uniform, Athletic broad-shouldered taper, Muscular broadest overall, Curvy pronounced waist-to-hip taper, Plus-size wide throughout, Petite additionally shorter). Pure geometric fill, no literal figure — stays within the "no AI-generated aesthetic, restraint over loudness" styling guide.
- Skin Tone got the same pill treatment with a small color-swatch circle (approximate representative tone per label) instead of an icon.
- Build and Pref Body Type are now visually identical twins (same shape/spacing/accent), differing only in single- vs multi-select.
- Extracted into `<ProfileFieldsStep1 value={...} onChange={(patch) => ...} />` and used by **both** `signup.tsx` and `events/[id].tsx`'s RSVP-signup flow, closing the duplication gap flagged below — any future change to these fields now only has to happen once. This also unified the two forms' previously-slightly-different input styling onto one consistent look.

### Sign up — everything else

- 🟡 **Gender, Relationship Goal, Conflict Style are still native `<select>`s** — lower priority than Build/Skin Tone (less visually sensitive data), but worth the same custom-dropdown treatment eventually for full consistency. Native selects also render light-mode OS chrome on some browsers, which clashes with the app's dark theme.
- 🟡 **No per-field validation feedback** — only one global error banner ([signup.tsx:254-258](src/pages/signup.tsx#L254-L258)) after submit; a 14-field step-1 grid gives no inline hints as the user fills it in.
- 🟢 **Height input allows nonsense** ([signup.tsx:325-335](src/pages/signup.tsx#L325-L335)) — plain ft/in number inputs accept e.g. "9 ft 15 in" with no clamping or live cm conversion shown.
- 🟢 **No step indicator** — the two-step form (profile → preferences/password) only reveals itself as multi-step once a "Back" button appears on step 2. A "Step 1 of 2" bar or two dots would reduce how open-ended the form feels.
- 🟢 **No password strength meter / show-hide toggle** on signup's password field.
- 🟢 **Hardcoded Unsplash background image repeated across three files** (login/signup/registration-complete) — not a visual bug, but a DRY smell; pull into one shared `AuthLayout`.

### Log in (`login.tsx`)

- 🟡 **Dead import**: `Eye, EyeOff` imported from lucide-react ([login.tsx:5](src/pages/login.tsx#L5)) but never rendered — a password show/hide toggle was clearly intended and never finished. Either build it (very low effort, high value for a numeric-adjacent password field) or drop the unused import.
- 🟢 **No "Forgot password" link/flow.**

### Registration complete (`registration-complete.tsx`)

- ✅ **Done — page deleted.** Rather than wire it into the signup success path, the decision was to remove the dead page entirely. `src/pages/registration-complete.tsx` is gone and its reference in `PWANavigation.tsx`'s `isAuthOrLanding` list has been cleaned up.

## 3. Core app pages

### Home (`home.tsx`)

- ✅ **Done** — invalid `py-0.2` class fixed to `py-0.5`.
- 🟢 **Lopsided desktop layout when there's no nearby event** ([home.tsx:444-494](src/pages/home.tsx#L444-L494)) — the right column collapses to just the conversations card with no fallback when `nearbyEvent` is falsy, leaving a big gap next to the taller match card. Add a minimal empty-state card for symmetry.

### Date (`date.tsx`)

- ✅ **Done** — restyled as an intentional empty state (icon badge + lighter framing, matching the app's other empty-state cards) instead of a stray paragraph.
- 🟡 **Native `window.confirm()` for blocking a user** ([date.tsx:163-167](src/pages/date.tsx#L163-L167)) — breaks out of the app's fully custom dark UI into a stock OS alert. Build an in-app confirm modal (there's precedent elsewhere, e.g. `me.tsx`'s modals). **The admin panel's "Run Matching Now" button has the exact same `confirm()` pattern** — worth fixing both together as one shared `ConfirmDialog` component.
- 🟡 **Report vs. Block inconsistency** ([date.tsx:445-457](src/pages/date.tsx#L445-L457)) — Block has a confirm step and clear context; Report silently fires with a hardcoded reason string (`"Inappropriate profile photo"`) and no user input at all. Give Report the same confirm step and a real reason picker.

### Chats (`chats.tsx`)

- 🔴 **Search input is decorative** ([chats.tsx:198-220](src/pages/chats.tsx#L198-L220)) — `searchQuery` is bound to state but never filters anything; there's only ever one thread rendered today, so it currently "works" by accident. Wire it up before multi-thread chat ships, or hide the input until it does something.
- 🟡 **Undelivered messages look identical to "sending" forever** ([chats.tsx:118-120, 292-296](src/pages/chats.tsx#L118-L120)) — per the code's own comment, a message blocked by the recipient just hangs in the sending state with no distinct error UI.
- 🟡 **No timestamps on messages** ([chats.tsx:284-312](src/pages/chats.tsx#L284-L312)) — baseline expectation for any chat UI; add a time under/beside each bubble or a day divider.
- 🟢 **Hardcoded `h-72` thread height** ([chats.tsx:276](src/pages/chats.tsx#L276)) regardless of viewport — cramped on desktop where there's much more vertical room. Use a flex/`md:h-[32rem]`-based height instead.
- ✅ **Done** — same restyle applied here too, consistent with `date.tsx`.

### Me / Profile (`me.tsx`)

- ✅ **Done — both badges removed.** "Active Member" and "Verified" were static JSX with no backing state; both have been deleted from `me.tsx` rather than kept as misleading claims.
- 🟢 **"Business Suite" entry point has no visual separation** from personal account settings below it ([me.tsx:457-475](src/pages/me.tsx#L457-L475)) — same card styling, just a `mb-4` gap. A small "For Organizers" section label (or physically separating it) would avoid mixing "manage yourself" with "manage your business account."

## 4. Events

### Events list (`events/index.tsx`)

- 🟡 **Misleading empty state** ([events/index.tsx:93-99](src/pages/events/index.tsx#L93-L99)) — "No events available right now" shows for both a genuinely empty catalog *and* zero search results, which reads as "there are no events" when really it's "no events match your search." Branch the copy on whether a search query is active, and add a "Clear search" action for the search case.
- ✅ **Done** — added `border border-white/10` (with a hover state) to match the rest of the app's cards.

### Event detail (`events/[id].tsx`)

- ✅ **Done — deduplicated.** Was reimplementing the entire signup step-1 form inline by hand (Build select, Skin Tone select, Pref Body Type pills, height/age fields). Now uses the same `<ProfileFieldsStep1 />` shared component as `signup.tsx` — see item 3 above.
- 🟢 This RSVP card is actually the **highest production-value UI in the app** (motion, consistent opacity scale, sticky aside) — worth treating as the reference pattern when polishing other forms, once it's extracted into a shared component.

## 5. Business Suite (`business.tsx`)

*(Mobile bottom-nav overlap already fixed this session.)*

- 🟢 **Raw hand-rolled `<button className="...">` everywhere instead of the shared `Button` component** (`src/components/ui/Button.tsx`, which has a full `cva` variant system already built) — this file, and essentially the whole app outside the design-system folder itself, never imports `Button`. See the cross-cutting note below; business.tsx's tab switcher, submit buttons, and admin-panel-review buttons are the most repetitive instances of this.
- 🟢 No loading skeletons for the Ads/Tickets lists — a bare "Loading…" text state would at least match the rest of the app's loading conventions better than a layout jump when data arrives.

## 6. Admin panel (`admin/index.tsx`)

*(Weekly Active Users chart and Log out control added this session.)*

- 🟡 **Native `confirm()` for "Run Friday Matching Now"** — same cross-cutting issue as `date.tsx`'s block confirmation; both should move to one shared in-app `ConfirmDialog`. Running the real matching algorithm is also the single highest-stakes action in the whole admin panel and arguably deserves more than a one-line browser confirm (e.g. a modal stating how many users will be matched).
- 🟢 **No pagination anywhere** — Pending Ads, Pending Tickets, and Flagged Profiles all render full unbounded lists. Fine at current scale; will become a real problem once ad/report volume grows. Worth a simple "load more" or page-size cap before it's needed urgently.
- 🟢 **No search/filter** on Flagged Profiles or WhatsApp Follow-ups — both are read top-to-bottom lists; even a simple name/number filter would help once the list grows past a screenful.

## 7. Legal & utility pages

- ✅ **Done — deduplicated.** Extracted `src/components/legal/LegalDocument.tsx` holding both policies' text (terms.tsx's fuller 6-section Terms copy won as canonical) plus the shared header/tab-switcher chrome. `privacy.tsx` and `terms.tsx` are now thin wrappers (`<LegalDocument defaultTab="privacy" | "terms" />` + page `<title>`). Verified both pages show identical, complete content for the same tab regardless of entry URL.
- ✅ **Done — `delete-data` button contrast fixed.** Default is now white text on black; hover swaps to the brand pink `#ffb6c1` with dark text, replacing the off-brand red. Also fixed the underlying `.legal-copy .legal-action` rule in `globals.css`, which had the same `#000B1A`-on-black color baked in at higher CSS specificity than the page's own Tailwind classes.
- ✅ **Done — re-skinned.** Both now use `font-serif` headings, the app's actual tokens (`#0c1322` card / `#0a0f1a` page bg / `#FFB6C1` & `#ff69b4` accents) instead of raw `slate`/`pink-500`, and lucide-react icons (`WifiOff`, `SearchX`) in the same circular icon-badge pattern used by Hero's install-guide modal, replacing the emoji glyphs. CTA buttons now match the white-pill pattern used across the rest of the app.

## 8. Cross-cutting / design-system issues

These showed up in nearly every page reviewed, so fixing them centrally is higher-leverage than any single-page fix above:

- 🟡 **The shared `Button` component is essentially unused.** `src/components/ui/Button.tsx` has a complete `cva` variant system (default/destructive/outline/secondary/ghost/link/premium, multiple sizes) but almost every page hand-rolls its own `<button className="...">` with a slightly different one-off Tailwind string. This is why button styling feels *close* but not quite identical across home/date/chats/me/business/admin. Adopting the shared component everywhere would both fix a lot of small inconsistencies at once and make future restyles a one-file change.
- 🟡 **`window.confirm()` used for destructive/high-stakes actions** in at least two places (`date.tsx` block, `admin/index.tsx` run-matching) — breaks immersion with a stock OS dialog in an otherwise fully custom dark UI. One shared `ConfirmDialog` component would fix both and any future confirm need.
- 🟡 **Native `<select>` dropdowns throughout** (signup's Gender/Build/Skin Tone/Relationship Goal/Conflict Style, duplicated again in `events/[id].tsx`) render OS-default light-mode chrome on some browsers, clashing with the dark theme — the body-type section above has the concrete redesign; the same custom-dropdown pattern should eventually replace the rest.
- ✅ **Done** — removed the hardcoded `"1"` badge rather than continue showing a fake count; can be re-added once real unread-message state exists.
- 🟢 **Duplicated profile-field forms**: the signup step-1 fields are hand-copied into `events/[id].tsx`'s RSVP flow. Extracting a shared component (noted above) also means the body-type redesign only has to happen once.

---

## Suggested order of attack

1. ✅ Delete `registration-complete.tsx` and its dangling reference.
2. ✅ Fix the `delete-data` contrast bug and the hardcoded "Verified"/"Active Member" badges.
3. ✅ Redesign the Build/Skin Tone pickers in signup, extracted into a shared `<ProfileFieldsStep1 />` used by both signup and `events/[id].tsx`.
4. ✅ Deduplicate `privacy.tsx`/`terms.tsx` into one source of truth.
5. ✅ Re-skin `offline.tsx` and `not-found.tsx` to match the rest of the app.
6. Adopt the shared `Button` component and a shared `ConfirmDialog` as the two highest-leverage design-system cleanups.
7. Everything else (badges, search filtering, pagination, timestamps) as ongoing polish.
