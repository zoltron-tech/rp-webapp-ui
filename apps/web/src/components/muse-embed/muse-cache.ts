import type { Muse } from "@nw/types";
import { transformMuse } from "@nw/utils/image";
import { getMuseAction } from "@/app/rp/muse/actions";

/**
 * Muses fetched for embeds, kept for the page's lifetime.
 *
 * A thread that links the same muse in three replies draws three cards, and
 * the server should hear about it once. The cache holds the promise rather
 * than the result so the second card mounted while the first is still
 * loading joins the in-flight request instead of starting its own.
 *
 * `null` is cached too: a muse that is private, deleted or blocked for this
 * viewer answers 404, and asking again on the next scroll will not change
 * that. A network failure is *not* cached, so a card that failed to load gets
 * another try the next time it mounts.
 */
const inflight = new Map<string, Promise<Muse | null>>();

const isMuse = (value: unknown): value is Muse =>
  !!value &&
  typeof value === "object" &&
  "firstName" in value &&
  !("message" in value);

export const fetchEmbeddedMuse = (museId: string): Promise<Muse | null> => {
  const cached = inflight.get(museId);
  if (cached) return cached;

  const request = getMuseAction(museId)
    .then((result) => {
      if (!isMuse(result)) return null;
      // The profile endpoint returns full-resolution art because the profile
      // page wants it; a card a few hundred pixels wide does not. Copy before
      // resizing: `transformMuse` rewrites the object in place.
      const copy = JSON.parse(JSON.stringify(result)) as Muse;
      transformMuse(copy, "feed");
      return copy;
    })
    .catch((error: unknown) => {
      inflight.delete(museId);
      throw error;
    });

  inflight.set(museId, request);
  return request;
};
