import { Dispatch, SetStateAction } from "react";

export const toggleState = (fn: Dispatch<SetStateAction<boolean>>) => () =>
  fn((prev) => !prev);
