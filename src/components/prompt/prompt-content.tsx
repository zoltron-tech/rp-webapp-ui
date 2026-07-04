"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { useToggleLike } from "@/hooks/use-toggle-like";
import {
  type CustomEventType,
  EVENTS,
  type PromptCommentReplyUpdatedPayload,
} from "@/utils/constants/custom-events";
import { parseTextContent } from "@/utils/helpers";
import { LikeButton } from "../common/like-button";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { VideoViewer } from "../image-viewer/VideoViewer";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
import { usePromptState, usePromptStateSet } from "./prompt.store";
import * as S from "./styled";

type PromptContentProps = {
  /** When true the text is always fully expanded (no read-more collapse). */
  disableCollapse?: boolean;
};

export const PromptContent: FC<PromptContentProps> = ({ disableCollapse }) => {
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
  const {
    on: onPromptEvent,
    off: offPromptEvent,
    emit: emitPromptEvent,
  } = useCustomEvents(EVENTS.PROMPT.base);

  useEffect(() => {
    const handlePromptUpdated = (
      e: CustomEventType<PromptCommentReplyUpdatedPayload>,
    ) => {
      // Every mounted prompt listens on the same event bus — only apply
      // the update meant for this prompt.
      if (e.detail.id !== promptId) return;

      setPromptState({ text: e.detail.text });
    };

    onPromptEvent(EVENTS.PROMPT.UPDATED, handlePromptUpdated);

    return () => {
      offPromptEvent(EVENTS.PROMPT.UPDATED, handlePromptUpdated);
    };
  }, [onPromptEvent, offPromptEvent, promptId, setPromptState]);

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

    emitPromptEvent(EVENTS.PROMPT.REACTED, {
      id: promptId,
      reacted: response.reacted,
      reactions: response.reactions,
    });
  }, [
    toggleLike,
    setPromptState,
    reacted,
    reactions,
    emitPromptEvent,
    promptId,
  ]);

  const onLike = useMemo(() => {
    if (authState !== "LOGGED_IN") return undefined;

    return handleLikeToggle;
  }, [authState, handleLikeToggle]);

  const textLines = useMemo(() => parseTextContent(text), [text]);

  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <S.PromptContent.Root>
      {/* {textLines.map((line, index) => (
        <S.TextLine key={index}>{line}</S.TextLine>
      ))} */}

      <RichTextRenderer
        savedText={text ?? ""}
        collapsedHeight={100}
        overlayHidden
        disableCollapse={disableCollapse}
      />
      {media && (
        <S.PromptMediaContainer>
          <ShouldRender if={media.toLocaleLowerCase().startsWith("http")}>
            <ShouldRender if={media.toLowerCase().endsWith("mp4")}>
              <S.PromptVideo
                src={`${media}#t=0.3`}
                muted
                playsInline
                style={{ cursor: "zoom-in" }}
                onClick={() => setVideoOpen(true)}
              />
              <VideoViewer
                src={media}
                open={videoOpen}
                onOpenChange={setVideoOpen}
              />
            </ShouldRender>
            <ShouldRender if={!media.toLowerCase().endsWith("mp4")}>
              <AppImageViewer src={media} alt="Prompt media">
                <ShouldRender if={!media.endsWith("mp4")}>
                  <S.PromptImage
                    src={media}
                    alt="Prompt media"
                    style={{ cursor: "zoom-in" }}
                  />
                </ShouldRender>
              </AppImageViewer>
            </ShouldRender>
          </ShouldRender>
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
