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
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

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
| `npm run db:seed` | Seed database with sample data |
| `npm run db:generate` | Generate new migrations from schema |
| `npm run db:migrate` | Run pending migrations |

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
│   ├── schema.ts     # Drizzle ORM schema (5 tables)
│   ├── index.ts      # Database connection
│   └── seed.ts       # Seed script with realistic data
└── lib/              # Shared utilities
    ├── freshness.ts  # Expiration status calculations
    └── utils.ts      # General helpers
```

The database is stored locally at `data/freshtrack.db` (SQLite) — no external database server required.

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
