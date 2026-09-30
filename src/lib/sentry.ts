// Error reporting settings shared by the server, edge, and browser runtimes.
// A DSN only allows submitting events, so it is safe to ship to the browser.
export const SENTRY_DSN =
  "https://accb7ea7cf2581828b3257688a3dd8a0@o4512174269136896.ingest.us.sentry.io/4512174280409088";

/** Where the browser SDK sends events; allowed by the CSP's connect-src. */
export const SENTRY_INGEST_ORIGIN = new URL(SENTRY_DSN).origin;

export const sentryOptions = {
  dsn: SENTRY_DSN,
  // Errors only: no tracing or session replay. Local errors stay local.
  enabled: process.env.NODE_ENV === "production",
  sendDefaultPii: false,
};
