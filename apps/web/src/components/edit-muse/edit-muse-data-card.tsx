"use client";

import type { Muse } from "@nw/types";
import { useCallback, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { AppearanceSection } from "./appearance-section";
import { ConnectionsSection } from "./connections-section";
import { CreateInitialSection } from "./create-initial-section";
import { GallerySection } from "./gallery-section";
import { HeadcanonsSection } from "./headcanons-section";
import { InformationSection } from "./information-section";
import { LandingSection } from "./landing-section";
import { useMuseState } from "./muse.store";
import { StorySection } from "./story-section";
import * as S from "./styled";

type SectionView =
  | "appearance"
  | "information"
  | "story"
  | "gallery"
  | "connections"
  | "headcanons";
type View = "landing" | "create-initial" | SectionView;

const WIZARD_STEPS: SectionView[] = ["appearance", "information", "story"];

type Props = {
  /** Set while creating a new verse — the muse this one is a verse of. */
  verseParentMuse?: Muse | null;
};

export default function EditMuseDataCard({ verseParentMuse }: Props) {
  const id = useMuseState("id");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { routeToPage } = usePageRouter();

  // Snapshot the mode on mount so wizard state doesn't flip when the store ID
  // updates after the first save in create mode.
  const [isCreateMode] = useState(() => !id);
  const [view, setView] = useState<View>(() =>
    id ? "landing" : "create-initial",
  );
  const [wizardStep, setWizardStep] = useState(0);

  const goToMusesList = () => {
    if (isCreateMode && novelist?.friends?.length === 0) {
      routeToPage(ROUTES.Fellows);
      return;
    }
    if (user?.username) routeToPage(ROUTES.Profile.View(user.username).Muses);
  };

  /** Create mode: initial step saved – begin the wizard */
  const handleCreateContinue = (_savedId: string) => {
    setWizardStep(0);
    setView(WIZARD_STEPS[0]);
  };

  /** Wizard: advance to the next step (or finish) */
  const handleWizardNext = (_savedId?: string) => {
    const nextIdx = wizardStep + 1;
    if (nextIdx < WIZARD_STEPS.length) {
      setWizardStep(nextIdx);
      setView(WIZARD_STEPS[nextIdx]);
    } else {
      goToMusesList();
    }
  };

  const handleLandingSelect = useCallback(
    (view: SectionView) => {
      if (!isCreateMode && view === "story" && id) {
        routeToPage(ROUTES.Profile.Muses.About(id));
        return;
      }
      setView(view);
    },
    [isCreateMode, id, routeToPage],
  );

  return (
    <S.Card>
      {view === "landing" && (
        <LandingSection onBack={goToMusesList} onSelect={handleLandingSelect} />
      )}

      {view === "create-initial" && (
        <CreateInitialSection
          onContinue={handleCreateContinue}
          onBack={goToMusesList}
          verseParentMuse={verseParentMuse}
        />
      )}

      {view === "appearance" && (
        <AppearanceSection
          isWizard={isCreateMode}
          stepIndex={0}
          totalSteps={WIZARD_STEPS.length}
          onBack={isCreateMode ? undefined : () => setView("landing")}
          onDone={isCreateMode ? handleWizardNext : () => setView("landing")}
          onSkip={isCreateMode ? handleWizardNext : undefined}
        />
      )}

      {view === "information" && (
        <InformationSection
          isWizard={isCreateMode}
          stepIndex={1}
          totalSteps={WIZARD_STEPS.length}
          onBack={isCreateMode ? undefined : () => setView("landing")}
          onDone={isCreateMode ? handleWizardNext : () => setView("landing")}
          onSkip={isCreateMode ? handleWizardNext : undefined}
        />
      )}

      {view === "gallery" && (
        <GallerySection onBack={() => setView("landing")} />
      )}

      {view === "connections" && (
        <ConnectionsSection onBack={() => setView("landing")} />
      )}

      {view === "headcanons" && (
        <HeadcanonsSection onBack={() => setView("landing")} />
      )}

      {view === "story" && (
        <StorySection
          isWizard={isCreateMode}
          stepIndex={2}
          totalSteps={WIZARD_STEPS.length}
          onBack={isCreateMode ? undefined : () => setView("landing")}
          onFinish={isCreateMode ? goToMusesList : () => setView("landing")}
        />
      )}
    </S.Card>
  );
}
