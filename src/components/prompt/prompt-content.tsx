"use client";

import { type FC, useCallback, useMemo } from "react";
import { useGlobalState } from "@/context/store/stores";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { parseTextContent } from "@/utils/helpers";
import { LikeButton } from "../common/like-button";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { usePromptState, usePromptStateSet } from "./prompt.store";
import * as S from "./styled";

type PromptContentProps = {};

export const PromptContent: FC<PromptContentProps> = ({}) => {
  const text = usePromptState("text");
  const media = usePromptState("media");
  const promptId = usePromptState("id");
  const reacted = usePromptState("reacted");
  const reactions = usePromptState("reactions");

  const authState = useGlobalState("authState");
  const setPromptState = usePromptStateSet();
  const { toggleLike } = useToggleLike({
    id: promptId,
    liked: reacted,
    type: "prompt",
  });

  const handleLikeToggle = useCallback(async () => {
    setPromptState({
      reacted: !reacted,
      reactions: reacted ? reactions - 1 : reactions + 1,
    });
    const response = await toggleLike();
    if (!response || "message" in response) {
      setPromptState({
        reacted: reacted,
        reactions: reacted ? reactions + 1 : reactions - 1,
      });
      return;
    }

    setPromptState({
      reacted: response.reacted,
      reactions: response.reactions,
    });
  }, [toggleLike, setPromptState, reacted, reactions]);

  const onLike = useMemo(() => {
    if (authState !== "LOGGED_IN") return undefined;

    return handleLikeToggle;
  }, [authState, handleLikeToggle]);

  const textLines = useMemo(() => parseTextContent(text), [text]);

  return (
    <S.PromptContent.Root>
      {textLines.map((line, index) => (
        <S.TextLine key={index}>{line.trim()}</S.TextLine>
      ))}
      {media && (
        <S.PromptMediaContainer>
          <AppImageViewer src={media} alt="Prompt media">
            <S.PromptImage
              src={media}
              alt="Prompt media"
              style={{ cursor: "zoom-in" }}
            />
          </AppImageViewer>
        </S.PromptMediaContainer>
      )}
      <S.PromptContent.Footer>
        <LikeButton
          onLike={onLike}
          parentId={promptId}
          liked={reacted}
          likes={reactions}
        />
      </S.PromptContent.Footer>
    </S.PromptContent.Root>
  );
};
