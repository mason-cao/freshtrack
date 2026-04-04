# FreshTrack UI Redesign — Session Summary

## Overview

Comprehensive UI/UX redesign of FreshTrack, a Next.js pantry tracking app. The goal is to transform the current utilitarian interface into a polished, feature-rich experience.

## Decisions Made

### 1. Design Direction: Warm & Organic
- Soft gradients (amber → sage → cream)
- Earthy, farmers' market aesthetic — approachable, friendly
- Rounded shapes (20px cards, 14px buttons, pill badges)
- Amber-tinted shadows (`0 2px 12px rgba(180, 160, 120, 0.08)`)
- Lucide-react icons only (no emojis)

### 2. Color Palette
| Token         | Hex       | Usage                        |
|---------------|-----------|------------------------------|
| Sage 600      | `#527a52` | Primary actions, active states |
| Sage 700      | `#3d5e3d` | Primary hover, gradients      |
| Amber         | `#d97706` | Accent, warnings              |
| Cream         | `#fefcf3` | Page background               |
| Warm White    | `#faf8f5` | Elevated surfaces             |
| Stone 900     | `#292524` | Primary text                  |
| Stone 500     | `#78716c` | Secondary text                |
| Terracotta    | `#c2410c` | Danger, urgent states         |

### 3. Freshness Status Colors
- **Fresh** (3+ days): Sage green bg/text (`#f0f4f0` / `#3d5e3d`)
- **Warning** (1-2 days): Amber bg/text (`#fef9ee` / `#92400e`)
- **Urgent** (today): Terracotta bg/text (`#fff5f0` / `#9a3412`)
- **Expired** (past): Stone bg/text (`#f5f0e8` / `#78716c`)

### 4. Typography
- **Font**: DM Sans — geometric humanist sans-serif with warmth
- Rounded letterforms complement the organic aesthetic

### 5. Navigation: Bottom Tab Bar + Side Rail
- **Mobile (< md)**: Fixed bottom tab bar with 4 tabs (Home, Pantry, Recipes, Stats)
  - Framer Motion `layoutId` sliding active indicator
  - FAB (floating action button) positioned above tabs for quick add
- **Desktop (≥ md)**: 72px collapsed side rail with icons + labels
  - Logo at top of rail
  - Same 4 navigation items

### 6. Implementation Approach: Framer-Powered (Approach B)
- Full Framer Motion integration for best animation quality
- `AnimatePresence` for page transitions (slide + fade)
- Spring physics on interactive elements (buttons, cards, FAB)
- `drag="x"` for swipe gestures
- `staggerChildren` for list entrance animations
- `layoutId` for shared layout animations (tab indicator, filter chips)
- +32KB gzipped bundle cost accepted for premium feel

### 7. New Features
- **Search & smart filters** — Client-side debounced search, pill-shaped filter chips (All, Urgent, Expiring, Fresh), sort dropdown
- **Swipe gestures** — Swipe right → "Used" (sage green), swipe left → "Wasted" (terracotta). Mobile only; desktop uses icon buttons.
- **Animated transitions** — Page transitions, staggered list entrances, skeleton loading states, spring-based micro-interactions
- **Enhanced dashboard** — Weekly summary hero card, streak badge, metric cards with icons, needs attention list, recipe suggestion
- **Quick add FAB** — Floating sage-green button on all pages, opens add-item dialog

### 8. Platform: Equally Mobile & Desktop
- Fully responsive with layout shifts at `md` breakpoint
- Touch-friendly targets on mobile, spacious layouts on desktop

---

## Screens Designed

### Dashboard (Home)
Sections top to bottom:
1. **Greeting + Streak Badge** — Time-based greeting with zero-waste day counter (animated count-up)
2. **Weekly Summary Hero Card** — Sage gradient card showing items used, wasted, $ saved this week. Animated number reveals.
3. **Metric Cards** — 3 cards: Active items, Use rate, Expiring soon. Each with themed lucide icon, staggered entrance animation.
4. ~~Freshness Timeline~~ — **REMOVED per user request**
5. **Needs Attention** — Top 3 most urgent items, swipeable on mobile, links to full pantry
6. **Recipe Idea** — Smart suggestion using expiring ingredients, tappable to recipe detail

### Pantry Page
- **Mobile**: Card list layout with swipe-to-action (Framer Motion `drag`). Search bar, horizontal filter chips, sort dropdown.
- **Desktop**: Table view inside rounded card. Search + filters in header row. "Add Item" button. Rounded icon buttons for Used/Wasted actions.

### Remaining (not yet designed)
- Recipes page
- Stats page
- Add Item dialog
- Skeleton loading states
- Empty states

---

## Tech Stack (unchanged + additions)
| Layer          | Technology                |
|----------------|--------------------------|
| Framework      | Next.js 16.2.1 (App Router) |
| Language       | TypeScript                |
| Database       | SQLite via better-sqlite3 |
| ORM            | Drizzle ORM              |
| Styling        | Tailwind CSS v4 (`@theme` for design tokens) |
| UI Components  | Radix UI primitives       |
| Charts         | Recharts                  |
| Icons          | lucide-react              |
| **Animations** | **Framer Motion (new)**   |
| **Confetti**   | **canvas-confetti (new)** |

## Key Files to Modify
- `src/app/globals.css` — `@theme` warm palette + CSS animation keyframes
- `src/app/layout.tsx` — Replace Navbar with AppShell, add AnimatePresence
- `src/lib/freshness.ts` — Update freshnessColor() returns from emerald → sage
- `src/components/layout/navbar.tsx` → Replace with `app-shell.tsx` (bottom tabs + side rail)
- `src/components/ui/button.tsx` — Update CVA variants to sage palette
- `src/components/pantry/item-table.tsx` — Split into table (desktop) + card list (mobile) with swipe
- `src/app/page.tsx` — Complete dashboard redesign

## Design System Implementation
- Define warm palette via Tailwind v4 `@theme` in `globals.css`
- Semantic token map in `src/lib/theme.ts` for JS-side color references
- Bulk replace: `emerald` → `sage`, `gray` → `stone` across all components
