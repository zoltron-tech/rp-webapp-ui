"use client";

import { useEffect } from "react";
import { BsCheckCircleFill, BsLockFill } from "react-icons/bs";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { LEVELS, BEYOND_LEVELS } from "@/lib/rp-levels";
import * as S from "./styled";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LevelsPage() {
  const novelist = useGlobalState("novelist");
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLevel = novelist?.level ?? 1;
  const currentXP = novelist?.totalPoints ?? 0;

  return (
    <S.Root>
      <S.Header>
        <S.HeaderEyebrow>Your progress</S.HeaderEyebrow>
        <S.HeaderTitle>Level Journey</S.HeaderTitle>
        <S.HeaderSub>
          Every word you write, every story you share — it all counts. Here is
          where your XP takes you.
        </S.HeaderSub>

        {novelist && (
          <S.CurrentBadge>
            <S.CurrentBadgeLevel>Level {currentLevel}</S.CurrentBadgeLevel>
            <S.CurrentBadgeDivider />
            <S.CurrentBadgeXP>
              {currentXP.toLocaleString()} XP total
            </S.CurrentBadgeXP>
          </S.CurrentBadge>
        )}
      </S.Header>

      <S.Timeline>
        {LEVELS.map((lvl, i) => {
          const isCompleted = currentLevel > lvl.level;
          const isCurrent = currentLevel === lvl.level;
          const isLocked = !isCompleted && !isCurrent;

          const xpEnd = lvl.xpEnd ?? lvl.xpStart;
          const levelRange = Math.max(1, xpEnd - lvl.xpStart + 1);
          const xpIntoLevel = Math.max(0, currentXP - lvl.xpStart);
          const progressPct = isCurrent
            ? Math.min(100, (xpIntoLevel / levelRange) * 100)
            : 0;

          const xpToNextLevel =
            isCurrent && lvl.xpEnd !== null
              ? lvl.xpEnd + 1 - currentXP
              : null;

          const isLastVisible = i === LEVELS.length - 1;

          return (
            <S.LevelEntry key={lvl.level}>
              <S.ConnectorArea>
                <S.LevelBall
                  $completed={isCompleted}
                  $current={isCurrent}
                  $comingSoon={lvl.comingSoon}
                >
                  {isCompleted ? (
                    <BsCheckCircleFill />
                  ) : (
                    <span>{lvl.level}</span>
                  )}
                </S.LevelBall>

                {/* Always draw a line after the last visible level so it flows into the beyond section */}
                {(!isLastVisible || true) && (
                  <S.ConnectorLine $filled={isCompleted} />
                )}
              </S.ConnectorArea>

              <S.LevelCard
                $completed={isCompleted}
                $current={isCurrent}
                $comingSoon={lvl.comingSoon}
              >
                {lvl.comingSoon && (
                  <S.ComingSoonBadge>Coming Soon</S.ComingSoonBadge>
                )}

                <S.LevelCardHead>
                  <S.LevelNumber $completed={isCompleted}>
                    Level {lvl.level}
                  </S.LevelNumber>
                  <S.LevelTitle>{lvl.title}</S.LevelTitle>
                  {isCurrent && xpToNextLevel !== null && (
                    <S.XPRange>
                      {xpToNextLevel.toLocaleString()} XP to next level
                    </S.XPRange>
                  )}
                  {isLocked && !lvl.comingSoon && (
                    <S.XPRange>
                      Unlocks at {lvl.xpStart.toLocaleString()} XP
                    </S.XPRange>
                  )}
                </S.LevelCardHead>

                {isCurrent && (
                  <S.ProgressBar>
                    <S.ProgressFill style={{ width: `${progressPct}%` }} />
                  </S.ProgressBar>
                )}

                {lvl.comingSoon ? (
                  <S.ComingSoonBody>
                    <S.ComingSoonIcon>
                      <BsLockFill />
                    </S.ComingSoonIcon>
                    <S.ComingSoonText>
                      Perks will be revealed as we build them.
                    </S.ComingSoonText>
                  </S.ComingSoonBody>
                ) : (
                  <S.PerkList>
                    {lvl.perks.map((perk, pi) => (
                      <S.PerkItem key={pi} $locked={isLocked}>
                        <S.PerkIcon>{perk.icon}</S.PerkIcon>
                        <S.PerkLabel>{perk.label}</S.PerkLabel>
                        {isLocked && (
                          <S.PerkLockIcon>
                            <BsLockFill />
                          </S.PerkLockIcon>
                        )}
                      </S.PerkItem>
                    ))}
                  </S.PerkList>
                )}
              </S.LevelCard>
            </S.LevelEntry>
          );
        })}
      </S.Timeline>

      {/* Ghost entries suggesting more levels exist beyond what's visible */}
      <S.BeyondSection>
        {BEYOND_LEVELS.map((n, i) => (
          <S.BeyondEntry key={n} $depth={i}>
            <S.ConnectorArea>
              <S.BeyondBall>?</S.BeyondBall>
              {i < BEYOND_LEVELS.length - 1 && (
                <S.ConnectorLine $filled={false} />
              )}
            </S.ConnectorArea>
            <S.BeyondCard>
              <S.LevelCardHead>
                <S.BeyondLevelNumber>Level {n}</S.BeyondLevelNumber>
                <S.BeyondTitle>???</S.BeyondTitle>
                <S.XPRange>— XP</S.XPRange>
              </S.LevelCardHead>
              <S.ComingSoonBody>
                <S.ComingSoonIcon>
                  <BsLockFill />
                </S.ComingSoonIcon>
                <S.ComingSoonText>Being written…</S.ComingSoonText>
              </S.ComingSoonBody>
            </S.BeyondCard>
          </S.BeyondEntry>
        ))}

        <S.BeyondFadeOverlay />
        <S.BeyondFooter>The story continues…</S.BeyondFooter>
      </S.BeyondSection>
    </S.Root>
  );
}
