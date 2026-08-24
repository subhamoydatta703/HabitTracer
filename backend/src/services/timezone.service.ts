
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const COMMON_TIMEZONES: string[] = [
  "Asia/Kolkata",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/Paris",
  "Australia/Sydney",
];

const SINGLE_TOKEN_ZONES = new Set(["UTC", "GMT"]);
const SLASH_ZONE_RE = /^[A-Za-z][A-Za-z0-9_+\-]*(\/[A-Za-z0-9_+\-]+)+$/;

export function isValidTimezone(timezone: string): boolean {
  if (typeof timezone !== "string" || timezone.length === 0 || timezone.length > 200) {
    return false;
  }
  if (!SINGLE_TOKEN_ZONES.has(timezone) && !SLASH_ZONE_RE.test(timezone)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getPart(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

export function getLocalDate(date: Date | number, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date instanceof Date ? date : new Date(date));

  return `${getPart(parts, "year")}-${getPart(parts, "month")}-${getPart(parts, "day")}`;
}

export function todayLocal(timezone: string, now: Date = new Date()): string {
  return getLocalDate(now, timezone);
}

export function isValidDateString(value: string): boolean {
  if (typeof value !== "string" || !DATE_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return false;
  return dateToDateString(d) === value;
}

export function dateStringToDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function dateToDateString(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}
