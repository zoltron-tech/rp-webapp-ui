"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiSolidConversation } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";
import { MdImage, MdPhotoLibrary } from "react-icons/md";
import { TiInfoLarge } from "react-icons/ti";
import { ShouldRender } from "@/components/common";
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
import { CardImageSection } from "./sections/card-image-section";
import { ConnectionsSection } from "./sections/connections-section";
import { GallerySection } from "./sections/gallery-section";
import { MoreSection } from "./sections/more-section";
import { MuseInfoSection } from "./sections/muse-info-section";
import { PromptsSection } from "./sections/prompts-section";
import * as S from "./styles";

type CARD_STATE =
  | "CARD_IMAGE"
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
    initial: "MUSE_INFO",
    transitions: {
      BACK_STORY: {
        CARD_IMAGE: true,
        CONNECTIONS: true,
        GALLERY: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
      CARD_IMAGE: {
        BACK_STORY: true,
        CONNECTIONS: true,
        GALLERY: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
      CONNECTIONS: {
        BACK_STORY: true,
        CARD_IMAGE: true,
        GALLERY: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
      GALLERY: {
        BACK_STORY: true,
        CARD_IMAGE: true,
        CONNECTIONS: true,
        MORE: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
      MORE: {
        BACK_STORY: true,
        CARD_IMAGE: true,
        CONNECTIONS: true,
        GALLERY: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
      MUSE_INFO: {
        BACK_STORY: true,
        CARD_IMAGE: true,
        CONNECTIONS: true,
        GALLERY: true,
        MORE: true,
        PROMPTS: true,
      },
      PROMPTS: {
        BACK_STORY: true,
        CARD_IMAGE: true,
        CONNECTIONS: true,
        GALLERY: true,
        MORE: true,
        MUSE_INFO: true,
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

  // Derive CSS background-size / background-position from the stored crop.
  // crop.x/y = bgPosition percent, crop.width = scale * 100.
  const cardCrop = muse?.useExtraImages ? muse?.cardBackground?.crop : null;
  const cardBgCss = cardCrop
    ? {
        bgPosition: `${cardCrop.x}% ${cardCrop.y}%`,
        bgSize: `${cardCrop.width}%`,
      }
    : null;
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
      <S.CardWrapper>
        <S.ImageWrapper>
          <S.CardBackground
            banner={cardBgSrc}
            $bgSize={cardBgCss?.bgSize}
            $bgPosition={cardBgCss?.bgPosition}
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
      </S.CardWrapper>

      {/* Sections — always show the selected one */}
      <ShouldRender if={is("CARD_IMAGE")}>
        <CardImageSection muse={muse} cardBgSrc={cardBgSrc} />
      </ShouldRender>

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

      {/* Section navigation */}
      <S.SideMenu>
        <S.MenuButton
          style={{
            display: "none",
            ...(typeof window !== "undefined" && window.innerWidth < 950
              ? { display: "flex" }
              : {}),
          }}
          className="card-image-mobile-only"
        >
          <S.MenuButtonIcon
            onClick={() => transition("CARD_IMAGE")}
            className={is("CARD_IMAGE") ? "selected" : ""}
            accent={accent}
          >
            <MdImage size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>CARD</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("MUSE_INFO")}
            className={is("MUSE_INFO") ? "selected" : ""}
            accent={accent}
          >
            <TiInfoLarge size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>INFO</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("BACK_STORY")}
            className={is("BACK_STORY") ? "selected" : ""}
            accent={accent}
          >
            <GiBookCover size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>STORY</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("PROMPTS")}
            className={is("PROMPTS") ? "selected" : ""}
            accent={accent}
          >
            <BiSolidConversation size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>POSTS</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("GALLERY")}
            className={is("GALLERY") ? "selected" : ""}
            accent={accent}
          >
            <MdPhotoLibrary size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>GALLERY</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("MORE")}
            className={is("MORE") ? "selected" : ""}
            accent={accent}
          >
            <FiMoreVertical size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>MORE</S.MenuText>
        </S.MenuButton>
      </S.SideMenu>
    </S.MuseContainer>
  );
}
