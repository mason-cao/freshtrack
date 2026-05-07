# FreshTrack

**Reduce food waste. Save money. Track what matters.**

FreshTrack is a pantry management dashboard that helps you track food freshness, get alerts before items expire, discover recipes to use expiring ingredients, and visualize waste patterns over time.

**Live app:** https://freshtrack-production-290e.up.railway.app

## The Problem

About 30-40% of food purchased by US households is wasted, costing the average family roughly $1,500/year. The root cause: people forget what's in their pantry. Items expire unnoticed, meals are not planned around what needs using first, and there is no feedback loop showing how much waste actually occurs.

## Features

- **Freshness Dashboard** - Overview of active pantry items, urgency metrics, and the next recipe to try
- **Expiration Alerts** - Prominent warnings for items expiring within 2 days
- **Pantry Management** - Add, search, filter, sort, and track inventory by quantity, unit, purchase date, expiration date, and estimated cost
- **Recipe Suggestions** - "Use It Up" recipes that match ingredients expiring within 5 days
- **Consume/Waste Logging** - Mark items as used or wasted, log outcomes, and undo recent actions
- **Statistics & Charts** - Monthly trends, waste rates, category breakdowns, and money saved estimates
- **Google Sign-In** - Auth.js-powered Google OAuth gate for the application

## Current Scope Notes

- Google is the only configured sign-in provider.
- Local development uses a SQLite/libSQL file by default; Turso can be used by setting the database environment variables.
- Pantry, recipe, and waste rows are not currently scoped per authenticated user in the active schema/routes.
- PWA assets, a web app manifest, and `/privacy` and `/terms` pages are not currently present.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Runtime | React 19 |
| Database | PostgreSQL on Railway via `postgres` and Drizzle ORM |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 with Google sign-in |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Charts | Recharts |
| Motion | Framer Motion |
| Icons | Lucide React |

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

Most application routes are protected by middleware and require an authenticated session. Auth routes and the login route are public.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | Auth.js route handler |
| GET | `/api/items` | List active pantry items |
| GET | `/api/items?status=consumed` | List items by status: `active`, `consumed`, or `wasted` |
| POST | `/api/items` | Add a new active item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Remove an item |
| POST | `/api/items/:id/consume` | Mark as consumed |
| POST | `/api/items/:id/waste` | Mark as wasted |
| POST | `/api/items/:id/restore` | Restore an item to active status |
| GET | `/api/categories` | List food categories |
| GET | `/api/recipes` | List all recipes with ingredients |
| GET | `/api/recipes/suggestions` | Recipes using active items expiring within 5 days |
| GET | `/api/stats` | Waste and consumption statistics |

## Deployment Notes

FreshTrack can run on Vercel with a Turso/libSQL database. Set these environment variables in the hosting provider:

```bash
TURSO_DATABASE_URL=<turso-libsql-url>
TURSO_AUTH_TOKEN=<turso-auth-token>
AUTH_SECRET=<generated-secret>
AUTH_URL=<deployed-origin>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

After configuring production environment variables, run Drizzle migrations against the production database:

```bash
TURSO_DATABASE_URL=<turso-libsql-url> TURSO_AUTH_TOKEN=<turso-auth-token> npm run db:migrate
```
