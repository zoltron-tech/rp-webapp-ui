import { getMuse } from "@nw/api/endpoints/muse";
import { getNovelist } from "@nw/api/endpoints/novelists";
import { getPrompt } from "@nw/api/endpoints/prompt";
import { getStoryboardEventThreads } from "@nw/api/endpoints/story";
import { getComment, getReplies } from "@nw/api/endpoints/thread";
import { queryKeys, useApi } from "@nw/features";
import type {
  Comment,
  Muse,
  Novelist,
  Prompt,
  Reply,
  StoryBoardEventThreadPage,
} from "@nw/types";
import type { DataType, ErrorType } from "@nw/types/common";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { findCached } from "@/lib/cache-seed";

/**
 * The reads the link cards make, and where they read from first.
 *
 * ## Local first
 *
 * A card should paint from what the phone already knows before it asks the
 * network (LOCAL_DATA_PLAN.md 4.1). Three tiers do that here:
 *
 *  - **Hydrated keys.** A novelist (`profile/<handle>`) and a thread
 *    (`thread/<id>`) the reader has opened before are in SQLite and are put
 *    into the query cache on launch and on every foreground. A card under
 *    those keys renders from the row with no request inside its freshness
 *    window, and refetches behind the paint outside it.
 *  - **Placeholders from lists.** A prompt is in the explore feed, the home
 *    activities or the outgoing-threads list the reader has scrolled; a
 *    character is in a home rail or a profile's character list. `findCached`
 *    lifts the entity out of those pages as `placeholderData`, so the card
 *    draws at once and the id fetch only confirms it. Those lists are the
 *    ones the store persists, so this works offline too.
 *  - **`offlineFirst`.** With no connection, a query in the default mode
 *    sits "paused" and a card without data would show a skeleton forever.
 *    Offline-first lets cached data render and tells the card, through
 *    `fetchStatus === "paused"`, to say it is offline instead.
 *
 * `null` is a 404 — private, deleted, blocked — and is an answer, not an
 * error: the card draws its "unavailable" row rather than a retry.
 */

const unwrap = <T>(result: DataType<T>): T | null => {
  if (result === null) return null;
  if (typeof result === "object" && "message" in (result as object)) {
    throw new Error(String((result as ErrorType).message));
  }
  return result as T;
};

const STALE = 5 * 60 * 1000;
const NETWORK = "offlineFirst" as const;

const isMuseLike = (entity: Record<string, unknown>): boolean =>
  typeof entity.firstName === "string" && "fandom" in entity;

const isPromptLike = (entity: Record<string, unknown>): boolean =>
  "source" in entity && typeof entity.text === "string" && "privacy" in entity;

/** Where characters already are: the home rails and every profile's list. */
const MUSE_LISTS = [["home", "muses"], ["profile"]];

/** Where prompts already are: the feeds and a thread's `prompt`. */
const PROMPT_LISTS = [["explore"], ["home"], ["outgoing-threads"], ["thread"]];

export const useMuseEmbed = (museId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    networkMode: NETWORK,
    placeholderData: () =>
      findCached(queryClient, MUSE_LISTS, (entity) =>
        entity.id === museId && isMuseLike(entity)
          ? (entity as unknown as Muse)
          : undefined,
      ),
    queryFn: async (): Promise<Muse | null> =>
      unwrap(await getMuse(api, museId)),
    queryKey: queryKeys.muse(museId),
    staleTime: STALE,
  });
};

export const useNovelistEmbed = (username: string) => {
  const api = useApi();
  return useQuery({
    networkMode: NETWORK,
    queryFn: async (): Promise<Novelist | null> =>
      unwrap(await getNovelist(api, username)),
    // The profile screen's key: hydrated from SQLite for anyone opened before.
    queryKey: queryKeys.profile(username),
    staleTime: 60 * 60 * 1000,
  });
};

export const usePromptEmbed = (promptId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    networkMode: NETWORK,
    placeholderData: () =>
      findCached(queryClient, PROMPT_LISTS, (entity) => {
        if (entity.id === promptId && isPromptLike(entity)) {
          return entity as unknown as Prompt;
        }
        // A thread's root comment carries its prompt whole.
        const prompt = entity.prompt;
        return prompt &&
          typeof prompt === "object" &&
          (prompt as Record<string, unknown>).id === promptId &&
          isPromptLike(prompt as Record<string, unknown>)
          ? (prompt as Prompt)
          : undefined;
      }),
    queryFn: async (): Promise<Prompt | null> =>
      unwrap(await getPrompt(api, promptId)),
    queryKey: queryKeys.prompt(promptId),
    staleTime: STALE,
  });
};

export const useThreadEmbed = (commentId: string) => {
  const api = useApi();
  return useQuery({
    networkMode: NETWORK,
    queryFn: async (): Promise<Comment | null> =>
      unwrap(await getComment(api, commentId)),
    // The thread screen's key: hydrated from SQLite for threads opened before.
    queryKey: queryKeys.thread(commentId),
    staleTime: STALE,
  });
};

const REPLY_SAMPLE = 4;

/** The newest few replies — decoration; a failure is an empty list. */
export const useThreadRepliesSample = (commentId: string, enabled: boolean) => {
  const api = useApi();
  return useQuery({
    enabled,
    networkMode: NETWORK,
    queryFn: async (): Promise<Reply[]> => {
      try {
        const result = await getReplies(api, commentId, 1, REPLY_SAMPLE);
        return Array.isArray(result) ? result : [];
      } catch {
        return [];
      }
    },
    queryKey: [
      ...queryKeys.threadReplies(commentId),
      "sample",
      REPLY_SAMPLE,
    ] as const,
    staleTime: STALE,
  });
};

/** A chapter's first passage and how many it has — decoration likewise. */
export const useChapterOpening = (eventId: string, enabled: boolean) => {
  const api = useApi();
  return useQuery({
    enabled,
    networkMode: NETWORK,
    queryFn: async (): Promise<StoryBoardEventThreadPage | null> => {
      try {
        const result = await getStoryboardEventThreads(api, eventId, 1, 1);
        return result && typeof result === "object" && "threads" in result
          ? result
          : null;
      } catch {
        return null;
      }
    },
    queryKey: [...queryKeys.storyChapterThreads(eventId), "opening"] as const,
    staleTime: STALE,
  });
};

/**
 * True while a card has nothing to draw because the phone is offline: the
 * query is still pending and react-query has paused its fetch rather than
 * failed it. The card shows an offline row instead of a skeleton that would
 * never resolve.
 */
export const isPausedOffline = (query: {
  isPending: boolean;
  fetchStatus: "fetching" | "paused" | "idle";
}): boolean => query.isPending && query.fetchStatus === "paused";
