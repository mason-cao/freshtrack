/**
 * Next.js loads .env.local for the app, but drizzle-kit and the tsx database
 * scripts do not. Load it in development so `npm run db:*` targets the same
 * database as `npm run dev`. Variables already set in the shell win (so an
 * explicit `DATABASE_URL=... npm run db:migrate` still targets that database),
 * and production never reads the file.
 */
export function loadLocalEnv(path = ".env.local") {
  if (process.env.NODE_ENV === "production") return;

  try {
    process.loadEnvFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
