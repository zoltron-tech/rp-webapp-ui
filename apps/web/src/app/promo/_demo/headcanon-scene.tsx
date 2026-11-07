"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { BiSolidConversation } from "react-icons/bi";
import { BsLightbulb } from "react-icons/bs";
import { FaImagePortrait, FaRegAddressCard } from "react-icons/fa6";
import {
  FiChevronLeft,
  FiChevronRight,
  FiFeather,
  FiLayers,
  FiMoreVertical,
  FiPlus,
} from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";
import { MdPhotoLibrary } from "react-icons/md";
import { TiInfoLarge } from "react-icons/ti";
import { createGlobalStyle } from "styled-components";
import { getMuseAppearance } from "@/app/rp/muse/[slug]/appearance";
import { MuseInfoSection } from "@/app/rp/muse/[slug]/sections/muse-info-section";
import SectionMiniHeader from "@/app/rp/muse/[slug]/sections/SectionMiniHeader";
import {
  SectionSwitcher,
  SectionSwitcherContext,
} from "@/app/rp/muse/[slug]/sections/section-switcher";
import * as M from "@/app/rp/muse/[slug]/styles";
import { toVerseOptions } from "@/components/headcanons/headcanon-editor-sheet";
import { HeadcanonsPanel } from "@/components/headcanons/headcanons-panel";
import { ProfileSongPlayer } from "@/components/profile-song";
import { HEADCANON_CATALOG } from "./headcanon-catalog";
import { HALDA, HEADCANON_STATES } from "./headcanon-data";
import { FEATURED_SONG } from "./muse-data";

/**
 * Halda's muse page on a phone, opened on Canon, for the Headcanons reel.
 *
 * The page's own parts (`app/rp/muse/[slug]/styles`), its phone menu groups
 * and section switcher, and the real `HeadcanonsPanel` with every sheet behind
 * its buttons — assembled around fixtures, as the muse scene is. The capture
 * (promo-social/reels/day-11-headcanons/tools/capture.mjs) opens it at a
 * phone viewport, because the phone layout is media queries, and clicks the
 * real buttons to open sheets.
 *
 *   ?state=empty|traits|full|new|visitor|visitor-hearted  (headcanon-data.ts)
 *   ?section=canon|info   ?from=MUSE_INFO   ?open=<headcanon id>
 */

