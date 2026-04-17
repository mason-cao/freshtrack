# FreshTrack Deployment Design

**Date:** 2026-04-16
**Status:** Approved for implementation planning

## Goal

Deploy FreshTrack as a public, installable PWA so anyone can sign up with a Google account and track their own pantry. No native app store submission. Free-tier hosting as the default, with a paid Railway plan already available as fallback.

## Non-Goals (v1)

The following are deliberately out of scope. Each deserves its own spec after v1 ships:

- Push notifications for expiring items
- Email + password auth (Google sign-in only for v1)
- Custom domain (use `freshtrack.vercel.app` at launch)
- Household / pantry sharing between users
- Offline mode via service worker
- Native iOS or Android app

## Architecture

```
┌─────────────────────────────────────────────────┐
│  User's browser / phone (installable PWA)       │
└────────────────────────┬────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────┐
│  Vercel (Next.js 16 hosting, free tier)         │
│  - App Router + Server Actions                  │
│  - Auth.js v5 (Google OAuth)                    │
│  - Drizzle ORM via @libsql/client               │
└────────────────────────┬────────────────────────┘
                         │ libSQL over HTTPS
                         ▼
┌─────────────────────────────────────────────────┐
│  Turso (managed libSQL, free tier)              │
│  Single DB, every row scoped by user_id         │
└─────────────────────────────────────────────────┘
```

### Hosting

- **Vercel free tier** — 100 GB bandwidth/mo, zero-config Next.js deploys, automatic preview deploys per PR, auto SSL.
- Connect GitHub repo to Vercel; every push to `main` auto-deploys to production.
- Default URL: `freshtrack.vercel.app`.
- Railway subscription ($5/mo) remains available as a fallback if Vercel limits are hit.

### Database

- **Turso free tier** — 500 DBs, 9 GB storage, 1B row reads/mo.
- libSQL is SQLite-compatible, so the current Drizzle `sqliteTable` schema and generated migrations reuse as-is.

## Database Migration

### Driver swap

- Remove `better-sqlite3` from `package.json`.
- Add `@libsql/client`.
- In `src/db/index.ts`, change the Drizzle import from `drizzle-orm/better-sqlite3` to `drizzle-orm/libsql` and construct a libSQL client with `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
- `next.config.ts` no longer needs `serverExternalPackages: ["better-sqlite3"]`.

### Schema changes

Add **new tables**:

- `users` — `id` (TEXT PK, UUID from Auth.js), `email` (UNIQUE), `name`, `image`, `createdAt`.
- `accounts`, `sessions`, `verificationTokens` — standard Auth.js Drizzle adapter tables.

Modify **existing tables** (`categories` excluded):

- `items` — add `userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`, plus index on `userId`.
- `recipes` — same.
- `recipeIngredients` — inherits isolation via its `recipeId` FK (recipes are per-user).
- `wasteLog` — same as items.

`categories` stays **global** (shared lookup table, no `userId`). All users see the same 10 categories in v1. Per-user categories deferred.

### Multi-tenancy enforcement

- Every server action and route handler calls `auth()` and derives `userId` from the session.
- A helper `getCurrentUserId()` throws if no session — no silent fallthrough.
- Every data query includes `where(eq(table.userId, userId))`. No exceptions.
- Middleware also blocks unauthenticated requests at the route level, providing defense-in-depth.

### Seed data

- `npm run db:seed` becomes dev-only — seeds a single hardcoded test user + their data. Not run in production.
- Production Turso DB starts empty. New users see an empty pantry with a friendly empty state on first login.

## Authentication

### Stack

- **Auth.js v5** (formerly NextAuth) with the Drizzle adapter pointed at the Turso DB.
- Google OAuth provider only.
- JWT session strategy — no DB hit per request; `userId` lives in the JWT payload.

### Google Cloud setup

1. Create a Google Cloud project.
2. Configure the OAuth consent screen. Requires privacy policy URL and terms of service URL — both hosted on the deployed app.
3. Create OAuth 2.0 Client ID (type: Web application) with:
   - Authorized origins: `https://freshtrack.vercel.app`, `http://localhost:3000`.
   - Redirect URIs: `https://freshtrack.vercel.app/api/auth/callback/google`, `http://localhost:3000/api/auth/callback/google`.
4. Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel env + `.env.local`.

### Code additions

