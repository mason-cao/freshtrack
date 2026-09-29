import { describe, expect, it, vi } from "vitest";
import { DEFAULT_EMAIL_FROM, sendEmail } from "./email-sender";

const email = {
  to: "cook@example.com",
  subject: "Spinach expires today",
  html: "<p>Hi</p>",
  text: "Hi",
  headers: { "List-Unsubscribe": "<https://myfreshtrack.app/api/reminders/unsubscribe?token=t>" },
  idempotencyKey: "reminder-user-2026-09-28",
};

function fakeFetch(status: number, body: unknown = {}) {
  return vi.fn<typeof fetch>(async () => Response.json(body, { status }));
}

describe("sendEmail via Resend", () => {
  it("posts the message with auth, idempotency, and list-unsubscribe headers", async () => {
    const fetchImpl = fakeFetch(200, { id: "email_123" });
    const result = await sendEmail(email, { apiKey: "re_test", fetchImpl, env: { NODE_ENV: "production" } });

    expect(result).toEqual({ ok: true, id: "email_123" });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer re_test",
      "Content-Type": "application/json",
      "Idempotency-Key": "reminder-user-2026-09-28",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      from: DEFAULT_EMAIL_FROM,
      to: ["cook@example.com"],
      subject: "Spinach expires today",
      html: "<p>Hi</p>",
      text: "Hi",
      headers: email.headers,
    });
  });

  it("uses a configured sender address", async () => {
    const fetchImpl = fakeFetch(200, { id: "email_123" });
    await sendEmail(email, {
      apiKey: "re_test",
      from: "FreshTrack <hello@send.myfreshtrack.app>",
      fetchImpl,
      env: { NODE_ENV: "production" },
    });
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body)).from).toBe(
      "FreshTrack <hello@send.myfreshtrack.app>"
    );
  });

  it("marks rate limits and server errors as retryable", async () => {
    expect(await sendEmail(email, { apiKey: "k", fetchImpl: fakeFetch(429), env: {} })).toMatchObject({
      ok: false,
      retryable: true,
      rateLimited: true,
    });
    expect(await sendEmail(email, { apiKey: "k", fetchImpl: fakeFetch(503), env: {} })).toMatchObject({
      ok: false,
      retryable: true,
      rateLimited: false,
    });
  });

  it("does not retry messages Resend rejects", async () => {
    const result = await sendEmail(email, {
      apiKey: "k",
      fetchImpl: fakeFetch(422, { message: "Invalid `to` field." }),
      env: {},
    });
    expect(result).toEqual({
      ok: false,
      retryable: false,
      rateLimited: false,
      error: "Resend rejected the email (422): Invalid `to` field.",
    });
  });

  it("treats network failures as retryable", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await sendEmail(email, { apiKey: "k", fetchImpl, env: {} })).toMatchObject({
      ok: false,
      retryable: true,
    });
  });

  it("previews the email locally when no API key is configured", async () => {
    const log = vi.fn();
    const fetchImpl = fakeFetch(200);
    const result = await sendEmail(email, { apiKey: undefined, fetchImpl, log, env: { NODE_ENV: "development" } });

    expect(result).toEqual({ ok: true, id: null });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(log.mock.calls[0][0]).toContain("Spinach expires today");
  });

  it("refuses to pretend to send in production without an API key", async () => {
    const result = await sendEmail(email, { apiKey: undefined, fetchImpl: fakeFetch(200), env: { NODE_ENV: "production" } });
    expect(result).toEqual({
      ok: false,
      retryable: false,
      rateLimited: false,
      error: "RESEND_API_KEY is not configured.",
    });
  });
});
