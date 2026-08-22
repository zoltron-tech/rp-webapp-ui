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
