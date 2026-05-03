import { NextRequest, NextResponse } from "next/server";
import { parseItemId, restoreItem } from "../../_lib";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const result = await restoreItem(itemId);
  return NextResponse.json(result.body, { status: result.status });
}
