"use client";

import { ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { useAuthContext } from "@/hooks";
import { Comment, Prompt } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as S from "./styles";
import { Container, Flex } from "@novelist-world/ui";
import { getPromptAction } from "../actions";
import moment from "moment";
import classNames from "classnames";
import PromptInput from "@/components/prompt-input";

export default function PromptPage({}) {
  const params = useParams();
  const { state: authState, user, novelist, state } = useAuthContext();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const promptId = params?.slug as string;
  const { push } = useRouter();

  const onAvatarClick = (sourceId: string | undefined) => {
    if (!sourceId) return;
    push(`/rp/muse/${sourceId}`);
  };

  const toFormattedDate = (unixTime: number | undefined): string => {
    if (!unixTime) return "unknown";
    const date = moment.unix(unixTime);
    const now = moment();

    const units = [
      { name: "y", value: now.diff(date, "years") },
      { name: "mon", value: now.diff(date, "months") },
      { name: "d", value: now.diff(date, "days") },
      { name: "h", value: now.diff(date, "hours") },
      { name: "m", value: now.diff(date, "minutes") },
    ];

    const unit = units.find((u) => u.value > 0);
    return unit ? `${unit.value}${unit.name} ago` : "just now";
  };

  const fetchPrompt = async (museId: string) => {
    setLoading(true);
    const _prompt = await getPromptAction(museId);

    if (!_prompt || "message" in _prompt) {
      setLoading(false);
      push("/404");
      return;
    }
    console.log(_prompt);
    setLoading(false);
    setPrompt(_prompt);
  };

  useEffect(() => {
    if (authState === "LOADING" || prompt) return;

    fetchPrompt(promptId);
  }, [authState]);

  const loadReplies = (comment: Comment) => {
    return comment.replies.map((reply) => (
      <>
        <Flex direction="column" gap={0}>
          <Flex>
            <S.Avatar
              src={reply.source?.image || ""}
              alt={""}
              size={30}
              onClick={() => onAvatarClick(reply.source.sourceId)}
              hoverable
            />
            <S.SourceName
              className={classNames("reply")}
              onClick={() => onAvatarClick(reply.source.sourceId)}
            >
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

  const loadComments = () => {
    return prompt?.comments.map((comment) => (
      <>
        <S.HeaderContainer>
          <Flex>
            <S.Avatar
              src={comment.source?.image || ""}
              alt={""}
              size={45}
              onClick={() => onAvatarClick(comment.source.sourceId)}
              hoverable
            />
            <S.SourceName
              onClick={() => onAvatarClick(comment.source.sourceId)}
            >
              {comment.source.name}
            </S.SourceName>
          </Flex>
          <S.Date>{toFormattedDate(comment.createdOn)}</S.Date>
        </S.HeaderContainer>
        <S.PromptText>{comment.text}</S.PromptText>
        {comment.media && (
          <S.CardWrapper>
            <S.CardBackground banner={comment.media || ""} className="image" />
          </S.CardWrapper>
        )}
        <S.CommentsHeader>Replies</S.CommentsHeader>
        <Flex justify="flex-end">
          <S.RepliesContainer>
            <ShouldRender preserveSpace if={comment.replies.length > 0}>
              {loadReplies(comment)}
            </ShouldRender>
            {state == "LOGGED_IN" && (
              <PromptInput muses={novelist?.muses || []} />
            )}
          </S.RepliesContainer>
        </Flex>
      </>
    ));
  };

  return (
    <S.ParentContainer>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.CommentsContainer>
        <S.HeaderContainer>
          <Flex>
            <S.Avatar
              src={prompt?.source?.image || ""}
              alt={""}
              size={50}
              onClick={() => onAvatarClick(prompt?.source.sourceId)}
              hoverable
            />
            <S.SourceName
              onClick={() => onAvatarClick(prompt?.source.sourceId)}
            >
              {prompt?.source?.name}
            </S.SourceName>
          </Flex>
          <S.Date>{toFormattedDate(prompt?.createdOn)}</S.Date>
        </S.HeaderContainer>
        <S.ScrollableContent>
          <Flex direction="column">
            <S.PromptText>{prompt?.text}</S.PromptText>
            {prompt?.media && (
              <S.CardWrapper>
                <S.CardBackground
                  banner={prompt?.media || ""}
                  className="image"
                />
              </S.CardWrapper>
            )}
          </Flex>
        </S.ScrollableContent>
      </S.CommentsContainer>
      <S.CommentsContainer>
        <S.CommentsHeader>Comments</S.CommentsHeader>
        <S.ScrollableContent>
          <ShouldRender
            preserveSpace
            if={prompt?.comments.length != null && prompt?.comments.length > 0}
          >
            {loadComments()}
          </ShouldRender>
          {state == "LOGGED_IN" && (
            <Container style={{ contain: "unset", width: "100%" }}>
              <PromptInput
                className={
                  prompt?.comments.length != null && prompt?.comments.length > 0
                    ? "upward"
                    : ""
                }
                muses={novelist?.muses || []}
              />
            </Container>
          )}
        </S.ScrollableContent>
      </S.CommentsContainer>
    </S.ParentContainer>
  );
}
