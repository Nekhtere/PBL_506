# DESIGN.md — BatamSmart Deals

## Project Overview
A curated E-Cash voucher marketplace for Singapore tourists visiting Batam. Pay in SGD, redeem instantly with QR at merchant partners. Apple-inspired light-only design with glass-morphism aesthetic.

---

## Tech Stack
| Package | Version | Purpose |
|---|---|---|
| Next.js | ^14.2.35 | App Router, file-system routing |
| React / React DOM | ^18.3.1 | UI framework |
| TypeScript | ^5.9.3 | Type safety |
| Tailwind CSS | ^3.4.19 | Utility-first styling |
| Framer Motion | ^13.2.0 | Animations & transitions |
| Lucide React | ^1.42.0 | Icon library |
| Leaflet | ^1.9.4 | Maps (lazy-loaded) |
| ESLint | ^9 | Linting |

> **Note:** `@tailwindcss/postcss ^4` is in devDependencies but **not wired** into `postcss.config.mjs` — Tailwind v3 is the active pipeline. Safe to remove.

---

## File Structure
```
D:\batam-smart-deals\
├── public/                        # Default create-next-app SVGs
├── src/
│   ├── app/
│   │   ├── globals.css            # Design tokens & component classes
│   │   ├── layout.tsx             # Root layout (Inter font, metadata)
│   │   ├── page.tsx               # Homepage (all sections)
│   │   ├── favicon.ico
│   │   ├── merchants/
│   │   │   └── page.tsx           # All merchant partners listing
│   │   └── legal/
│   │       └── [slug]/
│   │           └── page.tsx       # Legal pages (dynamic route)
│   ├── components/                # 13 components
│   │   ├── Navbar.tsx             # Fixed glass pill nav + cart drawer + CartItem interface
│   │   ├── HeroSection.tsx        # 100dvh Unsplash slideshow, trust badge, stats
│   │   ├── DealsSection.tsx       # Deal carousel: search, geolocation, Leaflet map, drag-scroll
│   │   ├── MerchantCard.tsx       # Photo tile (aspect 4/5), wishlist, add-to-cart animation
│   │   ├── MerchantDetail.tsx     # Modal body: header, highlights, promo, CTA
│   │   ├── DetailModal.tsx        # Generic modal shell (Escape, scroll-lock, spring)
│   │   ├── ItinerarySection.tsx   # 2 trip-bundle cards w/ totals & savings
│   │   ├── FerrySection.tsx       # 4 ferry-route cards + tips panel
│   │   ├── RideGuideSection.tsx   # iPhone mockup (SVG map), fare table
│   │   ├── HowItWorksSection.tsx  # 3-step explainer
│   │   ├── MobileCartBar.tsx      # Sticky bottom cart bar (mobile, count > 0)
│   │   ├── NearbyMap.tsx          # Leaflet island (dynamic ssr:false, emoji pins)
│   │   └── Footer.tsx             # Brand, links, legal bar
│   └── lib/
│       └── merchants.ts           # Single data source: 13 merchants, details, tagColors
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.js                 # images.unsplash.com domain
└── package.json
```

---

## Design System

### Design Tokens (`src/app/globals.css` — single source of truth)

> **Colours are stored as raw RGB channels, not hex.** Each colour has a
> `--x-rgb: 29 29 31` channel token, and the `--x: rgb(var(--x-rgb))` hex below
> derives from it. This indirection is load-bearing, not decoration: Tailwind
> needs channels to build `rgb(var(--x-rgb) / <alpha-value>)`, which is what
> makes `text-fg/50` read the token. Writing `text-[var(--fg)]/50` does **not**
> work — Tailwind cannot inject an alpha into a bare `var()` and silently emits
> the colour at full opacity instead. So: to add a colour, add the channel token
> here and reference it in `tailwind.config.ts`; never write a raw hex in a
> className.

#### Surfaces
| Token | Value | Usage |
|---|---|---|
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--surface-sunken` | `#F5F5F7` | Inset areas, empty states |
| `--surface-raised` | `#FAFAFA` | Hover row on a white card |
| `--surface-hover` | `#EBEBF0` | One step darker than sunken |
| `--bg` | `#FBFBFD` | Page background |
| `--line` | `#E8E8ED` | Borders |
| `--line-soft` | `#E5E5EA` | Subtle dividers |
| `--line-strong` | `#D2D2D7` | Emphasis borders |

