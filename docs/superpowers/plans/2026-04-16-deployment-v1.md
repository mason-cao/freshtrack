# FreshTrack Deployment v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy FreshTrack as a public installable PWA on Vercel + Turso with Google sign-in, multi-tenant data isolation, and required legal pages.

**Architecture:** Swap `better-sqlite3` for `@libsql/client` (libSQL is SQLite-compatible, Drizzle has a libSQL driver). Add Auth.js v5 with Google OAuth. Scope every row by `userId`. Add PWA manifest + icons. Deploy to Vercel, connect to Turso, configure Google OAuth for prod.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Drizzle ORM, `@libsql/client`, Auth.js v5 (`next-auth@beta`), Vitest (for one helper), Turso, Vercel.

**Spec:** `docs/superpowers/specs/2026-04-16-deployment-design.md`

---

## Before You Start

Do ALL of this work on a feature branch, not `main`:

```bash
git checkout -b deploy-v1
```

Vercel auto-deploys `main`; working on a branch means broken intermediate states never reach production. Only merge to `main` after Task 21.11's smoke test succeeds against a Vercel preview deploy from this branch.

---

## Testing Approach

This is a deployment-focused plan. The codebase has no test framework today and most tasks are verifiable by `npm run build` + manual browser testing. Full TDD across every task would be disproportionate.

**Where TDD applies:** The `getCurrentUserId()` helper in Task 10 is security-critical (a bug leaks data between users). We install Vitest and write unit tests for it and the session-scoped query helper.

**Everywhere else:** Verify with `npm run lint` (which runs `tsc --noEmit`), `npm run build`, and manual smoke tests in the browser against the local dev server before committing. Task 21 runs full end-to-end smoke tests against the Vercel preview deploy.

---

## File Map

**New files:**
- `src/auth.ts` — Auth.js config + `auth`, `handlers`, `signIn`, `signOut` exports
- `src/middleware.ts` — route protection
- `src/lib/session.ts` — `getCurrentUserId()` helper
- `src/lib/session.test.ts` — Vitest tests for session helper
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler re-exports
- `src/app/login/page.tsx` — login page with Google button
- `src/app/privacy/page.tsx` — privacy policy
- `src/app/terms/page.tsx` — terms of service
- `src/components/layout/install-prompt.tsx` — PWA install banner
- `src/components/layout/footer-legal.tsx` — footer with privacy/terms links
- `public/manifest.json` — PWA manifest
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-512-maskable.png`, `public/apple-touch-icon.png`
- `vitest.config.ts` — test config
- `.env.example` — committed env var template

**Modified files:**
- `src/db/index.ts` — swap driver
- `src/db/schema.ts` — add auth tables + userId columns
- `src/db/seed.ts` — async-ify, create dev user
- `drizzle.config.ts` — new dbCredentials
- `package.json` — dependency swaps + `test` script
- `next.config.ts` — remove `serverExternalPackages`
- `src/app/layout.tsx` — PWA meta tags, mount `InstallPrompt`, mount footer
- `src/app/page.tsx` — async-ify data fetches, read session, empty state
- `src/app/pantry/page.tsx` — same
- `src/app/recipes/page.tsx` — same
- `src/app/stats/page.tsx` — same
- `src/app/api/categories/route.ts` — async-ify
- `src/app/api/items/route.ts` — async-ify + userId filter
- `src/app/api/items/[id]/route.ts` — async-ify + userId filter
- `src/app/api/items/[id]/consume/route.ts` — same
- `src/app/api/items/[id]/waste/route.ts` — same
- `src/app/api/items/_lib.ts` — async-ify `categoryExists`, `completeItem`
- `src/app/api/recipes/route.ts` — async-ify + userId filter
- `src/app/api/recipes/suggestions/route.ts` — same
- `src/app/api/stats/route.ts` — async-ify + userId filter
- `src/components/layout/app-shell.tsx` — sign-out entry + profile
- `README.md` — deploy instructions + v2 roadmap

---

## Task 1: Swap DB Driver to libSQL

Replace `better-sqlite3` with `@libsql/client`. libSQL is the underlying driver Turso speaks; it also supports local file URLs so dev stays on the existing `./data/freshtrack.db` file without needing a Turso account for this task.

**Files:**
- Modify: `package.json`
- Modify: `src/db/index.ts`
- Modify: `drizzle.config.ts`
- Modify: `next.config.ts`
- Create: `.env.example`

- [ ] **Step 1.1: Swap dependencies**

```bash
npm uninstall better-sqlite3 @types/better-sqlite3
npm install @libsql/client
```

- [ ] **Step 1.2: Update `src/db/index.ts`**

Replace the entire file contents with:

```ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/freshtrack.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
```

Note: the `data/` directory no longer needs to be created by code — libSQL's file URL will create it if missing. If the existing local DB file is at `data/freshtrack.db`, the new client reads it unchanged.

- [ ] **Step 1.3: Update `drizzle.config.ts`**

Replace the entire file contents with:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:./data/freshtrack.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

- [ ] **Step 1.4: Update `next.config.ts`**

Remove the `serverExternalPackages` line. File becomes:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 1.5: Create `.env.example`**

```
# Database
TURSO_DATABASE_URL=file:./data/freshtrack.db
TURSO_AUTH_TOKEN=

# Auth.js
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- [ ] **Step 1.6: Verify build still passes**

```bash
npm run lint
```

Expected: fails. Multiple call sites use sync `.get()` / `.all()` / `.run()` which now return Promises. That's Task 2.

- [ ] **Step 1.7: Commit**

```bash
git add package.json package-lock.json src/db/index.ts drizzle.config.ts next.config.ts .env.example
git commit -m "Swap DB driver from better-sqlite3 to libSQL"
```

---

## Task 2: Convert All DB Calls to Async

The libSQL driver is async (HTTP-based), unlike better-sqlite3 which was synchronous. Every `.get()`, `.all()`, `.run()` now returns a Promise and every caller must be async.

**Files:**
- Modify: `src/app/api/items/_lib.ts`
- Modify: `src/app/api/items/route.ts`
- Modify: `src/app/api/items/[id]/route.ts`
- Modify: `src/app/api/items/[id]/consume/route.ts`
- Modify: `src/app/api/items/[id]/waste/route.ts`
- Modify: `src/app/api/categories/route.ts`
- Modify: `src/app/api/recipes/route.ts`
- Modify: `src/app/api/recipes/suggestions/route.ts`
- Modify: `src/app/api/stats/route.ts`
- Modify: `src/db/seed.ts`

