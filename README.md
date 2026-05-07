# FreshTrack

**Reduce food waste. Save money. Track what matters.**

FreshTrack is a pantry management dashboard that helps you track food freshness, get alerts before items expire, discover recipes to use expiring ingredients, and visualize your waste patterns over time.

**Live app:** https://freshtrack-production-290e.up.railway.app

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
| Database | PostgreSQL on Railway via `postgres` and Drizzle ORM |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 with Google sign-in |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm
- PostgreSQL, either local or Railway-hosted

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd freshtrack

# Install dependencies
npm install

# Configure a Postgres connection
cp .env.example .env.local

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
| `npm run db:seed:recipes` | Seed production-safe global starter recipes only |
| `npm run db:generate` | Generate new migrations from schema |
| `npm run db:migrate` | Run pending migrations |

## Deployment

FreshTrack deploys as an installable PWA on Railway with Railway Postgres as the managed database.

Production URL: https://freshtrack-production-290e.up.railway.app

### Environment Variables

See `.env.example` for the full template. Required in production:

- `DATABASE_URL` - Railway Postgres connection string
- `AUTH_SECRET` - generate with `openssl rand -base64 32`
- `AUTH_URL` - deployed origin, for example `https://freshtrack-production-290e.up.railway.app`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google Cloud OAuth credentials

### Deploy Steps

1. Create a Railway project linked to this repo.
2. Add a Railway Postgres service.
3. Add the production environment variables in the Railway app service.
4. Run migrations against production: `DATABASE_URL=... npm run db:migrate`
5. Seed global categories: `DATABASE_URL=... npm run db:seed:categories`
6. Seed global starter recipes: `DATABASE_URL=... npm run db:seed:recipes`
7. Deploy the app service from Railway.
8. Configure Google OAuth with:
   - Authorized origin: your Railway public app URL
   - Redirect URI: `<your Railway public app URL>/api/auth/callback/google`
   - Privacy policy: `<your Railway public app URL>/privacy`
   - Terms: `<your Railway public app URL>/terms`

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
│   ├── seed-categories.ts # Production-safe global category seed
│   └── seed-recipes.ts # Production-safe global recipe seed
└── lib/              # Shared utilities
    ├── freshness.ts  # Expiration status calculations
    └── utils.ts      # General helpers
```

Local development uses the `DATABASE_URL` in `.env.local`, usually a local Postgres database or a Railway-provided development connection string. Production uses Railway Postgres through the same Drizzle Postgres driver.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List active pantry items |
| POST | `/api/items` | Add a new item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Remove an item |
| POST | `/api/items/:id/consume` | Mark as consumed |
| POST | `/api/items/:id/waste` | Mark as wasted |
| POST | `/api/items/:id/restore` | Restore an item to active status |
| GET | `/api/categories` | List food categories |
| GET | `/api/recipes` | List all recipes |
| GET | `/api/recipes/suggestions` | Recipes using expiring items |
| GET | `/api/stats` | Waste & consumption statistics |
