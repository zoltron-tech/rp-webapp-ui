"use client";

import classNames from "classnames";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiSolidConversation } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";
import { MdClose, MdPhotoLibrary } from "react-icons/md";
import { TiInfoLarge } from "react-icons/ti";
import { ShouldRender, Username } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import { useStateMachine } from "@/hooks";
import { useNsfwCheck } from "@/hooks/use-nsfw-check";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse, MuseAboutSection, Prompt } from "@/types";
import { Logger } from "@/utils/services";
import {
  getMuseAboutSectionsAction,
  getMuseAction,
  getMuseMediaAction,
} from "../../muse/actions";
import { getPromptsByMuseAction } from "../../prompt/actions";
import { BackStorySection } from "./sections/back-story-section";
import { ConnectionsSection } from "./sections/connections-section";
import { GallerySection } from "./sections/gallery-section";
import { MoreSection } from "./sections/more-section";
import { MuseInfoSection } from "./sections/muse-info-section";
import { PromptsSection } from "./sections/prompts-section";
import * as S from "./styles";

type CARD_STATE =
  | "MAIN"
  | "VIDEO"
  | "MUSE_INFO"
  | "CONNECTIONS"
  | "BACK_STORY"
  | "PROMPTS"
  | "GALLERY"
  | "MORE";

