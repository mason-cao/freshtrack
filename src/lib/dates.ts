const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function getDateParts(value: string) {
  const match = DATE_INPUT_PATTERN.exec(value);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function toDateInputValue(date = new Date()): string {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join("-");
}

export function addDaysToDateInput(days: number, from = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function parseDateInput(value: string): Date {
  const parts = getDateParts(value);
  if (!parts) return new Date(Number.NaN);

  return new Date(parts.year, parts.month - 1, parts.day);
}

export function isDateInputValue(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const parts = getDateParts(value);
  if (!parts) return false;

  const date = parseDateInput(value);
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day
  );
}

export function differenceInCalendarDays(
  dateInput: string,
  from = new Date()
): number {
  const parts = getDateParts(dateInput);
  if (!parts) return Number.NaN;

  const targetUtc = Date.UTC(parts.year, parts.month - 1, parts.day);
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());

  return Math.round((targetUtc - fromUtc) / MS_PER_DAY);
}

export function monthKeyFromDateValue(value: string): string | null {
  const datePart = value.slice(0, 10);
  if (isDateInputValue(datePart)) return datePart.slice(0, 7);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
