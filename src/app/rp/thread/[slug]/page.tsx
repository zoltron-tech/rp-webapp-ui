"use client";

import { Flex } from "@novelist-world/ui";
import { useParams } from "next/navigation";
import { Separator } from "radix-ui";
import { useCallback, useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { RiFlagFill } from "react-icons/ri";
import { ShouldRender } from "@/components/common";
import { MuseAvatar } from "@/components/common/muse-avatar";
import { NovelistAvatar } from "@/components/common/novelist-avatar";
import { AppAlertDialog } from "@/components/dialog";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import PromptInput from "@/components/prompt-input";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useBindPageLoader, usePageRouter } from "@/hooks/use-page-router";
import type { Comment, Reply } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { displayDate, toFormattedDate } from "@/utils/helpers";
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
  const { comment, loading: loadingComments } = useGetComment(commentId);
  const {
    replies,
    loading: loadingReplies,
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
  const { routeToPage } = usePageRouter();
  const { successToast, warningToast, errorToast } = useUIContext();
  useBindPageLoader(loadingComments || loadingReplies);

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
      errorToast("There was an issue while reporting this comment.");
    }
  };

  const handleNotImplemented = () => {
    warningToast("This feature is coming soon!");
  };

  const onAvatarClick = (sourceId: string | undefined) => {
    if (!sourceId) return;
    routeToPage(ROUTES.Muse.View(sourceId));
  };

  const onBackClick = () => {
    if (!comment?.prompt?.id) return;
    routeToPage(`${ROUTES.Prompt.View(comment.prompt.id)}?threadOpen=true`);
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
          <S.ReplyHeaderContainer>
            <ShouldRender if={reply?.source.sourceType === "MUSE"}>
              <MuseAvatar
                museId={reply?.source.sourceId || ""}
                image={reply?.source.image || ""}
                name={reply?.source.name || ""}
              />
            </ShouldRender>
            <ShouldRender if={reply?.source.sourceType === "NOVELIST"}>
              <NovelistAvatar
                username={reply?.source.urlProp || ""}
                image={reply?.source.image || ""}
                name={reply?.source.name || ""}
              />
            </ShouldRender>
            <S.SourceInfo>
              <S.SourceName>{reply?.source.name}</S.SourceName>
              <ShouldRender if={Boolean(reply?.createdOn)}>
                <S.PromptSubheader
                  title={reply?.createdOn ? displayDate(reply.createdOn) : ""}
                  dateTime={reply?.createdOn}
                >
                  {reply?.createdOn ? toFormattedDate(reply?.createdOn) : ""}
                </S.PromptSubheader>
              </ShouldRender>
            </S.SourceInfo>
          </S.ReplyHeaderContainer>

          <S.PromptText>{reply.text}</S.PromptText>
          {reply.media && (
            <S.MediaContainer>
              <ShouldRender
                if={reply?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <S.PromptVideo src={`${reply?.media}#t=0.3`} controls />
              </ShouldRender>
              <ShouldRender
                if={!reply?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <AppImageViewer src={reply?.media} alt="Reply media">
                  <S.PromptImage src={reply.media || ""} alt="image" />
                </AppImageViewer>
              </ShouldRender>
            </S.MediaContainer>
          )}
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
        text={`Deleting the prompt will remove all of its threads and replies too. Are you sure you want to delete this reply?`}
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
      <S.RepliesContainer>
        <S.HeaderContainer>
          <Flex>
            <IoArrowBackOutline
              size={15}
              onClick={() => onBackClick()}
              style={{ cursor: "pointer" }}
            />
            <ShouldRender if={comment?.prompt?.source.sourceType === "MUSE"}>
              <MuseAvatar
                museId={comment?.prompt?.source.sourceId || ""}
                image={comment?.prompt?.source.image || ""}
                name={comment?.prompt?.source.name || ""}
              />
            </ShouldRender>
            <ShouldRender
              if={comment?.prompt?.source.sourceType === "NOVELIST"}
            >
              <NovelistAvatar
                username={comment?.prompt?.source.urlProp || ""}
                image={comment?.prompt?.source.image || ""}
                name={comment?.prompt?.source.name || ""}
              />
            </ShouldRender>
            <S.SourceInfo>
              <S.SourceName>{comment?.prompt?.source.name}</S.SourceName>
              <ShouldRender if={Boolean(comment?.prompt?.createdOn)}>
                <S.PromptSubheader
                  title={
                    comment?.prompt?.createdOn
                      ? displayDate(comment?.prompt?.createdOn)
                      : ""
                  }
                  dateTime={comment?.prompt?.createdOn}
                >
                  {comment?.prompt?.createdOn
                    ? toFormattedDate(comment?.prompt?.createdOn)
                    : ""}
                </S.PromptSubheader>
              </ShouldRender>
            </S.SourceInfo>
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
        <Separator.Root className="separator" orientation="horizontal" />
        <Flex direction="column">
          <S.PromptText>{comment?.prompt?.text}</S.PromptText>
          {comment?.prompt?.media && (
            <S.MediaContainer>
              <ShouldRender
                if={comment?.prompt?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <S.PromptVideo
                  src={`${comment?.prompt?.media}#t=0.3`}
                  controls
                />
              </ShouldRender>
              <ShouldRender
                if={!comment?.prompt?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <AppImageViewer src={comment?.prompt?.media} alt="Prompt media">
                  <S.PromptImage
                    src={comment?.prompt?.media || ""}
                    alt="image"
                  />
                </AppImageViewer>
              </ShouldRender>
            </S.MediaContainer>
          )}
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
          <S.ReplyHeaderContainer>
            <ShouldRender if={comment?.source.sourceType === "MUSE"}>
              <MuseAvatar
                museId={comment?.source.sourceId || ""}
                image={comment?.source.image || ""}
                name={comment?.source.name || ""}
              />
            </ShouldRender>
            <ShouldRender if={comment?.source.sourceType === "NOVELIST"}>
              <NovelistAvatar
                username={comment?.source.urlProp || ""}
                image={comment?.source.image || ""}
                name={comment?.source.name || ""}
              />
            </ShouldRender>
            <S.SourceInfo>
              <S.SourceName>{comment?.source.name}</S.SourceName>
              <ShouldRender if={Boolean(comment?.createdOn)}>
                <S.PromptSubheader
                  title={
                    comment?.createdOn ? displayDate(comment.createdOn) : ""
                  }
                  dateTime={comment?.createdOn}
                >
                  {comment?.createdOn
                    ? toFormattedDate(comment?.createdOn)
                    : ""}
                </S.PromptSubheader>
              </ShouldRender>
            </S.SourceInfo>
          </S.ReplyHeaderContainer>
          <S.PromptText>{comment?.text}</S.PromptText>
          {comment?.media && (
            <S.MediaContainer>
              <ShouldRender
                if={comment?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <S.PromptVideo src={`${comment?.media}#t=0.3`} controls />
              </ShouldRender>
              <ShouldRender
                if={!comment?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <AppImageViewer src={comment?.media} alt="Comment media">
                  <S.PromptImage src={comment.media || ""} alt="image" />
                </AppImageViewer>
              </ShouldRender>
            </S.MediaContainer>
          )}
        </Flex>
        {loadReplies()}
        {authState === "LOGGED_IN" && (
          <>
            <Separator.Root className="separator" orientation="horizontal" />
            <PromptInput
              parentId={commentId}
              type="reply"
              onSend={refetchReplies}
            />
          </>
        )}
      </S.RepliesContainer>
    </S.ParentContainer>
  );
}
