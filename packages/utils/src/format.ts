import moment from "moment";

/**
 * Pluralises `text` when `count` is anything other than 1, leaving words that
 * are already plural alone.
 */
export const pluralize = (text: string, count: number): string => {
  if (count === 1) {
    return text;
  }

  if (text.endsWith("s")) {
    return text; // Already plural
  }

  if (text.endsWith("y") && !/[aeiou]y$/.test(text)) {
    return `${text.slice(0, -1)}ies`; // Change 'y' to 'ies'
  }

  return `${text}s`; // Default pluralization
};

/** Cuts `text` to `max` characters, appending an ellipsis when it had to cut. */
export const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max)}...` : text;

/**
 * Formats a duration in seconds as `m:ss`.
 *
 * Negative and non-finite inputs both collapse to "0:00" — media elements
 * report `NaN` duration before metadata loads, and a seek can briefly report a
 * negative current time.
 */
export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

/**
 * Converts a UTC date string or timestamp to a moment object in the user's local timezone.
 */
export const toLocalDate = (
  dateTimeString: string | number | undefined,
): moment.Moment | null => {
  if (!dateTimeString) return null;
  return moment.utc(dateTimeString).local();
};

export const toFormattedDate = (
  dateTimeString: string | number | undefined,
): string => {
  if (!dateTimeString) return "unknown";

  const date = toLocalDate(dateTimeString);
  if (!date) return "unknown";

  const now = moment();

  const units = [
    { name: "year", value: now.diff(date, "years") },
    { name: "month", value: now.diff(date, "months") },
    { name: "day", value: now.diff(date, "days") },
    { name: "hour", value: now.diff(date, "hours") },
    { name: "minute", value: now.diff(date, "minutes") },
  ];

  const unit = units.find((u) => u.value > 0);

  if (!unit) {
    return "just now";
  }

  return `${unit.value} ${pluralize(unit.name, unit.value)} ago`;
};

export const displayDate = (
  dateTimeString: string | number | undefined,
): string => {
  if (!dateTimeString) return "unknown";

  const date = toLocalDate(dateTimeString);
  if (!date) return "unknown";

  return date.format("MMM D, YYYY [at] h:mm A");
};

export const toFormattedDateFromUnix = (
  timestamp: number | undefined,
): string => {
  if (!timestamp) return "unknown";

  // Normalize to milliseconds (check if timestamp is in seconds)
  const normalizedTimestamp = timestamp < 1e12 ? timestamp * 1000 : timestamp;

  return toFormattedDate(normalizedTimestamp);
};

export const parseTextContent = (
  text: string,
  options: {
    maxChars?: number;
    lineBreak?: string;
  } = {},
) => {
  if (!text) return [];
  const { maxChars = null, lineBreak = "\n" } = options;
  let processed = text;
  if (
    typeof maxChars === "number" &&
    maxChars > 0 &&
    processed.length > maxChars
  ) {
    processed = processed.slice(0, maxChars);
    if (processed.endsWith("\\")) {
      processed = processed.slice(0, -1);
    }
    processed += "...";
  }
  return processed.split(lineBreak);
};

/**
 * A chat timestamp: the clock time today, the date as well before that.
 *
 * Chat is the one place `toFormattedDate`'s relative wording is wrong. "2 hours
 * ago" on every bubble makes a conversation impossible to read back, because
 * the reader is trying to establish an order and a gap, not a distance from
 * now. The web bubble already formats it this way
 * (`chat-bubble/index.tsx`: `h:mm A`, `MMM D, h:mm A`); this is that rule,
 * named, so both clients cannot drift apart on it.
 */
export const toChatTime = (
  dateTimeString: string | number | undefined,
): string => {
  const date = toLocalDate(dateTimeString);
  if (!date) return "";
  return date.isSame(moment(), "day")
    ? date.format("h:mm A")
    : date.format("MMM D, h:mm A");
};

/**
 * A timestamp for an inbox row, which has a corner rather than a line.
 *
 * `toChatTime` is right inside a conversation and wrong in a list of them: it
 * produces "Mar 4, 2:15 PM", which is fourteen characters competing with the
 * name for the width of a phone. A list only has to answer "how long ago,
 * roughly", and it answers it at the resolution people actually use — the clock
 * for today, the word for yesterday, the weekday within the last week, and a
 * short date beyond that.
 */
export const toInboxTime = (
  dateTimeString: string | number | undefined,
): string => {
  const date = toLocalDate(dateTimeString);
  // `toLocalDate` returns null only for a *missing* value; an unparseable one
  // comes back as an invalid moment, which formats as the literal string
  // "Invalid date". A row with no timestamp beats a row claiming that.
  if (!date?.isValid()) return "";
  const now = moment();
  if (date.isSame(now, "day")) return date.format("h:mm A");
  if (date.isSame(now.clone().subtract(1, "day"), "day")) return "Yesterday";
  // Seven days rather than "this week": on a Monday, a calendar week would
  // reduce everything older than yesterday to a date.
  if (date.isAfter(now.clone().subtract(7, "days"))) return date.format("ddd");
  return date.isSame(now, "year")
    ? date.format("D MMM")
    : date.format("DD/MM/YY");
};

/**
 * The label for a day separator in a conversation: Today, Yesterday, or a date.
 *
 * Returns an empty string for an unparseable timestamp, so a broken date is a
 * missing separator rather than a separator reading "Invalid date".
 */
export const toChatDayLabel = (
  dateTimeString: string | number | undefined,
): string => {
  const date = toLocalDate(dateTimeString);
  if (!date) return "";
  const now = moment();
  if (date.isSame(now, "day")) return "Today";
  if (date.isSame(now.clone().subtract(1, "day"), "day")) return "Yesterday";
  return date.isSame(now, "year")
    ? date.format("MMMM D")
    : date.format("MMMM D, YYYY");
};

/** Do two timestamps fall on the same local day? */
export const isSameChatDay = (
  a: string | number | undefined,
  b: string | number | undefined,
): boolean => {
  const left = toLocalDate(a);
  const right = toLocalDate(b);
  if (!left || !right) return false;
  return left.isSame(right, "day");
};
