import moment from "moment";
import { ESCAPE_SEQUENCES } from "../constants/mapping";

export const stripS3Url = (url: string) => {
  let stripped = url.split("amazonaws.com/")?.[1];

  Object.keys(ESCAPE_SEQUENCES.S3).forEach((key) => {
    stripped = stripped?.replace(
      key,
      ESCAPE_SEQUENCES.S3[key as keyof typeof ESCAPE_SEQUENCES.S3],
    );
  });

  return stripped;
};

export const verifyEmailPattern = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
};

export const checkUsernameInvalidity = (username: string) => {
  if (username.length < 3 || username.length > 50) {
    return true; // Username must be between 3 and 50 characters
  }
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  return !usernameRegex.test(username);
};

export const verifyPasswordLength = (password: string) => {
  // Password must be at least 8 characters long
  return password.length >= 8;
};

export const verifyPasswordUpperCase = (password: string) => {
  // Password must contain at least one uppercase letter
  return /[A-Z]/.test(password);
};

export const verifyPasswordLowerCase = (password: string) => {
  // Password must contain at least one lowercase letter
  return /[a-z]/.test(password);
};

export const verifyPasswordNumber = (password: string) => {
  // Password must contain at least one number
  return /\d/.test(password);
};

export const verifyPasswordSpecialChar = (password: string) => {
  // Password must contain at least one special character
  return /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export const getFileNameFromUrl = (url: string): string => {
  if (!url) return "";

  try {
    // Extract last part after '/'
    const parts = url.split("/");
    let fileName = parts[parts.length - 1];

    // Remove file extension
    fileName = fileName.replace(/\.[^/.]+$/, "");

    // Replace special characters with spaces
    fileName = fileName.replace(/[-_+%20]+/g, " ");

    // Decode URI components if needed (e.g., %20 -> space)
    fileName = decodeURIComponent(fileName);

    // Trim extra spaces
    return fileName.trim();
  } catch (err) {
    return "";
  }
};

export const verifyPasswordsMatch = (
  password: string,
  confirmPassword: string,
) => {
  if (!password || !confirmPassword) {
    return false;
  }
  return password === confirmPassword;
};

export const verifyPasswordPattern = (password: string) => {
  // Password must be at least 8 characters long, contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  if (!password) return false;
  return (
    verifyPasswordLength(password) &&
    verifyPasswordUpperCase(password) &&
    verifyPasswordLowerCase(password) &&
    verifyPasswordNumber(password) &&
    verifyPasswordSpecialChar(password)
  );
};

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

export const toFormattedDateFromUnix = (
  timestamp: number | undefined,
): string => {
  if (!timestamp) return "unknown";

  // Normalize to milliseconds (check if timestamp is in seconds)
  const normalizedTimestamp = timestamp < 1e12 ? timestamp * 1000 : timestamp;

  return toFormattedDate(normalizedTimestamp);
};