- [ ] **Step 2.1: Update `src/app/api/items/_lib.ts`**

Make `categoryExists` async and `completeItem` async. The libSQL Drizzle driver does NOT support synchronous `db.transaction((tx) => …)` — it needs `await db.transaction(async (tx) => …)`. Update those two functions at the bottom of the file:

```ts
export async function categoryExists(categoryId: number): Promise<boolean> {
  const row = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .get();
  return Boolean(row);
}

export async function completeItem(itemId: number, action: ItemAction) {
  return db.transaction(async (tx) => {
    const item = await tx
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .get();

    if (!item) {
      return { status: 404, body: { error: "Item not found." } };
    }

    if (item.status !== "active") {
      return {
        status: 409,
        body: { error: `Item is already marked as ${item.status}.` },
      };
    }

    await tx
      .update(items)
      .set({ status: action, updatedAt: new Date().toISOString() })
      .where(eq(items.id, itemId))
      .run();

    await tx
      .insert(wasteLog)
      .values({
        itemId: item.id,
        itemName: item.name,
        action,
        quantity: item.quantity,
        unit: item.unit,
        costEstimate: item.costEstimate,
      })
      .run();

    return { status: 200, body: { success: true } };
  });
}
```

- [ ] **Step 2.2: Update `src/app/api/items/route.ts`**

Add `await` to every DB call. GET handler: `const result = await db.select()...all();`. POST handler: `const newItem = await db.insert(items).values(...).returning().get();` and `if (... && !(await categoryExists(...)))`.

- [ ] **Step 2.3: Update `src/app/api/items/[id]/route.ts`**

PATCH: `await categoryExists(...)`, `const updated = await db.update(...).returning().get();`. DELETE: `const existing = await db.select(...).get();` and `await db.delete(...).run();`.

- [ ] **Step 2.4: Update `src/app/api/items/[id]/consume/route.ts` and `.../waste/route.ts`**

Both wrap `completeItem()` calls with `await`.

- [ ] **Step 2.5: Update `src/app/api/categories/route.ts`**

Add `await` to the single `db.select().from(categories).all()` call.

- [ ] **Step 2.6: Update `src/app/api/recipes/route.ts`**

Add `await` to every `.all()` / `.get()` / `.run()`.

- [ ] **Step 2.7: Update `src/app/api/recipes/suggestions/route.ts`**

Same pattern.

- [ ] **Step 2.8: Update `src/app/api/stats/route.ts`**

Change `const allLogs = db.select().from(wasteLog).all();` to `const allLogs = await db.select().from(wasteLog).all();`.

- [ ] **Step 2.9: Update `src/db/seed.ts`**

Convert all DB calls to `await`. Wrap the main body in an `async function main() { … }` and call `main()` at the bottom. Keep the existing autoincrement reset logic — libSQL supports `DELETE FROM sqlite_sequence WHERE name = '…'` the same way.

- [ ] **Step 2.10: Verify build passes**

```bash
npm run lint && npm run build
```

Expected: PASS. If type errors remain, fix the remaining call sites (compiler points directly at them).

- [ ] **Step 2.11: Re-seed local DB and verify dev server works**

```bash
rm -f data/freshtrack.db
npm run db:migrate
npm run db:seed
npm run dev
```

Manually: visit `http://localhost:3000`, navigate dashboard/pantry/recipes/stats, add an item, mark it used. Everything should work as before.

- [ ] **Step 2.12: Commit**

```bash
git add src/ 
git commit -m "Convert DB access to async for libSQL driver"
```

---

## Task 3: Add Auth.js Schema Tables

Add the standard Auth.js tables (`users`, `accounts`, `sessions`, `verificationTokens`) to the Drizzle schema. Do NOT add `userId` to existing tables yet — that's Task 4 so the two migrations are reviewable separately.

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 3.1: Append to `src/db/schema.ts`**

Add these exports to the end of the file:

```ts
import { primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
```

Note: the existing `import { sqliteTable, text, integer, real } …` at the top doesn't include `primaryKey`. Either add it to that import OR add the `import { primaryKey }` line shown above — pick one to keep imports tidy.

- [ ] **Step 3.2: Generate migration**

```bash
npx drizzle-kit generate
```

Expected: new file `drizzle/0001_*.sql` creates `users`, `accounts`, `sessions`, `verification_tokens`.

- [ ] **Step 3.3: Apply migration to local DB**

```bash
npx drizzle-kit migrate
```

Expected: success, no errors.

- [ ] **Step 3.4: Verify app still runs**

```bash
npm run dev
```

Visit the app; data should load unchanged (new tables are empty and unused yet).

- [ ] **Step 3.5: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "Add Auth.js schema tables"
```

---

## Task 4: Add userId Columns to User-Scoped Tables

Add `userId` foreign key to `items`, `recipes`, `wasteLog`. `categories` stays global. `recipeIngredients` inherits isolation via `recipeId`.

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 4.1: Modify `items` table**

Inside the existing `items` export, add:

```ts
userId: text("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),
```

Place it after `id` so it's near the top. Add an index at the end of the table callback (if not already using a callback, wrap the column object in the two-argument form):

Change from:
```ts
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // ... existing columns
});
```

To:
```ts
import { index } from "drizzle-orm/sqlite-core";

