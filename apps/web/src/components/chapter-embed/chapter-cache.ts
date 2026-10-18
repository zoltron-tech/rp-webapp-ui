import type {
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventThread,
} from "@nw/types";
import {
  getStoryboardAction,
  getStoryboardEventAction,
  getStoryboardEventThreadsAction,
} from "@/app/rp/story/actions";

/**
 * Chapters fetched for embeds, kept for the page's lifetime.
 *
 * A chapter link names a story event. The event alone is a title and a
 * blurb; the card also wants the story it belongs to (name, cover, how many
 * chapters) and the chapter's opening passage (who wrote it, how many there
 * are). The event and the passages go out together — the passages are keyed
 * by the event id, which is known up front — and the story follows once the
 * event has named it. The story and the passages are decoration: a chapter
 * whose extras fail to load still gets its card.
 */
export type EmbeddedChapter = {
  event: StoryBoardEvent;
  story: StoryBoard | null;
  /** The first passage written in the chapter, when there is one. */
  opening: StoryBoardEventThread | null;
  /** How many passages the chapter has; null when that did not load. */
  passageCount: number | null;
};

const inflight = new Map<string, Promise<EmbeddedChapter | null>>();

const isEvent = (value: unknown): value is StoryBoardEvent =>
  !!value &&
  typeof value === "object" &&
  "name" in value &&
  "storyBoardId" in value &&
  !("message" in value);

const isStory = (value: unknown): value is StoryBoard =>
  !!value &&
  typeof value === "object" &&
  "name" in value &&
  "members" in value &&
  !("message" in value);

export const fetchEmbeddedChapter = (
  eventId: string,
): Promise<EmbeddedChapter | null> => {
  const cached = inflight.get(eventId);
  if (cached) return cached;

  const request = Promise.all([
    getStoryboardEventAction(eventId),
    getStoryboardEventThreadsAction(eventId, 1, 1).catch(() => null),
  ])
    .then(async ([event, page]) => {
      if (!isEvent(event)) return null;
      const story = await getStoryboardAction(event.storyBoardId).catch(
        () => null,
      );
      const threads =
        page && typeof page === "object" && "threads" in page ? page : null;
      return {
        event,
        opening: threads?.threads[0] ?? null,
        passageCount: threads?.totalCount ?? null,
        story: isStory(story) ? story : null,
      };
    })
    .catch((error: unknown) => {
      inflight.delete(eventId);
      throw error;
    });

  inflight.set(eventId, request);
  return request;
};
