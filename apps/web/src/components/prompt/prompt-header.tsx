"use client";

import { REPORT_SENT_TOAST } from "@/utils/report";
import { Flex, ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { RiFlagFill } from "react-icons/ri";
import { deletePromptAction, reportAction } from "@/app/rp/thread/actions";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { AvatarNew } from "../common/avatar-new";
import { MuseAvatar } from "../common/muse-avatar";
import { NovelistAvatar } from "../common/novelist-avatar";
import { PrivacyIcon } from "../common/privacy-icon";
import { AppAlertDialog } from "../dialog";
import { AppDropdownMenuResponsive } from "../profile-more-dropdown";
import { SharedWithDialog } from "../shared-with-dialog";
import { UpdatePromptForm, type UpdatePromptProps } from "../update-prompt";
import { usePromptState, usePromptStateSet } from "./prompt.store";
import { SharePromptDialog } from "./share-prompt-dialog";
import * as S from "./styled";

type PromptHeaderProps = {};

const PRIVACY_LABEL = {
  CUSTOM: "Custom",
  FRIENDS: "Friends",
  ONLY_ME: "Only me",
  PUBLIC: "Public",
} as const;

export const PromptHeader: FC<PromptHeaderProps> = () => {
  const promptId = usePromptState("id");
  const promptText = usePromptState("text");
  const promptMedia = usePromptState("media");
  const createdOn = usePromptState("createdOn");
  const privacy = usePromptState("privacy");
  const privacySelectedFriends = usePromptState("sharedWith");
  const [showPrivacySelectedFriends, setShowPrivacySelectedFriends] =
    useState(false);
  const promptAlert = usePromptState("promptAlert");
  const source = usePromptState("source");
  const novelist = useGlobalState("novelist");
  const isOwner =
    novelist?.muses.some((muse) => muse.id === source.sourceId) ||
    source.sourceId === novelist?.id;
  const setPromptState = usePromptStateSet();
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast, warningToast } = useUIContext();
  const authState = useGlobalState("authState");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditPromptAlert, setShowEditPromptAlert] = useState(false);
  const [editPromptPayload, setEditPromptPayload] =
    useState<UpdatePromptProps["payload"]>(null);
  const [editPromptType, setEditPromptType] =
    useState<UpdatePromptProps["type"]>("prompt");

  const handleReportPrompt = useCallback(async () => {
    if (!promptId) return;

    const response = await reportAction(promptId, "", "PROMPT");
    if (response?.message === API_MESSAGE.Success) {
      setPromptState({ promptAlert: null });
      successToast(REPORT_SENT_TOAST);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  }, [promptId, setPromptState, successToast, errorToast]);

  const handleDeletePrompt = useCallback(async () => {
    if (!promptId) return;

    const response = await deletePromptAction(promptId);
    if (response?.message === API_MESSAGE.Success) {
      setPromptState({ promptAlert: null });
      successToast("Prompt deleted.");
      // OOC posts belong to the novelist, so land on their profile rather
      // than a (non-existent) muse page.
      if (source.sourceType === "NOVELIST") {
        routeToPage(
          source.urlProp
            ? ROUTES.Profile.View(source.urlProp).Index
            : ROUTES.Home,
        );
      } else {
        routeToPage(ROUTES.Muse.View(source.sourceId));
      }
    } else {
      errorToast("There was an issue while deleting this prompt.");
    }
  }, [promptId, source, routeToPage, successToast, errorToast, setPromptState]);

  const shareItem = {
    icon: <IoIosShareAlt />,
    label: "Share to Community",
    onClick: () => setShowShareDialog(true),
  };

  const dropdownItems = isOwner
    ? [
        shareItem,
        {
          separator: true,
        },
        {
          icon: <FaRegEdit />,
          label: "Edit prompt",
          onClick: () => {
            setEditPromptPayload({
              id: promptId,
              text: promptText,
            });
            setEditPromptType("prompt");
            setShowEditPromptAlert(true);
          },
        },
        {
          separator: true,
        },
        {
          icon: <FaRegTrashCan />,
          label: "Delete this prompt",
          onClick: () => handleOpenChange("delete")(true),
          variant: "danger" as const,
        },
      ]
    : [
        shareItem,
        {
          separator: true,
        },
        {
          icon: <RiFlagFill />,
          label: "Report this prompt",
          onClick: () => handleOpenChange("report")(true),
          variant: "danger" as const,
        },
      ];

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
      <SharedWithDialog
        friends={privacySelectedFriends}
        open={showPrivacySelectedFriends}
        onClose={() => setShowPrivacySelectedFriends(false)}
      />

      <SharePromptDialog
        promptId={promptId ?? ""}
        prompt={{
          createdOn,
          media: promptMedia,
          source,
          text: promptText,
        }}
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />

      <UpdatePromptForm
        type={editPromptType}
        payload={editPromptPayload}
        open={showEditPromptAlert}
        setOpen={setShowEditPromptAlert}
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
      <S.SourceInfo>
        <S.NameRow>
          <S.SourceName>{source.name}</S.SourceName>
          <S.RoleTag $muse={source.sourceType === "MUSE"}>
            {source.sourceType === "MUSE" ? "Muse" : "Novelist"}
          </S.RoleTag>
        </S.NameRow>
        <S.PromptSubheader title={displayDate(createdOn)} dateTime={createdOn}>
          <span>{toFormattedDate(createdOn)}</span>
          <S.DotSep />
          <S.PrivacyChip
            $clickable={privacy === "CUSTOM"}
            onClick={
              privacy === "CUSTOM"
                ? () => setShowPrivacySelectedFriends(true)
                : undefined
            }
          >
            <PrivacyIcon privacy={privacy} />
            <span className="privacy-label">{PRIVACY_LABEL[privacy]}</span>
          </S.PrivacyChip>
          <ShouldRender if={privacy === "CUSTOM"}>
            <Flex
              style={{ alignItems: "center", gap: "0.25rem" }}
              onClick={() => setShowPrivacySelectedFriends(true)}
            >
              {privacySelectedFriends.slice(0, 2).map((friend) => (
                <AvatarNew
                  className="privacyAvatar"
                  key={friend.id}
                  src={friend.image}
                  alt={friend.username}
                  onClick={() => setShowPrivacySelectedFriends(true)}
                />
              ))}
              <S.privacyAvatarMoreIcon
                onClick={() => setShowPrivacySelectedFriends(true)}
              >
                <PiDotsThreeOutlineFill />
              </S.privacyAvatarMoreIcon>
            </Flex>
          </ShouldRender>
        </S.PromptSubheader>
      </S.SourceInfo>

      <S.HeaderDropdownMenuContainer>
        <ShouldRender if={authState === "LOGGED_IN"}>
          <AppDropdownMenuResponsive
            trigger={<BsThreeDots size={18} />}
            items={dropdownItems}
          />
        </ShouldRender>
      </S.HeaderDropdownMenuContainer>
      <AppAlertDialog
        closeOnConfirm
        heading={`Report this prompt?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={promptAlert === "report"}
        onOpenChange={handleOpenChange("report")}
        onConfirm={handleReportPrompt}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        closeOnConfirm
        heading={`Delete this prompt?`}
        text={`Deleting the prompt will remove all of its threads and replies too. Are you sure you want to delete this prompt?`}
        open={promptAlert === "delete"}
        onOpenChange={handleOpenChange("delete")}
        onConfirm={handleDeletePrompt}
        actionButtonLabel="Delete"
      />
    </S.PromptHeaderRoot>
  );
};