export const items = sqliteTable(
  "items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // ... rest of existing columns unchanged
  },
  (table) => ({
    userIdx: index("items_user_id_idx").on(table.userId),
  })
);
```

- [ ] **Step 4.2: Modify `recipes` table**

Same pattern — add `userId` as required + cascade delete, add `recipes_user_id_idx`.

- [ ] **Step 4.3: Modify `wasteLog` table**

Same pattern — add `userId` + `waste_log_user_id_idx` index.

- [ ] **Step 4.4: Generate migration**

```bash
npx drizzle-kit generate
```

Expected: `drizzle/0002_*.sql` that ALTER TABLEs to add `user_id`. SQLite ALTER TABLE ADD COLUMN cannot add a NOT NULL column without a default to a non-empty table. Since the dev DB currently has seed data but no users, the migration will fail.

- [ ] **Step 4.5: Drop and recreate dev DB**

Because there's no real data yet, nuke the local DB:

```bash
rm data/freshtrack.db
npx drizzle-kit migrate
```

Migration should now succeed against an empty DB. `npm run db:seed` is deferred until Task 13 (after we have a dev user to associate data with).

- [ ] **Step 4.6: Run type check — expect FAIL**

```bash
npm run lint
```

Expected: fails with "Property 'userId' is missing in type" on every `db.insert(items)`, `db.insert(recipes)`, `db.insert(wasteLog)` call. Drizzle derives insert value types from the schema, so now that `userId` is `notNull()`, callers must provide it. These errors are fixed in Task 11 (thread userId through all handlers).

Do NOT fix them ad-hoc here — just confirm the errors are the expected "missing userId" ones and proceed.

- [ ] **Step 4.7: Do NOT commit yet**

This change is logically coupled to Task 11 (the route handlers must provide `userId` for inserts to type-check). Hold the staged changes in the working tree until Task 11 is complete, OR stash them and re-apply before Task 11:

```bash
git stash push -m "schema-userId-wip" -- src/db/schema.ts drizzle/
```

If stashed: Task 11 will `git stash pop` at its start, then commit schema + route changes together.

If left unstaged: skip Tasks 5–10's unrelated file additions safely (they don't touch `items`/`recipes`/`wasteLog` files), but be aware the build stays broken until Task 11. Tasks 5–10 should still compile against the broken state since they don't import or modify the affected routes.

Pick one (stash recommended for cleanliness).

---

## Task 5: Install & Configure Auth.js

Install Auth.js v5 and wire it up with the Google provider and the Drizzle adapter.

**Files:**
- Modify: `package.json`
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 5.1: Install dependencies**

```bash
npm install next-auth@beta @auth/drizzle-adapter
```

- [ ] **Step 5.2: Generate `AUTH_SECRET`**

```bash
openssl rand -base64 32
```

Add the output to `.env.local` as `AUTH_SECRET=<generated value>`.

- [ ] **Step 5.3: Create `src/auth.ts`**

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

- [ ] **Step 5.4: Create route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5.5: Extend NextAuth types**

Create `src/types/next-auth.d.ts`:

```ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

Add to `tsconfig.json` `include` array if not already auto-picked-up (Next.js usually picks up `.d.ts` files; verify by running `npm run lint`).

- [ ] **Step 5.6: Verify build passes**

```bash
npm run lint && npm run build
```

Expected: PASS. (No code uses `auth()` yet, so nothing should break.)

- [ ] **Step 5.7: Commit**

```bash
git add package.json package-lock.json src/auth.ts src/app/api/auth/ src/types/
git commit -m "Install and configure Auth.js with Google provider"
```

---

## Task 6: Build `/login` Page

Create a login page matching the existing design system (sage/cream/terracotta, DM Sans, warm shadows).

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 6.1: Create login page**

```tsx
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-warm p-8 text-center">
        <h1 className="text-3xl font-semibold text-sage-900 mb-2">
          FreshTrack
        </h1>
        <p className="text-sage-700 mb-8">
          Sign in to start tracking your pantry.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            Continue with Google
          </Button>
        </form>
        <p className="text-xs text-sage-600 mt-8">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
```

Note on classnames: this assumes `bg-cream`, `text-sage-900`, etc. exist as Tailwind utilities from the existing `@theme` block in `globals.css`. If the token names differ, check `src/app/globals.css` and substitute the actual utility names (e.g. `bg-cream-50`, `text-sage`). Keep the visual intent: warm cream background, rounded card, clear single CTA.

- [ ] **Step 6.2: Verify build passes**

```bash
npm run lint && npm run build
```

Expected: PASS.

- [ ] **Step 6.3: Commit**

```bash
git add src/app/login/
git commit -m "Add /login page with Google sign-in"
```

---

## Task 7: Route-Protection Middleware

Redirect unauthenticated requests to `/login` for everything except public routes (`/login`, `/privacy`, `/terms`, `/api/auth/*`).

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 7.1: Create middleware**

```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/privacy", "/terms"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

The matcher excludes any path ending with a file extension (`.ico`, `.png`, `.webmanifest`, etc.), so `/manifest.json`, `/icon-192.png`, etc. pass through without auth.

- [ ] **Step 7.2: Verify build passes**

```bash
npm run lint && npm run build
```

Expected: PASS.

- [ ] **Step 7.3: Commit**

```bash
git add src/middleware.ts
git commit -m "Add auth middleware for route protection"
```

---

## Task 8: Google Cloud OAuth Setup (Manual)

This is a manual step performed in a browser. Document each action; do not mark the checkbox complete until each substep is verified.

**No files changed in this task.** The outputs are two env var values added to `.env.local`.

- [ ] **Step 8.1: Create Google Cloud project**

Visit https://console.cloud.google.com. If no project exists, create a new one named "FreshTrack". Select the project.

- [ ] **Step 8.2: Configure OAuth consent screen**

Go to **APIs & Services → OAuth consent screen**.
- User type: **External**
- App name: `FreshTrack`
- User support email: `masoncao7@gmail.com`
- App logo: skip for now
- Application home page: leave blank (will fill in after deploy)
- Application privacy policy link: leave blank for dev; mandatory for prod (Task 21 fills in)
- Application terms of service link: same
- Authorized domains: leave blank for dev
- Developer contact: `masoncao7@gmail.com`

Save. On the "Scopes" step, leave defaults (email, profile, openid). Save. On "Test users", add `masoncao7@gmail.com` so you can sign in while the app is in testing mode.

- [ ] **Step 8.3: Create OAuth Client ID**

Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
- Application type: **Web application**
- Name: `FreshTrack Dev`
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

Click **Create**. Copy the **Client ID** and **Client Secret**.

- [ ] **Step 8.4: Add credentials to `.env.local`**

Append to `.env.local`:

```
GOOGLE_CLIENT_ID=<client id from step 8.3>
GOOGLE_CLIENT_SECRET=<client secret from step 8.3>
```

- [ ] **Step 8.5: Restart dev server**

```bash
npm run dev
```

No commit — these are local env values only.

---

## Task 9: Verify Auth Flow Locally End-to-End

- [ ] **Step 9.1: Visit the app**

Open `http://localhost:3000`. Expect redirect to `/login`.

- [ ] **Step 9.2: Sign in**

Click "Continue with Google". Expect Google OAuth consent flow. Complete it with `masoncao7@gmail.com`.

- [ ] **Step 9.3: Verify landing**

Expect redirect back to `/`. (The dashboard may be broken at this stage because it queries items without a `userId` scope — see Task 11. For now, confirm only that the session cookie is set and `/login` no longer redirects.)

- [ ] **Step 9.4: Verify user row**

