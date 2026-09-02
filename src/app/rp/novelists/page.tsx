"use client";

import { isCompactViewport } from "@nw/utils/platform";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiDownload,
  FiGlobe,
  FiHeart,
  FiSmartphone,
  FiUsers,
} from "react-icons/fi";
import appInstallLogo from "@/assets/images/NW-mobile-app-install-logo.png";
import { InstallAppDialog } from "@/components/dialog/install-app-dialog";
import { Footer } from "@/components/layout";
import { LiveManuscript } from "@/components/live-manuscript";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
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
        <S.HeroGrid>
          <S.HeroInner>
            <S.Eyebrow>Collaborative Storytelling Platform</S.Eyebrow>
            <S.HeroTitle>
              Every story needs
              <br />
              <S.HeroTitleAccent>a second voice.</S.HeroTitleAccent>
            </S.HeroTitle>
            <S.HeroText>
              Novelist World is where roleplayers build living worlds together —
              you play a character, a friend replies as theirs, and the story
              unfolds one turn at a time.
            </S.HeroText>
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
            Every world reads like a book — a chapter title page, narration, and
            the dialogue its characters trade, spread across the page.
          </S.SectionSubtitle>
        </S.SectionHead>
        <S.StorybookShowcase>
          <LiveStorybook />
        </S.StorybookShowcase>
      </S.Section> */}

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

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <S.Section>
        <S.SectionHead>
          <S.SectionEyebrow>Why Novelist World</S.SectionEyebrow>
          <S.SectionTitle>
            Everything you need to tell your story
          </S.SectionTitle>
        </S.SectionHead>
        <S.CardsContainer>
          <S.InfoCard tiltOnHover effectStrength={15}>
            <S.CardIcon>
              <FiGlobe />
            </S.CardIcon>
            <S.Cardheading>Create Your Own Realm</S.Cardheading>
            <S.CardText>
              Create and customize realms, populate them with unique characters,
              and fill them with magical objects. Your imagination is the only
              limit.
            </S.CardText>
          </S.InfoCard>
          <S.InfoCard tiltOnHover effectStrength={15}>
            <S.CardIcon>
              <FiUsers />
            </S.CardIcon>
            <S.Cardheading>Collaborate and Connect</S.Cardheading>
            <S.CardText>
              Work with fellow writers to expand your stories. Share ideas,
              develop plots, and create something extraordinary together.
            </S.CardText>
          </S.InfoCard>
          <S.InfoCard tiltOnHover effectStrength={15}>
            <S.CardIcon>
              <FiHeart />
            </S.CardIcon>
            <S.Cardheading>Join a Thriving Community</S.Cardheading>
            <S.CardText>
              Whether you are a seasoned writer or just starting, you will find
              inspiration and support in our diverse and welcoming community.
            </S.CardText>
          </S.InfoCard>
        </S.CardsContainer>
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
              experience. It lives right on your home screen — no app store
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
