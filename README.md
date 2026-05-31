# FreshTrack

**Reduce food waste. Save money. Track what matters.**

FreshTrack is a pantry management dashboard that helps you track food freshness, get alerts before items expire, discover recipes to use expiring ingredients, and visualize waste patterns over time.

**Live app:** https://freshtrack.up.railway.app

## The Problem

About 30-40% of food purchased by US households is wasted, costing the average family roughly $1,500/year. The root cause: people forget what's in their pantry. Items expire unnoticed, meals are not planned around what needs using first, and there is no feedback loop showing how much waste actually occurs.

This habit does not just drain your wallet. It actively hurts the planet. Food waste drives climate change, causing roughly 8% of global greenhouse emissions. When we throw away food, we also waste the water, land, and energy used to grow it. That organic waste then rots in landfills and releases methane, a greenhouse gas far more potent than carbon dioxide. Because families lack a feedback loop showing how much waste actually occurs, this costly cycle continues completely unnoticed.

## Features

- **Freshness Dashboard** - Overview of active pantry items, urgency metrics, and the next recipe to try
- **Expiration Alerts** - Prominent warnings for items expiring within 2 days
- **Pantry Management** - Add, search, filter, sort, and track inventory by quantity, unit, purchase date, expiration date, and estimated cost
- **Barcode Scanning** - Scan a product barcode to prefill name, category, and expiration via Open Food Facts; works cross-browser (native Barcode Detection API with a ZXing fallback) and always offers manual entry
- **Recipe Suggestions** - "Use It Up" recipes that match ingredients expiring within 5 days
- **Recipe Dive** - Search and filter a catalog of recipes (imported from TheMealDB), ranked by how many of your expiring ingredients each one uses
- **Consume/Waste Logging** - Mark items as used or wasted, log outcomes, and undo recent actions
- **Statistics & Charts** - Monthly trends, waste rates, category breakdowns, and money saved estimates
- **Google Sign-In** - Auth.js-powered Google OAuth gate for the application

## Current Scope Notes

- Google is the only configured sign-in provider.
- Production runs on Railway with Railway Postgres.
- Local development uses PostgreSQL through `DATABASE_URL`.
- Pantry, recipe, and waste rows are scoped per authenticated user.
- Built-in categories and starter recipes are global seed data.
- PWA assets, a web app manifest, `/privacy`, and `/terms` are present.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Runtime | React 19 |
| Authentication | Auth.js / NextAuth v5 beta with Google OAuth |
| Database | PostgreSQL on Railway via `postgres` and Drizzle ORM |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Charts | Recharts |
| Motion | Framer Motion |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm
- PostgreSQL, either local or Railway-hosted
- Google OAuth credentials for local sign-in

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd freshtrack

# Install dependencies
npm install

# Create local environment config
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/freshtrack
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

For Google OAuth local development, add these callback settings to a Google OAuth web client:

```text
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI: http://localhost:3000/api/auth/callback/google
```

Then prepare the local database and start the app:

```bash
# Run database migrations
npm run db:migrate

# Seed the database with sample categories, items, recipes, and waste logs
npm run db:seed

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000** and will redirect unauthenticated users to **/login**.

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
| `npm run db:import:recipes` | Import the global recipe catalog from TheMealDB (idempotent, production-safe) |
| `npm run db:generate` | Generate new migrations from schema |
| `npm run db:migrate` | Run pending migrations |

## Deployment

FreshTrack deploys as an installable PWA on Railway with Railway Postgres as the managed database.

Production URL: https://freshtrack.up.railway.app

### Environment Variables

See `.env.example` for the full template. Required in production:

- `DATABASE_URL` - Railway Postgres connection string
- `AUTH_SECRET` - generate with `openssl rand -base64 32`
- `AUTH_URL` - deployed origin, for example `https://freshtrack.up.railway.app`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google Cloud OAuth credentials

### Deploy Steps

