# Amor Frontend Styling Guide

This guide defines the visual language for the Amor frontend so every new element stays aligned with the brand’s existing mood: premium, warm, cinematic, intimate, and unmistakably social.

The goal is not just consistency in color and spacing. It is consistency in feeling.

---

## 1. Brand essence

Amor is a social-dating brand for university communities. The visual identity should feel:

- intimate but polished
- playful but elevated
- social but not chaotic
- romantic but not overly feminine or cliché
- premium, modern, and editorial

The core mood is:

- late-night campus energy
- safe, exciting social connection
- soft romantic tension
- high-trust, low-noise design

When in doubt, choose restraint over loudness.

## Hard rules for every added section

Every new section must follow the same structural pattern as the current landing experience:

- it must be a full-width dark section with a deliberate editorial rhythm
- it must use the sticky-section layout pattern for major content blocks
- it must include a top zigzag separator when visually separating one section from the next
- it must remain grounded, dark, and tactile rather than ultra-glossy or futuristic
- it must avoid neon glow, ambient bloom, chrome-like surfaces, or any AI-generated aesthetic treatment

This is not optional. If a section does not fit the sticky + zigzag structure, it should be redesigned before it ships.

No glow effects. No neon halos. No AI-looking UI. No soft-focus surreal gradients that make the product feel synthetic or generated.

---

## 2. Core design tokens

These are the foundation values already used across the app and should be treated as source-of-truth defaults.

### 2.1 Color palette

Base tokens defined in `src/app/globals.css`:

- Background: `#000B1A` — midnight navy
- Foreground: `#F8F9FA` — off-white
- Primary: `#FFB6C1` — soft pink
- Secondary: `#FF69B4` — hot pink
- Accent: `#E0E0E0` — soft silver
- Muted: `rgba(248, 249, 250, 0.6)`
- Glass: `rgba(255, 255, 255, 0.05)`
- Glass border: `rgba(255, 255, 255, 0.1)`

Use these exact values instead of inventing new ones unless there is a strong product reason.

### 2.2 Typography system

Fonts defined in the app:

- Serif: `var(--font-young-serif)`
- Sans: `var(--font-inter)`
- Script / handwritten highlight: `var(--font-marker)`

Rules:

- Use serif for emotional, premium headings and editorial moments.
- Use sans for body copy, labels, UI text, forms, and buttons.
- Use the handwritten marker style only for short accent phrases or emphasis, usually 1–3 words.
- Do not use the handwritten font for long text, paragraphs, dense UI labels, or modal content.

Examples already in the app:

- `“get a date every Friday.”` uses a bold sans heading with a marker-accented highlight.
- `Real Dates Delivered` uses a serif heading with a marker accent.
- UI labels like countdown text and small labels use uppercase tracking with a sophisticated low-contrast treatment.

### 2.3 Surface and glass treatment

The app’s common surface language is dark and atmospheric. Prefer:

- dark backgrounds with soft pink highlights
- translucent glass panels
- subtle borders with low opacity
- strong contrast between content and background

Use class patterns like:

```tsx
className="bg-white/10 border border-white/15 backdrop-blur-md"
```

or

```tsx
className="glass-morphism"
```

Glass surfaces should not be overly bright or transparent enough to lose readability.

Keep these as practical defaults:

- background: `rgba(255,255,255,0.05)`
- border: `rgba(255,255,255,0.1)`
- blur: `12px`
- shadow: soft, deep, grounded shadow rather than dramatic glow

---

## 3. Layout and spacing rules

### 3.1 Section rhythm

The app uses a strong editorial rhythm:

- large vertical spacing between sections
- bold typography with a little air around it
- content that is centered, elegant, and intentionally spacious

Typical section structure:

- `py-16` to `py-24` on mobile/desktop
- generous margins around headings
- wide max-width content containers for clarity
- centered composition for hero/content sections

### 3.2 Container rules

Use wide container constraints and consistent horizontal padding:

- `px-6` on small screens
- `md:px-12` or similar on larger screens
- `max-w-5xl` or `max-w-4xl` depending on the composition

Avoid cramped panels. Most sections are intentionally breathable.

### 3.3 Spacing scale

Use this progressive scale for new components:

- `4` / `8` / `12` / `16` / `24` / `32` / `48` / `64`

Keep relationships consistent. Avoid mixing ad hoc spacing values unless there is a real layout need.

---

## 4. Typography usage rules

### 4.1 Headings

Headings should generally follow this structure:

- `font-serif` for the core title
- soft tracking tightening for premium feel
- large size and strong visual weight
- very little use of uppercase unless for labels and small metadata

Example:

```tsx
<h2 className="text-3xl md:text-5xl font-serif tracking-tight drop-shadow-md">
  Real Dates Delivered
</h2>
```

### 4.2 Body copy

body text should be clean, readable, and modern:

- use `font-sans`
- keep lines comfortable and not too long
- avoid bright white text on pale backgrounds
- avoid large blocks of dark text on dark sections unless contrast is intentionally managed

### 4.3 Accent text

Use the pink accent sparingly and purposefully.

Good examples:

- single-word highlight in a headline
- emotional emphasis in a CTA label
- a brand phrase like “Friday.” or “Delivered”

Bad examples:

- making every heading pink
- using the marker style on long sentences
- making every button glow with pink emphasis

### 4.4 Text emphasis conventions

Use marker font only for short, expressive accents, often with a slight rotation:

```tsx
className="font-[family-name:var(--font-marker)] text-[#ff69b4] inline-block -rotate-3"
```

This is a key signature of the brand and should not be overused.

---

## 5. Button system

Buttons are central to the brand and should feel tactile, premium, and simple.

### 5.1 Base button styling

The system already defines a reusable button pattern in `src/components/ui/Button.tsx`.

Base rules:

- `rounded-full` for most buttons
- `transition-all duration-200`
- subtle hover shadow lift
- `active:scale-[0.98]` for tactile feedback
- focus states with visible ring
- strong legibility in dark backgrounds

### 5.2 Recommended variants

Use these variants consistently:

- `default`: translucent white-on-dark with soft border
- `secondary`: solid white text on black
- `outline`: transparent with subtle border
- `premium`: pink-violet gradient accents
- `ghost`: low-emphasis, minimal action

### 5.3 Hover and motion behavior

Buttons should feel responsive but not over-animated.

Good defaults:

- hover: slight background or border shift
- hover shadow: more pronounced but subtle
- active: scale down slightly
- transitions: 150–250ms for micro-interactions

Avoid:

- jarring spring animation on every button
- large scaling transforms
- flashing colors or excessive glow

---

## 6. Card and media treatment

### 6.1 Polaroid / photo card styling

The brand uses collage-like image compositions and layered photo cards to create an editorial, “real-life” feel.

Typical traits:

- warm off-black frames
- subtle white border or dark frame
- layered rotations floating slightly
- shadow depth to suggest lifted paper or film
- border and crop balanced with enough whitespace

Example pattern:

```tsx
className="bg-[#1a1a1a] p-1.5 pb-6 shadow-2xl rounded-sm border border-white/5"
```

### 6.2 Image behavior

Images generally follow these rules:

- crop with strong object-fit
- no decorative border radii unless the composition warrants it
- hover scale effect: usually `scale-105` to `scale-100` or `hover:scale-105` on a 500ms transition
- keep image layout intentional and not overly glossy

### 6.3 Content cards

For feature blocks, testimonial cards, or event cards, use:

- dark surfaces with translucent borders
- soft shadows
- subtle glow or radial accent only in the background
- text color primarily white with muted grey for secondary content

---

## 7. Motion design rules

Motion should feel premium, intimate, and decisive. It should never feel noisy or playful for the sake of it.

### 7.1 Motion principles

The app uses a restrained motion language based on:

- fade-in
- upward or sideways slide from off-screen
- soft parallax or floating background accents
- gentle hover motion
- very brief microinteractions

