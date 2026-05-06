import type { Session } from "next-auth";

export function resolveCurrentUserId(session: Session | null): string {
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Authentication required.");
  }

  return userId;
}

export async function getCurrentUserId(): Promise<string> {
  const { auth } = await import("@/auth");
  return resolveCurrentUserId(await auth());
}