- `src/auth.ts` — exports `auth`, `handlers`, `signIn`, `signOut`.
- `app/api/auth/[...nextauth]/route.ts` — re-exports `handlers.GET` and `handlers.POST`.
- `src/middleware.ts` — wraps `auth()`; redirects unauthenticated requests to `/login` for everything except `/login`, `/privacy`, `/terms`, `/api/auth/*`, and static assets.
- `app/login/page.tsx` — single "Continue with Google" button styled to match the sage/cream/terracotta design system. Redirects to `/` on success.
- Sign-out entry point in the desktop side rail and inside a profile menu on the mobile bottom bar.

### First-signup flow

1. User clicks "Continue with Google" → Google OAuth → redirect back.
2. Auth.js Drizzle adapter inserts rows into `users` and `accounts`.
3. User lands on `/` with an empty dashboard and a "Welcome — add your first item" empty state.
4. Existing FAB leads them into the add-item flow.

### Abuse mitigation

- Google sign-in already gates abuse heavily. No CAPTCHA in v1.
- If abuse becomes a problem, add Cloudflare Turnstile on `/login`.

## PWA

### Manifest

- `public/manifest.json` with:
  - `name`: "FreshTrack"
  - `short_name`: "FreshTrack"
  - `display`: "standalone"
  - `start_url`: "/"
  - `theme_color`: sage (match token in `globals.css`)
  - `background_color`: cream (match token in `globals.css`)

### Icons

Generate from the existing wordmark, or a simple "FT" mark on a sage square if no icon exists yet:

- `public/icon-192.png` (192×192)
- `public/icon-512.png` (512×512)
- `public/icon-512-maskable.png` (512×512, maskable safe zone)
- `public/apple-touch-icon.png` (180×180)

### `<head>` metadata

Add to `app/layout.tsx`:

- `<link rel="manifest" href="/manifest.json">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- `<meta name="theme-color" content="...">` matching manifest
- Viewport with `viewport-fit=cover` for iOS safe-area support.

### Install affordance

Dismissible banner on mobile:

- iOS: "Install FreshTrack — tap Share, then Add to Home Screen."
- Android: trigger `beforeinstallprompt` native dialog on tap.
- Dismissal persists in `localStorage` so it doesn't nag.

### Deferred

- No service worker in v1 (no offline mode). Install still works without one.

## Legal

Google's OAuth consent screen requires a privacy policy URL and a terms URL. Both are mandatory — not optional.

### `app/privacy/page.tsx`

Plain-language content covering:

- What data is collected: email, name, avatar URL (from Google), pantry items the user enters.
- Where it's stored: Turso and Vercel (US region).
- That data is not sold or shared.
- How to request deletion: `mailto:masoncao7@gmail.com`.
- Contact email for privacy questions.

### `app/terms/page.tsx`

Short ToS covering:

- Use at your own risk, no warranty.
- Right to delete inactive accounts after a stated period.
- Contact email.

Both pages styled to match the design system. Footer links to both from every authenticated page and from `/login`.

These are hobby-app boilerplate, not legal advice. A full production deployment with paid features would warrant a lawyer review.

## Environment Variables

Committed `.env.example`:

```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`.env.local` stays gitignored. Same variables populated in Vercel project settings for production, with `AUTH_URL=https://freshtrack.vercel.app`.

## Rollout & Verification

### Pre-deploy checklist

1. Driver swap + schema changes work locally against a Turso dev DB.
2. Auth flow works locally with localhost OAuth credentials.
3. `/privacy` and `/terms` pages render.
4. PWA manifest passes Lighthouse "Installable" audit.
5. `npm run build` succeeds with no type errors.

### Deploy day

1. Push to `main`; verify Vercel build succeeds.
2. Add production env vars in Vercel.
3. Run Drizzle migration against production Turso DB.
4. Test signup end-to-end with a personal Google account.
5. Test on iPhone Safari and Android Chrome: install to home screen, sign in, add item, mark used, sign out.

### README updates

- Deploy section pointing at Vercel + Turso with required env vars.
- Note: "Auth: Google sign-in only in v1; email/password planned for v2."
- Note: "Push notifications for expiring items planned but not in v1."

## Future Work (separate specs)

- Push notifications for expiry alerts (web push, VAPID, scheduled job).
- Email + password auth alongside Google.
- Custom domain (Cloudflare + Vercel).
- Household sharing (multiple users sharing one pantry).
- Offline mode via service worker.
- Per-user custom categories.