```bash
npx drizzle-kit studio
```

Open the studio UI, find the `users` table, confirm a row exists with your email. Also check `accounts` for the Google linkage.

- [ ] **Step 9.5: Test sign-out**

From browser devtools, delete the `authjs.session-token` cookie. Refresh. Expect redirect to `/login`.

- [ ] **Step 9.6: No commit**

This is verification only. If any step fails, debug before moving on. Common failures:
- `redirect_uri_mismatch`: double-check Step 8.3 URI
- No user row created: likely the adapter isn't wired to the right tables — revisit `src/auth.ts`
- Session callback not firing: double-check the `jwt` and `session` callbacks

---

## Task 10: `getCurrentUserId` Helper + Tests

A small helper that throws if no session. Security-critical — test it.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/session.ts`
- Create: `src/lib/session.test.ts`

- [ ] **Step 10.1: Install vitest**

```bash
npm install -D vitest @vitest/ui
```

- [ ] **Step 10.2: Add test script to `package.json`**

Under `"scripts"`, add:
```
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 10.3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 10.4: Create the failing test FIRST**

Create `src/lib/session.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { getCurrentUserId } from "./session";

describe("getCurrentUserId", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns the user id when a session exists", async () => {
    authMock.mockResolvedValue({ user: { id: "user-123" } });
    await expect(getCurrentUserId()).resolves.toBe("user-123");
  });

  it("throws when no session exists", async () => {
    authMock.mockResolvedValue(null);
    await expect(getCurrentUserId()).rejects.toThrow("Not authenticated");
  });

  it("throws when session has no user id", async () => {
    authMock.mockResolvedValue({ user: {} });
    await expect(getCurrentUserId()).rejects.toThrow("Not authenticated");
  });
});
```

- [ ] **Step 10.5: Run test — expect FAIL**

```bash
npm test
```

Expected: FAIL with "Cannot find module './session'" or similar.

- [ ] **Step 10.6: Implement the helper**

Create `src/lib/session.ts`:

```ts
import { auth } from "@/auth";

export async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}
```

- [ ] **Step 10.7: Run test — expect PASS**

```bash
npm test
```

Expected: 3 tests pass.

