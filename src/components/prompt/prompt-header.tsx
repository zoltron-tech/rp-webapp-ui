"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import { type FC, useCallback, useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";
import { PiDotsThreeCircleFill, PiDotsThreeOutlineFill } from "react-icons/pi";
import { RiFlagFill } from "react-icons/ri";
import { deletePromptAction, reportAction } from "@/app/rp/thread/actions";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import {
  displayDate,
  getFileNameFromUrl,
  toFormattedDate,
} from "@/utils/helpers";
import { AvatarNew } from "../common/avatar-new";
import { MuseAvatar } from "../common/muse-avatar";
import { NovelistAvatar } from "../common/novelist-avatar";
import { PrivacyIcon } from "../common/privacy-icon";
import { AppAlertDialog } from "../dialog";
import { FriendsList } from "../friends-list";
import { InlineMusicPlayer } from "../inline-music-player/page";
import { AppDropdownMenu } from "../profile-more-dropdown";
import { UpdatePromptForm, type UpdatePromptProps } from "../update-prompt";
import { usePromptState, usePromptStateSet } from "./prompt.store";
import * as S from "./styled";

type PromptHeaderProps = {};

export const PromptHeader: FC<PromptHeaderProps> = () => {
  const promptId = usePromptState("id");
  const promptText = usePromptState("text");
  const promptSong = usePromptState("song");
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
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  }, [promptId, setPromptState, successToast, errorToast]);

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

  const dropdownItems = isOwner
    ? [
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
      <AppAlertDialog
        heading={`Shared with`}
        text={`Share with friends`}
        body={<FriendsList friends={privacySelectedFriends} />}
        open={showPrivacySelectedFriends}
        onOpenChange={setShowPrivacySelectedFriends}
        onCancel={() => setShowPrivacySelectedFriends(false)}
        onConfirm={() => {
          setShowPrivacySelectedFriends(false);
        }}
        closeButtonText="Cancel"
        actionButtonLabel="Ok"
        actionColor="neutral"
        isCancelHidden={true}
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
        />
      </ShouldRender>
      <ShouldRender if={source.sourceType === "NOVELIST"}>
        <NovelistAvatar
          username={source.urlProp}
          image={source.image}
          name={source.name}
        />
      </ShouldRender>
      <S.SourceInfo>
        <S.SourceName>{source.name}</S.SourceName>
        <S.PromptSubheader title={displayDate(createdOn)} dateTime={createdOn}>
          {toFormattedDate(createdOn)}
          <Flex
            style={{
              alignItems: "center",
              gap: "0.3rem",
              justifyContent: "flex-start",
            }}
          >
            <Flex
              onClick={
                privacy === "CUSTOM"
                  ? () => setShowPrivacySelectedFriends(true)
                  : () => {}
              }
              style={{ cursor: "pointer" }}
            >
              <PrivacyIcon privacy={privacy} />
            </Flex>
            <ShouldRender if={privacy === "CUSTOM"}>
              <IoIosShareAlt
                onClick={() => setShowPrivacySelectedFriends(true)}
                style={{ cursor: "pointer" }}
              />
              {privacySelectedFriends.slice(0, 2).map((friend) => (
                <>
                  <AvatarNew
                    className="privacyAvatar"
                    key={friend.id}
                    src={friend.image}
                    alt={friend.username}
                    onClick={() => setShowPrivacySelectedFriends(true)}
                  />
                </>
              ))}
              <S.privacyAvatarMoreIcon
                onClick={() => setShowPrivacySelectedFriends(true)}
              >
                <PiDotsThreeOutlineFill />
              </S.privacyAvatarMoreIcon>
            </ShouldRender>
          </Flex>
          <ShouldRender
            if={
              promptSong !== undefined &&
              promptSong !== null &&
              promptSong.length > 0
            }
          >
            <InlineMusicPlayer
              url={promptSong || ""}
              name={getFileNameFromUrl(promptSong || "")}
            />
          </ShouldRender>
        </S.PromptSubheader>
      </S.SourceInfo>

      <S.HeaderDropdownMenuContainer>
        <ShouldRender if={authState === "LOGGED_IN"}>
          <AppDropdownMenu
            trigger={<BsThreeDots size={18} />}
            items={dropdownItems}
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
