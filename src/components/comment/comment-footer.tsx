"use client";

import { useRouter } from "next/navigation";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";
import { GoCommentDiscussion } from "react-icons/go";
import { IoMdArrowForward } from "react-icons/io";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { ROUTES } from "@/utils/constants/routes";
import { pluralize } from "@/utils/helpers";
import { LikeButton } from "../common/like-button";
import { useCommentState, useCommentStateSet } from "./comment.store";
import * as S from "./styled";

export const CommentFooter: FC = () => {
  const replyCount = useCommentState("replyCount");
  const reacted = useCommentState("reacted");
  const reactions = useCommentState("reactions");
  const threadId = useCommentState("id");
  const threadUrl = useMemo(() => ROUTES.Thread.View(threadId), [threadId]);
  const { routeToPage } = usePageRouter();
  const authState = useGlobalState("authState");
  const setCommentState = useCommentStateSet();
  const { toggleLike } = useToggleLike({
    id: threadId,
    liked: reacted,
    type: "comment",
  });

  const handleLikeToggle = useCallback(async () => {
    setCommentState({
      reacted: !reacted,
      reactions: reacted ? reactions - 1 : reactions + 1,
    });
    const response = await toggleLike();
    if (!response || "message" in response) {
      setCommentState({
        reacted: reacted,
        reactions: reacted ? reactions + 1 : reactions - 1,
      });
      return;
    }

    setCommentState({
      reacted: response.reacted,
      reactions: response.reactions,
    });
  }, [toggleLike, setCommentState, reacted, reactions]);

  const onLike = useMemo(() => {
    if (authState !== "LOGGED_IN") return undefined;

    return handleLikeToggle;
  }, [authState, handleLikeToggle]);

  const replyText = useMemo(() => {
    if (replyCount === 0) return "No replies";
    return `${replyCount} ${pluralize("reply", replyCount)}`;
  }, [replyCount]);

  const handleOpenThread: MouseEventHandler<
    HTMLAnchorElement | HTMLButtonElement
  > = useCallback(
    (e) => {
      e.preventDefault();
      routeToPage(threadUrl);
    },
    [threadUrl, routeToPage],
  );

  return (
    <S.CommentFooter.Root>
      <S.CommentFooter.Left>
        <LikeButton
          onLike={onLike}
          parentId={threadId}
          liked={reacted}
          likes={reactions}
        />
      </S.CommentFooter.Left>
      <S.CommentFooter.Right>
        <S.CommentFooter.ReplyCount href={threadUrl} onClick={handleOpenThread}>
          <GoCommentDiscussion className="replies-icon" />
          {replyText}
        </S.CommentFooter.ReplyCount>
        <S.CommentFooter.OpenThreadButton onClick={handleOpenThread}>
          Open thread
          <IoMdArrowForward className="icon" />
        </S.CommentFooter.OpenThreadButton>
      </S.CommentFooter.Right>
    </S.CommentFooter.Root>
  );
};
