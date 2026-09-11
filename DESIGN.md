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

#### Surfaces
| Token | Value | Usage |
|---|---|---|
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--surface-sunken` | `#F5F5F7` | Inset areas, empty states |
| `--bg` | `#FBFBFD` | Page background |
| `--line` | `#E8E8ED` | Borders |
| `--line-soft` | `#E5E5EA` | Subtle dividers |

#### Text
| Token | Value | Usage |
|---|---|---|
| `--fg` | `#1D1D1F` | Primary text (Apple-style near-black) |
| `--muted` | `#515154` | Secondary text (5.1:1 contrast — AA ✓) |
| `--faint` | `#C7C7CC` | Decorative only — **never text** |

#### Accent
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#0071E3` | Primary action color (Apple blue) |
| `--accent-hover` | `#005BBB` | Hover state |
| `--accent-soft` | `rgba(0,113,227,0.1)` | Backgrounds, badges |

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
- **Colors**: `background (#FBFBFD)`, `foreground (#1D1D1F)`, `accent (#0071E3)`, `muted (#515154)`
- **Font family**: `Inter` (Google Fonts, `--font-inter` CSS var)
- **Border radius**: `4xl (2rem)`, `5xl (2.5rem)`
- **Backdrop blur**: `xs (2px)`

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
- **Current**: Light theme only, no dark-mode toggle
- **Architecture ready**: CSS custom properties allow future `[data-theme="dark"]` override
- **Dark variants exist**: `.glass-dark` class defined in globals.css
- **No `next-themes`** or theme provider installed

---

## Inline Colors (not tokenized)
Used directly in classNames — candidates for future token promotion:

| Hex | Where |
|---|---|
| `#6E6E73` | RideGuide mockup subtext |
| `#D2D2D7` | HowItWorks number ring |
| `#FAFAFA` | Fare-table row hover |
| `#EBEBF0` | Emoji merchant row hover |
| `#B3261E` | Geolocation error text |

Tailwind palette accents: `emerald-600` (success/free), `orange-600` (social proof), `yellow-400` (star fill), `red-500` (wishlist/error), `sky-400` (hero MapPin). `tagColors` map in `merchants.ts` spans orange/purple/emerald/amber/pink/blue/indigo/teal/fuchsia/cyan/lime/rose at 500–600.

---

## Animation Conventions
- **Entrance**: `opacity: 0` + `y: 30/24/20/12` → animate. Duration 0.4–0.7, stagger `delay: index * 0.07–0.15`.
- **Scroll reveal**: `useInView(ref, { once: true, margin: "-100px" })` on every section.
- **Easing**: `[0.16, 1, 0.3, 1]` (matches `--ease-out`) for hero/ride-guide; `"easeOut"`/`"easeInOut"` elsewhere.
- **Springs**: cart drawer `stiffness: 340, damping: 30`; cart badge `500/18`; mobile bar `380/32`.
- **Micro**: `whileHover={{ y: -4 }}`, `whileTap={{ scale: 0.98 / 0.94 }}`, hero crossfade 1.2s every 5s, floating badge `y: [0,-8,0]` 2.5s infinite, `layout` on cart list items.

---

## Layout Conventions
- **Sections**: alternate `bg-[#FBFBFD]` / `bg-[#F5F5F7]`; header pattern eyebrow → `h2 mt-2` → lead `mt-3`.
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

- **Images**: `next.config.js` allows `images.unsplash.com` domain
- **PostCSS**: Tailwind v3 + Autoprefixer
- **Leaflet CSS**: Imported globally in `layout.tsx` (lazy-loaded chunks fail otherwise)

---

## Verification Checklist
1. Run `npm run dev` → open `http://localhost:3000`
2. Verify navbar links navigate correctly from both `/` and `/merchants`
3. Test cart add/remove flows, modal open/close
4. Resize viewport to check all breakpoints (mobile → desktop)
5. Inspect computed CSS variables in DevTools
6. Ensure Leaflet map loads on nearby map section
7. Verify keyboard navigation (Tab, Enter, Escape)
8. Check reduced-motion behavior in OS settings

---

## Future Considerations
- Dark-mode toggle (swap CSS variables via `[data-theme="dark"]`)
- Centralize cart state with React Context or Zustand (for cross-page cart sharing)
- Unit tests for Navbar scroll behavior
- Remove unused `@tailwindcss/postcss ^4` dev dependency
- Token duplication: 4 colors exist as both CSS vars and Tailwind config values

---
*Generated with Claude Code*