#### Text
| Token | Value | Usage |
|---|---|---|
| `--fg` | `#1D1D1F` | Primary text (Apple-style near-black) |
| `--fg-hover` | `#333333` | Lifted fill for dark buttons on hover |
| `--muted` | `#515154` | Secondary text (7.7:1 on `--bg` — AA ✓) |
| `--subtle` | `#6E6E73` | Tertiary text (5.1:1 on white — AA ✓) |
| `--faint` | `#C7C7CC` | Decorative only — **never text** |

#### Accent & State
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#0071E3` | Primary action color (Apple blue) |
| `--accent-hover` | `#005BBB` | Hover state |
| `--accent-ink` | `#005BBB` | Text/links on light or on a 10% accent tint |
| `--danger` | `#B3261E` | Error text (6.3:1 on `--bg` — AA ✓) |

**Why `--accent-ink` exists:** plain `--accent` is 4.7:1 on white — which does
clear AA for normal text — but only **4.1:1 on its own 10% tint**, which does
not. Since the tint is where accent-coloured labels usually sit (promo banners,
badges), anything that *reads* accent-coloured uses `--accent-ink` instead:
6.5:1 on white and 5.7:1 on the tint, both AA ✓. `--accent` is for fills and
buttons, where white sits on top of it.

> Contrast figures here are WCAG 2.x relative-luminance ratios, measured against
> the surfaces named. If you change a colour, re-measure — the numbers in this
> table are load-bearing, and several were wrong before (see the note under
> "Colour Audit").

#### Border Radius
| Token | Value |
|---|---|
| `--r-xs` | `0.625rem` (10px) |
| `--r-sm` | `0.75rem` (12px) |
| `--r-md` | `1rem` (16px) |
| `--r-lg` | `1.5rem` (24px) |
| `--r-xl` | `1.75rem` (28px) |

#### Elevation
| Token | Value |
|---|---|
| `--sh-1` | Subtle (1px + 3px shadow) |
| `--sh-2` | Card default (1px + 24px shadow) |
| `--sh-3` | Elevated (24px + 40px shadow) |
| `--sh-accent` | Blue glow for CTA buttons |

#### Motion
| Token | Value |
|---|---|
| `--dur-fast` | `150ms` |
| `--dur` | `200ms` |
| `--dur-slow` | `400ms` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

### Tailwind Config (`tailwind.config.ts`)
Extends:
- **Colors**: one entry per token above, each resolving to
  `rgb(var(--x-rgb) / <alpha-value>)` — `bg`, `surface`, `surface-sunken`,
  `surface-raised`, `surface-hover`, `line`, `line-soft`, `line-strong`, `fg`,
  `fg-hover`, `muted`, `subtle`, `faint`, `accent`, `accent-hover`,
  `accent-ink`, `danger`. Never a raw hex here.
- **Font family**: `Inter` (Google Fonts, `--font-inter` CSS var)
- **Border radius**: `4xl (2rem)`, `5xl (2.5rem)`
- **Backdrop blur**: `xs (2px)`

> **Two ways to spend a token, and only one scales.** Prefer the utility class
> (`text-fg`, `bg-surface-sunken`) — it supports opacity modifiers. The arbitrary
> form (`text-[var(--fg)]`) still appears in places and renders correctly at full
> opacity, but it **cannot take an opacity modifier** and bypasses the utility
> layer. Treat it as legacy; new code uses the class.

### Component Classes (`globals.css @layer components`)
| Class | Description |
|---|---|
| `.glass` | Apple Liquid Glass — `rgba(255,255,255,0.72)` + `blur(20px)` + inset highlight |
| `.glass-dark` | Dark variant — `rgba(0,0,0,0.38)` + `blur(20px)` |
| `.navbar-glass` | Navbar-specific — `blur(16px)` + `will-change: transform` (40% cheaper composite) |
| `.navbar-glass--scrolled` | Darker background on scroll state |
| `.card-soft` | Surface + line border + `--sh-2` shadow |
| `.focus-on-dark` | White outline for elements on dark photos |
| `.scrollbar-hide` | Cross-browser scrollbar removal for carousels |

---

