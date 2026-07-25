"use client";

import { Carousel } from "@novelist-world/ui";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { LiveStorybook } from "@/components/live-storybook";
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

// Stable keys for the placeholder shimmer cards (avoids index-as-key).
const MUSE_SHIMMER_KEYS = ["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7"];

export default function NovelistsPage() {
  const initialRender = useRef(true);
  const [muses, set] = useState<Muse[]>([]);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const authState = useGlobalState("authState");
  const novelists = useGlobalState("novelists");
  const { routeToPage, baseDataLoader, stopPageLoading } = usePageRouter();
  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || screen.width < 768),
    [],
  );

  // Render the landing page immediately — don't keep the full-page loader up
  // while novelists/muses are still being fetched. The card rows below show
  // shimmer placeholders until their data streams in.
  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

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

  const isLoggedIn = authState === "LOGGED_IN";
  const museMidpoint = Math.floor(muses.length / 2);
  const firstMuseRow = muses.slice(0, museMidpoint);
  const secondMuseRow = muses.slice(museMidpoint);
  const musesLoading = muses.length === 0;
  const novelistsLoading = novelists.length === 0;

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

      {/* ─── Novelists ────────────────────────────────────────────────── */}
      <S.Section>
        <S.SectionHead>
          <S.SectionEyebrow>Meet the Novelists</S.SectionEyebrow>
          <S.SectionTitle>Storytellers shaping living worlds</S.SectionTitle>
          <S.SectionSubtitle>
            Discover the writers building the realms, characters, and adventures
            of Novelist World.
          </S.SectionSubtitle>
        </S.SectionHead>
        {novelistsLoading && (
          <S.NovelistShimmerRow aria-hidden="true">
            <S.NovelistShimmerCard className="side" />
            <S.NovelistShimmerCard />
            <S.NovelistShimmerCard className="side" />
          </S.NovelistShimmerRow>
        )}
        <NovelistCarouselDynamic />
      </S.Section>

      {/* ─── Muses ────────────────────────────────────────────────────── */}
      <S.Section>
        <S.SectionHead>
          <S.SectionEyebrow>Living Characters</S.SectionEyebrow>
          <S.SectionTitle>Interact with the Muses</S.SectionTitle>
          <S.SectionSubtitle>
            Meet the characters brought to life by our community — chat with
            them, and weave them into your own stories.
          </S.SectionSubtitle>
        </S.SectionHead>
        <S.MuseCarouselContainer>
          {musesLoading ? (
            <>
              <S.MuseShimmerRow aria-hidden="true">
                {MUSE_SHIMMER_KEYS.map((key) => (
                  <S.MuseShimmerCard key={key} />
                ))}
              </S.MuseShimmerRow>
              <S.MuseShimmerRow aria-hidden="true">
                {MUSE_SHIMMER_KEYS.map((key) => (
                  <S.MuseShimmerCard key={`${key}-b`} />
                ))}
              </S.MuseShimmerRow>
            </>
          ) : (
            <>
              <Carousel>
                {firstMuseRow.map((muse) => (
                  <MusePreviewCard
                    key={muse?.id}
                    className="hero"
                    muse={muse}
                  />
                ))}
              </Carousel>
              <Carousel direction="to-right">
                {secondMuseRow.map((muse) => (
                  <MusePreviewCard
                    key={muse?.id}
                    className="hero"
                    muse={muse}
                  />
                ))}
              </Carousel>
            </>
          )}
        </S.MuseCarouselContainer>
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
            <img src={appInstallLogo.src} alt="Novelist World app" />
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
