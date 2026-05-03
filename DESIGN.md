---
name: FreshTrack
description: Warm pantry intelligence for reducing household food waste.
colors:
  sage-50: "#f0f4f0"
  sage-100: "#dce6dc"
  sage-200: "#b8cdb8"
  sage-500: "#527a52"
  sage-600: "#3d5e3d"
  sage-700: "#2e472e"
  sage-800: "#1f301f"
  cream-background: "#fefcf3"
  warm-surface: "#faf8f5"
  warm-layer: "#f5f0e8"
  warm-border: "#ebe5d8"
  warm-border-strong: "#d6cdc0"
  amber-action: "#d97706"
  amber-warning: "#fcd34d"
  terracotta-danger: "#c2410c"
  terracotta-soft: "#fff5f0"
  stone-text: "#292524"
  stone-secondary: "#78716c"
  stone-muted: "#a8a29e"
typography:
  display:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0"
  title:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
  body:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "DM Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  xxl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.sage-500}"
    textColor: "{colors.warm-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.sage-600}"
    textColor: "{colors.warm-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.stone-text}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "36px"
  input-default:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.stone-text}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  card-default:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.stone-text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  filter-chip-selected:
    backgroundColor: "{colors.sage-500}"
    textColor: "{colors.warm-surface}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
---

# Design System: FreshTrack

## 1. Overview

**Creative North Star: "The Kitchen Ledger"**

FreshTrack should feel like a warm, practical pantry notebook upgraded with just enough intelligence to prevent waste. The surface is light because the product is used in kitchens, grocery routines, and everyday planning moments where legibility matters more than atmosphere. Food imagery and freshness status do the emotional work; decoration stays restrained.

The system rejects guilt-heavy sustainability apps, clinical enterprise dashboards, dark neon data products, purple gradient SaaS tropes, glassmorphism as decoration, and generic identical card grids. The interface should feel organized and tactile, never childish or punitive.

**Key Characteristics:**

- Warm neutral canvas with sage as the primary operational accent.
- Real food imagery for recognition and appetite, not stock-photo decoration.
- Dense but calm task surfaces, especially on pantry and stats screens.
- Clear semantic freshness states backed by labels, badges, and color.
- Motion that confirms state changes and completed actions.

## 2. Colors

The palette is a restrained product system: warm kitchen neutrals, muted sage for primary action and freshness, amber for use-soon cues, and terracotta for urgent or wasted outcomes.

### Primary

- **Pantry Sage**: The primary action and success family. Use sage for navigation selection, primary buttons, fresh states, and positive progress.
- **Deep Pantry Sage**: The deep hero surface and hover state. Use it for high-confidence surfaces such as dashboard and stats heroes.

### Secondary

- **Use-Soon Amber**: The warning and opportunity color. Use it for expiring items, recipe matches, savings emphasis, and small moment-of-action highlights.

### Tertiary

- **Waste Terracotta**: The danger and waste family. Use it for urgent freshness, wasted outcomes, destructive confirmation, and error messaging. It should be present but never dominate a whole screen.

### Neutral

- **Cream Background**: The global canvas. It keeps the app warm without turning beige-heavy.
- **Warm Surface**: Cards, dialogs, inputs, tables, and navigation.
- **Warm Layer**: Secondary surfaces, skeletons, chip backgrounds, and subtle dividers.
- **Stone Text**: Primary readable text.
- **Muted Stone**: Secondary labels, captions, timestamps, and helper copy.

### Named Rules

**The Freshness Carries Color Rule.** Color is earned by freshness state, selected navigation, primary action, or data visualization. Do not use accent color as background decoration.

**The No Shame Red Rule.** Terracotta signals urgency or waste, but it must not make the interface feel accusatory. Pair it with specific next actions.

## 3. Typography

**Display Font:** DM Sans with system fallbacks.
**Body Font:** DM Sans with system fallbacks.
**Label/Mono Font:** DM Sans with system fallbacks.

**Character:** One humanist sans keeps the product calm and cohesive. It should feel contemporary and friendly without becoming editorial or playful.

### Hierarchy

