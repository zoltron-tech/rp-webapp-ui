import { FC, MouseEventHandler, useCallback, useMemo } from "react";
import * as S from "./styled";
import { useCommentState } from "./comment.store";
import { pluralize } from "@/utils/helpers";
import { MdArrowForwardIos, MdOutlineArrowForwardIos } from "react-icons/md";
import { IoMdArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";
import { HeartIcon } from "../common/heart-icon";
import { LikeButton } from "../common/like-button";

export const CommentFooter: FC = () => {
  const replyCount = useCommentState("replyCount");
  const reacted = useCommentState("reacted");
  const reactions = useCommentState("reactions");
  const threadId = useCommentState("id");
  const threadUrl = useMemo(() => `/rp/thread/${threadId}`, [threadId]);
  const { push } = useRouter();

  const replyText = useMemo(() => {
    if (replyCount === 0) return "No replies";
    return `${replyCount} ${pluralize("reply", replyCount)}`;
  }, [replyCount]);

  const handleOpenThread: MouseEventHandler<
    HTMLAnchorElement | HTMLButtonElement
  > = useCallback(
    (e) => {
      e.preventDefault();
      push(threadUrl);
    },
    [threadUrl, push]
  );

  return (
    <S.CommentFooter.Root>
      <S.CommentFooter.Left>
        <LikeButton parentId={threadId} liked={reacted} likes={reactions} />
      </S.CommentFooter.Left>
      <S.CommentFooter.Right>
        <S.CommentFooter.ReplyCount href={threadUrl} onClick={handleOpenThread}>
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
