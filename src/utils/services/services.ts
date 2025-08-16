import { __DEV__, LOG_LEVEL, LOG_LEVELS } from "../constants";

const LOG_PREFIX = {
  [LOG_LEVELS.DEBUG]: "DEBUG",
  [LOG_LEVELS.LOG]: "LOG",
  [LOG_LEVELS.INFO]: "INFO",
  [LOG_LEVELS.WARN]: "WARN",
  [LOG_LEVELS.ERROR]: "EROR",
  [LOG_LEVELS.NONE]: "",
};

const logIfLevel = (level: LOG_LEVELS, ...args: any[]) => {
  if (
    __DEV__ &&
    !Number.isNaN(Number(LOG_LEVEL)) &&
    level <= Number(LOG_LEVEL)
  ) {
    console.log(`${LOG_PREFIX[level as LOG_LEVELS]}:- `, ...args);
  }
};

export const Logger = {
  debug: (...args: any[]) => logIfLevel(LOG_LEVELS.DEBUG, ...args),
  error: (...args: any[]) => logIfLevel(LOG_LEVELS.ERROR, ...args),
  info: (...args: any[]) => logIfLevel(LOG_LEVELS.INFO, ...args),
  log: (...args: any[]) => logIfLevel(LOG_LEVELS.LOG, ...args),
  warn: (...args: any[]) => logIfLevel(LOG_LEVELS.WARN, ...args),
};
