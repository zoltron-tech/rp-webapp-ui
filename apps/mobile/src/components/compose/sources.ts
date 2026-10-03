import type { Muse, Novelist } from "@nw/types";
import {
  API_MESSAGE,
  type Prompt,
  type PromptSource,
  type SubmitPromptInput,
} from "@nw/types";
import { randomUUID } from "expo-crypto";

/**
 * Who a post can come from, and the small conversions around sending one.
 *
 * Web keeps these in `components/prompt-input/helpers.ts` and
 * `components/event-thread-input/helpers.ts`; they are the same functions
 * here, because a `PromptSource` built differently on the two clients is a
 * post the server files under a different name.
 */

/** Web's `dropdownSelection`: which senders a composer may offer. */
export type DropdownSelection = "NOVELIST" | "MUSE" | "ALL";

export const novelistToSource = (novelist: Novelist): PromptSource => ({
  avatar: novelist.avatar,
  image: novelist.image || "",
  name: `${novelist.firstName} ${novelist.lastName ?? ""}`.trim(),
  sourceId: novelist.id || "",
  sourceType: "NOVELIST",
  urlProp: novelist.username || "",
});

export const museToSource = (muse: Muse): PromptSource => ({
  avatar: muse.avatar,
  image: muse.image || "",
  name: `${muse.firstName} ${muse.lastName ?? ""}`.trim(),
  sourceId: muse.id || "",
  sourceType: "MUSE",
  urlProp: muse.id || "",
});

/**
 * The senders a composer offers, in web's order: the novelist first, then
 * every muse with an id. A muse without one is a draft the server cannot
 * address.
 */
export const sourcesFor = (
  novelist: Novelist | null | undefined,
  selection: DropdownSelection,
): PromptSource[] => {
  if (!novelist) return [];
  const self = novelistToSource(novelist);
  const muses = (novelist.muses ?? [])
    .filter((muse) => Boolean(muse.id))
    .map(museToSource);
  switch (selection) {
    case "NOVELIST":
      return [self];
    case "MUSE":
      return muses;
    default:
      return [self, ...muses];
  }
};

/**
 * Web's `buildOptimisticPrompt`: a prompt drawn from what was just sent, so a
 * feed can show it before the server answers with the real row. The create
 * endpoint usually returns one; this is the fallback when it does not.
 */
export const buildOptimisticPrompt = (
  source: PromptSource,
  payload: SubmitPromptInput,
): Prompt => ({
  canInteract: true,
  commentCount: 0,
  createdOn: new Date().toISOString(),
  featuredSong: payload.featuredSong ?? null,
  id: randomUUID(),
  media: payload.media && payload.media !== "null" ? payload.media : "",
  privacy: payload.privacy ?? "PUBLIC",
  reacted: false,
  reactions: 0,
  sharedWith: payload.sharedWith ?? [],
  song: "",
  source,
  text: payload.text,
});

/** Web's `apiMessageToInfoMessage`, verbatim. */
export const submitErrorText = (message: API_MESSAGE | string): string => {
  switch (message) {
    case API_MESSAGE.Success:
      return "Operation completed successfully.";
    case API_MESSAGE.Error:
      return "An error occurred. Please try again.";
    case API_MESSAGE.NotAllowed:
      return "Cross-posting between novelists and characters is not permitted.";
    case API_MESSAGE.BadPayload:
      return "Invalid input provided. Please check your data.";
    case API_MESSAGE.AccessDenied:
      return "You do not have permission to perform this action.";
    default:
      return "An unexpected error occurred.";
  }
};
