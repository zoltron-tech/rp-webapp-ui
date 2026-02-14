import { useCallback } from "react";
import type { Hook } from "@/types/common";
import { API_MESSAGE } from "@/utils/constants";

type Props = {
  id: string;
  type: "prompt" | "comment" | "reply";
  liked: boolean;
};

type ReactionResponse = {
  reacted: boolean;
  reactions: number;
};

type ApiErrorResponse = {
  message: API_MESSAGE;
};

type ReturnType = {
  toggleLike: () => Promise<ReactionResponse | ApiErrorResponse>;
};

export const useToggleLike: Hook<Props, ReturnType> = ({
  id,
  type,
  liked = false,
}) => {
  const toggleLike = useCallback(async (): Promise<
    ReactionResponse | ApiErrorResponse
  > => {
    const URL = `/api/reaction/${id}`;
    const method = liked ? "DELETE" : "PATCH";
    const body = liked
      ? undefined
      : JSON.stringify({ targetType: type.toUpperCase() });

    const response = await fetch(URL, {
      body,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method,
    });

    if (!response.ok) {
      return { message: API_MESSAGE.Error };
    }

    return response.json();
  }, [id, type, liked]);

  return { toggleLike };
};
