/**
 * Server timestamps, as numbers.
 *
 * Portfolio formats every `createdAt` / `modifiedAt` as
 * `yyyy-MM-dd HH:mm:ss.SSSSSS` with no zone, and documents that the value is
 * UTC (`CustomDate.kt`). `new Date("2026-10-06 15:02:44.055927")` in Hermes
 * reads that as *local* time — hours out, in either direction — so the store
 * parses the pattern itself and pins it to UTC. ISO strings with a zone, which
 * the client's own optimistic rows carry, go through `Date.parse` unchanged.
 */

const SERVER_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?$/;

export const serverDateToMs = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = SERVER_PATTERN.exec(value);
  if (!match) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const [, y, mo, d, h, mi, s, frac = ""] = match;
  const ms = Number((frac + "000").slice(0, 3));
  return Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
    ms,
  );
};

/** What the delta routes take: an ISO date-time with an offset. */
export const msToServerParam = (ms: number): string =>
  new Date(ms).toISOString();
