// Transactional email through Resend's HTTP API (no SDK needed).
const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

export const DEFAULT_EMAIL_FROM = "FreshTrack <reminders@myfreshtrack.app>";

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  /** Resend drops repeats of the same key, so a retried send cannot double-deliver. */
  idempotencyKey?: string;
}

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; retryable: boolean; rateLimited: boolean; error: string };

interface SendEmailOptions {
  apiKey?: string;
  from?: string;
  fetchImpl?: typeof fetch;
  log?: (message: string) => void;
  env?: Partial<Record<"NODE_ENV" | "RESEND_API_KEY" | "EMAIL_FROM", string>>;
}

function failure(error: string, retryable: boolean, rateLimited = false): SendEmailResult {
  return { ok: false, retryable, rateLimited, error };
}

export async function sendEmail(
  email: OutgoingEmail,
  options: SendEmailOptions = {}
): Promise<SendEmailResult> {
  const env = options.env ?? process.env;
  const apiKey = "apiKey" in options ? options.apiKey : env.RESEND_API_KEY;
  const from = options.from ?? env.EMAIL_FROM?.trim() ?? DEFAULT_EMAIL_FROM;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!apiKey) {
    if (env.NODE_ENV === "production") {
      return failure("RESEND_API_KEY is not configured.", false);
    }
    // Local development: show what would have been sent.
    (options.log ?? console.info)(`[email preview] To: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`);
    return { ok: true, id: null };
  }

  let response: Response;
  try {
    response = await fetchImpl(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: from || DEFAULT_EMAIL_FROM,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.headers ? { headers: email.headers } : {}),
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch (error) {
    return failure(`Could not reach Resend: ${error instanceof Error ? error.message : "unknown error"}`, true);
  }

  const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
  if (response.ok) return { ok: true, id: body?.id ?? null };

  const detail = body?.message ? `: ${body.message}` : "";
  if (response.status === 429) return failure(`Resend rate limit reached (429)${detail}`, true, true);
  if (response.status >= 500) return failure(`Resend is unavailable (${response.status})${detail}`, true);
  return failure(`Resend rejected the email (${response.status})${detail}`, false);
}