### 7.2 Recommended animation durations

Use these as defaults:

- 0.3s–0.5s: micro interactions
- 0.6s–0.8s: standard entrance animations
- 1.0s: more dramatic hero or layered reveal

### 7.3 Easing and spring behavior

Preferred patterns:

- `easeOut` for most reveal animations
- `transition={{ duration: 0.6, ease: "easeOut" }}`
- `whileInView` for scroll-based reveals
- subtle slow lift or float for decorative elements

Examples already used in the app:

```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}
```

or

```tsx
initial={{ opacity: 0, x: -50, y: -50, rotate: -10 }}
whileInView={{ opacity: 1, x: 0, y: 0, rotate: -2 }}
transition={{ duration: 0.7, delay: 0.1 }}
```

### 7.4 Floating and decorative animation

There is already a `float` animation defined in the global CSS:

```css
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
```

Use it when a decorative object needs a subtle motion, not for major UI elements that should feel static and grounded.

### 7.5 Marquee / scrolling motion

The album/testimonial section uses a marquee animation with a gentle infinite scroll. This is primarily for image or testimonial walls, not for navigation or core layout.

Rules:

- keep motion slow and smooth
- pause on hover when possible
- do not use marquee for important content that users need to read immediately
- maintain image widths and spacing so the movement feels polished, not cramped

---

## 8. Background treatment

Backgrounds should almost always be dark and atmospheric.

### 8.1 Standard section background

Prefer:

```tsx
className="bg-[#0a0f1a]"
```

or a radial glow treatment like:

```tsx
className="bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]"
```

### 8.2 Premium background accents

Use soft radial gradients only as accent layers, not as the entire surface. The background should remain controlled and dark.

This is a good pattern:

```css
background: radial-gradient(circle at top left, rgba(255, 182, 193, 0.15), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255, 105, 180, 0.1), transparent 40%),
            var(--background);
```

### 8.3 Avoid

- bright full-screen gradients that overpower the content
- multiple neon colors competing for attention
- very high-contrast gradients without a dark base
- overly saturated backgrounds on white text where legibility drops

---

## 9. Sticky section system

The landing page uses sticky sections as a compositional device to create a sequenced, editorial scroll rhythm. This is a major part of the brand experience and should be treated as a deliberate pattern, not a random layout trick.

### 9.1 Core behavior

The reusable sticky section logic lives in `src/components/layout/StickySection.tsx`.

Rules:

- by default, sections are `relative` on desktop and `sticky` on medium+ screens
- if `stickyOnMobile` is enabled, the section remains sticky on mobile too
- the section uses `top: topStyle` dynamically to keep content locked while the section is taller than the viewport
- if the section is shorter than the viewport, it sticks to the top (`top: 0px`)
- if the section is taller than the viewport, it adjusts to keep the bottom aligned with the viewport edge

This prevents awkward jumps and keeps tall sections feeling intentional instead of unstable.

### 9.2 Pattern for page rhythm

The home page currently uses sticky sections in sequence:

```tsx
<StickySection className="z-10"><Hero /></StickySection>
<StickySection stickyOnMobile className="z-20"><HowItWorks /></StickySection>
<StickySection className="z-30"><Features /></StickySection>
<StickySection className="z-35"><UpcomingEvents /></StickySection>
<StickySection className="z-40"><SuccessStories /></StickySection>
<StickySection stickyOnMobile className="z-50"><FAQ /></StickySection>
```

This creates a flow where each subsequent section sits above or below the previous one in a layered, cinematic way. It feels designed, not simply stacked.

### 9.3 Sticky section rules for future additions

When creating a new sticky section:

- every major section should use the sticky-section pattern unless it is intentionally a short, non-narrative block
- keep z-index layering intentional and sequential
- avoid stacking multiple sticky sections with identical z-values
- maintain breathing room between sections so the sticky behavior does not feel cramped
- use soft top/bottom separators when needed to visually define a section boundary
- keep sticky behavior for narrative/content-heavy blocks, not for every single card or panel
- prefer sticky only for sections that benefit from a long-form anchored composition
- all new section blocks should be introduced with the same zigzag top treatment used across the landing page