/** Only the catalogue goes to the network; it answers from the fixture. */
const installCatalogStub = () => {
  const original = window.fetch;
  const stub: typeof window.fetch = (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (url.includes("/headcanon/catalog")) {
      return Promise.resolve(
        new Response(JSON.stringify(HEADCANON_CATALOG), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      );
    }
    // Writes would hit the real backend: the scene shows results by seed.
    if (url.includes("/headcanon/")) {
      return Promise.resolve(new Response("{}", { status: 503 }));
    }
    return original(input, init);
  };
  window.fetch = stub;
  return () => {
    window.fetch = original;
  };
};

/** A phone screen, not a GIF frame: the app's own black page behind it. */
const ScreenStyle = createGlobalStyle`
  html, body { background: #000 !important; }
`;

const GROUPS: { key: string; label: string; icon: IconType }[] = [
  { icon: FaImagePortrait, key: "CARD", label: "Card" },
  { icon: FaRegAddressCard, key: "ABOUT", label: "About" },
  { icon: BiSolidConversation, key: "SOCIAL", label: "Social" },
  { icon: MdPhotoLibrary, key: "GALLERY", label: "Gallery" },
  { icon: FiMoreVertical, key: "MORE", label: "More" },
];

const ABOUT = [
  { icon: TiInfoLarge, key: "MUSE_INFO", label: "Info" },
  { icon: GiBookCover, key: "BACK_STORY", label: "Story" },
  { icon: BsLightbulb, key: "HEADCANONS", label: "Canon" },
];

export const PromoHeadcanonScene = () => {
  const params = new URLSearchParams(window.location.search);
  const stateKey = params.get("state") ?? "full";
  const seed = HEADCANON_STATES[stateKey] ?? HEADCANON_STATES.full;
  const onInfo = params.get("section") === "info";
  const from = params.get("from");
  const openId = params.get("open");

  // Before any child's effect asks for the catalogue.
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const uninstall = installCatalogStub();
    setReady(true);
    return uninstall;
  }, []);

  const muse = HALDA;
  const accent = muse.useAccent ? (muse.accent ?? undefined) : undefined;
  const { hideExpandedBackground } = getMuseAppearance(muse);
  const name = [muse.firstName, muse.lastName].filter(Boolean).join(" ");

  const aboutRef = useRef<HTMLButtonElement>(null);
  const [pill, setPill] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  useLayoutEffect(() => {
    const b = aboutRef.current;
    if (!b) return;
    setPill({
      height: b.offsetHeight,
      left: b.offsetLeft,
      top: b.offsetTop,
      width: b.offsetWidth,
    });
  }, [ready]);

  const switcher = (
    <SectionSwitcher
      label="About sections"
      options={ABOUT}
      active={onInfo ? "MUSE_INFO" : "HEADCANONS"}
      from={from}
      accent={accent}
      onSelect={() => {}}
    />
  );

  const prev = muse.prev;
  const next = muse.next;
  const author = muse.pennedBy;

  if (!ready) return null;

  return (
    <M.MuseContainer data-promo="screen">
      <ScreenStyle />
      <M.Banner
        $src={muse.wallpaper?.src || muse.image || ""}
        $filterValues={muse.wallpaper?.filterValues ?? null}
      />

      {prev && (
        <M.MuseNavCard
          type="button"
          $side="left"
          $accent={prev.accent}
          aria-label="Previous character"
        >
          <M.MuseNavCardImage
            $src={prev.cardBackground?.src || prev.image || ""}
          />
          <M.MuseNavCardVeil $side="left" />
          <M.MuseNavCardRail $side="left">
            <M.MuseNavCardChevron $accent={prev.accent}>
              <FiChevronLeft size={18} />
            </M.MuseNavCardChevron>
            <M.MuseNavCardRailName>{prev.firstName}</M.MuseNavCardRailName>
          </M.MuseNavCardRail>
          <M.MuseNavCardFooter $side="left">
            <M.MuseNavCardEyebrow>
              <M.MuseNavCardKbd>←</M.MuseNavCardKbd> Previous
            </M.MuseNavCardEyebrow>
            <M.MuseNavCardName>{prev.firstName}</M.MuseNavCardName>
          </M.MuseNavCardFooter>
        </M.MuseNavCard>
      )}
      {next && (
        <M.MuseNavCard
          type="button"
          $side="right"
          $accent={next.accent}
          aria-label="Next character"
        >
          <M.MuseNavCardImage
            $src={next.cardBackground?.src || next.image || ""}
          />
          <M.MuseNavCardVeil $side="right" />
          <M.MuseNavCardRail $side="right">
            <M.MuseNavCardChevron $accent={next.accent}>
              <FiChevronRight size={18} />
            </M.MuseNavCardChevron>
            <M.MuseNavCardRailName>{next.firstName}</M.MuseNavCardRailName>
          </M.MuseNavCardRail>
          <M.MuseNavCardFooter $side="right">
            <M.MuseNavCardEyebrow>
              Next <M.MuseNavCardKbd>→</M.MuseNavCardKbd>
            </M.MuseNavCardEyebrow>
            <M.MuseNavCardName>{next.firstName}</M.MuseNavCardName>
          </M.MuseNavCardFooter>
        </M.MuseNavCard>
      )}

      {author && (
        <M.BylineBar>
          <M.BylineInner>
            <M.BylineRule $accent={accent} />
            <M.Byline
              type="button"
              title={`From the pen of ${author.firstName} ${author.lastName}`}
            >
              <M.BylinePen $accent={accent}>
                <FiFeather />
              </M.BylinePen>
              <M.BylineLead>From the pen of</M.BylineLead>
              <M.BylineChip $accent={accent}>
                <M.BylineAvatar
                  $src={author.avatar?.src ?? author.image ?? ""}
                />
                <M.BylineName>{`${author.firstName} ${author.lastName}`}</M.BylineName>
                <M.BylineChevron>
                  <FiChevronRight size={12} />
                </M.BylineChevron>
              </M.BylineChip>
            </M.Byline>
            <M.BylineRule $accent={accent} />
          </M.BylineInner>
        </M.BylineBar>
      )}

      <M.VerseHeaderBar aria-label="Character verses">
        <M.VerseHeaderInner>
          <M.VerseHeaderLabel $accent={accent}>
            <FiLayers />
            Verses
          </M.VerseHeaderLabel>
          <M.VerseCircleTrack $accent={accent}>
            {(muse.verses ?? []).map((verse) => (
              <M.VerseCircle
                key={verse.id}
                type="button"
                $active={verse.id === muse.id}
                $accent={verse.useAccent ? verse.accent : undefined}
                disabled={verse.id === muse.id}
                title={`Verse ${verse.verseNumber ?? 1}`}
              >
                {verse.verseNumber ?? 1}
              </M.VerseCircle>
            ))}
          </M.VerseCircleTrack>
          {seed.canEdit && (
            <M.VerseCircleNew
              type="button"
              title="Create a new verse of this character"
            >
              <FiPlus size={14} />
            </M.VerseCircleNew>
          )}
        </M.VerseHeaderInner>
      </M.VerseHeaderBar>

      <M.MuseSongBar>
        <M.MuseSongInner
          style={
            accent ? ({ "--accent": accent } as React.CSSProperties) : undefined
          }
        >
          <ProfileSongPlayer song={FEATURED_SONG} slim block accent={accent} />
        </M.MuseSongInner>
      </M.MuseSongBar>

      <M.CardWrapper>
        <M.ImageWrapper>
          <M.CardBackground
            $banner={muse.cardBackground?.src || muse.image || ""}
          />
        </M.ImageWrapper>
      </M.CardWrapper>

      <SectionSwitcherContext.Provider value={switcher}>
        {onInfo ? (
          <MuseInfoSection muse={muse} isOwnMuse={seed.canEdit} />
        ) : (
          // HeadcanonsSection's own tree, with the seed handed to the panel.
          <M.CardExpandedWrapper
            $hideChrome={hideExpandedBackground}
            data-promo="canon"
          >
            <M.CardBack
              className="muse-card"
              accent={accent}
              $hideBackground={hideExpandedBackground}
            >
              <M.InfoCardContent>
                <SectionMiniHeader muse={muse} accent={accent ?? null} />
                <M.InfoDivider $accent={accent ?? null} />
                <M.ScrollableContent accent={accent} data-promo="canon-scroll">
                  <HeadcanonsPanel
                    key={stateKey}
                    museId={muse.id as string}
                    museName={name}
                    tone="card"
                    accent={accent ?? null}
                    verses={toVerseOptions(muse.verses)}
                    ownerNovelistId={muse.pennedBy?.id ?? null}
                    ownerUsername={muse.pennedBy?.username ?? null}
                    openHeadcanonId={openId}
                    seed={seed}
                  />
                </M.ScrollableContent>
              </M.InfoCardContent>
            </M.CardBack>
          </M.CardExpandedWrapper>
        )}
      </SectionSwitcherContext.Provider>

      <M.SideMenu aria-label="Character sections">
        <M.MenuHighlight
          $accent={accent}
          style={{
            height: pill?.height ?? 0,
            opacity: pill ? 1 : 0,
            transform: `translate(${pill?.left ?? 0}px, ${pill?.top ?? 0}px)`,
            width: pill?.width ?? 0,
          }}
        />
        {GROUPS.map((g) => (
          <M.MenuButton
            key={g.key}
            ref={g.key === "ABOUT" ? aboutRef : undefined}
            type="button"
            className={g.key === "ABOUT" ? "selected" : ""}
            aria-current={g.key === "ABOUT" ? "page" : undefined}
            $accent={accent}
          >
            <M.MenuButtonIcon>
              <g.icon size={g.key === "CARD" ? 14 : 20} />
            </M.MenuButtonIcon>
            <M.MenuText>{g.label.toUpperCase()}</M.MenuText>
          </M.MenuButton>
        ))}
      </M.SideMenu>
    </M.MuseContainer>
  );
};
