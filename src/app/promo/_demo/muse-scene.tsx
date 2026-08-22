"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { BiSolidConversation } from "react-icons/bi";
import { FaHandshake } from "react-icons/fa6";
import {
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiMoreVertical,
} from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";
import { MdPhotoLibrary } from "react-icons/md";
import { TiInfoLarge } from "react-icons/ti";
import { BackStorySection } from "@/app/rp/muse/[slug]/sections/back-story-section";
import { ConnectionsSection } from "@/app/rp/muse/[slug]/sections/connections-section";
import { MuseInfoSection } from "@/app/rp/muse/[slug]/sections/muse-info-section";
import * as M from "@/app/rp/muse/[slug]/styles";
import * as ListS from "@/app/rp/profile/[slug]/muses/styles";
import { MusePreviewCard } from "@/components/muse-preview-card";
import { ProfileSongPlayer } from "@/components/profile-song";
import { usePromoHarness } from "./harness";
import {
  ABOUT_SECTIONS,
  CONNECTIONS,
  FEATURED_SONG,
  GRID,
  VERSE_MUSES,
  VERSE_NAV,
  VERSE_WALK_INDEX,
  WALK,
} from "./muse-data";
import { applyFrame, DURATION, resetActions } from "./muse-timeline";
import * as S from "./styles";

/** The three sections the scene visits. The rail shows the rest too — they are
 *  part of what the side menu *is* — but only these are wired. */
type Section = "MUSE_INFO" | "BACK_STORY" | "CONNECTIONS";

const RAIL: {
  key: Section | null;
  label: string;
  icon: React.ReactNode;
}[] = [
  { icon: <TiInfoLarge size={20} />, key: "MUSE_INFO", label: "INFO" },
  { icon: <GiBookCover size={20} />, key: "BACK_STORY", label: "STORY" },
  { icon: <BiSolidConversation size={20} />, key: null, label: "POSTS" },
  { icon: <FaHandshake size={20} />, key: "CONNECTIONS", label: "PEERS" },
  { icon: <MdPhotoLibrary size={20} />, key: null, label: "GALLERY" },
  { icon: <FiMoreVertical size={20} />, key: null, label: "MORE" },
];

/**
 * A character list, and the profile one of its cards opens into.
 *
 * The profile's layout is the muse page's own — the same styled components out
 * of `app/rp/muse/[slug]/styles`, and the same section components — assembled
 * here around fixtures instead of around four server fetches and a route
 * change per navigation. What the scene drives are real controls: the nav
 * cards, the verse circles and the side menu rail are the page's buttons with
 * the page's handlers behind them.
 */
