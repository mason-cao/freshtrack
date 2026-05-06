# FreshTrack

**Reduce food waste. Save money. Track what matters.**

FreshTrack is a pantry management dashboard that helps you track food freshness, get alerts before items expire, discover recipes to use expiring ingredients, and visualize your waste patterns over time.

## The Problem

~30-40% of food purchased by US households is wasted, costing the average family ~$1,500/year. The root cause: people forget what's in their pantry. Items expire unnoticed, meals aren't planned around what needs using first, and there's no feedback loop showing how much waste actually occurs.

## Features

- **Freshness Dashboard** — Color-coded overview of all pantry items (green/yellow/red/gray by expiration urgency)
- **Expiration Alerts** — Prominent warnings for items expiring within 2 days
- **Pantry Management** — Add, edit, filter, and remove items with full inventory tracking
- **Recipe Suggestions** — "Use It Up" recipes that match your expiring ingredients
- **Consume/Waste Logging** — Track whether items were used or wasted for accountability
- **Statistics & Charts** — Monthly trends, waste rates, and money saved estimates

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Runtime | React 19 |
| Database | SQLite/libSQL via `@libsql/client` locally and Turso in production |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 with Google sign-in |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd project

# Install dependencies
npm install

# Run database migrations
npx drizzle-kit migrate

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Type-check the project |
| `npm run typecheck` | Type-check the project |
| `npm run test` | Run Vitest tests |
| `npm run icons:generate` | Regenerate PWA icon PNGs |
| `npm run db:seed` | Seed local dev database with sample data |
| `npm run db:seed:categories` | Seed production-safe global categories only |
| `npm run db:generate` | Generate new migrations from schema |
| `npm run db:migrate` | Run pending migrations |

## Deployment

FreshTrack deploys as an installable PWA on Vercel with Turso as the managed libSQL database.

### Environment Variables

See `.env.example` for the full template. Required in production:

- `TURSO_DATABASE_URL` - libSQL URL from Turso
- `TURSO_AUTH_TOKEN` - Turso auth token
- `AUTH_SECRET` - generate with `openssl rand -base64 32`
- `AUTH_URL` - deployed origin, for example `https://freshtrack.vercel.app`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google Cloud OAuth credentials

### Deploy Steps

1. Create a Turso database: `turso db create freshtrack`
2. Get the URL and token: `turso db show --url freshtrack` and `turso db tokens create freshtrack`
3. Create a Vercel project linked to this repo
4. Add the production environment variables in Vercel project settings
5. Run migrations against production: `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:migrate`
6. Seed global categories only: `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:seed:categories`
7. Configure Google OAuth with:
   - Authorized origin: `https://freshtrack.vercel.app`
   - Redirect URI: `https://freshtrack.vercel.app/api/auth/callback/google`
   - Privacy policy: `https://freshtrack.vercel.app/privacy`
   - Terms: `https://freshtrack.vercel.app/terms`
8. Deploy from Vercel or push the production branch after env vars are in place.

Do not run `npm run db:seed` against production. That command creates a local dev user and demo pantry data.

## Scope

### v1

- Google sign-in
- Per-user pantry, recipe, and waste tracking
- Global built-in categories
- Installable PWA manifest and icons
- Public privacy policy and terms pages

### Planned

- Email and password auth
- Push notifications for expiring items
- Custom domain
- Household or shared pantry support
- Offline mode with a service worker
- Per-user custom categories

## Architecture

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # REST API endpoints
│   ├── pantry/       # Pantry management page
│   ├── recipes/      # Recipe suggestions page
│   ├── stats/        # Statistics & charts page
│   └── page.tsx      # Dashboard
├── components/       # React components
│   ├── ui/           # Base UI components (Button, Card, Dialog, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   ├── pantry/       # Pantry page components
│   ├── recipes/      # Recipe components
│   ├── stats/        # Chart components
│   └── layout/       # Navbar and page header
├── db/               # Database layer
│   ├── schema.ts     # Drizzle ORM schema
│   ├── index.ts      # Database connection
│   ├── seed.ts       # Local dev seed script with realistic data
│   └── seed-categories.ts # Production-safe global category seed
└── lib/              # Shared utilities
    ├── freshness.ts  # Expiration status calculations
    └── utils.ts      # General helpers
```

Local development uses `file:./data/freshtrack.db`. Production uses Turso through the same libSQL driver.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List active pantry items |
| POST | `/api/items` | Add a new item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Remove an item |
| POST | `/api/items/:id/consume` | Mark as consumed |
| POST | `/api/items/:id/waste` | Mark as wasted |
| GET | `/api/categories` | List food categories |
| GET | `/api/recipes` | List all recipes |
| GET | `/api/recipes/suggestions` | Recipes using expiring items |
| GET | `/api/stats` | Waste & consumption statistics |