- **Display** (700, 48px, 1 line height): Use only for large hero metrics or rare impact moments.
- **Headline** (700, 30px, 1.15 line height): Page titles and major dashboard statements.
- **Title** (600, 18px, 1.25 line height): Cards, dialogs, chart titles, and section headers.
- **Body** (400, 16px, 1.5 line height): Descriptions and readable copy. Keep prose near 65 to 75 characters per line.
- **Label** (600, 12px, 0.04em letter spacing): Badges, small metadata, table headers, and compact status labels.

### Named Rules

**The Utility Type Rule.** Typography should support scanning. Do not introduce display fonts, script styles, gradient text, or exaggerated tracking.

## 4. Elevation

FreshTrack uses a hybrid of warm shadows and tonal layering. Surfaces are not glassy or deeply floating; they feel lightly lifted from the cream canvas. Shadow appears on reusable surfaces, hover states, dialogs, and high-level hero cards.

### Shadow Vocabulary

- **Warm Small** (`0 1px 4px rgba(180, 160, 120, 0.06)`): Small controls and low-emphasis surfaces.
- **Warm Default** (`0 2px 12px rgba(180, 160, 120, 0.08)`): Cards, recipe tiles, tables, and panels.
- **Warm Large** (`0 8px 32px rgba(180, 160, 120, 0.12)`): Dialogs, floating actions, and major hero panels.

### Named Rules

**The Lift Only When Useful Rule.** Shadows establish hierarchy or interaction. Do not add ambient glow, glass blur, or decorative floating layers.

## 5. Components

### Buttons

- **Shape:** Gently rounded rectangles (8px radius).
- **Primary:** Pantry Sage background with warm surface text, 40px height, medium weight.
- **Hover / Focus:** Darken to Deep Pantry Sage. Focus uses a 2px sage ring with a cream offset.
- **Secondary / Ghost:** Warm surface or transparent background with stone text. Use for support actions and cancellation.

### Chips

- **Style:** Rounded pills with compact labels and optional counts. Selected chips use Pantry Sage; unselected chips use warm or transparent surfaces.
- **State:** Filter chips must expose selected state visually and semantically. Counts should help users understand result size before clicking.

### Cards / Containers

- **Corner Style:** Standard cards use 12px radius. Major hero panels use 16px to 24px when the imagery earns more presence.
- **Background:** Warm Surface on Cream Background.
- **Shadow Strategy:** Warm Default at rest, Warm Large only for overlays or major emphasis.
- **Border:** Prefer subtle warm borders when freshness state or table structure needs clarity.
- **Internal Padding:** 16px to 24px. Compact mobile inventory cards can use 12px to preserve density.

### Inputs / Fields

- **Style:** Warm Surface background, warm border, 8px radius, stone text, muted placeholder.
- **Focus:** Sage ring with clear keyboard visibility.
- **Error / Disabled:** Terracotta text or border for errors; reduced opacity and disabled cursor for inactive fields.

### Navigation

- **Style:** Desktop uses a fixed side rail with icon and label. Mobile uses a fixed bottom tab bar.
- **Active State:** Sage text with a soft sage background or top indicator.
- **Hover / Focus:** Keep transitions quick, 150 to 250ms. Icons should remain Lucide style and consistent in size.

### Signature Component

**Freshness Item Row.** Inventory items combine food imagery, quantity, category, freshness meter, and explicit used/wasted actions. Color should appear as a border, badge, meter, or label, not as a heavy side stripe.

## 6. Do's and Don'ts

### Do:

- **Do** use real food imagery when it improves item or recipe recognition.
- **Do** pair every freshness color with a readable label.
- **Do** keep primary actions reachable by keyboard and touch, without requiring swipe gestures.
- **Do** use sage, amber, and terracotta only for semantic state, action, and charts.
- **Do** respect reduced motion and keep most transitions between 150ms and 250ms.
- **Do** maintain the warm neutral canvas and avoid sudden cold gray sections.

### Don't:

- **Don't** use guilt-heavy sustainability language or make waste feel like personal failure.
- **Don't** use clinical enterprise dashboard styling, generic blue-gray palettes, or cold data-tool surfaces.
- **Don't** use dark neon dashboards, purple gradient SaaS heroes, gradient text, or glassmorphism as decoration.
- **Don't** use border-left or border-right greater than 1px as colored side stripes on cards, list items, callouts, or alerts.
- **Don't** use emoji as UI icons. Use Lucide icons or real food images.
- **Don't** build repeated identical card grids when a table, list, segmented control, or chart communicates the task better.
