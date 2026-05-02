"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FcCollaboration,
  FcComments,
  FcConferenceCall,
  FcExport,
  FcFaq,
  FcLibrary,
  FcMusic,
  FcSupport,
  FcVoicePresentation,
} from "react-icons/fc";
import { FiChevronRight, FiEdit2 } from "react-icons/fi";
import { sendFeedbackMessage } from "@/app/rp/profile/actions";
import { ShouldRender } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import { Flex } from "@/components/edit-muse-card/styles";
import { ContactSupportForm } from "@/components/user-menu";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { usePostLogout } from "@/hooks/use-post-logout";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

export default function UserMenuPage() {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const unreadReplyCount = useGlobalState("unreadReplyCount");
  const hasUnread = Boolean(
    unreadConversationIds?.length || (unreadReplyCount ?? 0) > 0,
  );
  const unreadCount = unreadConversationIds?.length ?? 0;
  const setGlobalState = useGlobalStoreSet();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showContactSupportAlert, setShowContactSupportAlert] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const { routeToPage, stopPageLoading } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const { handlePostLogout } = usePostLogout();

  useEffect(() => {
    if (authState === "LOGGED_IN") {
      stopPageLoading();
    }
  }, [authState, stopPageLoading]);

  const handleSendFeedbackMessage = async () => {
    const response = await sendFeedbackMessage(supportMessage.trim());
    if (response?.message === API_MESSAGE.Success) {
      successToast("Feedback sent successfully.");
    } else {
      errorToast(
        "There was an issue while sending feedback. Please contact at support@zoltrontech.com.",
      );
    }
  };

  const handleLogout = useCallback(async () => {
    await handlePostLogout();
  }, [handlePostLogout]);

  if (!user) return null;

  const displayName = novelist
    ? `${novelist.firstName} ${novelist.lastName}`.trim() || novelist.username
    : user.username;

  return (
    <S.Container>
      <AppAlertDialog
        heading="Logout?"
        text="Are you sure you want to logout?"
        open={showLogoutAlert}
        onOpenChange={setShowLogoutAlert}
        onConfirm={handleLogout}
        actionButtonLabel="Logout"
      />
      <AppAlertDialog
        heading="Contact Support"
        text="Send a message to support. We will try to get back to you via in-app notifications."
        body={
          <ContactSupportForm
            message={supportMessage}
            setMessage={setSupportMessage}
          />
        }
        open={showContactSupportAlert}
        onOpenChange={setShowContactSupportAlert}
        onConfirm={async () => {
          if (!supportMessage.trim()) return;
          await handleSendFeedbackMessage();
          setShowContactSupportAlert(false);
          setSupportMessage("");
        }}
        actionButtonLabel="Send message"
        actionColor="neutral"
        isConfirmDisabled={supportMessage.trim() === ""}
      />

      <S.UserHeader
        onClick={() => routeToPage(ROUTES.Profile.View(user.username).Index)}
      >
        <AvatarNew
          src={novelist?.image ?? null}
          alt={user.username}
          username={user.username}
        />
        <S.UserInfo>
          <S.UserName>{displayName}</S.UserName>
          <S.UserHandle>@{user.username}</S.UserHandle>
        </S.UserInfo>
        <S.EditButton
          onClick={(e) => {
            e.stopPropagation();
            routeToPage(ROUTES.Profile.Edit);
          }}
        >
          <FiEdit2 />
        </S.EditButton>
      </S.UserHeader>

      <ShouldRender if={authState === "LOGGED_IN"}>
        <S.Section>
          <S.MenuItem onClick={() => routeToPage(ROUTES.explore)}>
            <Flex justify="flex-start" align="center" gap="12px">
              <FcVoicePresentation />
              Explore
            </Flex>
            <FiChevronRight size={16} color="gray" />
          </S.MenuItem>
          <S.MenuItem onClick={() => routeToPage(ROUTES.outgoingThreads)}>
            <Flex justify="flex-start" align="center" gap="12px">
              <FcCollaboration />
              Interactions
            </Flex>
            <ShouldRender if={(unreadReplyCount ?? 0) > 0}>
              <S.UnreadBadge>
                {(unreadReplyCount ?? 0) > 99 ? "99+" : (unreadReplyCount ?? 0)}
              </S.UnreadBadge>
            </ShouldRender>
            <FiChevronRight size={16} color="gray" />
          </S.MenuItem>
        </S.Section>

        <S.Section>
          <S.MenuItem
            onClick={() =>
              routeToPage(ROUTES.Profile.View(novelist?.username || "").Muses)
            }
          >
            <Flex justify="flex-start" align="center" gap="12px">
              <FcConferenceCall />
              Characters
            </Flex>
            <FiChevronRight size={16} color="gray" />
          </S.MenuItem>
          <S.MenuItem onClick={() => routeToPage(ROUTES.conversations)}>
            <Flex justify="flex-start" align="center" gap="12px">
              <FcComments />
              Inbox
            </Flex>
            <ShouldRender if={(unreadConversationIds?.length ?? 0) > 0}>
              <S.UnreadBadge>
                {(unreadConversationIds?.length ?? 0) > 99
                  ? "99+"
                  : (unreadConversationIds?.length ?? 0)}
              </S.UnreadBadge>
            </ShouldRender>
            <FiChevronRight size={16} color="gray" />
          </S.MenuItem>
          <S.MenuItem
            onClick={() =>
              routeToPage(ROUTES.Profile.View(novelist?.username || "").Music)
            }
          >
            <Flex justify="flex-start" align="center" gap="12px">
              <FcMusic />
              Music
            </Flex>
            <FiChevronRight size={16} color="gray" />
          </S.MenuItem>
        </S.Section>
      </ShouldRender>

      <ShouldRender if={authState === "UNINITIALIZED"}>
        <S.Section>
          <S.MenuItem onClick={() => routeToPage(ROUTES.Onboarding)}>
            <Flex justify="flex-start" align="center" gap="12px">
              Onboarding
            </Flex>
            <FiChevronRight size={16} color="gray" />
          </S.MenuItem>
        </S.Section>
      </ShouldRender>

      <S.Section>
        <S.MenuItem onClick={() => routeToPage(ROUTES.Terms)}>
          <Flex justify="flex-start" align="center" gap="12px">
            <FcLibrary />
            Terms & conditions
          </Flex>
          <FiChevronRight size={16} color="gray" />
        </S.MenuItem>
        <S.MenuItem onClick={() => routeToPage(ROUTES.FAQs)}>
          <Flex justify="flex-start" align="center" gap="12px">
            <FcFaq />
            FAQs
          </Flex>
          <FiChevronRight size={16} color="gray" />
        </S.MenuItem>
        <S.MenuItem onClick={() => setShowContactSupportAlert(true)}>
          <Flex justify="flex-start" align="center" gap="12px">
            <FcSupport />
            Help & support
          </Flex>
          <FiChevronRight size={16} color="gray" />
        </S.MenuItem>
      </S.Section>

      <S.Section>
        <S.DestructiveMenuItem onClick={() => setShowLogoutAlert(true)}>
          <Flex justify="flex-start" align="center" gap="12px">
            <FcExport />
            Log out
          </Flex>
          <FiChevronRight size={16} color="gray" />
        </S.DestructiveMenuItem>
      </S.Section>
    </S.Container>
  );
}
