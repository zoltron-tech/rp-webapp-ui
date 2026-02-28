"use client";

import classNames from "classnames";
import { type FC, useCallback, useState } from "react";
import {
  FcCollaboration,
  FcConferenceCall,
  FcExport,
  FcFaq,
  FcLibrary,
  FcManager,
  FcMusic,
  FcNews,
  FcServices,
  FcSupport,
  FcVoicePresentation,
} from "react-icons/fc";
import { logoutAction } from "@/app/actions";
import { sendFeedbackMessage } from "@/app/rp/profile/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { AvatarNew } from "../common/avatar-new";
import { AppAlertDialog } from "../dialog";
import * as S from "./styles";

type UserMenuProps = {};

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
        {
          "The team will get back to you ASAP. Check your notifications for updates."
        }
      </S.FormMessage>
    </S.FormField>
  </S.FormRoot>
);

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showContactSupportAlert, setShowContactSupportAlert] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const setGlobalState = useGlobalStoreSet();
  const [open, setOpen] = useState(false);
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();

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
    logoutAction();
    setGlobalState({
      authState: "LOGGED_OUT",
      novelist: null,
      user: null,
    });
  }, [setGlobalState]);

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

  const toExplorePromptsPage = () => {
    routeToPage(ROUTES.explorePrompts);
  };

  const toNewsFeed = () => {
    routeToPage(ROUTES.newsFeed);
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

      <S.ContentContainer onClick={toggleState(setOpen)}>
        <AvatarNew
          className="selectable"
          src={novelist?.image ?? null}
          alt={user?.username || "User Avatar"}
        />
        <S.Menu className={classNames({ open })}>
          <ShouldRender if={authState === "LOGGED_IN"}>
            <S.List>
              <S.Element onClick={toUserProfile}>
                <FcManager />
                Your profile
              </S.Element>
              <S.Separator />
              <S.Element onClick={toNewsFeed}>
                <FcNews />
                Posts by novelists
              </S.Element>

              <S.Element onClick={toMusesPage}>
                <FcConferenceCall />
                Your characters
              </S.Element>
              <S.Element onClick={toMusicPage}>
                <FcMusic />
                Your music box
              </S.Element>
              <S.Element onClick={toOutgoingThreadsPage}>
                <FcCollaboration />
                Your interactions
              </S.Element>
              <S.Element onClick={toExplorePromptsPage}>
                <FcVoicePresentation />
                Explore prompts
              </S.Element>
            </S.List>
            <S.Separator />
            <S.List>
              <S.Element onClick={toEditProfile}>
                <FcServices />
                Edit profile
              </S.Element>
            </S.List>
            <S.Separator />
          </ShouldRender>
          <ShouldRender if={authState === "UNINITIALIZED"}>
            <S.List onClick={toOnboarding}>
              <S.Element>Onboarding</S.Element>
            </S.List>
          </ShouldRender>

          <S.List>
            <S.Element onClick={toTermsAndConditionsPage}>
              <FcLibrary />
              Terms & conditions
            </S.Element>
            <S.Element onClick={toFAQsPage}>
              <FcFaq />
              FAQs
            </S.Element>
            <S.Element onClick={() => setShowContactSupportAlert(true)}>
              <FcSupport />
              Help & support
            </S.Element>
          </S.List>
          <S.Separator />
          <S.List>
            <S.DeleteElement onClick={() => setShowLogoutAlert(true)}>
              <FcExport />
              Log out
            </S.DeleteElement>
          </S.List>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
