# Railway Postgres Deployment Design

## Goal

Deploy FreshTrack as a public installable PWA on Railway, using Railway Postgres as the managed production database.

## Architecture

FreshTrack runs as a Next.js 16 app on Railway. The app connects to Railway Postgres through Drizzle ORM's Postgres driver and a single `DATABASE_URL` environment variable.

The existing Vercel + Turso plan is replaced for this deployment path. The application keeps Auth.js Google sign-in, per-user data isolation, PWA assets, legal pages, and global category seeding.

## Database

- Replace `@libsql/client` and `drizzle-orm/libsql` with the `postgres` package and `drizzle-orm/postgres-js`.
- Convert `src/db/schema.ts` from `sqliteTable` definitions to `pgTable` definitions.
- Use `serial` integer primary keys for app-owned numeric IDs.
- Keep date-input fields such as purchase and expiration dates as strings through Postgres `date` columns in string mode.
- Keep activity timestamps as Postgres timestamps in string mode so existing dashboard aggregation keeps receiving string values.
- Use Auth.js-compatible timestamp columns for session expiration and email verification.
- Generate fresh Postgres migrations. Existing SQLite/libSQL migrations are not reusable against Railway Postgres.

## Environment

Required production variables on Railway:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are removed from the supported deployment path.

## Deployment Flow

1. Create or link a Railway project.
2. Add a Railway Postgres database service.
3. Deploy the Next.js app service from this repo.
4. Set Auth.js and Google OAuth environment variables on the app service.
5. Run `npm run db:migrate` against the Railway `DATABASE_URL`.
6. Run `npm run db:seed:categories` against production.
7. Run `npm run db:seed:recipes` against production.
8. Configure Google OAuth redirect URLs after the Railway public domain is known.

## Verification

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run db:generate`
- A production smoke test after Railway deployment: sign in, load dashboard, add an item, mark it consumed or wasted, and verify stats update.

## Non-Goals

- Migrating old SQLite/Turso data into Postgres. Production is not live yet, so Railway Postgres starts empty except global categories.
- Supporting both Turso and Railway as runtime options. Keeping one production database path avoids branching every migration and deploy instruction.
