import type { Comment, Reply } from "@nw/types";
import { getCommentAction, getRepliesAction } from "@/app/rp/thread/actions";

/**
 * Threads fetched for embeds, kept for the page's lifetime.
 *
 * A thread link names a comment. The comment carries its prompt, which gives
 * the card its two voices; the newest few replies come from a second request
 * so the card can show who else is in the thread and what was said last.
 * The pair is fetched together and cached as one, under the same contract as
 * the muse and prompt caches: a 404 is remembered, a network failure is not.
 */
export type EmbeddedThread = {
  comment: Comment;
  /** Newest first, at most `REPLY_SAMPLE`; empty when the thread is fresh. */
  replies: Reply[];
};

const REPLY_SAMPLE = 4;

const inflight = new Map<string, Promise<EmbeddedThread | null>>();

const isComment = (value: unknown): value is Comment =>
  !!value &&
  typeof value === "object" &&
  "source" in value &&
  "promptId" in value &&
  !("message" in value);

export const fetchEmbeddedThread = (
  commentId: string,
): Promise<EmbeddedThread | null> => {
  const cached = inflight.get(commentId);
  if (cached) return cached;

  const request = Promise.all([
    getCommentAction(commentId),
    // The replies are decoration: a thread with none, or whose replies did
    // not load, still gets its card.
    getRepliesAction(commentId, 1, REPLY_SAMPLE).catch(() => null),
  ])
    .then(([comment, replies]) => {
      if (!isComment(comment)) return null;
      return {
        comment,
        replies: Array.isArray(replies) ? replies : [],
      };
    })
    .catch((error: unknown) => {
      inflight.delete(commentId);
      throw error;
    });

  inflight.set(commentId, request);
  return request;
};
