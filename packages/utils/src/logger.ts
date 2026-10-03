/**
 * The logging seam.
 *
 * Shared code needs to log, and cannot decide *how*: the web app gates every
 * line behind `__DEV__` and a `LOG_LEVEL` read from `import.meta.env`, and the
 * native app will read its own config through a different mechanism entirely.
 * `@nw/api`'s client already solved this one endpoint at a time by taking a
 * `log` callback; this is the same idea for everything else.
 *
 * Default is silent. An app calls `setLogger` once at startup with its own
 * implementation — `apps/web/src/main.tsx` passes the `Logger` in
 * `utils/services`, so behaviour there is unchanged.
 */

type LogFn = (...args: unknown[]) => void;

export interface LoggerLike {
  debug: LogFn;
  log: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const noop: LogFn = () => {};

let sink: LoggerLike = {
  debug: noop,
  error: noop,
  info: noop,
  log: noop,
  warn: noop,
};

export const setLogger = (implementation: LoggerLike) => {
  sink = implementation;
};

/**
 * Reads `sink` at call time rather than closing over it, so a `setLogger` after
 * this module is imported still takes effect.
 */
export const logger: LoggerLike = {
  debug: (...args) => sink.debug(...args),
  error: (...args) => sink.error(...args),
  info: (...args) => sink.info(...args),
  log: (...args) => sink.log(...args),
  warn: (...args) => sink.warn(...args),
};
