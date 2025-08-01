"use client";

import { ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { useAuthContext } from "@/hooks";
import { Comment, Prompt } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as S from "./styles";
import { Flex } from "@novelist-world/ui";
import { getPromptAction, getPropmptCommentsAction } from "../actions";
import { toFormattedDate } from "@/utils/helpers";
import PromptInput from "@/components/prompt-input";

const useGetPrompt = (promptId: string) => {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrompt = useCallback(async () => {
    setLoading(true);
    const _prompt = await getPromptAction(promptId);

    if (!_prompt || "message" in _prompt) {
      setLoading(false);
      return;
    }
    setPrompt(_prompt);
    setLoading(false);
  }, [promptId]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  return { prompt, loading, refetch: fetchPrompt };
};

const useGetComments = (promptId: string, skipAutoFetch = false) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const _comments = (await getPropmptCommentsAction(promptId)) ?? [];

    if (!_comments || "message" in _comments) {
      setLoading(false);
      return;
    }
    setComments(_comments);
    setLoading(false);
  }, [promptId]);

  useEffect(() => {
    if (!skipAutoFetch) {
      fetchComments();
    }
  }, [fetchComments, skipAutoFetch]);

  return { comments, loading, refetch: fetchComments };
};

export default function PromptPage({}) {
  const params = useParams();
  const promptId = params?.slug as string;
  const { state: authState, novelist, state } = useAuthContext();
  const [showMobileThreads, setShowMobileThreads] = useState(false);
  const { prompt, loading } = useGetPrompt(promptId);
  const { comments, refetch: refetchComments } = useGetComments(promptId);
  const { push } = useRouter();

  const onAvatarClick = (sourceId: string | undefined) => {
    if (!sourceId) return;
    push(`/rp/muse/${sourceId}`);
  };

  const onThreadClick = (commentId: string | undefined) => {
    if (!commentId) return;
    push(`/rp/thread/${commentId}`);
  };

  const toggleMobileThreads = () => {
    setShowMobileThreads((prev) => !prev);
  };

  const loadThreads = () => {
    return comments.map((comment) => (
      <S.ThreadBox key={comment.id}>
        <S.HeaderContainer>
          <Flex>
            <S.Avatar
              src={comment.source?.image || ""}
              alt={""}
              size={30}
              onClick={() => onAvatarClick(comment.source.sourceId)}
              hoverable
            />
            <Flex direction="column" gap={0.2} align="flex-start">
              <S.SourceName
                className="reply"
                onClick={() => onAvatarClick(comment.source.sourceId)}
              >
                {comment.source.name}
              </S.SourceName>
              <S.Date className="reply">
                {toFormattedDate(comment.createdOn)}
              </S.Date>
            </Flex>
          </Flex>
        </S.HeaderContainer>
        <Flex
          direction="column"
          justify="center"
          style={{ minHeight: "170px" }}
        >
          <S.PromptText>
            {comment.text.length > 30
              ? `${comment.text.slice(0, 30)} ...`
              : comment.text}
          </S.PromptText>
          {comment.media && (
            <S.CardWrapper className="reply">
              <S.CardBackground
                banner={comment.media || ""}
                className="image"
              />
            </S.CardWrapper>
          )}
        </Flex>
        <S.SourceName
          className="reply action"
          onClick={() => onThreadClick(comment.id)}
        >
          {comment?.replyCount === 0 ? "No" : comment?.replyCount + " more"}{" "}
          replies...
        </S.SourceName>
      </S.ThreadBox>
    ));
  };

  const loadThreadsMobile = () => {
    return comments.map((comment) => (
      <S.ThreadBox className="mobile" key={comment.id}>
        <S.HeaderContainer>
          <Flex>
            <S.Avatar
              src={comment.source?.image || ""}
              alt={""}
              size={20}
              onClick={() => onAvatarClick(comment.source.sourceId)}
              hoverable
            />
            <Flex direction="column" gap={0.2} align="flex-start">
              <S.SourceName
                className="reply"
                onClick={() => onAvatarClick(comment.source.sourceId)}
              >
                {comment.source.name}
              </S.SourceName>
              <S.Date className="mobile">
                {toFormattedDate(comment.createdOn)}
              </S.Date>
            </Flex>
          </Flex>
        </S.HeaderContainer>
        <Flex
          direction="column"
          justify="center"
          style={{ minHeight: "163px" }}
        >
          <S.PromptText className="mobile">
            {comment.text.length > 30
              ? `${comment.text.slice(0, 30)} ...`
              : comment.text}
          </S.PromptText>
          {comment.media && (
            <S.CardWrapper className="mobile">
              <S.CardBackground
                banner={comment.media || ""}
                className="image"
              />
            </S.CardWrapper>
          )}
        </Flex>
        <S.SourceName
          className="reply action"
          onClick={() => onThreadClick(comment.id)}
        >
          {comment?.replyCount === 0 ? "No" : comment?.replyCount + " more"}{" "}
          replies...
        </S.SourceName>
        <div></div>
      </S.ThreadBox>
    ));
  };

  return (
    <S.ParentContainer>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.PromptContainer className={showMobileThreads ? "smaller" : ""}>
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
        {state === "LOGGED_IN" && (
          <div>
            <PromptInput
              type="comment"
              parentId={prompt?.id}
              muses={novelist?.muses || []}
              onSend={refetchComments}
            />
          </div>
        )}
        {comments.length > 0 && (
          <S.ThreadsContainerMobile
            className={showMobileThreads ? "expanded" : ""}
          >
            <S.ToggleThread className={showMobileThreads ? "expanded" : ""}>
              <S.SourceName className="action" onClick={toggleMobileThreads}>
                {showMobileThreads
                  ? "Hide existing threads"
                  : "Show existing threads"}
              </S.SourceName>
            </S.ToggleThread>
            <S.ScrollableContentHorzontal
              className={showMobileThreads ? "visible" : ""}
            >
              <ShouldRender preserveSpace if={comments.length > 0}>
                {loadThreadsMobile()}
              </ShouldRender>
            </S.ScrollableContentHorzontal>
          </S.ThreadsContainerMobile>
        )}
      </S.PromptContainer>
      {comments.length > 0 && (
        <S.ThreadsContainer>
          <S.CommentsHeader> Existing threads</S.CommentsHeader>
          <S.ScrollableContent>
            <ShouldRender preserveSpace if={comments.length > 0}>
              {loadThreads()}
            </ShouldRender>
          </S.ScrollableContent>
        </S.ThreadsContainer>
      )}
    </S.ParentContainer>
  );
}
