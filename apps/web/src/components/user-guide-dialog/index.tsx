"use client";

import classNames from "classnames";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IoArrowBack,
  IoArrowForward,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";
import * as F from "@/components/common/responsive-sheet/styles";
import { useGlobalState } from "@/context/store/stores";
import { GuideStage } from "./stage";
import * as S from "./styles";
import type { UserGuide } from "./types";

type Props = {
  /** The guide to walk — plain data, see [UserGuide]. */
  guide: UserGuide;
  open: boolean;
  /** Closing by any route: the X, Escape, the overlay, Skip or Finish. */
  onClose: () => void;
  /** The reader reached the end and pressed Finish. */
  onFinish?: () => void;
  /** The reader left early — worth knowing separately from finishing. */
  onSkip?: () => void;
  /** Opens on this step index instead of the first. */
  initialStep?: number;
};

/** Past this many steps the dots stop being readable; the counter carries it. */
const MAX_DOTS = 12;

/**
 * The app's guide dialog: one walkthrough component for every feature.
 *
 * Next / Back / Skip / Finish over a list of steps, each of which may carry a
 * *stage* — a mock of the real screen, built from the real components with
 * sample data. It is a centred dialog on desktop and a slide-up tray on mobile,
 * with the header and footer pinned so Next never scrolls out of reach on a
 * 375 × 667 screen.
 *
 * Adding a guide for another feature means exporting a [UserGuide] and passing
 * it here — see `guides/storyboard` for the shape.
 */
export const UserGuideDialog: FC<Props> = ({
  guide,
  open,
  onClose,
  onFinish,
  onSkip,
  initialStep = 0,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [index, setIndex] = useState(initialStep);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const total = guide.steps.length;
  const step = guide.steps[Math.min(index, total - 1)];
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  // Reopening starts the guide again rather than resuming where it was left —
  // somebody who closed it and came back is asking to be told, not resumed.
  useEffect(() => {
    if (open) setIndex(initialStep);
  }, [open, initialStep, guide.id]);

  const goTo = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), total - 1)),
    [total],
  );

  const finish = useCallback(() => {
    onFinish?.();
    onClose();
  }, [onFinish, onClose]);

  const skip = useCallback(() => {
    onSkip?.();
    onClose();
  }, [onSkip, onClose]);

  // A step change is a page change: the reader is put at the top of the new
  // one, and the heading takes focus so a screen reader announces it.
  useEffect(() => {
    if (!open) return;
    bodyRef.current?.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }, [index, open]);

  // Escape leaves; the arrows page. Typing inside a stage keeps its own keys —
  // a stage can hold real inputs, and paging away mid-word would be hostile.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skip();
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowRight" && !isLast) goTo(index + 1);
      if (e.key === "ArrowLeft" && !isFirst) goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, isFirst, isLast, goTo, skip]);

  // The page behind must not scroll under the tray.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !step || typeof document === "undefined") return null;

  return createPortal(
    <div className={classNames(theme, accent)}>
      <S.Overlay onClick={skip} />
      <S.Dialog
        role="dialog"
        aria-modal
        aria-label={`${guide.title} — step ${index + 1} of ${total}`}
      >
        <S.Grabber aria-hidden />

        <S.Header>
          <S.Title>{guide.title}</S.Title>
          <S.Counter aria-hidden>
            {index + 1} / {total}
          </S.Counter>
          <F.SheetActionButton
            type="button"
            aria-label="Close the guide"
            title="Close"
            onClick={skip}
          >
            <IoClose size={18} />
          </F.SheetActionButton>
        </S.Header>

        {/* Outside the scroller: the picture is the point of the step, so it
            keeps its size however long the copy under it runs. Keyed by step,
            since a stage holds its own state (the codex tab it is on, say) and
            each step means to open on its own. */}
        {step.stage && <GuideStage key={step.id}>{step.stage}</GuideStage>}

        <S.Copy ref={bodyRef}>
          {step.stageNote && <S.StageNote>{step.stageNote}</S.StageNote>}

          {/* Focused on every page turn, so a screen reader announces the new
              step. Not interactive — hence tabIndex -1, not 0. */}
          <S.StepTitle ref={titleRef} tabIndex={-1}>
            {step.title}
          </S.StepTitle>
          <S.StepBody>{step.body}</S.StepBody>

          {step.points && step.points.length > 0 && (
            <S.Points>
              {step.points.map((point, position) => (
                <li key={position}>{point}</li>
              ))}
            </S.Points>
          )}
        </S.Copy>

        <S.Footer>
          {!isLast && (
            <S.SkipButton type="button" onClick={skip}>
              Skip
            </S.SkipButton>
          )}

          {total > 1 && total <= MAX_DOTS && (
            <S.Dots>
              {guide.steps.map((candidate, position) => (
                <S.Dot
                  key={candidate.id}
                  type="button"
                  $active={position === index}
                  $done={position < index}
                  aria-label={`Step ${position + 1}: ${candidate.title}`}
                  aria-current={position === index ? "step" : undefined}
                  title={candidate.title}
                  onClick={() => goTo(position)}
                />
              ))}
            </S.Dots>
          )}

          <S.Actions>
            <S.BackButton
              type="button"
              disabled={isFirst}
              onClick={() => goTo(index - 1)}
            >
              <IoArrowBack size={15} />
              Back
            </S.BackButton>

            {isLast ? (
              <S.NextButton type="button" onClick={finish}>
                <IoCheckmark size={16} />
                Finish
              </S.NextButton>
            ) : (
              <S.NextButton type="button" onClick={() => goTo(index + 1)}>
                Next
                <IoArrowForward size={15} />
              </S.NextButton>
            )}
          </S.Actions>
        </S.Footer>
      </S.Dialog>
    </div>,
    document.body,
  );
};

export type { UserGuide, UserGuideStep } from "./types";
export { useUserGuide } from "./use-user-guide";
