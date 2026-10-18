import type { Novelist } from "@nw/types";
import { getNovelistAction } from "@/app/rp/novelists/actions";

/**
 * Novelists fetched for embeds, keyed by username, kept for the page's
 * lifetime. Same contract as the other embed caches: one request per name
 * however many cards show it, a 404 (no such novelist, or one who blocked
 * the viewer) remembered, a network failure not.
 */
const inflight = new Map<string, Promise<Novelist | null>>();

const isNovelist = (value: unknown): value is Novelist =>
  !!value &&
  typeof value === "object" &&
  "username" in value &&
  "firstName" in value &&
  !("message" in value);

export const fetchEmbeddedNovelist = (
  username: string,
): Promise<Novelist | null> => {
  const key = username.toLowerCase();
  const cached = inflight.get(key);
  if (cached) return cached;

  const request = getNovelistAction(username)
    .then((result) => (isNovelist(result) ? result : null))
    .catch((error: unknown) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, request);
  return request;
};
