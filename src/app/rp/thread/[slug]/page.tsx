"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { RiFlagFill } from "react-icons/ri";
import { ShouldRender } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import { PageLoader } from "@/components/layout";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import PromptInput from "@/components/prompt-input";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type { Comment, Reply } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import {
  deleteCommentAction,
  deletePromptAction,
  deleteReplyAction,
  getCommentAction,
  getRepliesAction,
  reportPromptCommentReply,
} from "../actions";
import * as S from "./styles";

const useGetComment = (commentId: string) => {
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchComment = useCallback(async () => {
    setLoading(true);
    const _comment = await getCommentAction(commentId);

    if (!_comment || "message" in _comment) {
      setLoading(false);
      return;
    }
    setComment(_comment);
    setLoading(false);
  }, [commentId]);

  useEffect(() => {
    fetchComment();
  }, [fetchComment]);

  return { comment, loading, refetch: fetchComment };
};

const useGetReplies = (commentId: string) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    const _replies = await getRepliesAction(commentId);

    if (!_replies || "message" in _replies) {
      setLoading(false);
      return;
    }
    setReplies(_replies);
    setLoading(false);
  }, [commentId]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  return { loading, refetch: fetchReplies, replies, setReplies };
};

export default function ThreadPage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const commentId = params?.slug as string;
  const { comment, loading } = useGetComment(commentId);
  const {
    replies,
    loading: repliesLoading,
    refetch: refetchReplies,
    setReplies,
  } = useGetReplies(commentId);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showDeleteCommentAlert, setShowDeleteCommentAlert] = useState(false);
  const [showReportCommentAlert, setShowReportCommentAlert] = useState(false);
  const [showDeletePromptAlert, setShowDeletePromptAlert] = useState(false);
  const [showReportPromptAlert, setShowReportPromptAlert] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState("");
  const { push } = useRouter();
  const { successToast, warningToast, errorToast } = useUIContext();

  const handleReportPrompt = async () => {
    if (!comment?.prompt?.id) return;

    const response = await reportPromptCommentReply(
      comment?.prompt?.id,
      "",
      "PROMPT",
    );
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  };

  const handleReportReply = async () => {
    if (!selectedReplyId || selectedReplyId === "") return;

    const response = await reportPromptCommentReply(
      selectedReplyId,
      "",
      "REPLY",
    );
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedReplyId || selectedReplyId === "") return;

    const response = await deleteReplyAction(selectedReplyId);
    if (response?.message === API_MESSAGE.Success) {
      setReplies((prev) => prev.filter((r) => r.id !== selectedReplyId));
      successToast(`Deleted successfully`);
    } else {
      errorToast("There was an issue while deleting this reply.");
    }
  };

  const handleDeleteComment = async () => {
    if (!comment?.id) return;

    const response = await deleteCommentAction(comment.id);
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Deleted successfully`);
      onBackClick();
    } else {
      errorToast("There was an issue while deleting this reply.");
    }
  };

  const handleDeletePrompt = async () => {
    if (!comment?.prompt?.id) return;

    const response = await deletePromptAction(comment.prompt.id);
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Deleted successfully`);
      onAvatarClick(comment.prompt.source.sourceId);
    } else {
      errorToast("There was an issue while deleting this reply.");
    }
  };

  const handleReportComment = async () => {
    if (!comment?.id) return;

    const response = await reportPromptCommentReply(comment?.id, "", "COMMENT");
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  };

  const handleNotImplemented = () => {
    warningToast("This feature is coming soon!");
  };

  const onAvatarClick = (sourceId: string | undefined) => {
    if (!sourceId) return;
    push(ROUTES.Muse.View(sourceId));
  };

  const onBackClick = () => {
    if (!comment?.prompt?.id) return;
    push(`${ROUTES.Prompt.View(comment.prompt.id)}?threadOpen=true`);
  };

  const loadReplies = () => {
    return [...replies].reverse().map((reply) => (
      <>
        <Flex
          direction="column"
          gap={0}
          style={{ marginBottom: "10px", position: "relative" }}
        >
          <S.DropdownMenuContainer>
            <ShouldRender if={authState === "LOGGED_IN"}>
              <AppDropdownMenu
                trigger={<BsThreeDots size={18} />}
                items={[
                  {
                    icon: <FaRegEdit />,
                    label: `Edit reply`,
                    onClick: handleNotImplemented,
                  },
                  {
                    separator: true,
                  },
                  {
                    icon: <RiFlagFill />,
                    label: `Report this reply`,
                    onClick: () => {
                      setShowReportAlert(true);
                      setSelectedReplyId(reply.id);
                    },
                    variant: "danger",
                  },
                  {
                    icon: <FaRegTrashCan />,
                    label: `Delete this reply`,
                    onClick: () => {
                      setShowDeleteAlert(true);
                      setSelectedReplyId(reply.id);
                    },
                    variant: "danger",
                  },
                ]}
              />
            </ShouldRender>
          </S.DropdownMenuContainer>
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
            <S.StyledDate>{toFormattedDate(reply.createdOn)}</S.StyledDate>
          </Flex>
        </Flex>
      </>
    ));
  };

  return (
    <S.ParentContainer>
      <AppAlertDialog
        heading={`Report this prompt?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportPromptAlert}
        onOpenChange={setShowReportPromptAlert}
        onConfirm={handleReportPrompt}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Delete this prompt?`}
        text={`Deleting the prompt will remove all of it's threads and replies too. Are you sure you want to delete this reply?`}
        open={showDeletePromptAlert}
        onOpenChange={setShowDeletePromptAlert}
        onConfirm={handleDeletePrompt}
        actionButtonLabel="Delete"
      />
      <AppAlertDialog
        heading={`Report this reply?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportCommentAlert}
        onOpenChange={setShowReportCommentAlert}
        onConfirm={handleReportComment}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Delete this reply?`}
        text={`Deleting this will remove all of the subsequent replies. Are you sure you want to delete this reply?`}
        open={showDeleteCommentAlert}
        onOpenChange={setShowDeleteCommentAlert}
        onConfirm={handleDeleteComment}
        actionButtonLabel="Delete"
      />
      <AppAlertDialog
        heading={`Report this reply?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportAlert}
        onOpenChange={setShowReportAlert}
        onConfirm={handleReportReply}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Delete this reply?`}
        text={`This action is permanent. Are you sure you want to delete this reply?`}
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDeleteReply}
        actionButtonLabel="Delete"
      />
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
          <S.HeaderDropdownMenuContainer>
            <ShouldRender if={authState === "LOGGED_IN"}>
              <AppDropdownMenu
                trigger={<BsThreeDots size={18} />}
                items={[
                  {
                    icon: <FaRegEdit />,
                    label: `Edit prompt`,
                    onClick: handleNotImplemented,
                  },
                  {
                    separator: true,
                  },
                  {
                    icon: <RiFlagFill />,
                    label: `Report this prompt`,
                    onClick: () => setShowReportPromptAlert(true),
                    variant: "danger",
                  },
                  {
                    icon: <FaRegTrashCan />,
                    label: `Delete this prompt`,
                    onClick: () => setShowDeletePromptAlert(true),
                    variant: "danger",
                  },
                ]}
              />
            </ShouldRender>
          </S.HeaderDropdownMenuContainer>
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
            <S.StyledDate>
              {toFormattedDate(comment?.prompt?.createdOn)}
            </S.StyledDate>
          </Flex>
        </Flex>
        <Flex
          direction="column"
          style={{ marginBottom: "10px", position: "relative" }}
        >
          <S.DropdownMenuContainer>
            <ShouldRender if={authState === "LOGGED_IN"}>
              <AppDropdownMenu
                trigger={<BsThreeDots size={18} />}
                items={[
                  {
                    icon: <FaRegEdit />,
                    label: `Edit reply`,
                    onClick: handleNotImplemented,
                  },
                  {
                    separator: true,
                  },
                  {
                    icon: <RiFlagFill />,
                    label: `Report this reply`,
                    onClick: () => setShowReportCommentAlert(true),
                    variant: "danger",
                  },
                  {
                    icon: <FaRegTrashCan />,
                    label: `Delete this reply`,
                    onClick: () => setShowDeleteCommentAlert(true),
                    variant: "danger",
                  },
                ]}
              />
            </ShouldRender>
          </S.DropdownMenuContainer>
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
            style={{ marginBottom: "20px", width: "70%" }}
          >
            <div></div>
            <S.StyledDate>{toFormattedDate(comment?.createdOn)}</S.StyledDate>
          </Flex>
        </Flex>
        {loadReplies()}
        {authState === "LOGGED_IN" && (
          <PromptInput
            muses={novelist?.muses || []}
            parentId={commentId}
            type="reply"
            onSend={refetchReplies}
          />
        )}
      </S.RepliesContainer>
    </S.ParentContainer>
  );
}
