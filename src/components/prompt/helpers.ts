import { useCallback, useEffect, useState } from "react";
import { getPropmptCommentsAction } from "@/app/rp/prompt/actions";
import { useCustomEvents } from "@/hooks";
import type { Comment } from "@/types";
import {
  type CustomEventType,
  EVENTS,
  type ItemDeletedPayload,
} from "@/utils/constants/custom-events";

export const useGetComments = (promptId: string, skipAutoFetch = false) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { on, off } = useCustomEvents(EVENTS.COMMENT.base);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const _comments = (await getPropmptCommentsAction(promptId)) ?? [];

    if (!_comments || "message" in _comments) {
      setLoading(false);
      return;
    }
    setComments(_comments);
    setLoading(false);
  }, [promptId]);

  useEffect(() => {
    if (!skipAutoFetch) {
      fetchComments();
    }
  }, [fetchComments, skipAutoFetch]);

  useEffect(() => {
    const handleDeleteComment = (
      event: CustomEventType<ItemDeletedPayload>,
    ) => {
      const commentId = event.detail.id;

      setComments((prev) => {
        const filteredComments = prev.filter(
          (comment) => comment.id !== commentId,
        );
        return filteredComments;
      });
    };
    on(EVENTS.COMMENT.DELETED, handleDeleteComment);
    return () => {
      off(EVENTS.COMMENT.DELETED, handleDeleteComment);
    };
  }, [on, off]);

  return { comments, loading, refetch: fetchComments };
};
