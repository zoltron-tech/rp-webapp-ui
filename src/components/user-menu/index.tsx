"use client";

import classNames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FaDiscord } from "react-icons/fa6";
import { FcBusinessman } from "react-icons/fc";
import {
  BookmarksIcon,
  CharactersIcon,
  ExploreIcon,
  FAQsIcon,
  HelpSupportIcon,
  InboxIcon,
  InstallAppIcon,
  InteractionsIcon,
  LibraryIcon,
  LogoutIcon,
  MusicIcon,
  StoriesIcon,
  TermsIcon,
} from "./user-menu-icons";
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
import { InstallAppDialog } from "../dialog/install-app-dialog";
import { Flex } from "../edit-muse-card/styles";
import { DiscordCommunityDialog } from "./discord-community-dialog";
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
  const [showDiscordDialog, setShowDiscordDialog] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const setGlobalState = useGlobalStoreSet();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const { routeToPage } = usePageRouter();
  const router = useRouter();
  const { successToast, errorToast } = useUIContext();
  const { handlePostLogout } = usePostLogout();
  const isMobile = useMemo(() => checkIsMobile(), []);
  const pathname = usePathname();

  // Prefetch the edit profile page so navigation is instant
  useEffect(() => {
    router.prefetch(ROUTES.Profile.Edit);
  }, [router]);

  const closeMobilePanel = useCallback(() => {
    setMobileClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setMobileClosing(false);
    }, 310);
  }, []);

  const handleClick = useCallback(() => {
    if (isMobile) {
      setMobileOpen(true);
      return;
    }
    toggleState(setOpen)();
  }, [isMobile]);

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
    closeMobilePanel();
    await handlePostLogout();
  }, [handlePostLogout, closeMobilePanel]);

  const toOnboarding = () => {
    routeToPage(ROUTES.Onboarding);
  };

  const toEditProfile = () => {
    routeToPage(ROUTES.Profile.Edit);
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

  const toBookmarksPage = () => {
    routeToPage(ROUTES.Bookmarks);
  };

  const toOutgoingThreadsPage = () => {
    routeToPage(ROUTES.outgoingThreads);
  };

  const toExplorePage = () => {
    routeToPage(ROUTES.explore);
  };

  const toLibraryPage = () => {
    routeToPage(ROUTES.Library);
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


  const handleInstallAppClick = () => {
    if (isMobile) {
      setShowInstallDialog(true);
    } else {
      routeToPage(ROUTES.InstallApp);
    }
  };

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <>
      <S.PositionContainer>
        <InstallAppDialog
          open={showInstallDialog}
          onClose={() => setShowInstallDialog(false)}
        />

        <DiscordCommunityDialog
          open={showDiscordDialog}
          onClose={() => setShowDiscordDialog(false)}
        />

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
              nwImage={novelist?.avatar}
            />
            <ShouldRender if={hasUnread}>
              <S.UnreadDot>
                {(unreadConversationIds?.length ?? 0) +
                  (unreadReplyCount ?? 0) >
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
                nwImage={novelist?.avatar}
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
                <S.Element onClick={toLibraryPage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <LibraryIcon size={20} />
                    Library
                  </Flex>
                  <FiChevronRight size={16} color="gray" />
                </S.Element>
                <S.Element onClick={toExplorePage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <ExploreIcon size={20} />
                    Explore Posts
                  </Flex>
                  <FiChevronRight size={16} color="gray" />
                </S.Element>
                <S.Element onClick={toOutgoingThreadsPage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <InteractionsIcon size={20} />
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
                    <CharactersIcon size={20} />
                    Characters
                  </Flex>
                  <FiChevronRight size={16} color="gray" />
                </S.Element>
                <S.Element onClick={toConversationsPage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <InboxIcon size={20} />
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
                <S.Element onClick={toStoryBoardsPage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <StoriesIcon size={20} />
                    Stories
                  </Flex>
                  <FiChevronRight size={16} color="gray" />
                </S.Element>
                <S.Element onClick={toBookmarksPage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <BookmarksIcon size={20} />
                    Bookmarks
                  </Flex>
                  <FiChevronRight size={16} color="gray" />
                </S.Element>
                <S.Element onClick={toMusicPage}>
                  <Flex justify="flex-start" align="center" gap="12px">
                    <MusicIcon size={20} />
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
                    <FcBusinessman />
                    Onboarding
                  </Flex>
                  <FiChevronRight size={16} color="gray" />
                </S.Element>
              </S.List>
            </ShouldRender>

            <S.List>
              <S.Separator />
              <S.DiscordElement onClick={() => setShowDiscordDialog(true)}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FaDiscord />
                  Join NW Community
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.DiscordElement>
              <S.Element onClick={handleInstallAppClick}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <InstallAppIcon size={20} />
                  Install NW App
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Element onClick={toTermsAndConditionsPage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <TermsIcon size={20} />
                  Terms & conditions
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Element onClick={toFAQsPage}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <FAQsIcon size={20} />
                  FAQs
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
              <S.Element onClick={() => setShowContactSupportAlert(true)}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <HelpSupportIcon size={20} />
                  Help & support
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.Element>
            </S.List>
            <S.Separator />
            <S.List>
              <S.DeleteElement onClick={() => setShowLogoutAlert(true)}>
                <Flex justify="flex-start" align="center" gap="12px">
                  <LogoutIcon size={20} />
                  Log out
                </Flex>
                <FiChevronRight size={16} color="gray" />
              </S.DeleteElement>
            </S.List>
          </S.Menu>
        </S.ContentContainer>
      </S.PositionContainer>

      {mobileOpen &&
        createPortal(
          <>
            <S.MobileOverlay
              $closing={mobileClosing}
              onClick={closeMobilePanel}
            />
            <S.MobilePanel
              $closing={mobileClosing}
              onTouchStart={(e) => {
                swipeStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (swipeStartX.current === null) return;
                const delta = e.changedTouches[0].clientX - swipeStartX.current;
                swipeStartX.current = null;
                if (delta > 60) closeMobilePanel();
              }}
            >
              <S.MobilePanelBody>
                <S.MobilePanelUserHeader
                  onClick={() => {
                    closeMobilePanel();
                    toUserProfile();
                  }}
                >
                  <AvatarNew
                    src={novelist?.image ?? null}
                    alt={user?.username || "User Avatar"}
                    username={user?.username}
                    nwImage={novelist?.avatar}
                  />
                  <S.MobilePanelUserInfo>
                    <S.MobilePanelUserName>
                      {novelist
                        ? `${novelist.firstName} ${novelist.lastName}`.trim() ||
                          novelist.username
                        : user.username}
                    </S.MobilePanelUserName>
                    <S.MobilePanelUserHandle>
                      @{user.username}
                    </S.MobilePanelUserHandle>
                  </S.MobilePanelUserInfo>
                  <S.MobilePanelEditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMobilePanel();
                      toEditProfile();
                    }}
                  >
                    <FiEdit2 />
                  </S.MobilePanelEditButton>
                </S.MobilePanelUserHeader>
                <ShouldRender if={authState === "LOGGED_IN"}>
                  <S.MobilePanelSection>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toLibraryPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <LibraryIcon size={20} />
                        Library
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toExplorePage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <ExploreIcon size={20} />
                        Explore Posts
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toOutgoingThreadsPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <InteractionsIcon size={20} />
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
                    </S.MobilePanelMenuItem>
                  </S.MobilePanelSection>
                  <S.MobilePanelSection>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toMusesPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <CharactersIcon size={20} />
                        Characters
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toConversationsPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <InboxIcon size={20} />
                        Inbox
                      </Flex>
                      <ShouldRender
                        if={(unreadConversationIds?.length ?? 0) > 0}
                      >
                        <S.UnreadBadge>
                          {(unreadConversationIds?.length ?? 0) > 99
                            ? "99+"
                            : unreadConversationIds?.length}
                        </S.UnreadBadge>
                      </ShouldRender>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toStoryBoardsPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <StoriesIcon size={20} />
                        Stories
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toBookmarksPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <BookmarksIcon size={20} />
                        Bookmarks
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toMusicPage();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <MusicIcon size={20} />
                        Music
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                  </S.MobilePanelSection>
                </ShouldRender>
                <ShouldRender if={authState === "UNINITIALIZED"}>
                  <S.MobilePanelSection>
                    <S.MobilePanelMenuItem
                      onClick={() => {
                        closeMobilePanel();
                        toOnboarding();
                      }}
                    >
                      <Flex justify="flex-start" align="center" gap="12px">
                        <FcBusinessman />
                        Onboarding
                      </Flex>
                      <FiChevronRight size={16} color="gray" />
                    </S.MobilePanelMenuItem>
                  </S.MobilePanelSection>
                </ShouldRender>
                <S.MobilePanelSection>
                  <S.MobilePanelDiscordMenuItem
                    onClick={() => {
                      closeMobilePanel();
                      setShowDiscordDialog(true);
                    }}
                  >
                    <Flex justify="flex-start" align="center" gap="12px">
                      <FaDiscord />
                      Join NW Community
                    </Flex>
                    <FiChevronRight size={16} color="white" />
                  </S.MobilePanelDiscordMenuItem>
                  <S.MobilePanelMenuItem
                    onClick={() => {
                      closeMobilePanel();
                      handleInstallAppClick();
                    }}
                  >
                    <Flex justify="flex-start" align="center" gap="12px">
                      <InstallAppIcon size={20} />
                      Install NW App
                    </Flex>
                    <FiChevronRight size={16} color="gray" />
                  </S.MobilePanelMenuItem>
                  <S.MobilePanelMenuItem
                    onClick={() => {
                      closeMobilePanel();
                      toTermsAndConditionsPage();
                    }}
                  >
                    <Flex justify="flex-start" align="center" gap="12px">
                      <TermsIcon size={20} />
                      Terms & conditions
                    </Flex>
                    <FiChevronRight size={16} color="gray" />
                  </S.MobilePanelMenuItem>
                  <S.MobilePanelMenuItem
                    onClick={() => {
                      closeMobilePanel();
                      toFAQsPage();
                    }}
                  >
                    <Flex justify="flex-start" align="center" gap="12px">
                      <FAQsIcon size={20} />
                      FAQs
                    </Flex>
                    <FiChevronRight size={16} color="gray" />
                  </S.MobilePanelMenuItem>
                  <S.MobilePanelMenuItem
                    onClick={() => setShowContactSupportAlert(true)}
                  >
                    <Flex justify="flex-start" align="center" gap="12px">
                      <HelpSupportIcon size={20} />
                      Help & support
                    </Flex>
                    <FiChevronRight size={16} color="gray" />
                  </S.MobilePanelMenuItem>
                </S.MobilePanelSection>
                <S.MobilePanelSection>
                  <S.MobilePanelDestructiveMenuItem
                    onClick={() => setShowLogoutAlert(true)}
                  >
                    <Flex justify="flex-start" align="center" gap="12px">
                      <LogoutIcon size={20} />
                      Log out
                    </Flex>
                    <FiChevronRight size={16} color="gray" />
                  </S.MobilePanelDestructiveMenuItem>
                </S.MobilePanelSection>
              </S.MobilePanelBody>
            </S.MobilePanel>
          </>,
          document.querySelector(".page-container") ?? document.body,
        )}
    </>
  );
};
