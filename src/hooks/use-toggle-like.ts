import { Hook } from "@/types/common";
import { API_MESSAGE } from "@/utils/constants";
import { useCallback } from "react";

type Props = {
  id: string;
  type: "prompt" | "comment";
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
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    if (response.status !== 200) {
      return { message: API_MESSAGE.Error };
    }

    return response.json();
  }, [id, type, liked]);

  return { toggleLike };
};