export default function MuseProfilePage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const [muse, setMuse] = useState<Muse | null>(null);
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [aboutSections, setAboutSections] = useState<MuseAboutSection[] | null>(
    null,
  );
  const [media, setMedia] = useState<string[] | null>(null);
  const [bannerNsfwRevealed, setBannerNsfwRevealed] = useState(false);
  const [cardNsfwRevealed, setCardNsfwRevealed] = useState(false);
  const username = params?.slug as string;
  const { baseDataLoader } = usePageRouter();
  const { transition, is } = useStateMachine<CARD_STATE>({
    initial: "MAIN",
    transitions: {
      BACK_STORY: {
        CONNECTIONS: true,
        GALLERY: true,
        MAIN: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      CONNECTIONS: {
        BACK_STORY: true,
        GALLERY: true,
        MAIN: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      GALLERY: {
        BACK_STORY: true,
        CONNECTIONS: true,
        MAIN: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      MAIN: {
        BACK_STORY: true,
        CONNECTIONS: true,
        GALLERY: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      MORE: {
        BACK_STORY: true,
        CONNECTIONS: true,
        GALLERY: true,
        MAIN: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      MUSE_INFO: {
        BACK_STORY: true,
        CONNECTIONS: true,
        GALLERY: true,
        MAIN: true,
        MORE: true,
        PROMPTS: true,
        VIDEO: true,
      },
      PROMPTS: {
        BACK_STORY: true,
        CONNECTIONS: true,
        GALLERY: true,
        MAIN: true,
        MORE: true,
        MUSE_INFO: true,
        VIDEO: true,
      },
      VIDEO: {
        BACK_STORY: true,
        CONNECTIONS: true,
        GALLERY: true,
        MAIN: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
    },
  });

  Logger.debug("params are:", params);

  const isOwnMuse = Boolean(
    user?.username && muse?.pennedBy?.username === user.username,
  );

  useEffect(() => {
    if (authState === "LOADING" || muse) return;

    const slug = username;
    baseDataLoader(() => getMuseAction(slug)).then(setMuse);
    baseDataLoader(() => getPromptsByMuseAction(slug)).then(setPrompts);
    baseDataLoader(() => getMuseAboutSectionsAction(slug)).then(
      setAboutSections,
    );
    baseDataLoader(() => getMuseMediaAction(slug)).then((result) => {
      if (Array.isArray(result)) setMedia(result);
    });
  }, [authState]);

  const getSafeImage = (src?: string) => src || "";
  const accent = muse?.useAccent ? (muse.accent ?? undefined) : undefined;

  const bannerSrc =
    (muse?.useExtraImages && getSafeImage(muse?.wallpaper?.src)) ||
    getSafeImage(muse?.image || "");
  const cardBgSrc =
    (muse?.useExtraImages && getSafeImage(muse?.cardBackground?.src)) ||
    getSafeImage(muse?.image || "");
  const isNsfwBanner = useNsfwCheck(bannerSrc || null, isOwnMuse);
  const isNsfwCard = useNsfwCheck(cardBgSrc || null, isOwnMuse);
  const showBannerNsfwOverlay = isNsfwBanner === true && !bannerNsfwRevealed;
  const showCardNsfwOverlay = isNsfwCard === true && !cardNsfwRevealed;
  const showCardBlur =
    !!cardBgSrc && (isNsfwCard === null || showCardNsfwOverlay);

  return (
    <S.MuseContainer>
      <S.Banner
        src={bannerSrc || null}
        filterValues={
          showBannerNsfwOverlay
            ? { blur: 40, brightness: 20, greyscale: 50 }
            : muse?.useExtraImages
              ? (muse?.wallpaper?.filterValues ?? {
                  blur: 20,
                  brightness: 50,
                  greyscale: 20,
                })
              : { blur: 20, brightness: 50, greyscale: 20 }
        }
      />
      {showBannerNsfwOverlay && (
        <S.BannerNSFWOverlay>
          <S.NSFWLabel>⚠️ Sensitive background content</S.NSFWLabel>
          <S.NSFWRevealButton
            type="button"
            onClick={() => setBannerNsfwRevealed(true)}
          >
            See anyway
          </S.NSFWRevealButton>
        </S.BannerNSFWOverlay>
      )}

      {/* Main character card */}
      <S.CardWrapper
        className={classNames({ closed: is("MAIN"), open: !is("MAIN") })}
      >
        <S.ImageWrapper>
          <S.CardBackground
            banner={cardBgSrc}
            style={{
              filter: showCardBlur ? "blur(20px)" : undefined,
              transition: "filter 0.3s ease",
            }}
          />
          {showCardNsfwOverlay && (
            <S.NSFWOverlay>
              <S.NSFWLabel>⚠️ Sensitive content</S.NSFWLabel>
            </S.NSFWOverlay>
          )}
        </S.ImageWrapper>
        {showCardNsfwOverlay && (
          <S.NSFWRevealButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCardNsfwRevealed(true);
            }}
          >
            See anyway
          </S.NSFWRevealButton>
        )}
        <S.Card className="muse-card">
          <S.CardHeader>
            <S.MuseInfo>
              <S.MuseName>
                {muse?.firstName} <br />
                {muse?.lastName}
              </S.MuseName>
              <S.AuthorContainer>
                <S.UsernameContainer>
                  <span className="penned">PENNED BY:</span>
                  <Username
                    username={muse?.pennedBy?.username}
                    accentOverride={accent}
                    primary
                  />
                </S.UsernameContainer>
              </S.AuthorContainer>
            </S.MuseInfo>
          </S.CardHeader>
        </S.Card>
      </S.CardWrapper>

      {/* Expanded sections */}
      <ShouldRender if={is("MUSE_INFO")}>
        <MuseInfoSection muse={muse} isOwnMuse={isOwnMuse} />
      </ShouldRender>

      <ShouldRender if={is("CONNECTIONS")}>
        <ConnectionsSection muse={muse} />
      </ShouldRender>

      <ShouldRender if={is("BACK_STORY")}>
        <BackStorySection
          muse={muse}
          aboutSections={aboutSections}
          isOwnMuse={isOwnMuse}
        />
      </ShouldRender>

      <ShouldRender if={is("PROMPTS")}>
        <PromptsSection muse={muse} prompts={prompts} />
      </ShouldRender>

      <ShouldRender if={is("GALLERY")}>
        <GallerySection muse={muse} media={media} />
      </ShouldRender>

      <ShouldRender if={is("MORE")}>
        <MoreSection muse={muse} isOwnMuse={isOwnMuse} />
      </ShouldRender>

      {/* Side navigation */}
      <S.SideMenu>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("PROMPTS")}
            className={classNames({ selected: is("PROMPTS") })}
            accent={accent}
          >
            <BiSolidConversation size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>INTERACTIONS</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("GALLERY")}
            className={classNames({ selected: is("GALLERY") })}
            accent={accent}
          >
            <MdPhotoLibrary size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>GALLERY</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("MUSE_INFO")}
            className={classNames({ selected: is("MUSE_INFO") })}
            accent={accent}
          >
            <TiInfoLarge size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>INFO</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("BACK_STORY")}
            className={classNames({ selected: is("BACK_STORY") })}
            accent={accent}
          >
            <GiBookCover size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>STORY</S.MenuText>
        </S.MenuButton>
        <ShouldRender if={!is("MAIN")}>
          <S.MenuButton className="stick-top">
            <S.MenuButtonIcon
              onClick={() => transition("MAIN")}
              accent={accent}
            >
              <MdClose />
            </S.MenuButtonIcon>
          </S.MenuButton>
        </ShouldRender>
        <ShouldRender if={is("MAIN")}>
          <S.MenuButton className="stick-top">
            <S.MenuButtonIcon
              onClick={() => transition("MORE")}
              accent={accent}
            >
              <FiMoreVertical size={"45%"} />
            </S.MenuButtonIcon>
          </S.MenuButton>
        </ShouldRender>
      </S.SideMenu>
    </S.MuseContainer>
  );
}
