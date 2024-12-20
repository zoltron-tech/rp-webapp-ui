"use client";

import { ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { useAuthContext } from "@/hooks";
import { Comment } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as S from "./styles";
import { Container, Flex } from "@novelist-world/ui";
import { getCommentAction } from "../actions";
import classNames from "classnames";
import PromptInput from "@/components/prompt-input";
import { toFormattedDate } from "@/utils/helpers";
import { IoArrowBackOutline } from "react-icons/io5";
import { Z_INDEX } from "@/theme";

export default function ThreadPage({}) {
  const params = useParams();
  const { state: authState, user, novelist, state } = useAuthContext();
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const commentId = params?.slug as string;
  const { push } = useRouter();

  const onAvatarClick = (sourceId: string | undefined) => {
    if (!sourceId) return;
    push(`/rp/muse/${sourceId}`);
  };

  const onBackClick = () => {
    if (!comment?.prompt?.id) return;
    push(`/rp/prompt/${comment?.prompt?.id}`);
  };

  const fetchThread = async (museId: string) => {
    setLoading(true);
    const _comment = await getCommentAction(museId);

    if (!_comment || "message" in _comment) {
      setLoading(false);
      push("/404");
      return;
    }
    console.log(_comment);
    setLoading(false);
    setComment(_comment);
  };

  useEffect(() => {
    if (authState === "LOADING" || comment) return;

    fetchThread(commentId);
  }, [authState]);

  const loadReplies = (comment: Comment | null) => {
    if (comment === null) return <></>;
    return comment.replies.map((reply) => (
      <>
        <Flex direction="column" gap={0} style={{ marginBottom: "10px" }}>
          <Flex>
            <S.Avatar
              src={reply.source?.image || ""}
              alt={""}
              size={50}
              onClick={() => onAvatarClick(reply.source.sourceId)}
              hoverable
            />
            <S.SourceName onClick={() => onAvatarClick(reply.source.sourceId)}>
              {reply.source.name}
            </S.SourceName>
          </Flex>

          <S.PromptText>{reply.text}</S.PromptText>
          {reply.media && (
            <S.CardWrapper className={classNames("reply")}>
              <S.CardBackground banner={reply.media || ""} className="image" />
            </S.CardWrapper>
          )}
          <Flex
            direction="row"
            justify="space-between"
            style={{ width: "70%" }}
          >
            <div></div>
            <S.Date>{toFormattedDate(reply.createdOn)}</S.Date>
          </Flex>
        </Flex>
      </>
    ));
  };

  return (
    <S.ParentContainer>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.RepliesContainer>
        <S.HeaderContainer>
          <Flex>
            <IoArrowBackOutline
              size={15}
              onClick={() => onBackClick()}
              style={{ cursor: "pointer" }}
            />
            <S.Avatar
              src={comment?.prompt?.source?.image || ""}
              alt={""}
              size={50}
              onClick={() => onAvatarClick(comment?.prompt?.source.sourceId)}
              hoverable
            />
            <S.SourceName
              onClick={() => onAvatarClick(comment?.prompt?.source.sourceId)}
            >
              {comment?.prompt?.source?.name}
            </S.SourceName>
          </Flex>
        </S.HeaderContainer>
        <Flex direction="column">
          <S.PromptText>{comment?.prompt?.text}</S.PromptText>
          {comment?.prompt?.media && (
            <S.CardWrapper>
              <S.CardBackground
                banner={comment?.prompt?.media || ""}
                className="image"
              />
            </S.CardWrapper>
          )}
          <Flex
            direction="row"
            justify="space-between"
            style={{ width: "70%" }}
          >
            <div></div>
            <S.Date>{toFormattedDate(comment?.prompt?.createdOn)}</S.Date>
          </Flex>
        </Flex>
        <Flex direction="column">
          <Flex>
            <S.Avatar
              src={comment?.source?.image || ""}
              alt={""}
              size={50}
              onClick={() => onAvatarClick(comment?.source.sourceId)}
              hoverable
            />
            <S.SourceName
              onClick={() => onAvatarClick(comment?.source.sourceId)}
            >
              {comment?.source.name}
            </S.SourceName>
          </Flex>
          <S.PromptText>{comment?.text}</S.PromptText>
          {comment?.media && (
            <S.CardWrapper>
              <S.CardBackground
                banner={comment.media || ""}
                className="image"
              />
            </S.CardWrapper>
          )}
          <Flex
            direction="row"
            justify="space-between"
            style={{ width: "70%" }}
          >
            <div></div>
            <S.Date>{toFormattedDate(comment?.createdOn)}</S.Date>
          </Flex>
        </Flex>
        {loadReplies(comment)}
        {state === "LOGGED_IN" && (
          <Flex style={{ borderTop: "1px solid gray" }}>
            <PromptInput
              className={
                comment?.replies.length != null && comment?.replies.length > 0
                  ? "upward"
                  : ""
              }
              muses={novelist?.muses || []}
            />
          </Flex>
        )}
      </S.RepliesContainer>
    </S.ParentContainer>
  );
}
