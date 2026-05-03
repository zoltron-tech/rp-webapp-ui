"use client";

import classNames from "classnames";
import { usePathname } from "next/navigation";
import { type FC, useCallback, useMemo, useState } from "react";
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
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { usePostLogout } from "@/hooks/use-post-logout";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { AvatarNew } from "../common/avatar-new";
import { AppAlertDialog } from "../dialog";
import { Flex } from "../edit-muse-card/styles";
import * as S from "./styles";

type UserMenuProps = {};

function checkIsMobile() {
  const minWidth = 768;
  return window.innerWidth < minWidth || screen.width < minWidth;
}

export const ContactSupportForm = ({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (val: string) => void;
}) => (
  <S.FormRoot
    onSubmit={(event) => {
      event.preventDefault(); // prevent default form submission
    }}
  >
    <S.FormField name="supportMessage">
      <S.FormLabel>
        Your message <span>{`(required)`}</span>
      </S.FormLabel>
      <S.FormControl asChild>
        <S.FormTextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
      </S.FormControl>
      <S.FormMessage>
        {"The team will get back to you ASAP. Check your inbox for updates."}
      </S.FormMessage>
    </S.FormField>
  </S.FormRoot>
);

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const unreadReplyCount = useGlobalState("unreadReplyCount");
  const hasUnread = Boolean(
    unreadConversationIds?.length || (unreadReplyCount ?? 0) > 0,
  );
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showContactSupportAlert, setShowContactSupportAlert] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const setGlobalState = useGlobalStoreSet();
  const [open, setOpen] = useState(false);
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const { handlePostLogout } = usePostLogout();
  const isMobile = useMemo(() => checkIsMobile(), []);
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    if (isMobile) {
      if (pathname === ROUTES.UserMenu) return;
      routeToPage(ROUTES.UserMenu);
      return;
    }
    toggleState(setOpen)();
  }, [isMobile, routeToPage, pathname]);

  const handleSendFeedbackMessage = async () => {
    const response = await sendFeedbackMessage(supportMessage.trim());
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Feedback sent successfully.`);
    } else {
      errorToast(
        "There was an issue while sending feedback Please contact at support@zoltrontech.com.",
      );
    }
  };

  const handleLogout = useCallback(async () => {
    toggleState(setOpen)();
    await handlePostLogout();
  }, [handlePostLogout]);

  const toOnboarding = () => {
    routeToPage(ROUTES.Onboarding);
  };

  const toEditProfile = () => {
    routeToPage(ROUTES.Profile.Edit, {
      skipLoading: true,
    });
  };

  const toMusesPage = () => {
    routeToPage(ROUTES.Profile.View(novelist?.username || "").Muses);
  };

  const toMusicPage = () => {
    routeToPage(ROUTES.Profile.View(novelist?.username || "").Music);
  };

  const toStoryBoardsPage = () => {
    routeToPage(ROUTES.Profile.View(novelist?.username || "").Storyboards);
  };

  const toOutgoingThreadsPage = () => {
    routeToPage(ROUTES.outgoingThreads);
  };

  const toExplorePage = () => {
    routeToPage(ROUTES.explore);
  };

  const toConversationsPage = () => {
    routeToPage(ROUTES.conversations);
  };

  const toUserProfile = () => {
    routeToPage(ROUTES.Profile.View(user?.username || "").Index);
  };

  const toTermsAndConditionsPage = () => {
    routeToPage(ROUTES.Terms);
  };

  const toFAQsPage = () => {
    routeToPage(ROUTES.FAQs);
  };

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <AppAlertDialog
        heading={`Logout?`}
        text={`Are you sure you want to logout?`}
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
          if (!supportMessage.trim()) return; // validation
          await handleSendFeedbackMessage();
          setShowContactSupportAlert(false); // close dialog
          setSupportMessage(""); // reset message
        }}
        actionButtonLabel="Send message"
        actionColor="neutral"
        isConfirmDisabled={supportMessage.trim() === ""}
      />

      <S.ContentContainer onClick={handleClick}>
        <S.AvatarWrapper>
          <AvatarNew
            className="selectable"
            src={novelist?.image ?? null}
            alt={user?.username || "User Avatar"}
            username={user?.username}
          />
          <ShouldRender if={hasUnread}>
            <S.UnreadDot>
              {(unreadConversationIds?.length ?? 0) + (unreadReplyCount ?? 0) >
              99
                ? "99+"
                : (unreadConversationIds?.length ?? 0) +
                  (unreadReplyCount ?? 0)}
            </S.UnreadDot>
          </ShouldRender>
        </S.AvatarWrapper>
        <S.Menu className={classNames({ open })}>
          <S.MenuUserHeader onClick={toUserProfile}>
            <AvatarNew
              src={novelist?.image ?? null}
              alt={user?.username || "User Avatar"}
              username={user?.username}
            />
            <S.MenuUserInfo>
              <S.MenuUserName>
                {novelist
                  ? `${novelist.firstName} ${novelist.lastName}`.trim() ||
                    novelist.username
                  : user.username}
              </S.MenuUserName>
              <S.MenuUserHandle>@{user.username}</S.MenuUserHandle>
            </S.MenuUserInfo>
            <S.MenuEditButton
              onClick={(e) => {
                e.stopPropagation();
                toEditProfile();
              }}
            >
              <FiEdit2 />
            </S.MenuEditButton>
          </S.MenuUserHeader>
          <S.Separator />
          <ShouldRender if={authState === "LOGGED_IN"}>
            <S.List>
              <S.Element onClick={toExplorePage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FcVoicePresentation />
                  Explore
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Element onClick={toOutgoingThreadsPage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FcCollaboration />
                  Interactions
                </Flex>
                <ShouldRender if={(unreadReplyCount ?? 0) > 0}>
                  <S.UnreadBadge>
                    {(unreadReplyCount ?? 0) > 99
                      ? "99+"
                      : (unreadReplyCount ?? 0)}
                  </S.UnreadBadge>
                </ShouldRender>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Separator />
              <S.Element onClick={toMusesPage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FcConferenceCall />
                  Characters
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Element onClick={toConversationsPage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FcComments />
                  Inbox
                </Flex>
                <ShouldRender if={(unreadConversationIds?.length ?? 0) > 0}>
                  <S.UnreadBadge>
                    {(unreadConversationIds?.length ?? 0) > 99
                      ? "99+"
                      : unreadConversationIds?.length}
                  </S.UnreadBadge>
                </ShouldRender>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Element onClick={toMusicPage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FcMusic />
                  Music
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
            </S.List>
          </ShouldRender>
          <ShouldRender if={authState === "UNINITIALIZED"}>
            <S.List onClick={toOnboarding}>
              <S.Element>
                <Flex justify="flex-start" align="center" gap="12px">
                  Onboarding
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
            </S.List>
          </ShouldRender>

          <S.List>
            <S.Separator />
            <S.Element onClick={toTermsAndConditionsPage}>
              <Flex justify="flex-start" align="center" gap="12px">
                <FcLibrary />
                Terms & conditions
              </Flex>
              <FiChevronRight size={16} color="gray" />
            </S.Element>
            <S.Element onClick={toFAQsPage}>
              <Flex justify="flex-start" align="center" gap="12px">
                <FcFaq />
                FAQs
              </Flex>
              <FiChevronRight size={16} color="gray" />
            </S.Element>
            <S.Element onClick={() => setShowContactSupportAlert(true)}>
              <Flex justify="flex-start" align="center" gap="12px">
                <FcSupport />
                Help & support
              </Flex>
              <FiChevronRight size={16} color="gray" />
            </S.Element>
          </S.List>
          <S.Separator />
          <S.List>
            <S.DeleteElement onClick={() => setShowLogoutAlert(true)}>
              <Flex justify="flex-start" align="center" gap="12px">
                <FcExport />
                Log out
              </Flex>
              <FiChevronRight size={16} color="gray" />
            </S.DeleteElement>
          </S.List>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
