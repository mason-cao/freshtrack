export const PRODUCTION_SITE_URL = "https://myfreshtrack.app";
/** The Railway-assigned domain, which now redirects to the custom domain. */
export const LEGACY_SITE_HOST = "freshtrack.up.railway.app";

/** Canonical public origin for metadata, sitemaps, and structured data. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  PRODUCTION_SITE_URL;
