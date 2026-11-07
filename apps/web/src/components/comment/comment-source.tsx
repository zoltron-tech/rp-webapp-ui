"use client";

import { REPORT_SENT_TOAST } from "@/utils/report";
import { ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  RiArrowGoBackLine,
  RiCheckboxCircleLine,
  RiFlagFill,
} from "react-icons/ri";
import {
  concludeCommentAction,
  deleteCommentAction,
  reportAction,
} from "@/app/rp/thread/actions";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { MuseAvatar } from "../common/muse-avatar";
import { NovelistAvatar } from "../common/novelist-avatar";
import { AppAlertDialog } from "../dialog";
import { AppDropdownMenuResponsive } from "../profile-more-dropdown";
import { UpdatePromptForm, type UpdatePromptProps } from "../update-prompt";
import { useCommentState, useCommentStateSet } from "./comment.store";
import * as S from "./styled";

export const CommentSource: FC = () => {
  const commentId = useCommentState("id");
  const commentText = useCommentState("text");
  const source = useCommentState("source");
  const createdOn = useCommentState("createdOn");
  const concluded = useCommentState("concluded");
  const commentAlert = useCommentState("commentAlert");
  const isPromptOwner = useCommentState("isPromptOwner");
  const setCommentState = useCommentStateSet();
  const { successToast, errorToast, warningToast } = useUIContext();
  const authState = useGlobalState("authState");
  const { emit } = useCustomEvents(EVENTS.COMMENT.base);
  const [showEditCommentAlert, setShowEditCommentAlert] = useState(false);
  const [editCommentPayload, setEditCommentPayload] =
    useState<UpdatePromptProps["payload"]>(null);
  const [editCommentType, setEditCommentType] =
    useState<UpdatePromptProps["type"]>("comment");

  const novelist = useGlobalState("novelist");
  const isOwner =
    novelist?.muses.some((muse) => muse.id === source.sourceId) ||
    source.sourceId === novelist?.id;
  const canConclude = isOwner || isPromptOwner;

  const handleReportComment = useCallback(async () => {
    const response = await reportAction(commentId, "", "COMMENT");
    if (response?.message === API_MESSAGE.Success) {
      setCommentState({ commentAlert: null });
      successToast(REPORT_SENT_TOAST);
    } else {
      errorToast("There was an issue while reporting this comment.");
    }
  }, [commentId, source, setCommentState, successToast, errorToast]);

  const handleToggleConcluded = useCallback(async () => {
    const next = !concluded;
    const response = await concludeCommentAction(commentId, next);
    if (response?.message === API_MESSAGE.Success) {
      setCommentState({ concluded: next });
      successToast(next ? `Thread marked as concluded` : `Thread reopened`);
    } else {
      errorToast("There was an issue while updating this thread.");
    }
  }, [commentId, concluded, setCommentState, successToast, errorToast]);

  const handleDeleteComment = useCallback(async () => {
    const response = await deleteCommentAction(commentId);
    if (response?.message === API_MESSAGE.Success) {
      emit(EVENTS.COMMENT.DELETED, {
        id: commentId,
      });
      successToast(`Deleted successfully`);
    } else {
      errorToast("There was an issue while deleting this comment.");
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

  const concludeItem = {
    icon: concluded ? <RiArrowGoBackLine /> : <RiCheckboxCircleLine />,
    label: concluded ? "Reopen thread" : "Mark as concluded",
    onClick: handleToggleConcluded,
  };
  const reportItem = {
    icon: <RiFlagFill />,
    label: "Report this reply",
    onClick: () => handleOpenChange("report")(true),
    variant: "danger" as const,
  };

  const dropdownItems = isOwner
    ? [
        {
          icon: <FaRegEdit />,
          label: "Edit reply",
          onClick: () => {
            setEditCommentPayload({
              id: commentId,
              text: commentText,
            });
            setEditCommentType("comment");
            setShowEditCommentAlert(true);
          },
        },
        concludeItem,
        {
          separator: true,
        },
        {
          icon: <FaRegTrashCan />,
          label: "Delete this reply",
          onClick: () => handleOpenChange("delete")(true),
          variant: "danger" as const,
        },
      ]
    : canConclude
      ? [concludeItem, { separator: true }, reportItem]
      : [reportItem];

  return (
    <S.Source>
      <UpdatePromptForm
        type={editCommentType}
        payload={editCommentPayload}
        open={showEditCommentAlert}
        setOpen={setShowEditCommentAlert}
      />
      <ShouldRender if={source.sourceType === "MUSE"}>
        <MuseAvatar
          museId={source.sourceId}
          image={source.image}
          name={source.name}
          avatar={source.avatar}
          useAccent={source.useAccent}
          accent={source.accent}
        />
      </ShouldRender>
      <ShouldRender if={source.sourceType === "NOVELIST"}>
        <NovelistAvatar
          username={source.urlProp}
          image={source.image}
          name={source.name}
          avatar={source.avatar}
          useAccent={source.useAccent}
          accent={source.accent}
        />
      </ShouldRender>
      <S.Source.Info>
        <S.Source.Name>{source.name}</S.Source.Name>
        <S.Source.Time title={displayDate(createdOn)} dateTime={createdOn}>
          {toFormattedDate(createdOn)}
        </S.Source.Time>
        <ShouldRender if={concluded}>
          <S.ConcludedChip>
            <RiCheckboxCircleLine size={13} />
            Concluded
          </S.ConcludedChip>
        </ShouldRender>
      </S.Source.Info>
      <S.HeaderDropdownMenuContainer>
        <ShouldRender if={authState === "LOGGED_IN"}>
          <AppDropdownMenuResponsive
            trigger={<BsThreeDots size={18} />}
            items={dropdownItems}
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
        text={`Deleting the prompt will remove all of its threads and replies too. Are you sure you want to delete this reply?`}
        open={commentAlert === "delete"}
        onOpenChange={handleOpenChange("delete")}
        onConfirm={handleDeleteComment}
        actionButtonLabel="Delete"
      />
    </S.Source>
  );
};
