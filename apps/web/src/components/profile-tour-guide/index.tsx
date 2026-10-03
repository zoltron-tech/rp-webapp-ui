import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import type { CallBackProps, Step } from "react-joyride";
import Joyride, { EVENTS, STATUS } from "react-joyride";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

interface State {
  run: boolean;
  stepIndex: number;
  steps: Step[];
}

interface ProfileTourGuideProps {
  start: boolean;
  setStartTour: (start: boolean) => void;
  onTourEnd: () => void;
}

const ProfileTourGuide = ({
  start,
  setStartTour,
  onTourEnd,
}: ProfileTourGuideProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const [joyrideStyles, setJoyrideStyles] = useState({
    arrowColor: "#2a2828",
    backgroundColor: "#2a2828",
    overlayColor: "rgba(61, 58, 58, 0.751)",
    primaryColor: "#72b6da",
    spotlightBorder: "4px solid #72b6da",
    textColor: "#ffffff",
    textColorSecondary: "#ffffff",
  });

  const totalSteps = 7;

  useEffect(() => {
    if (!pageContainerRef.current) {
      return;
    }

    const computed = getComputedStyle(pageContainerRef.current);
    const getVar = (name: string, fallback: string) =>
      computed.getPropertyValue(name).trim() || fallback;

    const bg1 = getVar("--bg-1", "#000000");
    const accentHover = getVar("--accent-hover", "#72b6da");

    setJoyrideStyles({
      arrowColor: getVar("--bg-3", "#2a2828"),
      backgroundColor: getVar("--bg-3", "#2a2828"),
      overlayColor: `color-mix(in srgb, ${bg1} 90%, transparent)`,
      primaryColor: getVar("--accent", "#72b6da"),
      spotlightBorder: `4px solid ${accentHover}`,
      textColor: getVar("--text", "#ffffff"),
      textColorSecondary: getVar("--text-secondary", "#ffffff"),
    });
  }, [accent, theme]);

  const generateSteps = (): Step[] => [
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Your Profile</h3>
            <p>
              Your RP spotlight starts here, where your whole story comes
              together at a glance.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`1 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "center",
      styles: {
        options: { width: 340, zIndex: 10000 },
        spotlight: { border: joyrideStyles.spotlightBorder },
      },
      target: "#profile-tour-step-1",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Name and Note</h3>
            <p>
              Make a strong first impression with a name and note that define
              your vibe instantly.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`2 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "bottom",
      styles: {
        options: { width: 320, zIndex: 10000 },
        spotlight: { border: joyrideStyles.spotlightBorder },
      },
      target: "#profile-tour-step-2",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Stats Row</h3>
            <p>
              Your social pulse in one row: friends, characters, and journey
              timeline.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`3 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "auto",
      styles: {
        options: { width: 340, zIndex: 10000 },
        spotlight: { border: joyrideStyles.spotlightBorder },
      },
      target: "#profile-tour-step-3",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>About Yourself</h3>
            <p>
              Tell your story in one place and let people connect with the real
              you behind the character.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`4 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "auto",
      styles: {
        options: { width: 340, zIndex: 10000 },
        spotlight: { border: joyrideStyles.spotlightBorder },
      },
      target: "#profile-tour-step-5",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Your Characters</h3>
            <p>
              Your cast lives here, ready to be discovered, remembered, and
              followed.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`5 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "auto",
      styles: {
        options: { width: 340, zIndex: 10000 },
        spotlight: { border: joyrideStyles.spotlightBorder },
      },
      target: "#profile-tour-step-6",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Your Friends</h3>
            <p>
              See your RP circle at a glance and jump back into your favorite
              connections.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`6 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "auto",
      styles: {
        options: { width: 320, zIndex: 10000 },
        spotlight: { border: joyrideStyles.spotlightBorder },
      },
      target: "#profile-tour-step-7",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Profile Tour Complete</h3>
            <p>You are all set, now make this profile unforgettable.</p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`7 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "center",
      styles: {
        options: { width: 320, zIndex: 10000 },
      },
      target: "body",
    },
  ];

  const [{ run, steps }, setState] = useState<State>({
    run: start,
    stepIndex: 0,
    steps: generateSteps(),
  });

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      steps: generateSteps(),
    }));
  }, [joyrideStyles]);

  useEffect(() => {
    if (start) {
      setState((prev) => ({
        ...prev,
        run: true,
        stepIndex: 0,
      }));
    }
  }, [start]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { index, status, step, type } = data;

    if (
      type === EVENTS.STEP_BEFORE &&
      typeof index === "number" &&
      index >= 3 &&
      typeof step?.target === "string" &&
      step.target !== "body"
    ) {
      const stepTarget = document.querySelector(step.target);
      if (stepTarget instanceof HTMLElement) {
        stepTarget.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      type === EVENTS.TOUR_END
    ) {
      setState((prev) => ({ ...prev, run: false }));
      setStartTour(false);
      onTourEnd();
    }
  };

  return (
    <S.PageContainer
      ref={pageContainerRef}
      className={classNames([accent, theme])}
    >
      <Joyride
        debug
        continuous
        showSkipButton
        disableCloseOnEsc
        disableOverlayClose
        disableScrolling
        locale={{
          back: <IoArrowBackOutline size={18} />,
        }}
        run={run}
        steps={steps}
        callback={handleJoyrideCallback}
        styles={{
          buttonNext: {
            backgroundColor: joyrideStyles.primaryColor,
            color: joyrideStyles.textColor,
          },
          buttonSkip: {
            color: joyrideStyles.textColorSecondary,
          },
          options: {
            arrowColor: joyrideStyles.arrowColor,
            backgroundColor: joyrideStyles.backgroundColor,
            overlayColor: joyrideStyles.overlayColor,
            primaryColor: joyrideStyles.primaryColor,
            textColor: joyrideStyles.textColor,
            zIndex: 10000,
          },
          overlay: {
            backgroundColor: joyrideStyles.overlayColor,
          },
          spotlight: {
            border: joyrideStyles.spotlightBorder,
          },
        }}
      />
    </S.PageContainer>
  );
};

export default ProfileTourGuide;
