import type { StoryBoard } from "@nw/types";
import { getStoryboardAction } from "@/app/rp/story/actions";

/**
 * Stories fetched for embeds, kept for the page's lifetime. Same contract as
 * the other embed caches: one request per id, a 404 (private, deleted, not
 * a member) remembered, a network failure not.
 */
const inflight = new Map<string, Promise<StoryBoard | null>>();

const isStory = (value: unknown): value is StoryBoard =>
  !!value &&
  typeof value === "object" &&
  "name" in value &&
  "members" in value &&
  !("message" in value);

export const fetchEmbeddedStory = (
  storyId: string,
): Promise<StoryBoard | null> => {
  const cached = inflight.get(storyId);
  if (cached) return cached;

  const request = getStoryboardAction(storyId)
    .then((result) => (isStory(result) ? result : null))
    .catch((error: unknown) => {
      inflight.delete(storyId);
      throw error;
    });

  inflight.set(storyId, request);
  return request;
};
