import type { IceBreaker, Muse, Novelist, PromptSource } from "@nw/types";

/**
 * Ice breakers: the rules, not the rendering.
 *
 * An ice breaker is a short line a novelist — or one of their muses — leaves on
 * the conversations page for anyone to answer. Replying to one creates the
 * conversation if it does not exist and sends the first message into it, tagged
 * as a reply to the ice breaker.
 *
 * What lives here is everything the two clients have to agree on and cannot
 * check at runtime: how long a message may be, which colours a bubble may take,
 * how to read the timestamp the endpoint sends, and who owns a given ice
 * breaker. Disagree on any of them and the failure is quiet — a message the
 * server truncates, a colour that renders as nothing, a date in 1970, or a
 * delete button offered to someone who cannot use it.
 *
 * What does not live here is layout. Web draws a rail of cards; the phone draws
 * something shaped for a thumb.
 */

/** What the backend accepts. Longer messages are rejected, not truncated. */
export const ICE_BREAKER_MAX_LENGTH = 160;

/**
 * The bubble colours on offer.
 *
 * A fixed set rather than a picker: these are chosen to stay legible with white
 * text in both themes, which an arbitrary colour is not. `null` means the
 * default bubble, and is always the first option.
 */
export const ICE_BREAKER_COLORS = [
  "#8b3a3a", // crimson
  "#a0522d", // sienna
  "#8b6914", // goldenrod
  "#2d6e45", // forest green
  "#1e6b63", // deep teal
  "#1a5276", // ocean blue
  "#4a3f8f", // indigo
  "#8b2d6b", // plum
] as const;

/**
 * `createdOn`, in milliseconds.
 *
 * The ice-breaker endpoint serialises this as raw epoch *seconds* with a
 * fractional part — `"1782895379.212409000"` — rather than the ISO string the
 * rest of the API returns. Handing that to a date formatter unparsed gives
 * January 1970, which reads as a bug in the clock rather than in the parsing.
 */
export const parseIceBreakerTimestamp = (value: string): number => {
  const seconds = Number.parseFloat(value);
  return Number.isFinite(seconds) ? seconds * 1000 : Date.now();
};

/**
 * Is this ice breaker one of ours?
 *
 * `sourceId` is the *author's* id — the novelist's own, or one of their muses'
 * — rather than an id belonging to the ice breaker. So ownership is "do I have
 * a source with this id", which is also why the delete endpoint takes a source
 * id rather than an ice breaker id.
 *
 * Owning one is what swaps the reply box for a delete: you cannot answer your
 * own ice breaker, and the control that would let you try is worse than absent.
 */
export const isOwnIceBreaker = (
  iceBreaker: IceBreaker,
  novelist: Novelist | null | undefined,
): boolean => {
  if (!novelist) return false;
  if (iceBreaker.sourceId === novelist.id) return true;
  return (novelist.muses ?? []).some((muse) => muse.id === iceBreaker.sourceId);
};

/**
 * The novelist and their muses as sources, in picker order.
 *
 * The same shape and the same order as `senderOptions` produces for the chat
 * composer — yourself first, then everyone you have penned — because the two
 * pickers answer the same question and a person who learns one has learned the
 * other.
 */
export const iceBreakerSources = (
  novelist: Novelist | null | undefined,
): PromptSource[] => {
  if (!novelist) return [];

  const self: PromptSource = {
    image: novelist.image || "",
    name: `${novelist.firstName} ${novelist.lastName ?? ""}`.trim(),
    sourceId: novelist.id || "",
    sourceType: "NOVELIST",
    urlProp: novelist.username || "",
  };

  const muses = (novelist.muses ?? []).map(
    (muse: Muse): PromptSource => ({
      image: muse.image || "",
      name: `${muse.firstName} ${muse.lastName ?? ""}`.trim(),
      sourceId: muse.id || "",
      sourceType: "MUSE",
      urlProp: muse.id || "",
    }),
  );

  return [self, ...muses];
};
