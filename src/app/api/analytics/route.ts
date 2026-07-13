import { auth } from "@/auth";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import {
  checkAnalyticsEventRateLimit,
  validateAnalyticsEventPayload,
} from "@/lib/analytics-events";
import { isSameOriginRequest } from "@/lib/request-security";
import { readLimitedJsonBody } from "@/lib/request-body";
import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";

const MAX_ANALYTICS_BODY_BYTES = 4 * 1024;
const MAX_USER_AGENT_LENGTH = 500;
const ANALYTICS_RETENTION_MS = 365 * 24 * 60 * 60 * 1_000;
const ANALYTICS_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1_000;

const globalForAnalyticsCleanup = globalThis as unknown as {
  freshtrackLastAnalyticsCleanupAt?: number;
};

async function pruneExpiredAnalyticsEvents(now = Date.now()) {
  const lastCleanup = globalForAnalyticsCleanup.freshtrackLastAnalyticsCleanupAt ?? 0;
  if (now - lastCleanup < ANALYTICS_CLEANUP_INTERVAL_MS) return;

  globalForAnalyticsCleanup.freshtrackLastAnalyticsCleanupAt = now;
  try {
    const cutoff = new Date(now - ANALYTICS_RETENTION_MS).toISOString();
    await db.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, cutoff));
  } catch {
    // Retention cleanup is best-effort and must not block event ingestion.
  }
}

function tooLargeResponse() {
  return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
}

function normalizedHeader(value: string | null, maxLength: number): string | null {
  const text = value?.trim() ?? "";
  return text ? text.slice(0, maxLength) : null;
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function analyticsRateLimitKeys(request: Request, visitorId: string): string[] {
  const clientAddress =
    firstHeaderValue(request.headers.get("x-forwarded-for")) ??
    firstHeaderValue(request.headers.get("cf-connecting-ip")) ??
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    "unknown";

  return [`visitor:${visitorId}`, `client:${clientAddress}`];
}

async function getOptionalUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request, { requireOriginHeader: true })) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const bodyResult = await readLimitedJsonBody(
    request,
    MAX_ANALYTICS_BODY_BYTES,
    { requireJsonContentType: true }
  );
  if (!bodyResult.ok) {
    if (bodyResult.status === 413) return tooLargeResponse();
    return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
  }

  const validation = validateAnalyticsEventPayload(bodyResult.body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  for (const key of analyticsRateLimitKeys(request, validation.data.visitorId)) {
    const rateLimit = checkAnalyticsEventRateLimit(key);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many analytics events." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }
  }

  await db.insert(analyticsEvents).values({
    ...validation.data,
    userId: await getOptionalUserId(),
    userAgent: normalizedHeader(request.headers.get("user-agent"), MAX_USER_AGENT_LENGTH),
  });
  await pruneExpiredAnalyticsEvents();

  return new Response(null, { status: 204 });
}
