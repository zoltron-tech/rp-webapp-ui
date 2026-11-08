"use client";

import { Separator } from "radix-ui";
import { useCallback, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { MdAutoStories, MdDoubleArrow } from "react-icons/md";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";

const MAX_QUOTE_LENGTH = 200;

type Props = {
  isWizard?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  onBack?: () => void;
  onFinish: () => void;
};

export function StorySection({
  isWizard,
  stepIndex = 2,
  totalSteps = 3,
  onBack,
  onFinish,
}: Props) {
  const id = useMuseState("id");
  const note = useMuseState("note");
  const firstName = useMuseState("firstName");
  const setMuseState = useMuseStoreSet();
  const { routeToPage } = usePageRouter();
  const { save, loading: saving } = useMuseSave();

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleGoToStory = useCallback(async () => {
    setSaveError(null);
    let result: Awaited<ReturnType<typeof save>>;
    try {
      result = await save();
    } catch (err) {
      console.error("[StorySection] save() threw:", err);
      setSaveError("Something went wrong. Please try again.");
      return;
    }
    if (!result.ok) {
      setSaveError("Failed to save. Please try again.");
      return;
    }
    routeToPage(ROUTES.Profile.Muses.About(result.id));
  }, [save, routeToPage]);

  const handleFinish = useCallback(async () => {
    if (isWizard) {
      setSaveError(null);
      let result: Awaited<ReturnType<typeof save>>;
      try {
        result = await save();
      } catch (err) {
        console.error("[StorySection] save() threw:", err);
        setSaveError("Something went wrong. Please try again.");
        return;
      }
      if (!result.ok) {
        setSaveError("Failed to save. Please try again.");
        return;
      }
    }
    onFinish();
  }, [isWizard, save, onFinish]);

  const isLastStep = stepIndex === totalSteps - 1;
  const quoteLength = (note ?? "").length;
  const quoteRemaining = MAX_QUOTE_LENGTH - quoteLength;

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          {!isWizard && onBack && (
            <S.BackButton type="button" onClick={onBack}>
              <BsArrowLeft size={18} />
            </S.BackButton>
          )}
          <S.FormHeading>
            <MdAutoStories />
            <h1>Story ahaha</h1>
          </S.FormHeading>
        </div>
        {isWizard && (
          <S.StepBadge>
            Step {stepIndex + 2} of {totalSteps + 1}
          </S.StepBadge>
        )}
      </S.TopBar>

      {isWizard && (
        <S.StepDots>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <S.StepDot
              key={i}
              $active={i === stepIndex}
              $done={i < stepIndex}
            />
          ))}
        </S.StepDots>
      )}

      <Separator.Root className="separator" orientation="horizontal" />

      <S.QuoteBlock>
        <S.QuoteLabel htmlFor="muse-quote">
          Favorite Quote by {firstName || "your character"}
        </S.QuoteLabel>
        <S.QuoteTextarea
          id="muse-quote"
          value={note ?? ""}
          onChange={(e) => {
            if (e.target.value.length <= MAX_QUOTE_LENGTH)
              setMuseState({ note: e.target.value });
          }}
          placeholder='"A quote that defines your character..."'
          rows={3}
          maxLength={MAX_QUOTE_LENGTH}
        />
        <S.QuoteCharCount className={quoteRemaining <= 20 ? "warn" : undefined}>
          {quoteLength} / {MAX_QUOTE_LENGTH}
        </S.QuoteCharCount>
      </S.QuoteBlock>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.StorySectionBody>
        <p>
          Add backstory, personality notes, and lore to bring your character to
          life. Story sections let you build a rich narrative for your muse.
        </p>
        {(Boolean(id) || isWizard) && (
          <S.AboutSectionsLink
            onClick={saving ? undefined : handleGoToStory}
            style={saving ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            <span>
              Edit Character Story
              <MdDoubleArrow size={20} />
            </span>
          </S.AboutSectionsLink>
        )}
      </S.StorySectionBody>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.WizardActions>
        {isWizard && (
          <>
            {saveError && (
              <S.LandingErrorBanner>{saveError}</S.LandingErrorBanner>
            )}
            <S.SkipButton
              type="button"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? "Saving…" : isLastStep ? "Finish" : "Skip"}
            </S.SkipButton>
          </>
        )}
      </S.WizardActions>
    </>
  );
}
