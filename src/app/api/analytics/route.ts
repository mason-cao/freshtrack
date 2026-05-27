import { auth } from "@/auth";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import {
  checkAnalyticsEventRateLimit,
  validateAnalyticsEventPayload,
} from "@/lib/analytics-events";
import { isSameOriginRequest } from "@/lib/request-security";
import { NextResponse } from "next/server";

const MAX_ANALYTICS_BODY_BYTES = 4 * 1024;
const MAX_USER_AGENT_LENGTH = 500;

function tooLargeResponse() {
  return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
}

function normalizedHeader(value: string | null, maxLength: number): string | null {
  const text = value?.trim() ?? "";
  return text ? text.slice(0, maxLength) : null;
}

async function readJsonBody(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_ANALYTICS_BODY_BYTES) {
    return { ok: false as const, status: 413 as const, error: "Request body is too large." };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_ANALYTICS_BODY_BYTES) {
    return { ok: false as const, status: 413 as const, error: "Request body is too large." };
  }

  try {
    return { ok: true as const, body: JSON.parse(text) };
  } catch {
    return { ok: false as const, status: 400 as const, error: "Invalid JSON body." };
  }
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
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    if (bodyResult.status === 413) return tooLargeResponse();
    return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
  }

  const validation = validateAnalyticsEventPayload(bodyResult.body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const rateLimit = checkAnalyticsEventRateLimit(validation.data.visitorId);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many analytics events." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  await db.insert(analyticsEvents).values({
    ...validation.data,
    userId: await getOptionalUserId(),
    userAgent: normalizedHeader(request.headers.get("user-agent"), MAX_USER_AGENT_LENGTH),
  });

  return new Response(null, { status: 204 });
}
