"use client";

import { Carousel } from "@novelist-world/ui";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InstallAppDialog } from "@/components/dialog/install-app-dialog";
import { Footer } from "@/components/layout";
import { MusePreviewCard } from "@/components/muse-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { getHeroPageMusesAction } from "../muse/actions";
import * as S from "./styles";

const NovelistCarouselDynamic = dynamic(
  () => import("@/components/novelist-carousel"),
  { ssr: false },
);

export default function NovelistsPage() {
  const initialRender = useRef(true);
  const [muses, set] = useState<Muse[]>([]);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const authState = useGlobalState("authState");
  const { routeToPage, baseDataLoader } = usePageRouter();
  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || screen.width < 768),
    [],
  );

  const updateMuses = useCallback(async () => {
    const response = await baseDataLoader(() => getHeroPageMusesAction());
    if (response && !("message" in response)) {
      set(response);
    }
  }, [set]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      updateMuses();
      return;
    }
  }, [updateMuses]);

  Logger.info("NovelistsPage rendered");

  const onLoginClick = () => {
    routeToPage(ROUTES.Login);
  };

  const toHomePage = () => {
    routeToPage(ROUTES.Home);
  };

  const handleDownloadAppClick = () => {
    if (isMobile) {
      setShowInstallDialog(true);
    } else {
      routeToPage(ROUTES.InstallApp);
    }
  };

  return (
    <>
      <S.PageContainer>
        <S.HeroEyebrow>Collaborative Storytelling Platform</S.HeroEyebrow>
        <S.MainHeading />
        <S.HeroContent>
          <S.MainSubtext>Create live worlds.</S.MainSubtext>
          <S.MainSubtext>Write stories together.</S.MainSubtext>
        </S.HeroContent>
        <S.Story>
          Build realms with friends, interact with characters, and watch your
          stories evolve through collaboration.
        </S.Story>
        <S.ButtonsGroupContainer>
          <S.MainButton
            onClick={authState === "LOGGED_IN" ? toHomePage : onLoginClick}
          >
            <span className="buttonLg">
              <span className="buttonSl" />
              <span className="buttonText">
                {authState === "LOGGED_IN" ? "My Dashboard" : "Get Started"}
              </span>
            </span>
          </S.MainButton>
          <S.MainButton onClick={handleDownloadAppClick}>
            <span className="buttonLg">
              <span className="buttonSl" />
              <span className="buttonText">Download as App</span>
            </span>
          </S.MainButton>
        </S.ButtonsGroupContainer>
      </S.PageContainer>
      <S.TabContainer>
        {/* <S.MainSubtext>Collaborate with fellow Novelists</S.MainSubtext> */}
      </S.TabContainer>
      <NovelistCarouselDynamic />
      {/* <S.MainSubtext>Interact with Characters</S.MainSubtext> */}
      <S.PageContainer>
        <S.MuseCarouselContainer>
          <Carousel>
            {muses.length &&
              muses
                .slice(0, Math.floor(muses.length / 2))
                .map((muse) => (
                  <MusePreviewCard
                    key={muse?.id}
                    className="hero"
                    muse={muse}
                  />
                ))}
          </Carousel>
          <Carousel direction="to-right">
            {muses.length &&
              muses
                .slice(Math.floor(muses.length / 2))
                .map((muse) => (
                  <MusePreviewCard
                    key={muse?.id}
                    className="hero"
                    muse={muse}
                  />
                ))}
          </Carousel>
        </S.MuseCarouselContainer>

        <S.CardsContainer>
          <S.InfoCard tiltOnHover effectStrength={15}>
            <S.Cardheading>Create Your Own Realm</S.Cardheading>
            <S.Story>
              Create and customize realms, populate them with unique characters,
              and fill them with magical objects. Your imagination is the only
              limit.
            </S.Story>
          </S.InfoCard>
          <S.InfoCard tiltOnHover effectStrength={15}>
            <S.Cardheading>Collaborate and Connect</S.Cardheading>
            <S.Story>
              Work with fellow writers to expand your stories. Share ideas,
              develop plots, and create something extraordinary together.
            </S.Story>
          </S.InfoCard>
          <S.InfoCard tiltOnHover effectStrength={15}>
            <S.Cardheading>Join a Thriving Community</S.Cardheading>
            <S.Story>
              Whether you are a seasoned writer or just starting, you will find
              inspiration and support in our diverse and welcoming community.
            </S.Story>
          </S.InfoCard>
        </S.CardsContainer>
      </S.PageContainer>
      <Footer />
      <InstallAppDialog
        open={showInstallDialog}
        onClose={() => setShowInstallDialog(false)}
      />
    </>
  );
}
