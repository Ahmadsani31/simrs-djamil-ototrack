/**
 * Lightweight logger that no-ops in production.
 *
 * - `log` / `warn`: only output when `__DEV__` is true.
 * - `error`: always logs. Errors are signal we want in crash reports too.
 *
 * Pakai ini untuk debug noise; untuk error yang bermakna pakai `logger.error`
 * supaya tetap muncul di production logcat / crash reporters.
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
