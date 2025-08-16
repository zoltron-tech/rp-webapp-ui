import JWT from "jsonwebtoken";
import type { Dispatch, SetStateAction } from "react";

export const toggleState = (fn: Dispatch<SetStateAction<boolean>>) => () =>
  fn((prev) => !prev);

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (_e) {
    return false;
  }
  return true;
};

export const validateJWTSync = (jwt: string) => {
  const decoded = JWT.decode(jwt, { complete: true });
  if (!decoded || typeof decoded.payload === "string" || !decoded.payload.exp) {
    return false;
  }
  const isValid = decoded.payload.exp * 1000 > Date.now();
  if (!isValid) {
    return false;
  }
  return true;
};
