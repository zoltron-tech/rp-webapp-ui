"use client";

import { isCompactViewport } from "@nw/utils/platform";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiDownload,
  FiLock,
  FiSmartphone,
  FiUsers,
} from "react-icons/fi";
import appInstallLogo from "@/assets/images/NW-mobile-app-install-logo.png";
import { InstallAppDialog } from "@/components/dialog/install-app-dialog";
import {
  BanterScene,
  CodexScene,
  CommunityScene,
} from "@/components/feature-showcase";
import { Footer } from "@/components/layout";
import { LiveManuscript } from "@/components/live-manuscript";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { HeroBackdrop } from "./hero-backdrops";
import * as S from "./styles";
import { ThreeMoves } from "./three-moves";

export default function NovelistsPage() {
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const authState = useGlobalState("authState");
  const { routeToPage, stopPageLoading } = usePageRouter();
  const isMobile = useMemo(() => isCompactViewport(), []);

  // The page is fully static now — nothing to wait on, so drop the loader on
  // mount rather than when landing data arrives.
  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

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

  const isLoggedIn = authState === "LOGGED_IN";

  return (
    <S.PageShell>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <S.Hero>
        <HeroBackdrop />
        <S.HeroGrid>
          <S.HeroInner>
            <S.Eyebrow>Collaborative Worldbuilding</S.Eyebrow>
            <S.HeroTitle>
              Worldbuilding is{" "}
              <S.HeroTitleAccent>
                better with company.
                <S.TitleUnderline
                  viewBox="0 0 460 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 8.5C86 3.5 168 3 250 5.5S412 9 456 4.5"
                    pathLength="1"
                  />
                </S.TitleUnderline>
              </S.HeroTitleAccent>
            </S.HeroTitle>
            <S.HeroText>
              Novelist World gives writers a shared desk: a Codex for your lore,
              storyboards for your arcs, and a co-author writing the next scene
              while you plan the one after.
            </S.HeroText>
            <S.HeroChips>
              <S.HeroChip>
                <FiUsers />
                Write as your characters
              </S.HeroChip>
              <S.HeroChip>
                <FiBookOpen />
                Storyboards and Codex
              </S.HeroChip>
              <S.HeroChip>
                <FiLock />
                Private, encrypted messages
              </S.HeroChip>
            </S.HeroChips>
            <S.HeroActions>
              <S.PrimaryButton onClick={isLoggedIn ? toHomePage : onLoginClick}>
                {isLoggedIn ? "My Dashboard" : "Get Started"}
                <FiArrowRight />
              </S.PrimaryButton>
              <S.GhostButton onClick={handleDownloadAppClick}>
                <FiDownload />
                Download as App
              </S.GhostButton>
            </S.HeroActions>
            <S.HeroNote>
              <FiCheck />
              No credit card · A new world takes about a minute to set up
            </S.HeroNote>
          </S.HeroInner>

          <S.HeroPanel>
            <LiveManuscript />
          </S.HeroPanel>
        </S.HeroGrid>
        <S.ScrollCue>
          <span>Explore</span>
          <FiChevronDown />
        </S.ScrollCue>
      </S.Hero>

      {/* ─── Read a storyboard ──────────────────────────────────────────
      <S.Section>
        <S.SectionHead>
          <S.SectionEyebrow>Read Along</S.SectionEyebrow>
          <S.SectionTitle>Open a storyboard, turn by turn</S.SectionTitle>
          <S.SectionSubtitle>
            Every world reads like a book: a chapter title page, narration, and
            the dialogue its characters trade, spread across the page.
          </S.SectionSubtitle>
        </S.SectionHead>
        <S.StorybookShowcase>
          <LiveStorybook />
        </S.StorybookShowcase>
      </S.Section> */}

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <S.Section>
        <S.SectionHead>
          <S.SectionEyebrow>Why Novelist World</S.SectionEyebrow>
          <S.SectionTitle>
            Everything you need to tell your story
          </S.SectionTitle>
        </S.SectionHead>
        <S.CardsContainer>
          <S.FeatureRow>
            <S.FeatureCopy>
              <S.FeatureStep>Build</S.FeatureStep>
              <S.Cardheading>Create Your Own Realm</S.Cardheading>
              <S.CardText>
                Create and customize realms, populate them with unique
                characters, and fill them with magical objects. Keep every
                place, face and secret straight in your storyboard's Codex.
              </S.CardText>
              <S.FeaturePoints>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>A Codex per storyboard.</b> Characters, places and lore,
                    each with its own entry and cover art.
                  </span>
                </S.FeaturePoint>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Characters that look the part.</b> Give each one its own
                    accent colour, banner and card background.
                  </span>
                </S.FeaturePoint>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Galleries, music and events.</b> Hang art, set a theme
                    tune, and lay your chapters out in order.
                  </span>
                </S.FeaturePoint>
              </S.FeaturePoints>
            </S.FeatureCopy>
            <CodexScene />
          </S.FeatureRow>

          <S.FeatureRow $flip>
            <S.FeatureCopy>
              <S.FeatureStep>Write together</S.FeatureStep>
              <S.Cardheading>Collaborate and Connect</S.Cardheading>
              <S.CardText>
                Work with fellow writers to expand your stories. Every turn is
                spoken by one of your characters and credited to you, so a scene
                reads as fiction rather than as a chat log.
              </S.CardText>
              <S.FeaturePoints>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Open starters.</b> Post a scene anyone can pick up, or
                    answer one that catches your eye.
                  </span>
                </S.FeaturePoint>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Character connections.</b> Record how your muses know
                    each other, and how that changes.
                  </span>
                </S.FeaturePoint>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Private messages, end-to-end encrypted.</b> Plot the
                    twist where nobody else can read it.
                  </span>
                </S.FeaturePoint>
              </S.FeaturePoints>
            </S.FeatureCopy>
            <BanterScene />
          </S.FeatureRow>

          <S.FeatureRow>
            <S.FeatureCopy>
              <S.FeatureStep>Belong</S.FeatureStep>
              <S.Cardheading>Join a Thriving Community</S.Cardheading>
              <S.CardText>
                Whether you are a seasoned writer or just starting, you will
                find inspiration and support in our diverse and welcoming
                community, on the app and in our Discord.
              </S.CardText>
              <S.FeaturePoints>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Ice breakers.</b> Say what&apos;s on your mind and let
                    someone start the conversation for you.
                  </span>
                </S.FeaturePoint>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Writers worth meeting.</b> Suggestions based on mutual
                    friends and the fandoms you already write in.
                  </span>
                </S.FeaturePoint>
                <S.FeaturePoint>
                  <S.PointTick>
                    <FiCheck size={11} />
                  </S.PointTick>
                  <span>
                    <b>Levels and leaderboards.</b> Earn XP for the writing you
                    were going to do anyway.
                  </span>
                </S.FeaturePoint>
              </S.FeaturePoints>
            </S.FeatureCopy>
            <CommunityScene />
          </S.FeatureRow>
        </S.CardsContainer>
      </S.Section>

      {/* ─── How it works ─────────────────────────────────────────────── */}
      <S.Section>
        <S.SectionHead>
          <S.SectionEyebrow>How It Works</S.SectionEyebrow>
          <S.SectionTitle>A story in three moves</S.SectionTitle>
          <S.SectionSubtitle>
            No rulebook, no setup weekend. Bring a character, open a scene, and
            start writing with someone.
          </S.SectionSubtitle>
        </S.SectionHead>
        <ThreeMoves />
        <S.StepsCta>
          <S.PrimaryButton onClick={isLoggedIn ? toHomePage : onLoginClick}>
            {isLoggedIn ? "Open my worlds" : "Start your first story"}
            <FiArrowRight />
          </S.PrimaryButton>
        </S.StepsCta>
      </S.Section>

      {/* ─── Download as App ──────────────────────────────────────────── */}
      <S.AppSection>
        <S.AppCard>
          <S.AppIconTile>
            <img src={appInstallLogo} alt="Novelist World app" />
          </S.AppIconTile>
          <S.AppBody>
            <S.AppHeading>Take your worlds anywhere</S.AppHeading>
            <S.AppText>
              Install Novelist World on your device for a faster, full-screen
              experience. It lives right on your home screen, no app store
              required.
            </S.AppText>
            <S.AppBenefits>
              <S.AppBenefit>
                <FiSmartphone />
                Home-screen app
              </S.AppBenefit>
              <S.AppBenefit>
                <FiDownload />
                No app store needed
              </S.AppBenefit>
            </S.AppBenefits>
            <S.PrimaryButton onClick={handleDownloadAppClick}>
              <FiDownload />
              Download as App
            </S.PrimaryButton>
          </S.AppBody>
        </S.AppCard>
      </S.AppSection>

      <Footer />
      <InstallAppDialog
        open={showInstallDialog}
        onClose={() => setShowInstallDialog(false)}
      />
    </S.PageShell>
  );
}