The zigzag top is part of the brand rhythm. It is not decorative fluff. It signals a section transition and helps create the consistent, cinematic flow of the homepage.

### 9.4 Mobile behavior

For mobile or smaller screens:

- use `stickyOnMobile` only when preserving the section as a visual anchor is important
- otherwise, default to a normal relative flow so content remains easy to read and scroll
- avoid making small UI blocks sticky on narrow screens unless they are meant to be constellations of content, not ephemeral controls

---

## 10. Overlapping and layered composition rules

The brand heavily uses subtle layering and overlap to create movement, depth, and a magazine-like composition. This is one of the clearest signatures of the app’s design language.

### 10.1 Overlap philosophy

The overlap effect is not random; it should be used to make a section feel curated and spatially alive. The app’s photo cards and editorial blocks deliberately sit at different depths and angles, giving the page a handcrafted cinematic feeling.

Use overlap when the element should feel:

- layered instead of flat
- composition-driven rather than purely utility-based
- editorial, tactile, and intentionally imperfect

### 10.2 Allowed overlap patterns

Good examples already in the app:

- photo cards drifting diagonally across the section
- block elements anchored at different positions with `absolute` placement
- central collage structures offset by `left-1/2` and `top-1/2`
- layered z-indices to define depth: cards behind other cards, titles behind or above media

Example:

```tsx
className="relative md:absolute md:left-1/2 md:top-1/2 z-10"
```

This pattern creates the layered editorial effect used in the feature collage.

### 10.3 Overlap constraints

When using overlap, keep these rules:

- the overlap should be visually intentional, not accidental
- maintain consistent shadows so layered elements remain grounded
- use low-opacity borders and dark frames to keep the composition elegant
- avoid too many overlapping pieces in one section; the arrangement should remain readable
- keep the overall composition centered and balanced across the viewport
- use rotation sparingly: a slight angle is good; aggressive rotation feels chaotic

### 10.4 Shared visual depth rules

For layered objects, consider:

- `z-index` values in stepped groups like `z-10`, `z-20`, `z-30`
- position offsets like `left-1/2`, `top-1/2`, `-translate-x-1/2`, `-translate-y-1/2`
- slight rotation such as `-rotate-3` or `rotate-2`
- subtle shadows to keep objects from flattening into the background

This should feel polished and intentional, never like floating UI with no structure.

### 10.5 Overlap do/don’t checklist

Do:

- keep cards within the same visual family and palette
- use consistent border treatments and shadow depth
- preserve enough negative space around the overlap so it remains legible
- let the arrangement feel like a curated collage

Don’t:

- overlap too many blocks with different colors and sizes
- use aggressive angles on everything
- place layered elements without a clear visual anchor
- create a composition that feels like a pile of junk instead of a deliberate editorial layout

---

## 11. Default component language

### 9.1 Layout blocks

Every new section should obey this pattern:

- dark section background
- large readable heading
- a clear accent line or highlighted phrase if needed
- main content block with spacing and emphasis
- soft visual glow accent in the background when appropriate

### 9.2 Cards and panels

Most panels should feel like they are floating over the dark background, not flatly pasted into it.

Use:

- `shadow-xl` or `shadow-2xl` for emotional depth
- `border border-white/10` or `border-white/5` for subtle separation
- `backdrop-blur-md` when glass is intentional

### 9.3 Contrast rules

Keep text legibility high:

- white and off-white for primary text
- muted grey for supporting labels
- pink for emphasis, not for paragraph copy
- avoid low-opacity text on low-contrast surfaces

---

## 10. Visual signatures that define the brand

These are the unique elements most important to preserving the vibe.

### 10.1 Pink accent highlights

Pink is not a generic accent; it is the emotional identity of the brand.

Use it most effectively in:

- short highlight words inside headings
- CTA emphasis
- subtle glows behind cards or background decorations
- icon badges and small labels

