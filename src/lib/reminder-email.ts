import { greetingName } from "./greeting";
import { daysBetween } from "./reminder-schedule";

const MAX_LISTED_ITEMS = 8;

export interface ReminderEmailItem {
  name: string;
  expirationDate: string;
}

export interface ReminderEmailInput {
  /** Account display name; only the first name is used. */
  name: string | null;
  /** The recipient's local date (YYYY-MM-DD). */
  today: string;
  items: ReminderEmailItem[];
  recipe: { name: string; matchingIngredients: string[] } | null;
  links: { pantry: string; recipes: string; settings: string; unsubscribe: string };
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function expiryPhrase(today: string, expirationDate: string): string {
  const days = daysBetween(today, expirationDate);
  if (days <= 0) return "expires today";
  if (days === 1) return "expires tomorrow";
  return `expires in ${days} days`;
}

function buildSubject(items: ReminderEmailItem[], today: string): string {
  const [first, second] = items.map((item) => oneLine(item.name));
  if (items.length === 1) return `${first} ${expiryPhrase(today, items[0].expirationDate)}`;
  if (items.length === 2) return `${first} and ${second} expire soon`;
  return `${first}, ${second}, and ${items.length - 2} more expire soon`;
}

export function buildReminderEmail(input: ReminderEmailInput) {
  const items = [...input.items].sort(
    (a, b) => a.expirationDate.localeCompare(b.expirationDate) || a.name.localeCompare(b.name, "en")
  );
  const listed = items.slice(0, MAX_LISTED_ITEMS).map((item) => ({
    name: oneLine(item.name),
    phrase: expiryPhrase(input.today, item.expirationDate),
  }));
  const moreCount = items.length - listed.length;
  const firstName = input.name ? greetingName(input.name) : "there";
  const recipeUses = input.recipe?.matchingIngredients.slice(0, 3).join(", ");
  const { links } = input;

  const text = [
    `Hi ${firstName},`,
    "",
    "These are about to go bad in your pantry:",
    ...listed.map((item) => `- ${item.name}: ${item.phrase}`),
    ...(moreCount > 0 ? [`+${moreCount} more in your pantry`] : []),
    "",
    ...(input.recipe
      ? [`Try tonight: ${input.recipe.name}${recipeUses ? ` (uses ${recipeUses})` : ""}`, links.recipes, ""]
      : []),
    `Open your pantry: ${links.pantry}`,
    "",
    "You get this email when something in your FreshTrack pantry is about to expire, at most once a day.",
    `Stop these emails: ${links.unsubscribe}`,
    `Reminder settings: ${links.settings}`,
  ].join("\n");

  const itemRows = listed
    .map(
      (item) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #e6dcc4;font-size:15px;color:#1c1917;">${escapeHtml(item.name)}</td>
            <td style="padding:10px 0;border-bottom:1px solid #e6dcc4;font-size:14px;color:#6b645f;text-align:right;white-space:nowrap;">${escapeHtml(item.phrase)}</td>
          </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#fbf5e6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf5e6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf7;border:1px solid #e6dcc4;border-radius:16px;padding:28px;">
            <tr><td style="font-size:13px;font-weight:600;color:#3d5e3d;letter-spacing:0.08em;text-transform:uppercase;">FreshTrack</td></tr>
            <tr><td style="padding-top:16px;font-size:16px;color:#1c1917;">Hi ${escapeHtml(firstName)},</td></tr>
            <tr><td style="padding-top:8px;font-size:15px;line-height:1.5;color:#44403c;">These are about to go bad in your pantry:</td></tr>
            <tr>
              <td style="padding-top:8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}
                </table>
                ${moreCount > 0 ? `<p style="margin:10px 0 0;font-size:14px;color:#6b645f;">+${moreCount} more in your pantry</p>` : ""}
              </td>
            </tr>
            ${
              input.recipe
                ? `<tr><td style="padding-top:20px;font-size:15px;line-height:1.5;color:#44403c;">Try tonight: <a href="${escapeHtml(links.recipes)}" style="color:#3d5e3d;font-weight:600;">${escapeHtml(input.recipe.name)}</a>${recipeUses ? ` <span style="color:#6b645f;">(uses ${escapeHtml(recipeUses)})</span>` : ""}</td></tr>`
                : ""
            }
            <tr>
              <td style="padding-top:24px;">
                <a href="${escapeHtml(links.pantry)}" style="display:inline-block;background:#3d5e3d;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:10px;">Open your pantry</a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;font-size:12px;line-height:1.6;color:#6b645f;">
                You get this email when something in your FreshTrack pantry is about to expire, at most once a day.
                <a href="${escapeHtml(links.unsubscribe)}" style="color:#6b645f;">Stop these emails</a> or
                <a href="${escapeHtml(links.settings)}" style="color:#6b645f;">change reminder settings</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: buildSubject(items, input.today), html, text };
}