## Typography
- **Font**: Inter (variable `--font-inter`) via `next/font/google`
- **Sizes**: `text-[13px]` (nav, badges) → `text-[15px]` (body) → `text-xl`/`text-2xl` (headings)
- **Weights**: `font-semibold` (labels), `font-bold` (headings, prices)
- **Text wrapping**: `text-wrap: balance` on h1–h3, `text-wrap: pretty` on p (native CSS, no JS)

---

## Component Hierarchy

### Homepage Flow
```
RootLayout (src/app/layout.tsx)
└─ Home (src/app/page.tsx)
   ├─ Navbar (fixed top, glass)
   │   ├─ Logo (hash link to #home)
   │   ├─ Desktop nav links (centered absolute)
   │   ├─ Cart button → CartScreen overlay
   │   └─ Mobile menu toggle → dropdown
   ├─ HeroSection (search bar, hero image)
   ├─ DealsSection → MerchantCard[] (horizontal scroll)
   ├─ ItinerarySection
   ├─ FerrySection
   ├─ RideGuideSection
   ├─ HowItWorksSection
   ├─ Footer
   └─ MobileCartBar (fixed bottom bar, mobile only)
```

### Merchant Detail Flow
```
MerchantsPage (src/app/merchants/page.tsx)
├─ Navbar (shared)
├─ MerchantCard[] (grid: 1/2/3 columns)
├─ DetailModal → MerchantDetail (overlay)
└─ MobileCartBar
```

### Cart Flow
```
MobileCartBar → opens → Navbar CartScreen overlay
CartScreen → list of CartItem → remove / checkout
```

---

## State Management
- **Pattern**: Local component state (`useState`) — no global store
- **Cart state** (`CartItem[]`): lives in `Home` and `MerchantsPage`, passed down via props
- **Selected merchant**: `selected` state in `MerchantsPage`, shown via `DetailModal`
- **Modal open/close**: Boolean state (`cartOpen`, `mobileOpen`, `selected`)
- **Scroll tracking**: `useEffect` + `requestAnimationFrame` in Navbar for glass opacity

---

## Navigation & Routing
- **Internal links**: Hash links with absolute paths (`href="/#deals"`) — works from sub-pages
- **Sub-pages**: `Link` from `next/link` (e.g., "Back to deals" on merchants page)
- **Route structure**:
  - `/` — Homepage
  - `/merchants` — All merchant partners
  - `/legal/[slug]` — Dynamic legal pages

---

## Responsive Design
| Breakpoint | Behavior |
|---|---|
| Mobile (< 640px) | Single column grid, mobile nav menu, MobileCartBar |
| `sm` (≥ 640px) | 2-column merchant grid |
| `md` (≥ 768px) | Desktop nav visible, mobile menu hidden |
| `lg` (≥ 1024px) | 3-column merchant grid |

- **Navbar**: Fixed top, glass morphism, darkens on scroll
- **Cart overlay**: Full viewport on mobile, centered dialog on desktop
- **Merchant cards**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

## Theming & Dark Mode
- **Current**: Light theme only, no dark-mode toggle — by design, not by omission
- **Enforced**: `color-scheme: light` on `:root` stops the UA from darkening form
  controls, scrollbars and the canvas when the OS is in dark mode
- **Architecture ready**: every colour is a `--*-rgb` channel token, so a
  `[data-theme="dark"]` block redefining those channels would re-theme the whole
  app without touching a className — and the `rgb(var(--x-rgb) / <alpha-value>)`
  form means opacity modifiers keep working in dark mode too
- **Dark variants exist**: `.glass-dark` class defined in globals.css
- **No `next-themes`** or theme provider installed

---

## Colour Audit

Every colour that a UI element paints comes from a token. The five hexes that
used to be listed here as "candidates for future token promotion" have all been
promoted:

| Old hex | Now | Where |
|---|---|---|
| `#6E6E73` | `--subtle` | RideGuide mockup subtext |
| `#D2D2D7` | `--line-strong` | HowItWorks number ring |
| `#FAFAFA` | `--surface-raised` | Fare-table row hover |
| `#EBEBF0` | `--surface-hover` | Emoji merchant row hover |
| `#B3261E` | `--danger` | Geolocation error text |

`npm run verify:tokens` enforces this: it fails the build if a token class stops
compiling, or if a palette colour reappears as a frozen literal outside `:root`.

### Deliberate non-token literals

Two places keep raw colours on purpose, and should stay that way:

1. **`themeColor: "#FBFBFD"` in `layout.tsx`** — a `<meta>` value, not CSS. It
   cannot read a CSS variable; it must equal `--bg` by hand.
2. **The RideGuide phone illustration** (`#e8f4f8` / `#d1ecf5` / `#c8e6f0`
   sky gradient, `#94a3b8` road grid, `#ef4444` destination pin) — this is
   artwork, not UI chrome. The route line and start pin do use `var(--accent)`,
   but the illustration's own palette is not part of the theme and should not
   invert if a theme switch is ever added. The destination pin keeps its red
   rather than borrowing `--danger`, because red-here means "you are going
   here", not "something failed".

Contrast notes in comments (`#515154 on #FBFBFD = 7.7:1 ✓`) name the hex a token
resolves to, to keep the measurement checkable. They are documentation, not
colour sources.

> **These figures were wrong across the codebase and are now corrected.** The
> old comments claimed `#515154` was 5.1:1 on `--bg`; it is **7.7:1**. The
> `--accent-ink` rationale was wrong in the other direction — it claimed plain
> `--accent` fails AA on white (it does not: 4.7:1) when the real failure is on
> its own 10% tint (4.1:1). The token was always right; only the explanation was
> wrong. If you change a colour, re-measure and update both the token comment
> and the table above.

### Text over photos (not measurable as a ratio)

Text sitting on the hero slideshow, merchant photos or the RideGuide mockup
cannot be checked with a contrast ratio, because the backdrop is an image of
unknown luminance — a bright sky pixel and a dark one give different answers for
the same text. **There is no single correct number**, and a comment claiming one
(e.g. the old "white/80 = 9.4:1") is misleading, because it only holds where the
overlay happens to be dark.

What actually protects that text:

- **Gradient scrim** — the hero runs `from-black/85 via-black/40 to-black/15`
  bottom-to-top, so the bottom of the frame (where the headline and stats sit)
  is the darkest.
- **`.text-shadow-photo`** — a two-layer shadow (`0 1px 2px rgba(0,0,0,.55)` +
  `0 1px 10px rgba(0,0,0,.35)`) applied on MerchantCard, MerchantDetail,
  ItinerarySection and the RideGuide overlay. The shadow, not the ratio, is what
  keeps the text legible over an unpredictable backdrop.

Measured worst case, for the record: white/80 text at the *top* of the hero
gradient over a pure-white photo pixel is only ~1.3:1, and mid-gradient ~2.4:1.
That is why no text lives at the top of the hero — the content block is pushed
down into the dark end, and the top scrim exists solely to keep the glass navbar
legible. If you move text upward, re-check it against a bright slide.

### Tailwind palette colours (kept)

Some semantics are legitimately categorical rather than thematic, so they use
Tailwind's palette directly:

- `emerald-600` — success / free / verified
- `yellow-400` — star fill
- `red-500` — wishlist / error accent
- `orange-600` — social proof
- `sky-400` — hero MapPin
- `tagColors` in `merchants.ts` — 12 category badges spanning
  orange/purple/emerald/amber/pink/blue/indigo/teal/fuchsia/cyan/lime/rose

These are deliberately **not** tokenised: they encode a category, not a
themeable surface. Tokenising them would imply they should change with a theme,
which they should not.

---

## Animation Conventions
- **Entrance**: `opacity: 0` + `y: 30/24/20/12` → animate. Duration 0.4–0.7, stagger `delay: index * 0.07–0.15`.
- **Scroll reveal**: `useInView(ref, { once: true, margin: "-100px" })` on every section.
- **Easing**: `[0.16, 1, 0.3, 1]` (matches `--ease-out`) for hero/ride-guide; `"easeOut"`/`"easeInOut"` elsewhere.
- **Springs**: cart drawer `stiffness: 340, damping: 30`; cart badge `500/18`; mobile bar `380/32`.
- **Micro**: `whileHover={{ y: -4 }}`, `whileTap={{ scale: 0.98 / 0.94 }}`, hero crossfade 1.2s every 5s, floating badge `y: [0,-8,0]` 2.5s infinite, `layout` on cart list items.

---

