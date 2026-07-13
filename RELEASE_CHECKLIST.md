# Production release checklist

## Before deployment

- [ ] Review the diff and confirm CI passes from a clean `npm ci` install.
- [ ] Confirm `npm audit --omit=dev --audit-level=high` reports no release-blocking advisory.
- [ ] Confirm production has `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` configured; set `DATABASE_POOL_MAX` against the database connection budget.
- [ ] Confirm `AUTH_DEV_BYPASS` is absent from production. The code ignores it outside development, but it should not be present.
- [ ] Confirm the Google OAuth origin and callback URL exactly match the production HTTPS origin.
- [ ] Take or verify a restorable Postgres backup and record the restore procedure.
- [ ] Review the generated SQL migration, then run `npm run db:migrate` against the intended database.
- [ ] Seed global categories/recipes only when required. Never run the destructive development seed in production.
- [ ] Confirm the Privacy Policy, Terms, support email, and third-party processor list are still accurate.

## Smoke test after deployment

- [ ] `/`, `/foods`, a food guide, `/privacy`, and `/terms` load without Auth.js cookies and permit public caching.
- [ ] `/login` completes Google sign-in and returns to `/app`.
- [ ] Anonymous `/app` requests redirect to `/login`; anonymous protected API requests return JSON `401`.
- [ ] Add, edit, use, waste, restore, and delete an item in a dedicated test account.
- [ ] Scan a known barcode and verify unknown products fall back to manual entry.
- [ ] Recipe search, filtering, pagination, suggestions, and Stats load for the test account.
- [ ] Verify CSP, HSTS, `nosniff`, frame protection, referrer policy, permissions policy, COOP, and private API cache headers.
- [ ] Check logs for authentication, migration, database-pool, or upstream product-lookup errors.

## Rollback and operations

- [ ] Keep the previous deploy available until smoke testing passes.
- [ ] Roll back application code first when a compatible prior version exists; restore data only from a confirmed backup and only when a migration cannot be rolled forward safely.
- [ ] Define alerts for elevated 5xx responses, authentication failures, exhausted database connections, latency, and storage growth before a high-traffic launch.
- [ ] Exercise database restore and account-deletion procedures before handling real user incidents.
- [ ] Record the release time, commit, migration version, operator, and smoke-test result.
