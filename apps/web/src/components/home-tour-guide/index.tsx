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

interface HomeTourGuideProps {
  start: boolean;
  setStartTour: (start: boolean) => void;
  onTourEnd: () => void;
}

const HomeTourGuide = ({
  start,
  setStartTour,
  onTourEnd,
}: HomeTourGuideProps) => {
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
            <h3>Welcome to your Home Feed!</h3>
            <p>
              Your RP world starts here, where every update pulls you deeper
              into the story.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`1 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      locale: {
        skip: <span>Skip</span>,
      },
      placement: "center",
      styles: {
        options: {
          width: 400,
          zIndex: 10000,
        },
        spotlight: {
          padding: 0,
        },
      },
      target: "body",
      title: "Home Feed",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Friends List</h3>
            <p>
              Your inner circle lives here, one click away from instant
              connection.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`2 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      locale: { skip: <span>Skip</span> },
      placement: "auto",
      showSkipButton: true,
      styles: {
        options: {
          width: 220,
          zIndex: 10000,
        },
        spotlight: {
          border: joyrideStyles.spotlightBorder,
        },
      },
      target: "#home-tour-step-1",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Characters by Friends</h3>
            <p>
              Discover the characters your friends bring to life and dive into
              their worlds.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`3 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      locale: { skip: <span>Skip</span> },
      placement: "auto",
      showSkipButton: true,
      styles: {
        options: {
          width: 280,
          zIndex: 10000,
        },
        spotlight: {
          border: joyrideStyles.spotlightBorder,
        },
      },
      target: "#home-tour-step-2",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Friend Suggestions</h3>
            <p>
              Find your next RP connection with smart suggestions tailored to
              your vibe.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`4 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      locale: { skip: <span>Skip</span> },
      placement: "auto",
      showSkipButton: true,
      styles: {
        options: {
          width: 300,
          zIndex: 10000,
        },
        spotlight: {
          border: joyrideStyles.spotlightBorder,
        },
      },
      target: "#home-tour-step-3",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Explore new characters</h3>
            <p>
              Meet fresh faces from the community and expand your universe in
              seconds.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`5 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      locale: { skip: <span>Skip</span> },
      placement: "auto",
      showSkipButton: true,
      styles: {
        options: {
          width: 300,
          zIndex: 10000,
        },
        spotlight: {
          border: joyrideStyles.spotlightBorder,
        },
      },
      target: "#home-tour-step-4",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Updates by your friends</h3>
            <p>
              Stay in sync with every post, moment, and move from your RP
              circle.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`6 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      locale: { skip: <span>Skip</span> },
      placement: "auto",
      showSkipButton: true,
      styles: {
        options: {
          width: 300,
          zIndex: 10000,
        },
        spotlight: {
          border: joyrideStyles.spotlightBorder,
        },
      },
      target: "#home-tour-step-5",
    },
    {
      content: (
        <S.TourWrapper className={classNames([accent, theme])}>
          <S.BodyInfo>
            <h3>Enjoy your RP Journey!</h3>
            <p>
              You are all set, now jump in and make your next RP moment count.
            </p>
          </S.BodyInfo>
          <S.FooterInfo>
            <p>{`7 / ${totalSteps}`}</p>
          </S.FooterInfo>
        </S.TourWrapper>
      ),
      placement: "center",
      showSkipButton: true,
      styles: {
        options: {
          width: 300,
          zIndex: 10000,
        },
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
    const { status, step, type } = data;

    // Scroll only for targeted lower-feed steps.
    if (type === EVENTS.STEP_BEFORE && step?.target === "#home-tour-step-4") {
      const stepTarget = document.querySelector("#home-tour-step-4");
      if (stepTarget instanceof HTMLElement) {
        stepTarget.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }

    // For step 5, scroll the first list item into view so the popup remains visible.
    if (type === EVENTS.STEP_BEFORE && step?.target === "#home-tour-step-5") {
      const titleTarget = document.querySelector("#home-tour-step-5");

      if (titleTarget instanceof HTMLElement) {
        const sectionContainer = titleTarget.parentElement;
        const firstListItem = sectionContainer
          ? Array.from(sectionContainer.children).find(
              (child) =>
                child instanceof HTMLElement && child.id !== "home-tour-step-5",
            )
          : null;

        const scrollTarget =
          firstListItem instanceof HTMLElement ? firstListItem : titleTarget;

        scrollTarget.scrollIntoView({
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
          buttonClose: {
            marginRight: "5px",
            marginTop: "5px",
          },
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

export default HomeTourGuide;
