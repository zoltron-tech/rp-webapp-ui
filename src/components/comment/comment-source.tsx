"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiFlagFill } from "react-icons/ri";
import {
  deleteCommentAction,
  reportPromptCommentReply,
} from "@/app/rp/thread/actions";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { MuseAvatar } from "../common/muse-avatar";
import { AppAlertDialog } from "../dialog";
import { AppDropdownMenu } from "../profile-more-dropdown";
import { useCommentState, useCommentStateSet } from "./comment.store";
import * as S from "./styled";

export const CommentSource: FC = () => {
  const commentId = useCommentState("id");
  const source = useCommentState("source");
  const createdOn = useCommentState("createdOn");
  const commentAlert = useCommentState("commentAlert");
  const setCommentState = useCommentStateSet();
  const { successToast, errorToast, warningToast } = useUIContext();
  const authState = useGlobalState("authState");
  const { emit } = useCustomEvents(EVENTS.COMMENT.base);

  const handleNotImplemented = useCallback(() => {
    warningToast("This feature is coming soon!");
  }, [warningToast]);

  const handleReportComment = useCallback(async () => {
    const response = await reportPromptCommentReply(commentId, "", "COMMENT");
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  }, [commentId, source, successToast, errorToast]);

  const handleDeleteComment = useCallback(async () => {
    const response = await deleteCommentAction(commentId);
    if (response?.message === API_MESSAGE.Success) {
      emit(EVENTS.COMMENT.DELETED, {
        id: commentId,
      });
      successToast(`Deleted successfully`);
    } else {
      errorToast("There was an issue while deleting this reply.");
    }
  }, [commentId, source, successToast, errorToast]);

  const handleOpenChange = useCallback(
    (type: typeof commentAlert) =>
      (open: boolean = false) => {
        if (!open) {
          setCommentState({ commentAlert: null });
          return;
        }

        setCommentState({ commentAlert: type });
      },
    [commentAlert, setCommentState],
  );

  return (
    <S.Source>
      <MuseAvatar
        museId={source.sourceId}
        image={source.image}
        name={source.name}
      />
      <S.Source.Info>
        <S.Source.Name>{source.name}</S.Source.Name>
        <S.Source.Time title={displayDate(createdOn)} dateTime={createdOn}>
          {toFormattedDate(createdOn)}
        </S.Source.Time>
      </S.Source.Info>
      <S.HeaderDropdownMenuContainer>
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
                onClick: () => handleOpenChange("report")(true),
                variant: "danger",
              },
              {
                icon: <FaRegTrashCan />,
                label: `Delete this thread`,
                onClick: () => handleOpenChange("delete")(true),
                variant: "danger",
              },
            ]}
          />
        </ShouldRender>
      </S.HeaderDropdownMenuContainer>
      <AppAlertDialog
        heading={`Report this reply?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={commentAlert === "report"}
        onOpenChange={handleOpenChange("report")}
        onConfirm={handleReportComment}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Delete this thread?`}
        text={`Deleting the prompt will remove all of it's threads and replies too. Are you sure you want to delete this reply?`}
        open={commentAlert === "delete"}
        onOpenChange={handleOpenChange("delete")}
        onConfirm={handleDeleteComment}
        actionButtonLabel="Delete"
      />
    </S.Source>
  );
};