1. Create a Railway project linked to this repo.
2. Add a Railway Postgres service.
3. Add the production environment variables in the Railway app service.
4. Run migrations against production: `DATABASE_URL=... npm run db:migrate`
5. Seed global categories: `DATABASE_URL=... npm run db:seed:categories`
6. Seed global starter recipes: `DATABASE_URL=... npm run db:seed:recipes`
7. Import the recipe catalog: `DATABASE_URL=... npm run db:import:recipes`
8. Deploy the app service from Railway.
9. Configure Google OAuth with:
   - Authorized origin: your Railway public app URL
   - Redirect URI: `<your Railway public app URL>/api/auth/callback/google`
   - Privacy policy: `<your Railway public app URL>/privacy`
   - Terms: `<your Railway public app URL>/terms`

Do not run `npm run db:seed` against production. That command creates a local dev user and demo pantry data. It is guarded and only runs outside production with:

```bash
ALLOW_DESTRUCTIVE_SEED=1 npm run db:seed
```

## Scope

### v1

- Google sign-in
- Per-user pantry, recipe, and waste tracking
- Barcode scanning for quick item entry
- Global built-in categories and an imported recipe catalog with search, filters, and expiring-ingredient ranking
- Installable PWA manifest and icons
- Public privacy policy and terms pages
- Railway deployment with Railway Postgres

### Planned

- Email and password auth
- Push notifications for expiring items
- Custom domain
- Household or shared pantry support
- Offline mode with a service worker
- Per-user custom categories

## Architecture

```text
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # REST API endpoints and Auth.js route handler
│   ├── login/        # Google sign-in page
│   ├── pantry/       # Pantry management page
│   ├── recipes/      # Recipe suggestions page
│   ├── stats/        # Statistics & charts page
│   └── page.tsx      # Dashboard
├── components/       # React components
│   ├── ui/           # Base UI components
│   ├── dashboard/    # Dashboard-specific components
│   ├── pantry/       # Pantry page components
│   ├── recipes/      # Recipe components
│   ├── stats/        # Chart components
│   └── layout/       # App shell, navigation, FAB, and undo toast
├── db/               # Database layer
│   ├── schema.ts     # Drizzle ORM schema
│   ├── index.ts      # Postgres database connection
│   ├── seed.ts       # Local dev seed script with realistic data
│   ├── seed-categories.ts # Production-safe global category seed
│   └── seed-recipes.ts # Production-safe global recipe seed
├── lib/              # Shared utilities
└── types/            # NextAuth type augmentation
```

The active Drizzle schema includes pantry tables (`categories`, `items`), recipe tables (`recipes`, `recipe_ingredients`), waste tracking (`waste_log`), and Auth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`).

Local development uses the `DATABASE_URL` in `.env.local`, usually a local Postgres database or a Railway-provided development connection string. Production uses Railway Postgres through the same Drizzle Postgres driver.

## API Endpoints

Most application routes are protected by middleware and require an authenticated session. Auth routes and the login route are public.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | Auth.js route handler |
| GET | `/api/items` | List active pantry items |
| GET | `/api/items?status=consumed` | List items by status: `active`, `consumed`, or `wasted` |
| POST | `/api/items` | Add a new active item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Remove an item |
| POST | `/api/items/:id/consume` | Mark an active item as consumed and log it |
| POST | `/api/items/:id/waste` | Mark an active item as wasted and log it |
| POST | `/api/items/:id/restore` | Restore a consumed/wasted item to active and remove the latest matching log |
| GET | `/api/categories` | List food categories |
| GET | `/api/products/:barcode` | Look up a product by barcode (Open Food Facts, with a UPCitemdb name fallback) for add-item prefill |
| GET | `/api/recipes` | List recipes with ingredients; supports `search`, `cuisine`, `category`, `maxMinutes`, and `sort`, and annotates each with expiring-ingredient matches |
| GET | `/api/recipes/suggestions` | Recipes using active items expiring within 5 days |
| GET | `/api/stats` | Waste and consumption statistics |
