# FreshTrack

**Reduce food waste. Save money. Track what matters.**

FreshTrack is a pantry management dashboard that helps you track food freshness, get alerts before items expire, discover recipes to use expiring ingredients, and visualize waste patterns over time.

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
| Authentication | Auth.js / NextAuth v5 beta with Google OAuth |
| Database | libSQL-compatible SQLite via `@libsql/client` |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Charts | Recharts |
| Motion | Framer Motion |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm
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
TURSO_DATABASE_URL=file:./data/freshtrack.db
TURSO_AUTH_TOKEN=
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
# The local libSQL file needs its parent directory to exist
mkdir -p data

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
| `npm run db:seed` | Seed database with sample data |
| `npm run db:generate` | Generate new migrations from schema |
| `npm run db:migrate` | Run pending migrations |

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
│   ├── index.ts      # libSQL database connection
│   └── seed.ts       # Seed script with sample data
├── lib/              # Shared utilities
└── types/            # NextAuth type augmentation
```

The active Drizzle schema includes pantry tables (`categories`, `items`), recipe tables (`recipes`, `recipe_ingredients`), waste tracking (`waste_log`), and Auth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`).

By default, the database is stored locally at `data/freshtrack.db`. To use Turso instead, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

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