- [ ] **Step 10.8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/session.ts src/lib/session.test.ts
git commit -m "Add getCurrentUserId helper with Vitest tests"
```

---

## Task 11: Thread userId Through All Data Access

This is the security-critical task. Every query that reads or writes user data must scope by `userId`. Pattern: `const userId = await getCurrentUserId();` at the top of each handler, then `.where(and(eq(items.userId, userId), …))` on every query.

**Files:**
- Modify: `src/app/api/items/route.ts`
- Modify: `src/app/api/items/[id]/route.ts`
- Modify: `src/app/api/items/[id]/consume/route.ts`
- Modify: `src/app/api/items/[id]/waste/route.ts`
- Modify: `src/app/api/items/_lib.ts` (update `completeItem` signature)
- Modify: `src/app/api/recipes/route.ts`
- Modify: `src/app/api/recipes/suggestions/route.ts`
- Modify: `src/app/api/stats/route.ts`

The `/api/categories/route.ts` stays unchanged because categories are global per spec Section 2.

- [ ] **Step 11.0: Restore schema changes if stashed**

If Task 4.7 was stashed:

```bash
git stash pop
```

Verify `src/db/schema.ts` again shows the `userId` columns. If not stashed, the changes are still in the working tree — skip.

- [ ] **Step 11.1: Update `src/app/api/items/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, categories } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import {
  categoryExists,
  isItemStatus,
  validateCreateItemPayload,
} from "./_lib";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") || "active";

  if (!isItemStatus(status)) {
    return NextResponse.json(
      { error: "Status must be active, consumed, or wasted." },
      { status: 400 }
    );
  }

  const result = await db
    .select({
      id: items.id,
      name: items.name,
      categoryId: items.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      quantity: items.quantity,
      unit: items.unit,
      purchaseDate: items.purchaseDate,
      expirationDate: items.expirationDate,
      status: items.status,
      costEstimate: items.costEstimate,
      notes: items.notes,
      createdAt: items.createdAt,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(and(eq(items.userId, userId), eq(items.status, status)))
    .orderBy(asc(items.expirationDate))
    .all();

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateCreateItemPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (
    validation.data.categoryId !== null &&
    !(await categoryExists(validation.data.categoryId))
  ) {
    return NextResponse.json({ error: "Category not found." }, { status: 400 });
  }

  const newItem = await db
    .insert(items)
    .values({
      ...validation.data,
      userId,
      status: "active",
    })
    .returning()
    .get();

  return NextResponse.json(newItem, { status: 201 });
}
```

- [ ] **Step 11.2: Update `src/app/api/items/[id]/route.ts`**

Read `userId` at top of both handlers. Change `.where(eq(items.id, itemId))` to `.where(and(eq(items.id, itemId), eq(items.userId, userId)))` everywhere. Import `and` from `drizzle-orm`. Example for PATCH:

```ts
const userId = await getCurrentUserId();
// … validation unchanged …
const updated = await db
  .update(items)
  .set({ ...validation.data, updatedAt: new Date().toISOString() })
  .where(and(eq(items.id, itemId), eq(items.userId, userId)))
  .returning()
  .get();
```

DELETE:
```ts
const userId = await getCurrentUserId();
// …
const existing = await db
  .select({ id: items.id })
  .from(items)
  .where(and(eq(items.id, itemId), eq(items.userId, userId)))
  .get();

if (!existing) {
  return NextResponse.json({ error: "Item not found" }, { status: 404 });
}

await db
  .delete(items)
  .where(and(eq(items.id, itemId), eq(items.userId, userId)))
  .run();
```

- [ ] **Step 11.3: Update `completeItem` in `_lib.ts`**

Change the signature to accept a `userId`:

```ts
export async function completeItem(
  itemId: number,
  userId: string,
  action: ItemAction
) {
  return db.transaction(async (tx) => {
    const item = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .get();

    if (!item) {
      return { status: 404, body: { error: "Item not found." } };
    }

    if (item.status !== "active") {
      return {
        status: 409,
        body: { error: `Item is already marked as ${item.status}.` },
      };
    }

    await tx
      .update(items)
      .set({ status: action, updatedAt: new Date().toISOString() })
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .run();

    await tx
      .insert(wasteLog)
      .values({
        itemId: item.id,
        itemName: item.name,
        action,
        quantity: item.quantity,
        unit: item.unit,
        costEstimate: item.costEstimate,
        userId,
      })
      .run();

    return { status: 200, body: { success: true } };
  });
}
```

Add `import { and } from "drizzle-orm";` if not already present.

- [ ] **Step 11.4: Update consume/waste routes**

```ts
// src/app/api/items/[id]/consume/route.ts
import { NextResponse } from "next/server";
import { completeItem, parseItemId } from "../../_lib";
import { getCurrentUserId } from "@/lib/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const result = await completeItem(itemId, userId, "consumed");
  return NextResponse.json(result.body, { status: result.status });
}
```

Same pattern for `waste/route.ts` with action `"wasted"`. Check the existing signature — the handler may already be structured slightly differently; preserve external behavior, just thread `userId`.

- [ ] **Step 11.5: Update `src/app/api/recipes/route.ts`**

Read `userId` at top of each handler. Every `db.select().from(recipes)` query gets `.where(eq(recipes.userId, userId))` (add to any existing where). Every `db.insert(recipes)` gets `userId` in the values. Every update/delete gets the userId match in the where clause.

- [ ] **Step 11.6: Update `src/app/api/recipes/suggestions/route.ts`**

Same pattern. Suggestions should only match the user's own items and recipes.

- [ ] **Step 11.7: Update `src/app/api/stats/route.ts`**

```ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { wasteLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import { formatMonthLabel, monthKeyFromDateValue } from "@/lib/dates";

// …

export async function GET() {
  const userId = await getCurrentUserId();
  const allLogs = await db
    .select()
    .from(wasteLog)
    .where(eq(wasteLog.userId, userId))
    .all();

  // … rest of aggregation unchanged …
}
```

- [ ] **Step 11.8: Verify build passes**

```bash
npm run lint && npm run build
```

Expected: PASS (all callers threaded).

- [ ] **Step 11.9: Commit (schema + route changes together)**

```bash
git add src/db/schema.ts drizzle/ src/app/api/ src/lib/
git commit -m "Add userId columns and scope all data access by userId"
```

---

## Task 12: Empty States for New Users

New users land on `/` with no items. Ensure each page handles the empty case gracefully. The existing `src/components/ui/empty-state.tsx` component should already exist — check it and reuse.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/pantry/page.tsx`
- Modify: `src/app/recipes/page.tsx`
- Modify: `src/app/stats/page.tsx`

- [ ] **Step 12.1: Inspect existing empty-state component**

```bash
cat src/components/ui/empty-state.tsx
```

Note its props (likely `title`, `description`, `action`). Design system should already cover it.

- [ ] **Step 12.2: Dashboard empty state**

In `src/app/page.tsx`, when `items.length === 0`, render:

```tsx
<EmptyState
  title="Your pantry is empty"
  description="Add your first item to start tracking freshness and cutting waste."
  action={
    <Button asChild>
      <Link href="/pantry">Add your first item</Link>
    </Button>
  }
/>
```

Hide the `WeeklyHero`, `MetricCards`, `NeedsAttention`, and recipe suggestion blocks when empty — show ONLY the greeting, streak (which should read zero), and the empty state CTA.

- [ ] **Step 12.3: Pantry empty state**

In `src/app/pantry/page.tsx`, when no items match the current filter, render:
- If `searchTerm` or non-default filter active: existing "no results" copy
- If pantry is completely empty (no items regardless of filter): "Nothing in your pantry yet. Tap + to add your first item."

- [ ] **Step 12.4: Recipes empty state**

In `src/app/recipes/page.tsx`, when no recipes exist: "No recipes yet. Recipes will appear once you add them." (Recipe creation UI is out of scope for this task — this is just a safe empty message.)

- [ ] **Step 12.5: Stats empty state**

In `src/app/stats/page.tsx`, when `wasteLog` is empty: "Stats will appear once you start marking items as used or wasted."

- [ ] **Step 12.6: Verify locally**

Delete items from the dev DB via `drizzle-kit studio` or re-seed empty, then visit each page. Confirm empty states render and none of the charts/components throw on empty arrays.

- [ ] **Step 12.7: Commit**

```bash
git add src/app/
git commit -m "Add empty states for new users"
```

---

## Task 13: Update Seed Script for Dev User

`npm run db:seed` should create a fixed dev user and associate all seeded data with them, so local development with auth still shows a populated DB.

**Files:**
- Modify: `src/db/seed.ts`

- [ ] **Step 13.1: Create dev user at top of seed**

After the category/table-clear logic, before items/recipes/wasteLog inserts:

```ts
const DEV_USER_ID = "dev-user-local";
const DEV_USER_EMAIL = "dev@freshtrack.local";

await db.delete(users).where(eq(users.id, DEV_USER_ID)).run();
await db
  .insert(users)
  .values({
    id: DEV_USER_ID,
    email: DEV_USER_EMAIL,
    name: "Dev User",
  })
  .run();
```

Import `users` from schema and `eq` from `drizzle-orm` if not already imported.

- [ ] **Step 13.2: Associate all seed data with `DEV_USER_ID`**

Every `items.insert(...)` gets `userId: DEV_USER_ID`. Same for `recipes` inserts and `wasteLog` inserts.

- [ ] **Step 13.3: Note that real sign-in creates a DIFFERENT user**

After running `db:seed`, the dev user sees seeded data only if they sign in as `dev@freshtrack.local`. In practice during dev, signing in with your real Google account creates a separate user with no data. This is expected — the seed is for testing the dashboard with data; real accounts test the empty-state flow.

Document this in a comment at the top of `seed.ts`:

```ts
// Creates a fixed dev user (id: "dev-user-local", email: "dev@freshtrack.local")
// and seeds their pantry. Google sign-in with a real account creates a separate
// user and does NOT see this data — use drizzle-kit studio to inspect both.
```

- [ ] **Step 13.4: Run seed and verify**

```bash
npm run db:seed
```

Open studio (`npx drizzle-kit studio`), confirm: `users` has `dev-user-local` + your Google account; all `items`/`recipes`/`wasteLog` rows have `user_id = 'dev-user-local'`.

- [ ] **Step 13.5: Commit**

```bash
git add src/db/seed.ts
git commit -m "Scope seed data to a dev user"
```

---

## Task 14: Generate PWA Icons

Generate 4 icon files from the existing brand. If no source logo exists, create a simple "FT" monogram on a sage-colored square.

**Files:**
- Create: `public/icon-192.png` (192×192)
- Create: `public/icon-512.png` (512×512)
- Create: `public/icon-512-maskable.png` (512×512, with safe-zone padding)
- Create: `public/apple-touch-icon.png` (180×180)

- [ ] **Step 14.1: Source asset**

Check if `public/` already has a logo. If yes, use it. If no, generate a 1024×1024 PNG: solid sage background (`#84a98c` or match the design token value in `globals.css`), centered cream-colored "FT" text using DM Sans bold, 520px font size. Any design tool works (Figma export, Photoshop, or `sharp` via a one-off script).

If using `sharp` quickly:

```bash
npm install -D sharp
```

Then a one-off `scripts/make-icons.mjs`:

```js
import sharp from "sharp";
import fs from "fs";

const SIZE = 1024;
const BG = "#84a98c";
const FG = "#fefae0";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect width="100%" height="100%" fill="${BG}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="DM Sans, sans-serif" font-weight="700" font-size="520"
        fill="${FG}">FT</text>
</svg>`;

fs.writeFileSync("/tmp/ft.svg", svg);

await sharp("/tmp/ft.svg").resize(192).png().toFile("public/icon-192.png");
await sharp("/tmp/ft.svg").resize(512).png().toFile("public/icon-512.png");
await sharp("/tmp/ft.svg").resize(180).png().toFile("public/apple-touch-icon.png");

// Maskable version: add 10% padding so the "FT" stays inside the safe zone.
const maskableSvg = svg.replace(
  `font-size="520"`,
  `font-size="420"`
);
fs.writeFileSync("/tmp/ft-maskable.svg", maskableSvg);
await sharp("/tmp/ft-maskable.svg").resize(512).png().toFile("public/icon-512-maskable.png");

console.log("Icons generated.");
```

Run: `node scripts/make-icons.mjs`. Verify the four files exist and open in an image viewer. Icons should be legible at small sizes.

Once generated, you can delete `scripts/make-icons.mjs` and the dev-only `sharp` dependency — they're not needed beyond this task:

```bash
rm scripts/make-icons.mjs
npm uninstall sharp
```

- [ ] **Step 14.2: Commit**

```bash
git add public/icon-192.png public/icon-512.png public/icon-512-maskable.png public/apple-touch-icon.png package.json package-lock.json
git commit -m "Add PWA icons"
```

---

## Task 15: PWA Manifest and `<head>` Metadata

**Files:**
- Create: `public/manifest.json`
- Modify: `src/app/layout.tsx`

- [ ] **Step 15.1: Create manifest**

`public/manifest.json`:

```json
{
  "name": "FreshTrack",
  "short_name": "FreshTrack",
  "description": "Track your pantry, cut food waste.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fefae0",
  "theme_color": "#84a98c",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

Note: `background_color` and `theme_color` must match the actual CSS token values used in the app. Check `src/app/globals.css` for the sage/cream token resolution; if they differ from `#84a98c` / `#fefae0`, substitute the real values.

- [ ] **Step 15.2: Update `src/app/layout.tsx` metadata export**

Use Next.js 16's `metadata` export. Add or update the exported `metadata` constant in `src/app/layout.tsx`:

```ts
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "FreshTrack",
  description: "Track your pantry, cut food waste.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FreshTrack",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#84a98c",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};
```

Remove any existing `<meta name="viewport">` or `<meta name="theme-color">` tags that conflict — the `viewport` export handles them.

- [ ] **Step 15.3: Verify build**

```bash
npm run build
npm run dev
```

Open `http://localhost:3000/manifest.json` — expect the JSON. Open DevTools → Application → Manifest — expect "Installable" green check with icons listed.

- [ ] **Step 15.4: Commit**

```bash
git add public/manifest.json src/app/layout.tsx
git commit -m "Add PWA manifest and metadata"
```

---

## Task 16: Install Prompt Component

A dismissible banner that shows install instructions on mobile.

**Files:**
- Create: `src/components/layout/install-prompt.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 16.1: Create the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "freshtrack:install-prompt-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already installed (PWA running standalone)?
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (isStandalone) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    if (isAndroid) {
      setPlatform("android");
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setVisible(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-20 left-4 right-4 z-40 bg-white rounded-2xl shadow-warm p-4 flex items-start gap-3 md:hidden"
        >
          <div className="flex-1 text-sm">
            <p className="font-semibold text-sage-900 mb-1">
              Install FreshTrack
            </p>
            {platform === "ios" ? (
              <p className="text-sage-700">
                Tap the Share icon, then "Add to Home Screen".
              </p>
            ) : (
              <p className="text-sage-700">
                Add FreshTrack to your home screen for quick access.
              </p>
            )}
          </div>
          {platform === "android" && (
            <Button size="sm" onClick={install}>
              Install
            </Button>
          )}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-sage-600 hover:text-sage-900"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 16.2: Mount in layout**

In `src/app/layout.tsx`, import `InstallPrompt` and render it inside the `<body>` (after the children). Note: it's client-only and guards itself against SSR with `typeof window` checks.

- [ ] **Step 16.3: Verify**

```bash
npm run dev
```

Open Chrome DevTools → toggle device emulator to iPhone or Pixel. Reload. Banner should appear. Dismiss — refresh — it should stay hidden (localStorage persists).

- [ ] **Step 16.4: Commit**

```bash
git add src/components/layout/install-prompt.tsx src/app/layout.tsx
git commit -m "Add PWA install prompt"
```

---

## Task 17: Privacy Policy Page

**Files:**
- Create: `src/app/privacy/page.tsx`

- [ ] **Step 17.1: Create the page**

```tsx
export const metadata = {
  title: "Privacy Policy — FreshTrack",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sage-900">
      <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>
      <p className="text-sm text-sage-700 mb-8">Last updated: April 16, 2026</p>

      <section className="space-y-4 leading-relaxed">
        <h2 className="text-xl font-semibold mt-8">What we collect</h2>
        <p>
          When you sign in with Google, we receive your name, email address,
          and profile picture URL. We also store the pantry items, recipes,
          and consumption history you enter into FreshTrack.
        </p>

        <h2 className="text-xl font-semibold mt-8">How we use it</h2>
        <p>
          We use your information solely to provide the FreshTrack service —
          showing you your own pantry and statistics. We do not sell, rent, or
          share your data with third parties, and we do not use it for
          advertising.
        </p>

        <h2 className="text-xl font-semibold mt-8">Where it's stored</h2>
        <p>
          Your data is stored on servers operated by Vercel and Turso, both
          located in the United States. Passwords are not stored — we rely on
          Google for authentication.
        </p>

        <h2 className="text-xl font-semibold mt-8">Your rights</h2>
        <p>
          You can request deletion of your account and all associated data at
          any time by emailing{" "}
          <a href="mailto:masoncao7@gmail.com" className="underline">
            masoncao7@gmail.com
          </a>
          . Deletion is permanent and completed within 7 days.
        </p>

        <h2 className="text-xl font-semibold mt-8">Cookies</h2>
        <p>
          FreshTrack uses a single session cookie to keep you signed in. No
          analytics, tracking, or advertising cookies are set.
        </p>

        <h2 className="text-xl font-semibold mt-8">Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:masoncao7@gmail.com" className="underline">
            masoncao7@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 17.2: Verify**

Visit `/privacy` — should render without requiring auth (middleware exempts it).

- [ ] **Step 17.3: Commit**

```bash
git add src/app/privacy/
git commit -m "Add privacy policy page"
```

---

## Task 18: Terms of Service Page

**Files:**
- Create: `src/app/terms/page.tsx`

- [ ] **Step 18.1: Create the page**

```tsx
export const metadata = {
  title: "Terms of Service — FreshTrack",
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sage-900">
      <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>
      <p className="text-sm text-sage-700 mb-8">Last updated: April 16, 2026</p>

      <section className="space-y-4 leading-relaxed">
        <h2 className="text-xl font-semibold mt-8">Use at your own risk</h2>
        <p>
          FreshTrack is provided as-is, without any warranty of any kind. We
          do our best to keep the service reliable, but we can't guarantee
          uptime, accuracy, or that your data will never be lost. Keep your
          own records if the information is important.
        </p>

        <h2 className="text-xl font-semibold mt-8">Acceptable use</h2>
        <p>
          Don't try to break the service, access other users' data, or use
          FreshTrack for anything illegal. We reserve the right to suspend
          accounts that do.
        </p>

        <h2 className="text-xl font-semibold mt-8">Inactive accounts</h2>
        <p>
          Accounts with no sign-ins for 12 months may be deleted, along with
          all associated data, to free resources.
        </p>

        <h2 className="text-xl font-semibold mt-8">Changes</h2>
        <p>
          We may update these terms occasionally. Continued use of FreshTrack
          after changes means you accept the new terms.
        </p>

        <h2 className="text-xl font-semibold mt-8">Contact</h2>
        <p>
          Questions? Email{" "}
          <a href="mailto:masoncao7@gmail.com" className="underline">
            masoncao7@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 18.2: Verify**

Visit `/terms` — renders, no auth required.

- [ ] **Step 18.3: Commit**

```bash
git add src/app/terms/
git commit -m "Add terms of service page"
```

---

## Task 19: Footer Links + Sign-Out UI

Add footer links to `/privacy` and `/terms` on every authenticated page. Add a sign-out entry on the desktop side rail and a profile menu on the mobile bottom bar.

**Files:**
- Create: `src/components/layout/footer-legal.tsx`
- Modify: `src/app/layout.tsx` (mount footer for authed routes)
- Modify: `src/components/layout/app-shell.tsx` (profile + sign-out)

- [ ] **Step 19.1: Create footer component**

```tsx
import Link from "next/link";

export function FooterLegal() {
  return (
    <footer className="mt-16 pb-24 md:pb-8 px-6 text-center text-xs text-sage-600">
      <nav className="flex items-center justify-center gap-4">
        <Link href="/privacy" className="hover:text-sage-900 underline">
          Privacy
        </Link>
        <span aria-hidden>·</span>
        <Link href="/terms" className="hover:text-sage-900 underline">
          Terms
        </Link>
        <span aria-hidden>·</span>
        <a
          href="mailto:masoncao7@gmail.com"
          className="hover:text-sage-900 underline"
        >
          Contact
        </a>
      </nav>
      <p className="mt-3">© {new Date().getFullYear()} FreshTrack</p>
    </footer>
  );
}
```

- [ ] **Step 19.2: Mount footer in layout**

In `src/app/layout.tsx`, render `<FooterLegal />` near the bottom of `<body>`. It appears on every page including `/login`, `/privacy`, `/terms` — that's fine and expected.

- [ ] **Step 19.3: Add sign-out action**

Read the current structure of `src/components/layout/app-shell.tsx`. Identify where the desktop side rail renders nav items and where the mobile bottom bar renders them. The shell may already accept `children` + some session prop — check it.

Add a sign-out server action. Create it inline in a client-compatible form. Approach: expose a server action from a colocated file or from `src/auth.ts`.

Add to bottom of `src/auth.ts`:

```ts
// Already exports: handlers, auth, signIn, signOut
```

No change needed — `signOut` is already exported. Create a small server action wrapper for the UI:

```ts
// src/app/actions/sign-out.ts
"use server";
import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
```

In `src/components/layout/app-shell.tsx`, import `signOutAction`. Add:

- **Desktop side rail (bottom):** a sign-out button styled consistently with existing nav items. Icon `LogOut` from `lucide-react`. Label "Sign out" (visible when rail is expanded at `xl:`).
- **Mobile bottom bar:** a "Profile" tab (user avatar icon), tapping it opens a dialog/sheet with name, email, and a "Sign out" button.

Use the existing `Dialog` from `@/components/ui/dialog` for the mobile profile sheet.

Pass the session into `AppShell` by reading it in the layout (server component) and forwarding `user={session.user}` as a prop to the shell.

- [ ] **Step 19.4: Read session in layout**

In `src/app/layout.tsx`:

```tsx
import { auth } from "@/auth";
// …
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <AppShell user={session?.user ?? null}>
          {children}
        </AppShell>
        <InstallPrompt />
        <FooterLegal />
      </body>
    </html>
  );
}
```

Note: `AppShell` already wraps children; verify the current signature and adapt. If the shell currently branches on pathname to hide itself on `/login`, keep that branch — the profile UI only renders when `user` is non-null.

- [ ] **Step 19.5: Verify**

Run `npm run dev`. Sign in, sign out. Verify:
- Desktop side rail shows sign-out when expanded
- Mobile bottom bar shows profile tab → opens sheet → sign-out button works
- After sign-out, redirected to `/login`

- [ ] **Step 19.6: Commit**

```bash
git add src/
git commit -m "Add footer legal links and sign-out UI"
```

---

## Task 20: README Updates

**Files:**
- Modify: `README.md`

- [ ] **Step 20.1: Read current README**

```bash
cat README.md
```

- [ ] **Step 20.2: Update with deploy section**

Add a "Deployment" section after setup/dev-server sections:

```markdown
## Deployment

FreshTrack is deployed as a PWA on Vercel + Turso.

### Environment variables

See `.env.example` for the full list. Required in production:

- `TURSO_DATABASE_URL` — libSQL URL from Turso
- `TURSO_AUTH_TOKEN` — Turso auth token
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `AUTH_URL` — your deployed origin (e.g. `https://freshtrack.vercel.app`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth credentials

### Deploy steps

1. Create a Turso database: `turso db create freshtrack`
2. Get the URL and token: `turso db show --url freshtrack` / `turso db tokens create freshtrack`
3. Create a Vercel project linked to this repo
4. Add the env vars above to Vercel project settings
5. Push to `main` — Vercel auto-deploys
6. Run migrations against prod: `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx drizzle-kit migrate`
```

Also add a "v1 scope / roadmap" section:

```markdown
## Scope

### v1 (shipped)

- Google sign-in
- Multi-tenant pantry / recipes / waste tracking
- Installable PWA (manifest + icons)

### Planned

- Email + password auth
- Push notifications for expiring items
- Custom domain
- Household (shared pantry) support
- Offline mode (service worker)
```

- [ ] **Step 20.3: Commit**

```bash
git add README.md
git commit -m "Document deployment and v1 scope in README"
```

---

## Task 21: Production Deployment

This is largely manual — done through the Vercel, Turso, and Google Cloud dashboards. Each step is concrete and verifiable.

- [ ] **Step 21.1: Install Turso CLI**

```bash
brew install tursodatabase/tap/turso
turso auth login
```

- [ ] **Step 21.2: Create production database**

```bash
turso db create freshtrack
turso db show --url freshtrack
turso db tokens create freshtrack
```

Save both values — they're `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for prod.

- [ ] **Step 21.3: Run migrations against prod**

```bash
TURSO_DATABASE_URL="<prod url>" TURSO_AUTH_TOKEN="<prod token>" npx drizzle-kit migrate
```

Expected: all migrations apply (0000, 0001, 0002). Verify via `turso db shell freshtrack` then `.tables` — should list `categories`, `items`, `recipes`, `recipe_ingredients`, `waste_log`, `users`, `accounts`, `sessions`, `verification_tokens`.

- [ ] **Step 21.4: Seed production categories**

Categories are global (no userId). Write a one-shot script or manually insert via `turso db shell`:

```sql
INSERT INTO categories (name, icon, default_shelf_life_days) VALUES
  ('Produce', 'Apple', 7),
  ('Dairy', 'Milk', 10),
  ('Meat', 'Beef', 4),
  ('Seafood', 'Fish', 2),
  ('Grains', 'Wheat', 180),
  ('Pantry', 'Package', 365),
  ('Frozen', 'Snowflake', 90),
  ('Beverages', 'CupSoda', 30),
  ('Condiments', 'Utensils', 180),
  ('Baked', 'Cookie', 5);
```

(Exact names/icons/shelf-lives should match `src/db/seed.ts`. Copy verbatim from there.)

- [ ] **Step 21.5: Create Vercel project**

1. `vercel.com` → New Project → import this GitHub repo
2. Framework: Next.js (auto-detected)
3. Root directory: `/`
4. Build settings: defaults
5. Don't deploy yet — add env vars first

- [ ] **Step 21.6: Add env vars in Vercel**

Under Project Settings → Environment Variables, add (Production scope):

```
TURSO_DATABASE_URL=<prod url>
TURSO_AUTH_TOKEN=<prod token>
AUTH_SECRET=<new openssl rand value>
AUTH_URL=https://freshtrack.vercel.app
GOOGLE_CLIENT_ID=<placeholder — Step 21.8 provides>
GOOGLE_CLIENT_SECRET=<placeholder — Step 21.8 provides>
```

- [ ] **Step 21.7: First deploy (will fail OAuth but should build)**

Trigger a deploy (push to `main` or redeploy from dashboard). Confirm build succeeds and the site loads at the assigned `*.vercel.app` URL. `/login` renders but clicking Google sign-in will fail because OAuth isn't yet configured for the prod URL.

- [ ] **Step 21.8: Create prod OAuth credentials in Google Cloud**

In the same Google Cloud project from Task 8:

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: Web application
3. Name: "FreshTrack Production"
4. Authorized origins: `https://freshtrack.vercel.app`
5. Authorized redirect URIs: `https://freshtrack.vercel.app/api/auth/callback/google`
6. Create. Copy the new Client ID and Secret.

- [ ] **Step 21.9: Update Vercel env vars with prod credentials**

Replace `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with the new values. Redeploy so new envs apply.

- [ ] **Step 21.10: Update OAuth consent screen for prod**

Back in Google Cloud → OAuth consent screen → Edit:

- Application home page: `https://freshtrack.vercel.app`
- Application privacy policy link: `https://freshtrack.vercel.app/privacy`
- Application terms of service link: `https://freshtrack.vercel.app/terms`
- Authorized domains: `vercel.app`

Save. To open to public signups, **Publish app** (moves out of "Testing" mode). Google may prompt for verification — for a small app with basic scopes (email, profile, openid), it typically doesn't require formal verification.

- [ ] **Step 21.11: End-to-end prod smoke test**

From a phone (or two browsers):

1. Visit `https://freshtrack.vercel.app` → redirects to `/login`
2. Sign in with Google
3. Lands on `/` with empty state
4. Add an item, confirm it appears in Pantry
5. Mark it consumed → confetti → moves out of Active list
6. Check Stats → shows the one consumed item
7. Sign out → back to `/login`
8. Sign in again with a **different** Google account → empty state (not the first user's data)
9. Install to home screen (iOS Safari: Share → Add to Home Screen; Android Chrome: banner or menu "Install app")
10. Open from home screen → confirm it launches standalone (no browser chrome)
11. Visit `/privacy` and `/terms` → both render

- [ ] **Step 21.12: Announce**

Share the link. Monitor Vercel + Turso dashboards for errors in the first few days.

---

## Future-Work Specs (NOT in this plan)

Per spec Section "Future Work", create follow-up specs for:

- Push notifications for expiry alerts (web push, VAPID, scheduled cron)
- Email + password authentication
- Custom domain (Cloudflare → Vercel)
- Household / shared pantry
- Offline mode via service worker
- Per-user custom categories
