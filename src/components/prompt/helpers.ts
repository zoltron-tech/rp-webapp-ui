import { getPropmptCommentsAction } from "@/app/rp/prompt/actions";
import { Comment } from "@/types";
import { useCallback, useEffect, useState } from "react";

export const useGetComments = (promptId: string, skipAutoFetch = false) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

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

  return { comments, loading, refetch: fetchComments };
};
