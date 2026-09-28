/** First name for the dashboard greeting; "Chef" when the account has no name. */
export function greetingName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] || "Chef";
}
