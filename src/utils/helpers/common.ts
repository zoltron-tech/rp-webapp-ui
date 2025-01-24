import { Dispatch, SetStateAction } from "react";

export const toggleState = (fn: Dispatch<SetStateAction<boolean>>) => () =>
  fn((prev) => !prev);

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
