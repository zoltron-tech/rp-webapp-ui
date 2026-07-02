"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiSolidConversation } from "react-icons/bi";
import { FaImagePortrait } from "react-icons/fa6";
import { FiCamera, FiChevronLeft, FiChevronRight, FiMoreVertical } from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";
import { MdImage, MdPhotoLibrary } from "react-icons/md";
import { TiInfoLarge } from "react-icons/ti";
import { ShouldRender } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import BannerCropDialog from "@/components/dialog/banner-crop-dialog";
import { useGlobalState } from "@/context/store/stores";
import { useStateMachine } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { Muse, MuseAboutSection, Prompt } from "@/types";
import type { ImageCropFilter, NWImage } from "@/types/novelist";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { reverseWsrvUrl } from "@/utils/image";
import { Logger } from "@/utils/services";
import { deleteMedia } from "../../profile/actions";
import { getMuseRankAction } from "../../leaderboard/actions";
import {
  getMuseAboutSectionsAction,
  getMuseAction,
  getMuseMediaAction,
  removeMuseCardBackgroundAction,
  setMuseCardBackgroundAction,
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

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function toCropFilter(src: string, x: number, y: number, scale: number): ImageCropFilter {
  const scalePct = Math.round(scale * 100);
  return { height: scalePct, src, width: scalePct, x: Math.round(x), y: Math.round(y) };
}

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
  const { successToast, errorToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();
  const [muse, setMuse] = useState<Muse | null>(null);
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [aboutSections, setAboutSections] = useState<MuseAboutSection[] | null>(
    null,
  );
  const [media, setMedia] = useState<string[] | null>(null);
  const [museRank, setMuseRank] = useState<number | null>(null);
  const [museRankLoading, setMuseRankLoading] = useState(true);
  const username = params?.slug as string;
  const { baseDataLoader, routeToPage } = usePageRouter();
  const fetchedForRef = useRef<string | null>(null);

  // ── Card background crop ───────────────────────────────────────────────────
  const [cardBgCropOpen, setCardBgCropOpen] = useState(false);
  const [pendingCardBgSrc, setPendingCardBgSrc] = useState("");
  const [cardBgX, setCardBgX] = useState(50);
  const [cardBgY, setCardBgY] = useState(50);
  const [cardBgScale, setCardBgScale] = useState(1);
  const [cardBgImageUploading, setCardBgImageUploading] = useState(false);
  const [cardBgSaving, setCardBgSaving] = useState(false);
  const [tempUploadedCardBg, setTempUploadedCardBg] = useState<string | null>(null);
  const [confirmRemoveCardBg, setConfirmRemoveCardBg] = useState(false);
  const cardBgViewportRef = useRef<HTMLDivElement>(null);
  const cardBgDragStart = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const lastCardBgPinchDist = useRef<number | null>(null);
  const cardBgFileInputRef = useRef<HTMLInputElement>(null);

  const openNewCardBgCropDialog = (src: string) => {
    setPendingCardBgSrc(src);
    setCardBgX(50);
    setCardBgY(50);
    setCardBgScale(1);
    setCardBgCropOpen(true);
  };

  const openExistingCardBgCropDialog = useCallback(() => {
    const bg = muse?.cardBackground;
    if (!bg?.src) {
      cardBgFileInputRef.current?.click();
      return;
    }
    setPendingCardBgSrc(reverseWsrvUrl(bg.src) ?? bg.src);
    setCardBgX(bg.crop?.x ?? 50);
    setCardBgY(bg.crop?.y ?? 50);
    setCardBgScale(bg.crop?.width ? bg.crop.width / 100 : 1);
    setCardBgCropOpen(true);
  }, [muse?.cardBackground]);

  async function handleCardBgFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !muse?.id) return;
    const reader = new FileReader();
    reader.onloadend = () => { openNewCardBgCropDialog(reader.result as string); };
    reader.readAsDataURL(file);
    if (tempUploadedCardBg) await deleteMedia(tempUploadedCardBg);
    setCardBgImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentType", file.type);
    formData.append("prefix", muse.id);
    const url = await uploadMedia(formData);
    setCardBgImageUploading(false);
    if (!url || url === API_MESSAGE.MediaError) {
      errorToast("Failed to upload image.");
      setCardBgCropOpen(false);
      return;
    }
    setTempUploadedCardBg(url);
    setPendingCardBgSrc(url);
  }

  const handleCardBgPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.isPrimary === false) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cardBgDragStart.current = { bx: cardBgX, by: cardBgY, px: e.clientX, py: e.clientY };
  };

  const handleCardBgPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardBgDragStart.current || !cardBgViewportRef.current) return;
    const rect = cardBgViewportRef.current.getBoundingClientRect();
    const dx = ((e.clientX - cardBgDragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - cardBgDragStart.current.py) / rect.height) * 100;
    setCardBgX(clamp(cardBgDragStart.current.bx - dx, 0, 100));
    setCardBgY(clamp(cardBgDragStart.current.by - dy, 0, 100));
  };

  const handleCardBgPointerUp = () => { cardBgDragStart.current = null; };

  const handleCardBgWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setCardBgScale((prev) => clamp(prev + delta, 1, 3));
  };

  const handleCardBgTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastCardBgPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  };

  const handleCardBgTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastCardBgPinchDist.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const delta = (dist - lastCardBgPinchDist.current) * 0.01;
      lastCardBgPinchDist.current = dist;
      setCardBgScale((prev) => clamp(prev + delta, 1, 3));
    }
  };

  const handleCardBgScaleChange = (v: number) => { setCardBgScale(clamp(v, 1, 3)); };

  const handleCardBgCropConfirm = useCallback(() => {
    if (!muse?.id) return;
    const crop = toCropFilter(pendingCardBgSrc, cardBgX, cardBgY, cardBgScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingCardBgSrc,
    };
    setCardBgSaving(true);
    setMuseCardBackgroundAction(muse.id, nwImage).then((result) => {
      setCardBgSaving(false);
      if (result && typeof result === "object" && "message" in result) {
        errorToast("Failed to update card background.");
        return;
      }
      setTempUploadedCardBg(null);
      setMuse((prev) =>
        prev ? { ...prev, cardBackground: result as NWImage, useExtraImages: true } : prev,
      );
      successToast("Card background updated.");
    });
  }, [muse?.id, pendingCardBgSrc, cardBgX, cardBgY, cardBgScale, errorToast, successToast]);

  const handleCardBgCropCancel = useCallback(async () => {
    if (tempUploadedCardBg && tempUploadedCardBg === pendingCardBgSrc) {
      await deleteMedia(tempUploadedCardBg);
      setTempUploadedCardBg(null);
    }
    setCardBgCropOpen(false);
  }, [tempUploadedCardBg, pendingCardBgSrc]);

  const resetCardBgCrop = useCallback(() => {
    setCardBgX(50);
    setCardBgY(50);
    setCardBgScale(1);
  }, []);

  const handleCardBgFit = useCallback((fitScale: number) => {
    setCardBgX(50);
    setCardBgY(50);
    setCardBgScale(fitScale);
  }, []);

  async function handleRemoveCardBg() {
    if (!muse?.id) return;
    const result = await removeMuseCardBackgroundAction(muse.id);
    if (result && typeof result === "object" && "message" in result) {
      errorToast("Failed to remove card background.");
      return;
    }
    setMuse((prev) => prev ? { ...prev, cardBackground: null, useExtraImages: false } : prev);
    successToast("Card background removed.");
  }
  const { transition, is, state } = useStateMachine<CARD_STATE>({
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

  useEffect(() => {
    if (!muse?.id) return;
    getMuseRankAction(muse.id).then((result) => {
      if (result && !("message" in result)) setMuseRank(result.rank);
      setMuseRankLoading(false);
    });
  }, [muse?.id]);

  Logger.debug("params are:", params);

  const isOwnMuse = Boolean(
    user?.username && muse?.pennedBy?.username === user.username,
  );
  const museLoading = muse === null;
  // Kept across navigation so the prev/next arrows don't disappear while the
  // next muse's shimmer is loading in — they're the only thing we can show
  // before the new muse data arrives.
  const [navIds, setNavIds] = useState<{ prevId: string | null; nextId: string | null }>({
    nextId: null,
    prevId: null,
  });

  const promptsFetchedRef = useRef(false);
  const aboutSectionsFetchedRef = useRef(false);
  const mediaFetchedRef = useRef(false);

  useEffect(() => {
    if (authState === "LOADING" || fetchedForRef.current === username) return;
    fetchedForRef.current = username;
    // Navigating between muses via prev/next reuses this component instance
    // (same route segment), so per-muse state must be reset explicitly.
    setMuse(null);
    setPrompts(null);
    setAboutSections(null);
    setMedia(null);
    setMuseRank(null);
    setMuseRankLoading(true);
    promptsFetchedRef.current = false;
    aboutSectionsFetchedRef.current = false;
    mediaFetchedRef.current = false;
    baseDataLoader(() => getMuseAction(username)).then((data) => {
      setMuse(data);
      if (data) setNavIds({ nextId: data.nextId ?? null, prevId: data.prevId ?? null });
    });
  }, [authState, username]);

  const handlePrevMuse = useCallback(() => {
    if (navIds.prevId) routeToPage(ROUTES.Muse.View(navIds.prevId), { skipLoading: true });
  }, [navIds.prevId, routeToPage]);

  const handleNextMuse = useCallback(() => {
    if (navIds.nextId) routeToPage(ROUTES.Muse.View(navIds.nextId), { skipLoading: true });
  }, [navIds.nextId, routeToPage]);

  useEffect(() => {
    if (state !== "PROMPTS" || promptsFetchedRef.current || authState === "LOADING") return;
    promptsFetchedRef.current = true;
    baseDataLoader(() => getPromptsByMuseAction(username)).then((data) => {
      setPrompts(data ?? []);
    });
  }, [state, authState, username]);

  useEffect(() => {
    if (state !== "BACK_STORY" || aboutSectionsFetchedRef.current || authState === "LOADING") return;
    aboutSectionsFetchedRef.current = true;
    baseDataLoader(() => getMuseAboutSectionsAction(username)).then((data) => {
      setAboutSections(data ?? []);
    });
  }, [state, authState, username]);

  useEffect(() => {
    if (state !== "GALLERY" || mediaFetchedRef.current || authState === "LOADING") return;
    mediaFetchedRef.current = true;
    baseDataLoader(() => getMuseMediaAction(username)).then((result) => {
      setMedia(Array.isArray(result) ? result : []);
    });
  }, [state, authState, username]);

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
  return (
    <S.MuseContainer>
      <S.Banner
        src={bannerSrc || null}
        filterValues={
          muse?.useExtraImages
            ? (muse?.wallpaper?.filterValues ?? {
                blur: 20,
                brightness: 50,
                greyscale: 20,
              })
            : { blur: 20, brightness: 50, greyscale: 20 }
        }
      />

      {/* Prev/next muse navigation — kept visible (but disabled) while the
          next muse loads in, using the last-known neighbor ids */}
      {navIds.prevId && (
        <S.MuseNavButton
          type="button"
          $side="left"
          title="Previous character"
          aria-label="Previous character"
          onClick={handlePrevMuse}
          disabled={museLoading}
        >
          <FiChevronLeft size={22} />
        </S.MuseNavButton>
      )}
      {navIds.nextId && (
        <S.MuseNavButton
          type="button"
          $side="right"
          title="Next character"
          aria-label="Next character"
          onClick={handleNextMuse}
          disabled={museLoading}
        >
          <FiChevronRight size={22} />
        </S.MuseNavButton>
      )}

      {/* Main character card */}
      <S.CardWrapper>
        <S.ImageWrapper>
          {museLoading ? (
            <S.CardBackgroundShimmer />
          ) : (
            <S.CardBackground
              banner={cardBgSrc}
              $bgSize={cardBgCss?.bgSize}
              $bgPosition={cardBgCss?.bgPosition}
            />
          )}
        </S.ImageWrapper>
        {isOwnMuse && (
          <>
            <S.CardBgEditBtn
              type="button"
              title={cardBgSaving ? "Saving…" : muse?.cardBackground ? "Adjust card image" : "Add card image"}
              disabled={cardBgSaving || cardBgImageUploading}
              onClick={openExistingCardBgCropDialog}
            >
              {cardBgSaving ? <span style={{ fontSize: "0.45rem" }}>…</span> : <FiCamera size={12} />}
            </S.CardBgEditBtn>
            {muse?.cardBackground && (
              <S.CardBgRemoveBtn
                className="card-bg-remove"
                type="button"
                title="Remove card image"
                onClick={() => setConfirmRemoveCardBg(true)}
              >
                ×
              </S.CardBgRemoveBtn>
            )}
          </>
        )}
      </S.CardWrapper>

      {/* Sections — always show the selected one */}
      <ShouldRender if={is("CARD_IMAGE")}>
        <CardImageSection
          muse={muse}
          cardBgSrc={cardBgSrc}
          isOwnMuse={isOwnMuse}
          cardBgSaving={cardBgSaving || cardBgImageUploading}
          onEditCardBg={openExistingCardBgCropDialog}
          onRemoveCardBg={() => setConfirmRemoveCardBg(true)}
        />
      </ShouldRender>

      <ShouldRender if={is("MUSE_INFO")}>
        <MuseInfoSection
          muse={muse}
          isOwnMuse={isOwnMuse}
          museRank={museRank}
          museRankLoading={museRankLoading}
          onMuseUpdate={(updates) => setMuse((prev) => (prev ? { ...prev, ...updates } : prev))}
        />
      </ShouldRender>

      <ShouldRender if={is("CONNECTIONS")}>
        <ConnectionsSection muse={muse} />
      </ShouldRender>

      <ShouldRender if={is("BACK_STORY")}>
        <BackStorySection
          muse={muse}
          aboutSections={aboutSections}
          isOwnMuse={isOwnMuse}
          onMuseUpdate={(updates) => setMuse((prev) => (prev ? { ...prev, ...updates } : prev))}
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
            <FaImagePortrait size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>CARD</S.MenuText>
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

      {/* Card background — hidden file input */}
      <input
        ref={cardBgFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleCardBgFileChange}
      />

      {/* Card background crop/adjust dialog */}
      <AppAlertDialog
        open={cardBgCropOpen}
        onOpenChange={(open) => {
          if (!open) handleCardBgCropCancel();
          setCardBgCropOpen(open);
        }}
        heading="Adjust card image"
        text="Drag to reposition. Scroll or pinch to zoom."
        showConfirm={false}
        isCancelHidden={true}
        body={
          <S.CardBgCropBody>
            <BannerCropDialog
              open={cardBgCropOpen}
              src={pendingCardBgSrc}
              x={cardBgX}
              y={cardBgY}
              scale={cardBgScale}
              portrait
              aspectRatio="9 / 16"
              onOpenChange={setCardBgCropOpen}
              onPointerDown={handleCardBgPointerDown}
              onPointerMove={handleCardBgPointerMove}
              onPointerUp={handleCardBgPointerUp}
              onTouchStart={handleCardBgTouchStart}
              onTouchMove={handleCardBgTouchMove}
              onWheel={handleCardBgWheel}
              onScaleChange={handleCardBgScaleChange}
              onReset={resetCardBgCrop}
              onFit={handleCardBgFit}
              onCancel={handleCardBgCropCancel}
              onConfirm={handleCardBgCropConfirm}
              onChangeBanner={() => cardBgFileInputRef.current?.click()}
              isUploading={cardBgImageUploading}
              viewportRef={cardBgViewportRef}
            />
          </S.CardBgCropBody>
        }
      />

      {/* Confirm: remove card background */}
      <AppAlertDialog
        heading="Remove card image?"
        text="Remove the custom card background? The main character image will be used instead."
        open={confirmRemoveCardBg}
        onOpenChange={(open) => { if (!open) setConfirmRemoveCardBg(false); }}
        onCancel={() => setConfirmRemoveCardBg(false)}
        onConfirm={() => { setConfirmRemoveCardBg(false); handleRemoveCardBg(); }}
        actionButtonLabel="Remove"
        actionColor="negative"
      />
    </S.MuseContainer>
  );
}
