export const PRODUCTION_SITE_URL = "https://myfreshtrack.app";

/** Canonical public origin for metadata, sitemaps, and structured data. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  PRODUCTION_SITE_URL;
