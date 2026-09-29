import { and, eq, gte, inArray, isNull, lt, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { items, users } from "@/db/schema";
import { suggestRecipes } from "@/app/api/recipes/_lib";
import { sendEmail, type OutgoingEmail, type SendEmailResult } from "@/lib/email-sender";
import { buildReminderEmail, type ReminderEmailItem } from "@/lib/reminder-email";
import {
  REMINDER_WINDOW_DAYS,
  addDaysToDate,
  isReminderDue,
  resolveReminderTimeZone,
} from "@/lib/reminder-schedule";
import { siteUrl } from "@/lib/site-url";
import { createUnsubscribeToken, unsubscribeSecret } from "@/lib/unsubscribe-token";

// Resend allows 2 requests per second by default.
const SEND_SPACING_MS = 600;

export interface ReminderRunSummary {
  /** Users with reminders on. */
  checked: number;
  /** Of those, users in their send window who have not had today's email. */
  due: number;
  sent: number;
  /** Due users with nothing expiring soon; they are checked again next run. */
  noItems: number;
  failed: number;
  /** True when Resend rate-limited the run and the rest were left for later. */
  stoppedEarly: boolean;
}

interface ReminderRunOptions {
  send?: (email: OutgoingEmail) => Promise<SendEmailResult>;
  sleep?: (ms: number) => Promise<void>;
  secret?: string;
  baseUrl?: string;
}

function reminderLinks(baseUrl: string, token: string) {
  const tracking = "utm_source=reminder&utm_medium=email";
  return {
    pantry: `${baseUrl}/pantry?${tracking}`,
    recipes: `${baseUrl}/recipes?${tracking}`,
    settings: `${baseUrl}/settings`,
    unsubscribe: `${baseUrl}/unsubscribe?token=${token}`,
    oneClickUnsubscribe: `${baseUrl}/api/reminders/unsubscribe?token=${token}`,
  };
}

/**
 * Email every user whose local morning has started, who has not had today's
 * reminder, and who has items expiring within REMINDER_WINDOW_DAYS. Safe to
 * run often and from more than one process: each send is claimed first.
 */
export async function sendDueReminders(
  now = new Date(),
  options: ReminderRunOptions = {}
): Promise<ReminderRunSummary> {
  const send = options.send ?? ((email: OutgoingEmail) => sendEmail(email));
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const secret = options.secret ?? unsubscribeSecret();
  const baseUrl = options.baseUrl ?? siteUrl;
  const summary: ReminderRunSummary = {
    checked: 0,
    due: 0,
    sent: 0,
    noItems: 0,
    failed: 0,
    stoppedEarly: false,
  };

  const candidates = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      timeZone: users.timeZone,
      lastReminderOn: users.lastReminderOn,
    })
    .from(users)
    .where(eq(users.reminderEmailsEnabled, true));
  summary.checked = candidates.length;

  const dueUsers = candidates
    .map((user) => ({
      ...user,
      ...isReminderDue({
        now,
        timeZone: resolveReminderTimeZone(user.timeZone),
        lastReminderOn: user.lastReminderOn,
      }),
    }))
    .filter((user) => user.due);
  summary.due = dueUsers.length;
  if (dueUsers.length === 0) return summary;

  // Local "today" differs by zone, so fetch the widest window and filter per user.
  const todays = dueUsers.map((user) => user.today).sort();
  const expiring = await db
    .select({ userId: items.userId, name: items.name, expirationDate: items.expirationDate })
    .from(items)
    .where(
      and(
        inArray(items.userId, dueUsers.map((user) => user.id)),
        eq(items.status, "active"),
        gte(items.expirationDate, todays[0]),
        lte(items.expirationDate, addDaysToDate(todays[todays.length - 1], REMINDER_WINDOW_DAYS))
      )
    );
  const itemsByUser = new Map<string, ReminderEmailItem[]>();
  for (const item of expiring) {
    itemsByUser.set(item.userId, [...(itemsByUser.get(item.userId) ?? []), item]);
  }

  let attempted = false;
  for (const user of dueUsers) {
    const through = addDaysToDate(user.today, REMINDER_WINDOW_DAYS);
    const userItems = (itemsByUser.get(user.id) ?? []).filter(
      (item) => item.expirationDate >= user.today && item.expirationDate <= through
    );
    if (userItems.length === 0) {
      summary.noItems += 1;
      continue;
    }

    // Claim today's reminder before sending so overlapping runs cannot both send it.
    const [claimed] = await db
      .update(users)
      .set({ lastReminderOn: user.today })
      .where(
        and(
          eq(users.id, user.id),
          eq(users.reminderEmailsEnabled, true),
          or(isNull(users.lastReminderOn), lt(users.lastReminderOn, user.today))
        )
      )
      .returning({ id: users.id });
    if (!claimed) continue;

    const recipe = await suggestRecipes(user.id, userItems.map((item) => item.name), 1)
      .then((matches) => matches[0] ?? null)
      .catch(() => null);
    const links = reminderLinks(baseUrl, createUnsubscribeToken(user.id, secret));
    const message = buildReminderEmail({
      name: user.name,
      today: user.today,
      items: userItems,
      recipe: recipe && { name: recipe.name, matchingIngredients: recipe.matchingIngredients },
      links,
    });

    if (attempted) await sleep(SEND_SPACING_MS);
    attempted = true;
    const result = await send({
      to: user.email,
      ...message,
      headers: {
        "List-Unsubscribe": `<${links.oneClickUnsubscribe}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      idempotencyKey: `reminder-${user.id}-${user.today}`,
    });

    if (result.ok) {
      summary.sent += 1;
      continue;
    }

    summary.failed += 1;
    console.error(`[reminders] send failed: ${result.error}`);
    if (result.retryable) {
      // Release the claim so a later run retries today's reminder.
      await db
        .update(users)
        .set({ lastReminderOn: user.lastReminderOn })
        .where(and(eq(users.id, user.id), eq(users.lastReminderOn, user.today)));
    }
    if (result.rateLimited) {
      summary.stoppedEarly = true;
      break;
    }
  }

  return summary;
}
