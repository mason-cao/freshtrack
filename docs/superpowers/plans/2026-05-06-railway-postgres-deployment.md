# Railway Postgres Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch FreshTrack from the Vercel + Turso deployment path to Railway hosting with Railway Postgres.

**Architecture:** Use Drizzle ORM's Postgres driver with the `postgres` package. Convert schema and query call sites from SQLite/libSQL methods to Postgres promise queries, generate fresh Postgres migrations, and update deployment docs/env templates.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM, postgres-js, Auth.js v5, Railway Postgres.

---

## Files

- Modify: `package.json`, `package-lock.json`
- Modify: `src/db/schema.ts`, `src/db/index.ts`, `src/db/seed.ts`, `src/db/seed-categories.ts`
- Modify: `src/app/api/**/route.ts`, `src/app/api/items/_lib.ts`
- Modify: `drizzle.config.ts`, `drizzle/**`
- Modify: `README.md`, `.env.example`, `src/app/privacy/page.tsx`

## Tasks

- [x] Add a database config helper and tests proving `DATABASE_URL` is required outside test/dev fallbacks.
- [x] Replace libSQL dependency usage with `postgres` and Drizzle's Postgres driver.
- [x] Convert Drizzle schema from SQLite to Postgres.
- [x] Convert `.all()`, `.get()`, and `.run()` query calls to Postgres-compatible awaited queries.
- [x] Convert seed scripts to Postgres-compatible operations and remove SQLite sequence reset SQL.
- [x] Replace SQLite/libSQL migrations with a fresh Postgres migration set.
- [x] Update README, env template, deployment docs, and privacy copy for Railway.
- [x] Verify with `npm run test`, `npm run lint`, and `npm run build`.
- [ ] Pause for a logical commit with message: `Switch deployment database to Railway Postgres`.