### 10.2 Handwritten typography

This is the strongest personality trait in the brand. It should feel intentionally imperfect and personal.

Use it for:

- 1–3 word brand phrases
- short headline breaks
- emotional signature moments

Do not use it for:

- full sentences
- navigation
- dense forms or marketing body copy

### 10.3 Editorial layout composition

The brand likes layered, slightly asymmetrical compositions.

Examples:

- cards drifting at angles
- overlapping images with diagonal placement
- floating frame-like layers
- slow moving collage composition

This should feel carefully curated, not chaotic.

---

## 12. Do and don’t checklist

### Do

- keep the dark midnight palette as the baseline
- use pink as a precise highlight, not constant saturation
- maintain soft glass surfaces and low-opacity borders
- use serif headings and clean sans UI mix
- respect spacing rhythm and generous vertical space
- defer to subtle motion rather than loud animation
- keep focus on content, not decoration

### Don’t

- introduce a bright rainbow palette
- make every panel neon or glowing
- use too much marker typography
- add cluttered gradients to every section
- overuse big shadows or harsh contrast
- animate every element at once
- use overly playful shapes or cartoonish styling
- add glow effects, bloom, impossible lighting, or chrome-like highlights
- create an AI-looking interface with clean-glass, synthetic gradients, futuristic surfaces, or ultra-smooth generic SaaS styling
- create a look that feels more “crypto startup” or “fitness brand” than “romantic social app”

---

## 13. Implementation checklist for future additions

Before shipping any new section, component, or feature, check all of the following:

1. Does it use the dark navy base background or an intentional variant?
2. Does it use the approved typography system?
3. Does it keep the pink accent restrained and meaningful?
4. Does the spacing feel breathable and aligned with the existing layout rhythm?
5. Are shadows and borders soft and layered rather than harsh?
6. Are animations subtle, slow, and premium rather than flashy?
7. Is the card or section composition editorial and intentional?
8. Is the element legible without relying on heavy glow or contrast tricks?
9. Does it fit the “safe, modern, intimate” emotional tone of the brand?
10. If it includes a custom motion, does it feel consistent with the existing ease and timing patterns?

If the answer to most of these is “no,” reassess the design before shipping.

---

## 14. Ready-to-use class patterns

These classes are a safe starting point for new UI work.

### 13.1 Section shell

```tsx
<section className="relative w-full py-16 md:py-24 overflow-hidden bg-[#0a0f1a]">
  <div className="w-full max-w-5xl mx-auto px-6 md:px-12">
    ...
  </div>
</section>
```

### 13.2 Glass card

```tsx
<div className="glass-morphism rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
  ...
</div>
```

### 13.3 Accent heading

```tsx
<h2 className="text-3xl md:text-5xl font-serif tracking-tight drop-shadow-md">
  Real Dates <span className="font-[family-name:var(--font-marker)] text-[#ff69b4] font-normal tracking-wide inline-block -rotate-3 ml-2">Delivered</span>
</h2>
```

### 13.4 Soft hover interaction

```tsx
className="transition-all duration-200 hover:bg-white/10 hover:border-white/20"
```

### 13.5 Reveal animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  viewport={{ once: true }}
>
  ...
</motion.div>
```

---

## 15. Design philosophy summary

The Amor brand should always feel like this:

- a premium social app for meaningful real-world dates
- polished but emotionally warm
- dimly lit, romantic, and a little cinematic
- elegant without being cold
- modern without feeling sterile

When a new element is proposed, ask: “Does this feel like Amor?” If the answer is uncertain, strip it back until it does.

This is not a style that thrives on complexity. It thrives on calm confidence, elegant contrast, and a clear emotional identity.

---

## 16. Source references in this repo

The design system is currently expressed in these files:

- `src/app/globals.css`
- `src/components/ui/Button.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Features.tsx`
- `src/components/sections/SuccessStories.tsx`
- `src/components/layout/Navbar.tsx`

Any new element should be checked against these files before implementation.
