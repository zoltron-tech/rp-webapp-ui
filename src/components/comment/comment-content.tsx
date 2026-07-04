"use client";

import { type FC, useEffect, useMemo } from "react";
import { useCustomEvents } from "@/hooks";
import {
  type CustomEventType,
  EVENTS,
  type PromptCommentReplyUpdatedPayload,
} from "@/utils/constants/custom-events";
import { parseTextContent } from "@/utils/helpers";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
import { useCommentState, useCommentStateSet } from "./comment.store";
import * as S from "./styled";

export const CommentContent: FC = () => {
  const text = useCommentState("text");
  const commentId = useCommentState("id");
  const setCommentState = useCommentStateSet();
  const { on: onCommentEvent, off: offCommentEvent } = useCustomEvents(
    EVENTS.COMMENT.base,
  );

  useEffect(() => {
    const handleCommentUpdated = (
      e: CustomEventType<PromptCommentReplyUpdatedPayload>,
    ) => {
      // Every mounted comment listens on the same event bus — only apply
      // the update meant for this comment.
      if (e.detail.id !== commentId) return;

      setCommentState({ text: e.detail.text });
    };

    onCommentEvent(EVENTS.COMMENT.UPDATED, handleCommentUpdated);

    return () => {
      offCommentEvent(EVENTS.COMMENT.UPDATED, handleCommentUpdated);
    };
  }, [onCommentEvent, offCommentEvent, commentId, setCommentState]);

  const textLines = useMemo(
    () => parseTextContent(text, { maxChars: 200 }),
    [text],
  );
  const media = useCommentState("media");

  return (
    <S.CommentContent.Root>
      {/* {textLines.map((line, index) => (
        <S.CommentContent.TextLine key={index}>
          {line}
        </S.CommentContent.TextLine>
      ))} */}
      <RichTextRenderer savedText={text ?? ""} collapsedHeight={100} />
      {media && (
        <S.CommentContent.MediaContainer>
          <AppImageViewer src={media} alt="Comment media">
            <S.CommentContent.Image
              src={media}
              alt="Comment media"
              style={{ cursor: "zoom-in" }}
            />
          </AppImageViewer>
        </S.CommentContent.MediaContainer>
      )}
    </S.CommentContent.Root>
  );
};
