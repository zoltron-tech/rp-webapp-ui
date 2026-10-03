import type { Comment } from "@nw/types";
import { useCallback, useEffect, useState } from "react";
import { getPropmptCommentsAction } from "@/app/rp/prompt/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import {
  type CustomEventType,
  EVENTS,
  type ItemDeletedPayload,
} from "@/utils/constants/custom-events";

export const useGetComments = (promptId: string, skipAutoFetch = false) => {
  const cachedPromptComments = useGlobalState("cachedPromptComments");
  const setGlobalState = useGlobalStoreSet();

  const [comments, setComments] = useState<Comment[]>(
    () => cachedPromptComments?.[promptId] ?? [],
  );
  const [loading, setLoading] = useState(
    () => !cachedPromptComments?.[promptId],
  );
  const { on, off } = useCustomEvents(EVENTS.COMMENT.base);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const _comments = (await getPropmptCommentsAction(promptId)) ?? [];

    if (!_comments || "message" in _comments) {
      setLoading(false);
      return;
    }
    setComments(_comments);
    setGlobalState((state) => ({
      cachedPromptComments: {
        ...(state.cachedPromptComments ?? {}),
        [promptId]: _comments,
      },
    }));
    setLoading(false);
  }, [promptId, setGlobalState]);

  useEffect(() => {
    if (!skipAutoFetch && !cachedPromptComments?.[promptId]) {
      fetchComments();
    }
  }, [fetchComments, skipAutoFetch, cachedPromptComments, promptId]);

  useEffect(() => {
    const handleDeleteComment = (
      event: CustomEventType<ItemDeletedPayload>,
    ) => {
      const commentId = event.detail.id;

      setComments((prev) => {
        const filtered = prev.filter((c) => c.id !== commentId);
        setGlobalState((state) => ({
          cachedPromptComments: {
            ...(state.cachedPromptComments ?? {}),
            [promptId]: filtered,
          },
        }));
        return filtered;
      });
    };
    on(EVENTS.COMMENT.DELETED, handleDeleteComment);
    return () => {
      off(EVENTS.COMMENT.DELETED, handleDeleteComment);
    };
  }, [on, off, promptId, setGlobalState]);

  return { comments, loading, refetch: fetchComments };
};
