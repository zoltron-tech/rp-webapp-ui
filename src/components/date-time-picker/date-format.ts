export type Era = "AD" | "BC";

export type DateTimeFields = {
  era: Era;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
};

function pad(n: number, width = 2): string {
  return Math.max(0, n).toString().padStart(width, "0");
}

/**
 * Parses the backend's wire value for eventTime. AD dates use the backend's
 * existing zone-less shape ("yyyy-MM-dd HH:mm:ss.SSSSSS") unchanged, so
 * existing data keeps working. BC dates carry a "BC" prefix on the same
 * shape — the backend needs to understand that prefix for BC saves to
 * round-trip correctly.
 */
export function parseWireValue(value: string | null): DateTimeFields | null {
  if (!value) return null;

  const bcMatch = value.match(/^BC(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (bcMatch) {
    const [, y, m, d, hh, mm] = bcMatch;
    return {
      day: Number(d),
      era: "BC",
      hour: Number(hh),
      minute: Number(mm),
      month: Number(m),
      year: Number(y),
    };
  }

  const adMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (adMatch) {
    const [, y, m, d, hh, mm] = adMatch;
    return {
      day: Number(d),
      era: "AD",
      hour: Number(hh),
      minute: Number(mm),
      month: Number(m),
      year: Number(y),
    };
  }

  return null;
}

export function toWireValue(fields: DateTimeFields): string {
  const prefix = fields.era === "BC" ? "BC" : "";
  const y = pad(fields.year, 4);
  const m = pad(fields.month);
  const d = pad(fields.day);
  const hh = pad(fields.hour);
  const mm = pad(fields.minute);
  return `${prefix}${y}-${m}-${d} ${hh}:${mm}:00.000000`;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * The in-story date, short enough to sit on a timeline axis: "12 Mar 1892",
 * or "12 Mar 500 BC". Returns null when there is no usable date — an in-story
 * date is the authors' own, so it is never guessed at or defaulted.
 */
export function toShortStoryDate(value: string | null): string | null {
  const fields = parseWireValue(value);
  if (!fields) return null;

  const month = MONTH_NAMES[fields.month - 1] ?? pad(fields.month);
  const era = fields.era === "BC" ? " BC" : "";
  return `${fields.day} ${month} ${fields.year}${era}`;
}

/**
 * The in-story clock, "14:30". Midnight reads as no time at all: the picker
 * defaults an omitted time to 00:00, so showing it back would invent a
 * precision the authors never gave.
 */
export function toStoryClock(value: string | null): string | null {
  const fields = parseWireValue(value);
  if (!fields) return null;
  if (fields.hour === 0 && fields.minute === 0) return null;
  return `${pad(fields.hour)}:${pad(fields.minute)}`;
}

/** The AD date field's format: "dd-mm-yyyy". Kept in its own input from the
 *  time field so the optional-ness of time is visually obvious rather than
 *  buried inside one combined string. */
export const AD_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;
/** The AD time field's format: "hh:mm". Left blank, it defaults to 00:00. */
export const AD_TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export function toAdDateText(fields: DateTimeFields): string {
  return `${pad(fields.day)}-${pad(fields.month)}-${pad(fields.year, 4)}`;
}

export function toAdTimeText(fields: DateTimeFields): string {
  return `${pad(fields.hour)}:${pad(fields.minute)}`;
}

/** Reformats raw keystrokes into "dd-mm-yyyy" as the user types, inserting
 *  the dashes automatically — mobile's numeric keypad has no "-" key, so
 *  digit-only input must still be able to produce a valid date string. */
export function formatAdDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  return parts.filter(Boolean).join("-");
}

/** Same auto-formatting as formatAdDateInput, for "hh:mm". */
export function formatAdTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  const parts = [digits.slice(0, 2), digits.slice(2, 4)];
  return parts.filter(Boolean).join(":");
}

/** Validates ranges only (not days-in-month) — good enough to catch typos
 *  without re-implementing a calendar. */
export function parseAdDateText(
  text: string,
): Pick<DateTimeFields, "day" | "month" | "year"> | null {
  const match = text.match(AD_DATE_PATTERN);
  if (!match) return null;

  const [, d, m, y] = match;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  return { day, month, year };
}

/** An empty string is valid and means "no time specified" (defaults to
 *  00:00) — only a non-empty, malformed value is rejected. */
export function parseAdTimeText(
  text: string,
): Pick<DateTimeFields, "hour" | "minute"> | null {
  if (!text) return { hour: 0, minute: 0 };

  const match = text.match(AD_TIME_PATTERN);
  if (!match) return null;

  const [, hh, mm] = match;
  const hour = Number(hh);
  const minute = Number(mm);

  if (hour > 23) return null;
  if (minute > 59) return null;

  return { hour, minute };
}