export const PromoMuseScene = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  /** Which character of the walk is open; 0 is the one with the verses. */
  const [walkIndex, setWalkIndex] = useState(0);
  const [verseIndex, setVerseIndex] = useState(0);
  /** Null until Info is chosen from the rail — the profile opens on the card
   *  alone and the panel is what expands beside it. */
  const [section, setSection] = useState<Section | null>(null);

  // Verses belong to the character the walk ends on, so the flip has
  // something to flip once Next has been used twice.
  const onVerses = walkIndex === VERSE_WALK_INDEX;
  const muse = onVerses ? VERSE_MUSES[verseIndex] : WALK[walkIndex];
  const accent = muse.useAccent ? (muse.accent ?? undefined) : undefined;
  const verses = onVerses ? VERSE_NAV : [];

  const cardSrc = muse.cardBackground?.src || muse.image || "";
  const bannerSrc = muse.wallpaper?.src || muse.image || "";

  // The sliding pill in the rail, measured off the selected button's own box —
  // the same trick the muse page uses so one bit of code drives it on both
  // axes.
  const buttonRefs = useRef<Partial<Record<Section, HTMLButtonElement | null>>>(
    {},
  );
  const [highlight, setHighlight] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    // No section, no pill — otherwise the capture's warm-up pass leaves it
    // parked on whatever was last opened when the scene resets to the top.
    if (!section) {
      setHighlight(null);
      return;
    }
    const button = buttonRefs.current[section];
    if (!button?.offsetWidth) return;
    setHighlight({
      height: button.offsetHeight,
      left: button.offsetLeft,
      top: button.offsetTop,
      width: button.offsetWidth,
    });
  }, [section]);

  const lastT = useRef(0);
  const seek = useCallback((t: number) => {
    // Back to the top after the capture's warm-up pass: put the scene back on
    // the first character, its first verse and its first section.
    if (t < 200 && lastT.current >= 200) {
      resetActions();
      setWalkIndex(0);
      setVerseIndex(0);
      setSection(null);
    }
    lastT.current = t;
    if (rootRef.current) applyFrame(rootRef.current, t);
  }, []);

  useLayoutEffect(() => {
    if (rootRef.current) applyFrame(rootRef.current, 0);
  }, []);

  usePromoHarness(DURATION, seek);

  const nextMuse = WALK[walkIndex + 1] ?? WALK[0];
  const prevMuse = WALK[walkIndex - 1] ?? WALK[WALK.length - 1];

  return (
    <S.MuseRoot ref={rootRef}>
      <S.MuseStage data-promo="stage">
        {/* ── The list ─────────────────────────────────────────────────── */}
        <S.MuseListLayer data-promo="muse-list">
          <ListS.Container>
            <ListS.MuseListContainer data-promo="muse-grid">
              {GRID.map(({ root, verses: family }) => (
                <MusePreviewCard key={root.id} muse={root} verses={family} />
              ))}
            </ListS.MuseListContainer>
          </ListS.Container>
        </S.MuseListLayer>

        {/* ── The profile ──────────────────────────────────────────────── */}
        <S.MuseProfileLayer data-promo="muse-profile">
          <M.Banner
            data-promo="muse-banner"
            src={bannerSrc}
            filterValues={muse.wallpaper?.filterValues ?? null}
          />

          <M.MuseNavCard
            type="button"
            $side="left"
            $accent={prevMuse.accent}
            data-promo="nav-prev"
            aria-label="Previous character"
            onClick={() => setWalkIndex((i) => Math.max(0, i - 1))}
          >
            <M.MuseNavCardImage
              $src={prevMuse.cardBackground?.src || prevMuse.image || ""}
            />
            <M.MuseNavCardVeil $side="left" />
            <M.MuseNavCardRail $side="left">
              <M.MuseNavCardChevron $accent={prevMuse.accent}>
                <FiChevronLeft size={18} />
              </M.MuseNavCardChevron>
              <M.MuseNavCardRailName>
                {prevMuse.firstName}
              </M.MuseNavCardRailName>
            </M.MuseNavCardRail>
            <M.MuseNavCardFooter $side="left">
              <M.MuseNavCardEyebrow>
                <M.MuseNavCardKbd>←</M.MuseNavCardKbd> Previous
              </M.MuseNavCardEyebrow>
              <M.MuseNavCardName>{prevMuse.firstName}</M.MuseNavCardName>
            </M.MuseNavCardFooter>
          </M.MuseNavCard>

          <M.MuseNavCard
            type="button"
            $side="right"
            $accent={nextMuse.accent}
            data-promo="nav-next"
            aria-label="Next character"
            onClick={() =>
              setWalkIndex((i) => Math.min(WALK.length - 1, i + 1))
            }
          >
            <M.MuseNavCardImage
              $src={nextMuse.cardBackground?.src || nextMuse.image || ""}
            />
            <M.MuseNavCardVeil $side="right" />
            <M.MuseNavCardRail $side="right">
              <M.MuseNavCardChevron $accent={nextMuse.accent}>
                <FiChevronRight size={18} />
              </M.MuseNavCardChevron>
              <M.MuseNavCardRailName>
                {nextMuse.firstName}
              </M.MuseNavCardRailName>
            </M.MuseNavCardRail>
            <M.MuseNavCardFooter $side="right">
              <M.MuseNavCardEyebrow>
                Next <M.MuseNavCardKbd>→</M.MuseNavCardKbd>
              </M.MuseNavCardEyebrow>
              <M.MuseNavCardName>{nextMuse.firstName}</M.MuseNavCardName>
            </M.MuseNavCardFooter>
          </M.MuseNavCard>

          <M.VerseHeaderBar aria-label="Character verses" data-promo="verses">
            <M.VerseHeaderInner>
              <M.VerseHeaderLabel $accent={accent}>
                <FiLayers />
                Verses
              </M.VerseHeaderLabel>
              <M.VerseCircleTrack $accent={accent}>
                {verses.length === 0 ? (
                  <M.VerseCircle
                    type="button"
                    $active
                    $accent={accent}
                    disabled
                  >
                    1
                  </M.VerseCircle>
                ) : (
                  verses.map((verse, index) => (
                    <M.VerseCircle
                      key={verse.id}
                      type="button"
                      data-promo={`verse-${index + 1}`}
                      $active={index === verseIndex}
                      $accent={verse.accent}
                      title={`Verse ${verse.verseNumber ?? 1}`}
                      aria-current={index === verseIndex ? "true" : undefined}
                      onClick={() => setVerseIndex(index)}
                    >
                      {verse.verseNumber ?? 1}
                    </M.VerseCircle>
                  ))
                )}
              </M.VerseCircleTrack>
            </M.VerseHeaderInner>
          </M.VerseHeaderBar>

          <M.MuseSongBar data-promo="song">
            <M.MuseSongInner
              style={
                accent
                  ? ({ "--accent": accent } as React.CSSProperties)
                  : undefined
              }
            >
              <ProfileSongPlayer
                song={FEATURED_SONG}
                slim
                block
                accent={accent}
              />
            </M.MuseSongInner>
          </M.MuseSongBar>

          <S.MuseCardFlip data-promo="card-flip">
            <M.CardWrapper data-promo="muse-card">
              <M.ImageWrapper>
                <M.CardBackground banner={cardSrc} />
              </M.ImageWrapper>
            </M.CardWrapper>
          </S.MuseCardFlip>

          <S.MuseSectionSlot data-promo="section">
            {section === "MUSE_INFO" && (
              <MuseInfoSection muse={muse} isOwnMuse={false} />
            )}
            {section === "BACK_STORY" && (
              <BackStorySection
                muse={muse}
                aboutSections={ABOUT_SECTIONS}
                isOwnMuse={false}
              />
            )}
            {section === "CONNECTIONS" && (
              <ConnectionsSection
                muse={muse}
                isOwnMuse={false}
                seed={CONNECTIONS}
              />
            )}
          </S.MuseSectionSlot>

          <M.SideMenu aria-label="Character sections" data-promo="rail">
            <M.MenuHighlight
              $accent={accent}
              style={{
                height: highlight?.height ?? 0,
                opacity: highlight ? 1 : 0,
                transform: `translate(${highlight?.left ?? 0}px, ${highlight?.top ?? 0}px)`,
                width: highlight?.width ?? 0,
              }}
            />
            {RAIL.map((item) => (
              <M.MenuButton
                key={item.label}
                ref={
                  item.key
                    ? (el) => {
                        buttonRefs.current[item.key as Section] = el;
                      }
                    : undefined
                }
                type="button"
                data-promo={`rail-${item.label.toLowerCase()}`}
                /* `item.key === section` alone marks every *unwired* entry
                   selected while nothing is open, since both are null. */
                className={
                  item.key !== null && item.key === section ? "selected" : ""
                }
                $accent={accent}
                onClick={() => item.key && setSection(item.key)}
              >
                <M.MenuButtonIcon>{item.icon}</M.MenuButtonIcon>
                <M.MenuText>{item.label}</M.MenuText>
              </M.MenuButton>
            ))}
          </M.SideMenu>
        </S.MuseProfileLayer>
      </S.MuseStage>
    </S.MuseRoot>
  );
};
