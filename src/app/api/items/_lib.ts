import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/request-security";
import { isRequestBodyOverLimit, readLimitedJsonBody } from "@/lib/request-body";
import { parseItemId } from "@/lib/item-validation";
import { checkItemMutationRateLimit } from "@/lib/rate-limits";

export const MAX_ITEM_REQUEST_BODY_BYTES = 8 * 1024;

export function isRequestBodyTooLarge(request: Request): boolean {
  return isRequestBodyOverLimit(request, MAX_ITEM_REQUEST_BODY_BYTES);
}

export function readJsonRequestBody(request: Request) {
  return readLimitedJsonBody(request, MAX_ITEM_REQUEST_BODY_BYTES, {
    requireJsonContentType: true,
  });
}

export async function authorizeItemMutation(request: Request, hasBody = false) {
  if (!isSameOriginRequest(request, { requireOriginHeader: true })) {
    return { ok: false as const, response: NextResponse.json(
      { error: "Cross-origin request blocked." }, { status: 403 }
    ) };
  }
  const userId = await getCurrentUserId();
  if (hasBody && isRequestBodyTooLarge(request)) {
    return { ok: false as const, response: NextResponse.json(
      { error: "Request body is too large." }, { status: 413 }
    ) };
  }
  const limit = checkItemMutationRateLimit(userId);
  if (!limit.ok) {
    return { ok: false as const, response: NextResponse.json(
      { error: `Too many item changes. Try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    ) };
  }
  return { ok: true as const, userId };
}

export function itemActionHandler(
  action: (itemId: number, userId: string) => Promise<{ status: number; body: object }>
) {
  return async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const access = await authorizeItemMutation(request);
    if (!access.ok) return access.response;
    const itemId = parseItemId((await params).id);
    if (itemId === null) {
      return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
    }
    const result = await action(itemId, access.userId);
    return NextResponse.json(result.body, { status: result.status });
  };
}
