import {
  getStoryboard,
  getStoryboardEvent,
  getStoryboardEventThreads,
  getStoryCharacters,
  getStoryCodex,
  getStoryMaps,
  getStoryTimeline,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi } from "@nw/features";
import type {
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventThreadPage,
} from "@nw/types";
import type { ErrorType } from "@nw/types/common";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { findCached } from "@/lib/cache-seed";

/**
 * The storyboard, read.
 *
 * One hook per endpoint web's story pages call, and nothing that writes. The
 * endpoints answer in three shapes — the payload, `null` for a 404, or an
 * error object carrying `message` — and every hook here turns those into what
 * react-query understands: data, `null` ("not there": a deleted story, a
 * private one this reader cannot see), or a thrown error worth retrying.
 */

/** Web's `THREADS_PAGE_SIZE` in the chapter reader. */
export const THREADS_PAGE_SIZE = 10;

const STALE = 60 * 1000;

const unwrap = <T extends object>(result: T | ErrorType | null): T | null => {
  if (result === null) return null;
  if (!Array.isArray(result) && "message" in result) {
    throw new Error(String((result as ErrorType).message));
  }
  return result as T;
};

/** A storyboard as the lists hold it: the same payload the story page asks for. */
const isStory = (
  value: Record<string, unknown>,
): value is StoryBoard & Record<string, unknown> =>
  Array.isArray(value.events) &&
  Array.isArray(value.members) &&
  "isPublic" in value;

/**
 * The story page draws from the card that opened it.
 *
 * The library and the home rail are fed by `/story/random`, which answers
 * whole storyboards — chapters, members and cast — so the page is complete on
 * its first frame and the request only confirms it. See `lib/cache-seed.ts`.
 */
export const useStory = (storyId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    enabled: Boolean(storyId),
    placeholderData: () =>
      storyId
        ? findCached(
            queryClient,
            [queryKeys.library(), queryKeys.homeStories()],
            (entity) =>
              entity.id === storyId && isStory(entity) ? entity : undefined,
          )
        : undefined,
    queryFn: async () => unwrap(await getStoryboard(api, storyId as string)),
    queryKey: queryKeys.story(storyId ?? ""),
    staleTime: STALE,
  });
};

/**
 * A chapter draws from the story it is part of.
 *
 * Every storyboard payload carries its chapters in full — title, cover,
 * description, dividers — so a chapter opened from its story, its timeline or
 * a story card is already on the phone. Its passages are a separate request
 * and still load as they did.
 */
export const useStoryChapter = (eventId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    enabled: Boolean(eventId),
    placeholderData: () =>
      eventId
        ? findCached(
            queryClient,
            [["story"], queryKeys.library(), queryKeys.homeStories()],
            (entity) =>
              Array.isArray(entity.events)
                ? (entity.events as StoryBoardEvent[]).find(
                    (event) => event.id === eventId,
                  )
                : undefined,
          )
        : undefined,
    queryFn: async () =>
      unwrap(await getStoryboardEvent(api, eventId as string)),
    queryKey: queryKeys.storyChapter(eventId ?? ""),
    staleTime: STALE,
  });
};

/** A chapter's passages in reading order, a page of ten at a time. */
export const useStoryChapterThreads = (eventId: string | undefined) => {
  const api = useApi();
  return useInfiniteQuery({
    enabled: Boolean(eventId),
    getNextPageParam: (
      lastPage: StoryBoardEventThreadPage,
      _all: StoryBoardEventThreadPage[],
      lastPageParam: number,
    ) =>
      lastPageParam * THREADS_PAGE_SIZE < lastPage.totalCount &&
      lastPage.threads.length > 0
        ? lastPageParam + 1
        : undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<StoryBoardEventThreadPage> => {
      const page = unwrap(
        await getStoryboardEventThreads(
          api,
          eventId as string,
          pageParam,
          THREADS_PAGE_SIZE,
        ),
      );
      return (
        page ?? {
          pageNumber: pageParam,
          pageSize: THREADS_PAGE_SIZE,
          threads: [],
          totalCount: 0,
        }
      );
    },
    queryKey: queryKeys.storyChapterThreads(eventId ?? ""),
    staleTime: STALE,
  });
};

export const useStoryCodex = (storyId: string | undefined) => {
  const api = useApi();
  return useQuery({
    enabled: Boolean(storyId),
    queryFn: async () => unwrap(await getStoryCodex(api, storyId as string)),
    queryKey: queryKeys.storyCodex(storyId ?? ""),
    staleTime: STALE,
  });
};

export const useStoryTimeline = (storyId: string | undefined) => {
  const api = useApi();
  return useQuery({
    enabled: Boolean(storyId),
    queryFn: async () => unwrap(await getStoryTimeline(api, storyId as string)),
    queryKey: queryKeys.storyTimeline(storyId ?? ""),
    staleTime: STALE,
  });
};

export const useStoryMaps = (storyId: string | undefined) => {
  const api = useApi();
  return useQuery({
    enabled: Boolean(storyId),
    queryFn: async () => unwrap(await getStoryMaps(api, storyId as string)),
    queryKey: queryKeys.storyMaps(storyId ?? ""),
    staleTime: STALE,
  });
};

export const useStoryCharacters = (storyId: string | undefined) => {
  const api = useApi();
  return useQuery({
    enabled: Boolean(storyId),
    queryFn: async () =>
      unwrap(await getStoryCharacters(api, storyId as string)) ?? [],
    queryKey: queryKeys.storyCharacters(storyId ?? ""),
    staleTime: STALE,
  });
};
