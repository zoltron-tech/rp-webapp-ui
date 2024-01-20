import { __DEV__ } from "../constants";

export const Logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
};
