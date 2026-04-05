# FreshTrack — Session Summary

## Current State (as of 2026-04-04)

FreshTrack is a fully functional, responsive pantry tracking app. Mobile and desktop experiences are both polished. The app is ready for deployment prep.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 (`@theme` directive) |
| UI Components | Radix UI primitives (shadcn/ui) |
| Charts | Recharts |
| Icons | lucide-react |
| Animations | Framer Motion |
| Confetti | canvas-confetti |
| Images | next/image + Unsplash CDN |

## Design System

- **Palette**: Sage green / cream / terracotta with warm stone neutrals
- **Font**: DM Sans
- **Shadows**: Amber-tinted warm shadows (`shadow-warm`, `shadow-warm-sm`, `shadow-warm-lg`)
- **Corners**: 12-20px radius on cards, pill-shaped badges and chips
- **Animations**: Spring physics throughout (stiffness 300-400, damping 17-30), staggered list entrances, `layoutId` shared animations
- **Tokens**: Defined via `@theme` in `globals.css`

### Freshness Status Colors
| Status | Condition | Style |
|--------|-----------|-------|
| Fresh | 3+ days | Sage green |
| Warning | 1-2 days | Amber |
| Urgent | Today | Terracotta |
| Expired | Past | Stone gray |

## Layout Architecture

### Mobile (< md)
- Fixed bottom tab bar (Home, Pantry, Recipes, Stats) with `layoutId` sliding indicator
- FAB (floating action button) for quick add
- Swipe-to-action cards in pantry (right = Used with confetti, left = Wasted)

### Desktop (md+)
- Side rail: 72px icon-only, expands to 220px at `xl:` with "FreshTrack" label
- Smooth `transition-[width]` / `transition-[margin-left]` on sidebar expand
- Container: `max-w-5xl` default, `xl:max-w-none` with `xl:px-12 2xl:px-20` padding
- Desktop table view in pantry (replaces swipe cards)

## Pages

### Dashboard (`/`)
- 12-col CSS grid at `xl:` breakpoint
- Greeting + animated streak badge
- WeeklyHero: sage gradient card with animated count-up numbers (Used/Wasted/Saved)
- 3 MetricCards (Active Items, Use Rate, Expiring Soon)
- NeedsAttention: up to 6 urgent items with circular Unsplash food photos
- Recipe suggestion card: Unsplash hero image, ingredient pills, cook time (right column at xl)

### Pantry (`/pantry`)
- Search bar with debounced input + item count
- Animated filter pills (All, Urgent, Expiring, Fresh, Expired) with `layoutId`
- Sort dropdown (Expiry Date, Name, Date Added, Category)
- Mobile: swipeable `ItemCard` with drag gestures
- Desktop: `ItemTable` with circular food photos, category badges, expiry badges

### Recipes (`/recipes`)
- Grid: 1 → 2 → 3 → 4 → 5 columns across breakpoints
- "Use It Up" section highlights recipes using expiring ingredients
- Recipe cards: Unsplash hero images, time/serving pills overlaid
- Detail modal: hero image, 2-col ingredients/instructions at xl, up to `2xl:max-w-3xl`

### Stats (`/stats`)
- Animated SVG `WasteRateRing` (Framer Motion `strokeDashoffset`)
- 4-stat hero grid (Consumed, Wasted, Use Rate, Saved)
- Two Recharts bar charts: consumption vs waste, cost breakdown
- Charts scale: 300px → 420px → 500px across breakpoints

## Key Files

| File | Purpose |
|------|---------|
| `src/components/layout/app-shell.tsx` | Shell with bottom tabs (mobile) + side rail (desktop) |
| `src/lib/food-images.ts` | Maps food names/categories → Unsplash URLs |
| `src/lib/freshness.ts` | Freshness status logic + color mappings |
| `src/db/schema.ts` | Drizzle schema (categories, items, recipes, recipeIngredients, wasteLog) |
| `src/db/seed.ts` | Dev seed data (10 categories, 37 items, 20 recipes, 44 waste logs) |
| `src/app/globals.css` | Tailwind `@theme` tokens for the warm palette |
| `next.config.ts` | Unsplash remote pattern for next/image |

## Seed Database

Run `npm run db:seed` to reset. Resets autoincrement counters.

- **10 categories**: Produce, Dairy, Meat, Bakery, Frozen, Canned, Beverages, Snacks, Condiments, Grains & Pasta
- **37 items**: Mix of urgent/warning/fresh/expired states with realistic cost estimates
- **20 recipes**: Range from 0-min smoothies to 28-min baked dishes, each with ingredient lists linked to pantry items
- **44 waste log entries**: 3 months of history for stats charts

## User Preferences (from feedback)

- Show quantity, not price, on pantry items
- Use high-quality Unsplash stock photos, never emojis as icons
- Vivid, smooth animations — premium feel, not bland
- Frequent previews and questions during implementation — never auto-pilot
- Simple page names ("My Pantry" not "The Root Cellar")
- App will be deployed for real users; seed data is dev-only

## Stitch Design References

- `.stitch/designs/dashboard-mobile.png` — mobile dashboard reference
- `.stitch/designs/pantry-mobile.png` — mobile pantry reference
- Current mobile UI closely matches both references (intentional deviations: quantity instead of price, "My Pantry" header)
