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
