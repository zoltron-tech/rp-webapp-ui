"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useRouter } from "next/navigation";
import { Separator, Tabs } from "radix-ui";
import { useCallback, useEffect, useState } from "react";
import { ImProfile } from "react-icons/im";
import { finishOnboardingAction } from "@/app/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
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
  const { push } = useRouter();
  const [currentStep, setCurrentStep] = useState("username");

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
    const response = await finishOnboardingAction();
    if (response.message !== API_MESSAGE.Success) {
      console.log("Error finishing onboarding:", response);
      return;
    }
    const updatedNovelist = await getUserNovelist();
    if ("message" in updatedNovelist) {
      console.log("Error fetching updated novelist:", updatedNovelist);
      return;
    }

    setGlobalState({
      authState: "LOGGED_IN",
      novelist: updatedNovelist,
    });

    push(ROUTES.Profile.View(user?.username || "").Index);
  }, [push, novelist, user]);

  return (
    <S.OnboardingPageRoot>
      <S.Card>
        <S.FormHeading>
          <ImProfile />
          <h1>Complete your profile</h1>
        </S.FormHeading>
        <S.FormDescription>
          <p>
            Please fill in your profile details to help us understand you
            better.
          </p>
          <p>
            This information will be used to personalize your experience on our
            platform.
          </p>
        </S.FormDescription>
        <Separator.Root className="separator" orientation="horizontal" />

        <ShouldRender if={authState === "UNINITIALIZED"}>
          <StoreProvider<OnboardingState>
            storeId="onboarding"
            initial={{
              about: novelist?.about || "",
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
                      <PaletteStep handleNext={handleAccentNext} />
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
