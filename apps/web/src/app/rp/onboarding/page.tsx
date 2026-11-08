"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Separator, Tabs } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { PiMaskHappyBold } from "react-icons/pi";
import { finishOnboardingAction } from "@/app/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { getUserNovelist } from "../novelists/actions";
import { AboutStep } from "./about-step";
import { BasicInfoStep } from "./basic-info-step";
import type { OnboardingState } from "./onboarding.store";
import { PaletteStep } from "./palette-step";
import { PreviewBox } from "./preview-box";
import * as S from "./styled";
import { UsernameStep } from "./username-step";

type Step = "username" | "name" | "avatar-bio" | "accent";

export default function OnboardingPage() {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage } = usePageRouter();
  const [currentStep, setCurrentStep] = useState("username");
  const { stopPageLoading } = usePageRouter();
  const { errorToast } = useUIContext();
  const [finishing, setFinishing] = useState(false);
  const finishingRef = useRef(false);

  const handleUsernameNext = useCallback(() => {
    setCurrentStep("name");
  }, []);

  const handleNameNext = useCallback(() => {
    setCurrentStep("avatar-bio");
  }, []);

  const handleAboutNext = useCallback(() => {
    setCurrentStep("accent");
  }, []);

  const handleAccentNext = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    const fail = () => {
      finishingRef.current = false;
      setFinishing(false);
      errorToast("Couldn't finish setting up your profile. Please try again.");
    };

    const response = await finishOnboardingAction().catch(() => null);
    if (response?.message !== API_MESSAGE.Success) {
      fail();
      return;
    }
    const updatedNovelist = await getUserNovelist().catch(() => null);
    if (!updatedNovelist || "message" in updatedNovelist) {
      fail();
      return;
    }

    // Stays "finishing" while the route changes, so Finish can't fire twice.
    setGlobalState({
      authState: "LOGGED_IN",
      justOnboarded: true,
      novelist: updatedNovelist,
      showJoinDiscordPrompt: true,
    });

    routeToPage(ROUTES.Welcome);
  }, [routeToPage, setGlobalState, errorToast]);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.OnboardingPageRoot>
      <S.Card>
        <S.FormHeading>
          <HiOutlineUserCircle />
          <div className="heading-text">
            <S.OocBadge>Out-of-Character · Author Profile</S.OocBadge>
            <h1>Set up your profile</h1>
          </div>
        </S.FormHeading>

        <S.InfoCallout>
          <PiMaskHappyBold className="callout-icon" aria-hidden />
          <div>
            This is <strong>you, the author</strong> &mdash; not a character.
            You&apos;ll create <em>Characters</em> to roleplay as after
            finishing this profile.
          </div>
        </S.InfoCallout>

        <Separator.Root className="separator" orientation="horizontal" />

        <ShouldRender if={authState === "UNINITIALIZED"}>
          <StoreProvider<OnboardingState>
            storeId="onboarding"
            initial={{
              about: novelist?.about || "",
              avatar: novelist?.avatar ?? null,
              firstName: novelist?.firstName || "",
              image: novelist?.image || "",
              lastName: novelist?.lastName || "",
              palette: user?.palette ?? 0,
              theme: "dark",
              username: user?.username || "",
            }}
          >
            <Tabs.Root
              value={currentStep}
              onValueChange={setCurrentStep}
              asChild
            >
              <S.ContentContainer>
                <S.OnboardingPanel>
                  <Tabs.List
                    className="tabs-list"
                    aria-label="Onboarding Steps"
                  >
                    <Tabs.Trigger value="username" className="tab">
                      Username
                    </Tabs.Trigger>
                    <Tabs.Trigger value="name" className="tab">
                      Basic Info
                    </Tabs.Trigger>
                    <Tabs.Trigger value="avatar-bio" className="tab">
                      About
                    </Tabs.Trigger>
                    <Tabs.Trigger value="accent" className="tab">
                      Accent
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="username" asChild>
                    <S.StepContent>
                      <UsernameStep handleNext={handleUsernameNext} />
                    </S.StepContent>
                  </Tabs.Content>
                  <Tabs.Content value="name" asChild>
                    <S.StepContent>
                      <BasicInfoStep handleNext={handleNameNext} />
                    </S.StepContent>
                  </Tabs.Content>
                  <Tabs.Content value="avatar-bio" asChild>
                    <S.StepContent>
                      <AboutStep handleNext={handleAboutNext} />
                    </S.StepContent>
                  </Tabs.Content>
                  <Tabs.Content value="accent" asChild>
                    <S.StepContent>
                      <PaletteStep
                        handleNext={handleAccentNext}
                        finishing={finishing}
                      />
                    </S.StepContent>
                  </Tabs.Content>
                </S.OnboardingPanel>
                <PreviewBox />
              </S.ContentContainer>
            </Tabs.Root>
          </StoreProvider>
        </ShouldRender>
      </S.Card>
    </S.OnboardingPageRoot>
  );
}
