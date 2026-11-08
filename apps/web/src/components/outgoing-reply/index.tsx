"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { PromptThreadComment } from "@nw/types";
import { stubHandle } from "@nw/types";
import { Separator } from "radix-ui";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";
import { GoCommentDiscussion } from "react-icons/go";
import { IoMdArrowForward } from "react-icons/io";
import { RiCheckboxCircleLine } from "react-icons/ri";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { displayDate, pluralize, toFormattedDate } from "@/utils/helpers";
import { HiddenItem } from "../common/hidden-item";
import { MuseAvatar } from "../common/muse-avatar";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
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
  const replyText = useMemo(() => {
    if (promptThreadComment?.concluded) return "Thread concluded";
    if (promptThreadComment?.replyCount === 0) return "No new replies";
    return `${promptThreadComment?.replyCount} new ${pluralize("reply", promptThreadComment?.replyCount || 0)}`;
  }, [promptThreadComment?.concluded, promptThreadComment?.replyCount]);

  const typeLabel = useMemo(() => {
    return promptThreadComment?.type === "REPLY" ? "Your reply" : "Your comment";
  }, [promptThreadComment?.type]);

  const unreadCountLabel = useMemo(() => {
    if (!promptThreadComment) return "0";
    return promptThreadComment.replyCount > 9
      ? "9+"
      : String(promptThreadComment.replyCount);
  }, [promptThreadComment]);

  const unreadCountTitle = useMemo(() => {
    if (!promptThreadComment) return "";
    return `${promptThreadComment.replyCount} new ${pluralize("reply", promptThreadComment.replyCount)}`;
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

  // The other side is someone the viewer blacklisted: the whole thread card
  // waits behind one stub (BLOCK_BLACKLIST_PLAN.md B11). Blocked threads are
  // left out by the server.
  return (
    <HiddenItem
      reason={promptThreadComment.hiddenReason}
      kind="thread"
      handle={stubHandle(promptThreadComment.target)}
    >
      <S.ThreadRoot
        className={className}
        {...rest}
        data-has-replies={promptThreadComment.replyCount > 0 ? "" : undefined}
        data-concluded={promptThreadComment.concluded ? "" : undefined}
      >
        <S.PromptHeaderRoot>
          <S.AvatarGroup>
            <S.PrimaryAvatarSlot>
              <MuseAvatar
                preview
                museId={promptThreadComment.source.sourceId}
                image={
                  promptThreadComment.source.avatar?.src ||
                  promptThreadComment.source.image
                }
                name={promptThreadComment.source.name}
                useAccent={promptThreadComment.source.useAccent}
                accent={promptThreadComment.source.accent}
              />
            </S.PrimaryAvatarSlot>
            <S.TargetAvatarSlot>
              <MuseAvatar
                preview
                museId={promptThreadComment.target.sourceId}
                image={
                  promptThreadComment.target.avatar?.src ||
                  promptThreadComment.target.image
                }
                name={promptThreadComment.target.name}
                useAccent={promptThreadComment.target.useAccent}
                accent={promptThreadComment.target.accent}
              />
            </S.TargetAvatarSlot>
          </S.AvatarGroup>

          <S.SourceInfo>
            <S.SourceNameRow>
              <S.SourceName>
                {promptThreadComment.source.name.split(" ")[0]}
              </S.SourceName>
              <S.TypeTag>{typeLabel}</S.TypeTag>
            </S.SourceNameRow>
            <S.PromptSubheader>
              <ShouldRender if={Boolean(date)}>
                <time title={date ? displayDate(date) : ""} dateTime={date}>
                  {date ? toFormattedDate(date) : ""}
                </time>
              </ShouldRender>
              <S.MetaDivider aria-hidden>➺</S.MetaDivider>
              <S.MetaTarget>
                with {promptThreadComment.target.name.split(" ")[0]}
              </S.MetaTarget>
            </S.PromptSubheader>
          </S.SourceInfo>

          <ShouldRender if={promptThreadComment.replyCount > 0}>
            <S.UnreadBadge onClick={handleOpenThread} title={unreadCountTitle}>
              {unreadCountLabel}
            </S.UnreadBadge>
          </ShouldRender>
          <ShouldRender if={Boolean(promptThreadComment.concluded)}>
            <S.ConcludedBadge title="This thread has been concluded">
              <RiCheckboxCircleLine />
              <span>Concluded</span>
            </S.ConcludedBadge>
          </ShouldRender>
        </S.PromptHeaderRoot>
        <Separator.Root className="separator" orientation="horizontal" />

        <S.PromptContent.Root>
          <RichTextRenderer
            savedText={promptThreadComment.text ?? ""}
            collapsedHeight={100}
          />
          {promptThreadComment.media && (
            <S.PromptContent.MediaContainer>
              <ShouldRender
                if={promptThreadComment.media
                  .toLocaleLowerCase()
                  .endsWith("mp4")}
              >
                <S.PromptVideo
                  src={`${promptThreadComment.media}#t=0.3`}
                  controls
                />
              </ShouldRender>
              <ShouldRender
                if={
                  !promptThreadComment.media.toLocaleLowerCase().endsWith("mp4")
                }
              >
                <AppImageViewer
                  src={promptThreadComment?.media}
                  alt="outgoing thread media"
                >
                  <S.PromptImage
                    src={promptThreadComment.media}
                    alt="Prompt media"
                  />
                </AppImageViewer>
              </ShouldRender>
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
    </HiddenItem>
  );
};
