"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Separator } from "radix-ui";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";
import { GoCommentDiscussion } from "react-icons/go";
import { IoMdArrowForward } from "react-icons/io";
import { usePageRouter } from "@/hooks/use-page-router";
import type { PromptThreadComment } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import {
  displayDate,
  parseTextContent,
  pluralize,
  toFormattedDate,
} from "@/utils/helpers";
import { MuseAvatar } from "../common/muse-avatar";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import * as S from "./styled";

type Props = React.HTMLProps<HTMLDivElement> & {
  promptThreadComment?: PromptThreadComment | null;
};

export const PromptThreadCommentCard: FC<Props> = ({
  promptThreadComment,
  className,
  ...rest
}) => {
  const { routeToPage } = usePageRouter();
  const threadUrl = useMemo(
    () => ROUTES.Thread.View(promptThreadComment?.parentId || ""),
    [promptThreadComment?.parentId],
  );
  const textLines = useMemo(
    () => parseTextContent(promptThreadComment?.text || ""),
    [promptThreadComment],
  );
  const replyText = useMemo(() => {
    if (promptThreadComment?.replyCount === 0) return "No new replies";
    return `${promptThreadComment?.replyCount} new ${pluralize("reply", promptThreadComment?.replyCount || 0)}`;
  }, [promptThreadComment?.replyCount]);

  const newReplyCount = useMemo(() => {
    if (!promptThreadComment) return 0;
    return promptThreadComment?.replyCount < 10
      ? String(promptThreadComment?.replyCount) +
          " new " +
          pluralize("reply", promptThreadComment?.replyCount)
      : "9+ new " + pluralize("reply", promptThreadComment?.replyCount);
  }, [promptThreadComment]);

  const date = useMemo(() => {
    if (!promptThreadComment) return "";
    return new Date(promptThreadComment.createdOn * 1000).toISOString();
  }, [promptThreadComment]);

  const handleOpenThread: MouseEventHandler<
    HTMLAnchorElement | HTMLButtonElement
  > = useCallback(
    (e) => {
      e.preventDefault();
      routeToPage(threadUrl);
    },
    [threadUrl, routeToPage],
  );

  if (!promptThreadComment) return null;

  return (
    <S.ThreadRoot>
      <S.PromptHeaderRoot>
        <MuseAvatar
          museId={promptThreadComment.source.sourceId}
          image={promptThreadComment.source.image}
          name={promptThreadComment.source.name}
        />
        <S.SourceInfo>
          <S.SourceName>{promptThreadComment.source.name}</S.SourceName>
          <ShouldRender if={Boolean(date)}>
            <S.PromptSubheader
              title={date ? displayDate(date) : ""}
              dateTime={date}
            >
              {date ? toFormattedDate(date) : ""}
            </S.PromptSubheader>
          </ShouldRender>
        </S.SourceInfo>
        <ShouldRender if={promptThreadComment.replyCount > 0}>
          <S.UnreadBadge onClick={handleOpenThread}>
            {newReplyCount}
          </S.UnreadBadge>
        </ShouldRender>
      </S.PromptHeaderRoot>
      <Separator.Root className="separator" orientation="horizontal" />

      <S.PromptContent.Root>
        {textLines.map((line, index) => (
          <S.TextLine key={index}>{line.trim()}</S.TextLine>
        ))}
        {/* {promptThreadComment.text} */}
        {promptThreadComment.media && (
          <S.PromptContent.MediaContainer>
            <AppImageViewer
              src={promptThreadComment?.media}
              alt="outgoing thread media"
            >
              <S.PromptImage
                src={promptThreadComment.media}
                alt="Prompt media"
              />
            </AppImageViewer>
          </S.PromptContent.MediaContainer>
        )}
      </S.PromptContent.Root>

      <S.CommentFooter.Root>
        <S.CommentFooter.Left>
          {/* <LikeButton
                onLike={onLike}
                parentId={threadId}
                liked={reacted}
                likes={reactions}
              /> */}
        </S.CommentFooter.Left>
        <S.CommentFooter.Right>
          <S.CommentFooter.ReplyCount
            href={threadUrl}
            onClick={handleOpenThread}
          >
            <GoCommentDiscussion className="replies-icon" />
            {replyText}
          </S.CommentFooter.ReplyCount>
          <S.CommentFooter.OpenThreadButton onClick={handleOpenThread}>
            Open thread
            <IoMdArrowForward className="icon" />
          </S.CommentFooter.OpenThreadButton>
        </S.CommentFooter.Right>
      </S.CommentFooter.Root>
    </S.ThreadRoot>
  );
};
