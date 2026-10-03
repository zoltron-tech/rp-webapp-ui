"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { IoIosShareAlt } from "react-icons/io";
import { TbMessageCircle } from "react-icons/tb";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { useToggleLike } from "@/hooks/use-toggle-like";
import {
  type CustomEventType,
  EVENTS,
  type PromptCommentReplyUpdatedPayload,
} from "@/utils/constants/custom-events";
import { pluralize } from "@/utils/helpers";
import { HeartIcon } from "../common/heart-icon";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { VideoViewer } from "../image-viewer/VideoViewer";
import { ReactionLikersDialog } from "../reaction-likers-dialog";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
import { usePromptState, usePromptStateSet } from "./prompt.store";
import { PromptFeaturedSong } from "./prompt-featured-song";
import { SharePromptDialog } from "./share-prompt-dialog";
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
  const source = usePromptState("source");
  const featuredSong = usePromptState("featuredSong");
  const commentCount = usePromptState("commentCount");
  const createdOn = usePromptState("createdOn");

  const isOOC = source?.sourceType === "NOVELIST";
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);

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

  const handleOpenLikers = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reactions) return;
    setLikersOpen(true);
  };

  const handleReplyClick = useCallback(() => {
    emitPromptEvent(EVENTS.PROMPT.OPEN_THREADS, { id: promptId });
  }, [emitPromptEvent, promptId]);

  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <S.PromptContent.Root>
      <ShouldRender if={isOOC}>
        <S.OOCEyebrow>Out of character</S.OOCEyebrow>
      </ShouldRender>

      <RichTextRenderer
        savedText={text ?? ""}
        collapsedHeight={100}
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
      <ShouldRender if={!!featuredSong}>
        {featuredSong && <PromptFeaturedSong song={featuredSong} />}
      </ShouldRender>

      <S.PromptContent.Footer>
        <S.LikeGroup>
          <S.HeartLikeButton
            type="button"
            $liked={reacted}
            onClick={onLike}
            aria-label={reacted ? "Unlike prompt" : "Like prompt"}
            aria-pressed={reacted}
          >
            <HeartIcon filled={reacted} />
          </S.HeartLikeButton>
          <S.LikeCountButton type="button" onClick={handleOpenLikers}>
            <span className="count-short">{reactions}</span>
            <span className="label-full">
              {`${reactions} ${pluralize("novelist", reactions)} ${pluralize(
                "like",
                reactions === 1 ? 2 : 1,
              )} this`}
            </span>
          </S.LikeCountButton>
        </S.LikeGroup>
        <S.ActionButton type="button" onClick={handleReplyClick}>
          <TbMessageCircle />
          <span className="count-short">{commentCount}</span>
          <span className="label-full">
            {commentCount > 0
              ? `${commentCount} ${pluralize("Comment", commentCount)}`
              : "No Comments"}
          </span>
        </S.ActionButton>
        <S.ActionButton
          type="button"
          className="share"
          $accentHover
          onClick={() => setShowShareDialog(true)}
          aria-label="Share prompt"
        >
          <IoIosShareAlt />
        </S.ActionButton>
      </S.PromptContent.Footer>

      <SharePromptDialog
        promptId={promptId ?? ""}
        prompt={{
          createdOn,
          media,
          source,
          text,
        }}
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
      <ReactionLikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        targetId={promptId ?? ""}
        initialCount={reactions}
      />
    </S.PromptContent.Root>
  );
};
