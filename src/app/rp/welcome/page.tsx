"use client";

import { useRouter } from "next/navigation";
import { type FC, useEffect, useRef, useState } from "react";
import logo from "@/assets/images/logo.png";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

const WelcomePage: FC = () => {
  const justOnboarded = useGlobalState("justOnboarded");
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const setGlobalState = useGlobalStoreSet();
  const router = useRouter();
  const { routeToPage, stopPageLoading } = usePageRouter();
  const [navigating, setNavigating] = useState(false);
  // Tracks whether we've ever observed a non-initial auth state. The store is
  // seeded with LOGGED_OUT on hard URL navigation, so we must wait for
  // AuthProvider's verify cycle (LOADING -> LOGGED_IN/OUT) before deciding
  // whether to redirect.
  const authResolved = useRef(false);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  // Consume the "justOnboarded" flag once on mount so a refresh doesn't keep
  // re-triggering post-onboarding side effects (e.g. the discord prompt).
  useEffect(() => {
    if (justOnboarded) {
      setGlobalState({ justOnboarded: false });
    }
  }, [justOnboarded, setGlobalState]);

  // Redirect unauthenticated users to login, but only after auth has actually
  // resolved at least once.
  useEffect(() => {
    if (authState === "LOADING" || authState === "LOGGED_IN") {
      authResolved.current = true;
      return;
    }
    if (authState === "LOGGED_OUT" && authResolved.current) {
      router.replace(ROUTES.Login);
    }
  }, [authState, router]);

  if (authState === "LOADING") return null;
  if (authState === "LOGGED_OUT" && !authResolved.current) return null;
  if (authState === "LOGGED_OUT") return null;

  const handleCreateCharacter = () => {
    if (navigating) return;
    setNavigating(true);
    routeToPage(ROUTES.Profile.Muses.Create);
  };

  const handleSkip = () => {
    if (navigating) return;
    setNavigating(true);
    routeToPage(ROUTES.Fellows);
  };

  return (
    <S.Root>
      <S.CardBorderWrap>
        <S.Card>
          {/* ── Branding ── */}
          <S.BrandHeader>
            <S.LogoImg src={logo.src} alt="Novelist World logo" />
            <S.BrandName>
              <S.BrandNamePrimary>Novelist</S.BrandNamePrimary>
              <S.BrandNameAccent>World</S.BrandNameAccent>
            </S.BrandName>
          </S.BrandHeader>

          {/* ── Festive confetti row ── */}
          <S.FestiveRow aria-hidden>
            <span>🎊</span>
            <span>✨</span>
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
          </S.FestiveRow>

          <S.Title>
            Welcome,{" "}
            <S.Highlight>
              {novelist?.firstName || novelist?.username || "Novelist"}
            </S.Highlight>
            ! 🥳
          </S.Title>

          <S.Divider />

          <S.Section>
            <S.Paragraph>
              Your author profile is live. You can now explore{" "}
              <S.Accented>out of character</S.Accented> 💬 &mdash; chat,
              comment, and connect with fellow novelists.
            </S.Paragraph>
            <S.Paragraph>
              Ready for the fun part? Bring a <strong>Character</strong> to life
              ✍️ and start writing stories together.
            </S.Paragraph>
          </S.Section>

          <S.Actions>
            <S.PrimaryButton
              type="button"
              onClick={handleCreateCharacter}
              disabled={navigating}
            >
              ✨ Create my first character
            </S.PrimaryButton>
            <S.SkipButton
              type="button"
              onClick={handleSkip}
              disabled={navigating}
            >
              Skip for now
            </S.SkipButton>
            <S.SkipHint>
              Just looking around? 👀 You can add characters anytime from your
              profile.
            </S.SkipHint>
          </S.Actions>
        </S.Card>
      </S.CardBorderWrap>
    </S.Root>
  );
};

export default WelcomePage;
