import type { Dispatch, SetStateAction } from "react";

export const toggleState = (fn: Dispatch<SetStateAction<boolean>>) => () =>
  fn((prev) => !prev);

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};
