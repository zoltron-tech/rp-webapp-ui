import moment from "moment";
import { ESCAPE_SEQUENCES } from "../constants/mapping";

export const stripS3Url = (url: string) => {
  let stripped = url.split("amazonaws.com/")?.[1];

  Object.keys(ESCAPE_SEQUENCES.S3).forEach((key) => {
    stripped = stripped?.replace(
      key,
      ESCAPE_SEQUENCES.S3[key as keyof typeof ESCAPE_SEQUENCES.S3]
    );
  });

  return stripped;
};

export const verifyEmailPattern = (email: string) => {
  const emailRegex = new RegExp(
    // eslint-disable-next-line no-useless-escape
    "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
  );
  return emailRegex.test(email);
};

export const verifyUsernamePattern = (username: string) => {
  const usernameRegex = new RegExp("^[a-zA-Z0-9_.-]+$");
  return usernameRegex.test(username);
};

export const toFormattedDate = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) return "unknown";

  const date = moment(dateTimeString, "YYYY-MM-DD HH:mm:ss.SSSSSS");
  const now = moment();

  const units = [
    { name: "y", value: now.diff(date, "years") },
    { name: "mon", value: now.diff(date, "months") },
    { name: "d", value: now.diff(date, "days") },
    { name: "h", value: now.diff(date, "hours") },
    { name: "m", value: now.diff(date, "minutes") },
  ];

  const unit = units.find((u) => u.value > 0);
  return unit ? `${unit.value}${unit.name}` : "just now";
};

export const toFormattedDateFromUnix = (
  timestamp: number | undefined
): string => {
  if (!timestamp) return "unknown";

  // Normalize to milliseconds (check if timestamp is in seconds)
  const normalizedTimestamp = timestamp < 1e12 ? timestamp * 1000 : timestamp;

  const date = moment(normalizedTimestamp);
  const now = moment();

  const units = [
    { name: "y", value: now.diff(date, "years") },
    { name: "mon", value: now.diff(date, "months") },
    { name: "d", value: now.diff(date, "days") },
    { name: "h", value: now.diff(date, "hours") },
    { name: "m", value: now.diff(date, "minutes") },
  ];

  const unit = units.find((u) => u.value > 0);
  return unit ? `${unit.value}${unit.name}` : "just now";
};
