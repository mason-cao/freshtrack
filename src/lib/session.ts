import type { Session } from "next-auth";

const DEV_BYPASS_USER_ID = "dev-user-local";

function isDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_DEV_BYPASS === "1"
  );
}

export function resolveCurrentUserId(session: Session | null): string {
  if (isDevBypassEnabled()) {
    return DEV_BYPASS_USER_ID;
  }

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Authentication required.");
  }

  return userId;
}

export async function getCurrentUserId(): Promise<string> {
  if (isDevBypassEnabled()) {
    return DEV_BYPASS_USER_ID;
  }
  const { auth } = await import("@/auth");
  return resolveCurrentUserId(await auth());
}