## Layout Conventions
- **Sections**: alternate `bg-bg` / `bg-surface-sunken`; header pattern eyebrow → `h2 mt-2` → lead `mt-3`. A few sections still spell the first as `bg-[var(--bg)]` — same colour, legacy form, see the Tailwind Config note above.
- **Containers**: `max-w-6xl` (most sections), `max-w-5xl` (hero, HowItWorks), `max-w-3xl` (navbar), `max-w-md` (cart), `max-w-2xl` (search).
- **Anchor IDs**: `home`, `deals`, `itinerary`, `ferry`, `ride-guide`, `how-it-works`.
- **Z-index scale**: 5 (carousel fade edges) → 10 (arrows) → 40 (MobileCartBar) → 50 (Navbar) → 60 (DetailModal) → 70 (cart overlay).
- **Images**: plain `<img>` with `eslint-disable @next/next/no-img-element`, Unsplash `?w=700-1800&q=80&auto=format&fit=crop`. Not `next/image`.

---

## Code Conventions
- `CartItem` interface exported from `Navbar.tsx`, imported elsewhere (deliberate — cart owner is the navbar).
- `src/lib/merchants.ts` is the only data module; lookup maps (`tagColors`, `CATEGORY_GLYPH`) keyed by category/tag strings.
- `ponytail:` comments mark known shortcuts (fixed FX rate, indicative ferry fares, emoji map pins) — each names its upgrade path.
- All icon-only buttons carry `aria-label` + `aria-hidden` on the icon; overlays use `role="dialog"` / `role="menu"` + `aria-modal`.

---

## Accessibility
- **Focus ring**: Global `:focus-visible` outline (2px solid accent, 2px offset)
- **Dark surface focus**: `.focus-on-dark` class switches to white outline
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` kills all animation/transition
- **Semantic HTML**: `role="menu"`, `role="menuitem"`, `role="dialog"`, `aria-modal`, `aria-label`
- **Alt text**: Images use `alt` attributes; decorative icons use `aria-hidden="true"`

---

## Build & Deploy
| Script | Command |
|---|---|
| Development | `npm run dev` |
| Production build | `npm run build` |
| Production start | `npm run start` |
| Lint | `npm run lint` |
| Token gate | `npm run verify:tokens` |

- **Images**: `next.config.js` allows `images.unsplash.com` domain
- **PostCSS**: Tailwind v3 + Autoprefixer
- **Leaflet CSS**: Imported globally in `layout.tsx` (lazy-loaded chunks fail otherwise)

> **`verify:tokens` reads built CSS**, so it must run *after* `npm run build`.
> Run it first and it reports "No built CSS at .next/static/css" — that is the
> gate telling you the build has not happened, not a failure of the code.
>
> On Windows, `next build` cannot run while a `next dev` server holds the same
> `.next` directory — the build dies with `EPERM ... open '.next\trace'`. Stop
> the dev server first.

---

## Verification Checklist
1. `npm run build` → must compile clean
2. `npm run verify:tokens` → the invariant is `0 missing` and `0 frozen literal(s)`.
   (The leading "N used, N compiled" counts move as code changes; the two zeros are
   what must hold.)
3. Run `npm run dev` → open `http://localhost:3000`
4. Verify navbar links navigate correctly from both `/` and `/merchants`
5. Test cart add/remove flows, modal open/close
6. Resize viewport to check all breakpoints (mobile → desktop)
7. Inspect computed CSS variables in DevTools
8. Ensure Leaflet map loads on nearby map section
9. Verify keyboard navigation (Tab, Enter, Escape)
10. Check reduced-motion behavior in OS settings

---

## Future Considerations
- Dark-mode toggle. The architecture is ready — every colour is a channel token,
  so a `[data-theme="dark"]` block that redefines the `--*-rgb` values would
  work without touching a single className. **But the current design is
  light-only by intent** (`color-scheme: light` in `globals.css`, documented in
  the Project Overview), so this is a design decision to revisit, not a
  technical gap to close. The deliberate non-token literals in the RideGuide
  illustration would need to stay literal, or be given their own dark variants.
- Centralize cart state with React Context or Zustand (for cross-page cart sharing)
- Unit tests for Navbar scroll behavior
- Remove unused `@tailwindcss/postcss ^4` dev dependency — it is in
  devDependencies but not wired into `postcss.config.mjs`; Tailwind v3 is the
  active pipeline
- Migrate the remaining legacy `text-[var(--x)]` / `bg-[var(--x)]` forms to
  their utility-class equivalents (`text-fg`, `bg-bg`), so every colour spend
  supports an opacity modifier