"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiFlagFill } from "react-icons/ri";
import {
  deletePromptAction,
  reportPromptCommentReply,
} from "@/app/rp/thread/actions";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { MuseAvatar } from "../common/muse-avatar";
import { PrivacyIcon } from "../common/privacy-icon";
import { AppAlertDialog } from "../dialog";
import { AppDropdownMenu } from "../profile-more-dropdown";
import { usePromptState, usePromptStateSet } from "./prompt.store";
import * as S from "./styled";

type PromptHeaderProps = {};

export const PromptHeader: FC<PromptHeaderProps> = () => {
  const promptId = usePromptState("id");
  const source = usePromptState("source");
  const createdOn = usePromptState("createdOn");
  const privacy = usePromptState("privacy");
  const promptAlert = usePromptState("promptAlert");
  const setPromptState = usePromptStateSet();
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast, warningToast } = useUIContext();
  const authState = useGlobalState("authState");

  const handleNotImplemented = useCallback(() => {
    warningToast("This feature is coming soon!");
  }, [warningToast]);

  const handleReportPrompt = useCallback(async () => {
    if (!promptId) return;

    const response = await reportPromptCommentReply(promptId, "", "PROMPT");
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  }, [promptId, successToast, errorToast]);

  const handleDeletePrompt = useCallback(async () => {
    if (!promptId) return;

    const response = await deletePromptAction(promptId);
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Deleted successfully`);
      routeToPage(ROUTES.Muse.View(source.sourceId));
    } else {
      errorToast("There was an issue while deleting this reply.");
    }
  }, [promptId, source, routeToPage, successToast, errorToast]);

  const handleOpenChange = useCallback(
    (type: typeof promptAlert) =>
      (open: boolean = false) => {
        if (!open) {
          setPromptState({ promptAlert: null });
          return;
        }

        setPromptState({ promptAlert: type });
      },
    [promptAlert, setPromptState],
  );

  return (
    <S.PromptHeaderRoot>
      <MuseAvatar
        museId={source.sourceId}
        image={source.image}
        name={source.name}
      />
      <S.SourceInfo>
        <S.SourceName>{source.name}</S.SourceName>
        <S.PromptSubheader title={displayDate(createdOn)} dateTime={createdOn}>
          {toFormattedDate(createdOn)}
          <PrivacyIcon privacy={privacy} />
        </S.PromptSubheader>
      </S.SourceInfo>

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
                onClick: () => handleOpenChange("report")(true),
                variant: "danger",
              },
              {
                icon: <FaRegTrashCan />,
                label: `Delete this prompt`,
                onClick: () => handleOpenChange("delete")(true),
                variant: "danger",
              },
            ]}
          />
        </ShouldRender>
      </S.HeaderDropdownMenuContainer>
      <AppAlertDialog
        heading={`Report this prompt?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={promptAlert === "report"}
        onOpenChange={handleOpenChange("report")}
        onConfirm={handleReportPrompt}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Delete this prompt?`}
        text={`Deleting the prompt will remove all of it's threads and replies too. Are you sure you want to delete this reply?`}
        open={promptAlert === "delete"}
        onOpenChange={handleOpenChange("delete")}
        onConfirm={handleDeletePrompt}
        actionButtonLabel="Delete"
      />
    </S.PromptHeaderRoot>
  );
};
