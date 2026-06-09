import { NextRequest, NextResponse } from "next/server";
import {
  checkItemMutationRateLimit,
  completeItem,
  parseItemId,
} from "../../_lib";
import { getCurrentUserId } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/request-security";

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Too many item changes. Try again in ${retryAfterSeconds} seconds.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request, { requireOriginHeader: true })) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const userId = await getCurrentUserId();
  const rateLimit = checkItemMutationRateLimit(userId);
  if (!rateLimit.ok) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const result = await completeItem(itemId, userId, "consumed");
  return NextResponse.json(result.body, { status: result.status });
}
