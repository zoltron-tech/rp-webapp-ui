import { removeReaction, setReaction } from "@nw/api/endpoints/novelists";
import type { Hook } from "@nw/types/common";
import { useCallback } from "react";
import { api } from "@/lib/api";
import { API_MESSAGE } from "@/utils/constants";

type Props = {
  id: string;
  type:
    | "prompt"
    | "comment"
    | "reply"
    | "media"
    | "muse"
    | "profile"
    | "story_board"
    | "story_board_event";
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
    // Straight to the portfolio service, which has had these endpoints all
    // along. The Next route handler this replaces existed only to read the JWT
    // cookie and re-send it as a header — work the browser now does itself.
    const result = liked
      ? await removeReaction(api, id)
      : await setReaction(api, id, type.toUpperCase());

    if (!result || "message" in result) return { message: API_MESSAGE.Error };
    return result;
  }, [id, type, liked]);

  return { toggleLike };
};
