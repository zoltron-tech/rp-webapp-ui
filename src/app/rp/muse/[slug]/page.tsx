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
import type { ImageCropFilter, ImageFilter, MuseNavItem, NWImage } from "@/types/novelist";
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

type NavDirection = "prev" | "next";

interface BannerLayer {
  dir: NavDirection | null;
  filters: ImageFilter;
  id: number;
  src: string | null;
}

const DEFAULT_BANNER_FILTERS: ImageFilter = { blur: 20, brightness: 50, greyscale: 20 };

const navName = (m: MuseNavItem) => [m.firstName, m.lastName].filter(Boolean).join(" ");

/**
 * Full muse → nav item. When navigating next/prev, the muse we're leaving is
 * by definition the new muse's back-neighbor, so it can be seeded instantly
 * instead of shimmer-loading until the fetch returns.
 */
function museToNavItem(m: Muse): MuseNavItem | null {
  if (!m.id) return null;
  return {
    accent: m.accent,
    avatar: m.avatar,
    cardBackground: m.cardBackground,
    extraAttributes: m.extraAttributes,
    firstName: m.firstName,
    gender: null,
    id: m.id,
    image: m.image,
    lastName: m.lastName,
    nicknames: m.nicknames,
    note: m.note,
    privacy: m.privacy,
    song: m.song,
    story: m.story,
    useAccent: m.useAccent,
    useExtraImages: m.useExtraImages,
    video: m.video,
    wallpaper: m.wallpaper,
  };
}

/** Card image + crop for a prev/next nav card, same fallback chain as the main card. */
function navCardVisual(m: MuseNavItem) {
  const src = (m.useExtraImages && m.cardBackground?.src) || m.image || "";
  const crop = m.useExtraImages ? m.cardBackground?.crop : null;
  return {
    bgPosition: crop ? `${crop.x}% ${crop.y}%` : undefined,
    bgSize: crop ? `${crop.width}%` : undefined,
    src,
  };
}

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
  // Auto-fit only for a freshly uploaded card image, not when re-adjusting an
  // existing one (which already has a saved crop position).
  const [cardBgAutoFit, setCardBgAutoFit] = useState(false);
  const [cardBgImageUploading, setCardBgImageUploading] = useState(false);
  const [cardBgSaving, setCardBgSaving] = useState(false);
  const [tempUploadedCardBg, setTempUploadedCardBg] = useState<string | null>(null);
  const [confirmRemoveCardBg, setConfirmRemoveCardBg] = useState(false);
  const cardBgViewportRef = useRef<HTMLDivElement>(null);
  const cardBgFileInputRef = useRef<HTMLInputElement>(null);

  const openNewCardBgCropDialog = (src: string) => {
    setPendingCardBgSrc(src);
    setCardBgX(50);
    setCardBgY(50);
    setCardBgScale(1);
    setCardBgAutoFit(true);
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
    setCardBgAutoFit(false);
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

  // Dragging is handled imperatively inside BannerCropDialog; it commits the
  // final position here once the gesture settles.
  const handleCardBgPan = (nx: number, ny: number) => {
    setCardBgX(clamp(nx, 0, 100));
    setCardBgY(clamp(ny, 0, 100));
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
  // Kept across navigation so the prev/next nav stays visible while the next
  // muse loads in; `navLoading` swaps the cards/buttons to a shimmer/spinner.
  const [nav, setNav] = useState<{ prev: MuseNavItem | null; next: MuseNavItem | null }>({
    next: null,
    prev: null,
  });
  const [navLoading, setNavLoading] = useState(false);
  // Minimal data of the muse being navigated to — lets the wallpaper and card
  // image swap immediately while the full muse loads in the background.
  const [previewMuse, setPreviewMuse] = useState<MuseNavItem | null>(null);
  const navDirectionRef = useRef<NavDirection | null>(null);

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
    // Drop the optimistic preview if this navigation isn't the one that set it
    // (e.g. a direct link while a prev/next fetch was still in flight).
    setPreviewMuse((p) => (p?.id === username ? p : null));
    baseDataLoader(() => getMuseAction(username)).then((data) => {
      setMuse(data);
      setNavLoading(false);
      setPreviewMuse(null);
      navDirectionRef.current = null;
      if (data) setNav({ next: data.next ?? null, prev: data.prev ?? null });
    });
  }, [authState, username]);

  const handlePrevMuse = useCallback(() => {
    if (!nav.prev || navLoading) return;
    navDirectionRef.current = "prev";
    setPreviewMuse(nav.prev);
    setNavLoading(true);
    // The muse we're leaving is the target's "next" neighbor — seed it so
    // that side renders instantly; only the unknown side shimmers.
    setNav({ next: muse ? museToNavItem(muse) : null, prev: null });
    routeToPage(ROUTES.Muse.View(nav.prev.id), { skipLoading: true });
  }, [nav.prev, navLoading, muse, routeToPage]);

  const handleNextMuse = useCallback(() => {
    if (!nav.next || navLoading) return;
    navDirectionRef.current = "next";
    setPreviewMuse(nav.next);
    setNavLoading(true);
    // The muse we're leaving is the target's "prev" neighbor — seed it so
    // that side renders instantly; only the unknown side shimmers.
    setNav({ next: null, prev: muse ? museToNavItem(muse) : null });
    routeToPage(ROUTES.Muse.View(nav.next.id), { skipLoading: true });
  }, [nav.next, navLoading, muse, routeToPage]);

  // Arrow-key navigation (desktop). Skipped while typing, while a dialog on
  // this page is open, or when a modifier is held (e.g. Alt+← is browser back).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (cardBgCropOpen || confirmRemoveCardBg) return;
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") handlePrevMuse();
      else handleNextMuse();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePrevMuse, handleNextMuse, cardBgCropOpen, confirmRemoveCardBg]);

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

  // While the full muse loads after prev/next navigation, fall back to the
  // minimal nav object so the wallpaper and card image swap instantly.
  const museVisual: Muse | MuseNavItem | null = muse ?? previewMuse;

  const bannerSrc =
    (museVisual?.useExtraImages && getSafeImage(museVisual?.wallpaper?.src)) ||
    getSafeImage(museVisual?.image || "");
  const cardBgSrc =
    (museVisual?.useExtraImages && getSafeImage(museVisual?.cardBackground?.src)) ||
    getSafeImage(museVisual?.image || "");

  // Derive CSS background-size / background-position from the stored crop.
  // crop.x/y = bgPosition percent, crop.width = scale * 100.
  const cardCrop = museVisual?.useExtraImages ? museVisual?.cardBackground?.crop : null;
  const cardBgCss = cardCrop
    ? {
        bgPosition: `${cardCrop.x}% ${cardCrop.y}%`,
        bgSize: `${cardCrop.width}%`,
      }
    : null;

  const bannerFilters = museVisual?.useExtraImages
    ? (museVisual.wallpaper?.filterValues ?? DEFAULT_BANNER_FILTERS)
    : DEFAULT_BANNER_FILTERS;

  // Wallpaper layers for the prev/next crossfade: the incoming wallpaper is
  // stacked on top of the old one and animated in; the old layer is dropped
  // once the animation finishes.
  const bannerLayerIdRef = useRef(0);
  const [bannerLayers, setBannerLayers] = useState<BannerLayer[]>([]);
  const bannerFilterKey = `${bannerFilters.blur}-${bannerFilters.brightness}-${bannerFilters.greyscale}`;

  useEffect(() => {
    setBannerLayers((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.src === (bannerSrc || null)) {
        // Same wallpaper, only filters changed — update in place, no animation.
        const same =
          last.filters.blur === bannerFilters.blur &&
          last.filters.brightness === bannerFilters.brightness &&
          last.filters.greyscale === bannerFilters.greyscale;
        return same ? prev : [...prev.slice(0, -1), { ...last, filters: bannerFilters }];
      }
      bannerLayerIdRef.current += 1;
      return [
        ...prev.slice(-1),
        {
          dir: navDirectionRef.current,
          filters: bannerFilters,
          id: bannerLayerIdRef.current,
          src: bannerSrc || null,
        },
      ];
    });
  }, [bannerSrc, bannerFilterKey]);

  const navPrevVisual = nav.prev ? navCardVisual(nav.prev) : null;
  const navNextVisual = nav.next ? navCardVisual(nav.next) : null;

  return (
    <S.MuseContainer>
      {bannerLayers.map((layer, i) => (
        <S.Banner
          key={layer.id}
          src={layer.src}
          filterValues={layer.filters}
          className={
            i > 0
              ? layer.dir === "next"
                ? "banner-enter banner-enter-next"
                : layer.dir === "prev"
                  ? "banner-enter banner-enter-prev"
                  : "banner-enter"
              : undefined
          }
          onAnimationEnd={() => {
            setBannerLayers((prev) => (prev.length > 1 ? prev.slice(-1) : prev));
          }}
        />
      ))}

      {/* Prev/next muse navigation. Desktop (>950px) shows edge-docked "peek"
          cards that slide out on hover/focus (arrow keys also navigate);
          mobile keeps the chevron buttons. Unknown neighbors shimmer while
          the target muse loads in the background. */}
      {(nav.prev || navLoading) && (
        <S.MuseNavCard
          type="button"
          $side="left"
          $accent={nav.prev?.useAccent ? nav.prev.accent : undefined}
          title={nav.prev ? `Previous: ${navName(nav.prev)}` : "Loading…"}
          aria-label="Previous character"
          onClick={handlePrevMuse}
          disabled={navLoading || museLoading}
        >
          {!nav.prev ? (
            <S.CardBackgroundShimmer />
          ) : (
            <>
              <S.MuseNavCardImage
                $src={navPrevVisual?.src ?? ""}
                $bgSize={navPrevVisual?.bgSize}
                $bgPosition={navPrevVisual?.bgPosition}
              />
              <S.MuseNavCardVeil $side="left" />
              <S.MuseNavCardRail $side="left">
                <S.MuseNavCardChevron $accent={nav.prev.useAccent ? nav.prev.accent : undefined}>
                  <FiChevronLeft size={18} />
                </S.MuseNavCardChevron>
                <S.MuseNavCardRailName>{nav.prev.firstName}</S.MuseNavCardRailName>
              </S.MuseNavCardRail>
              <S.MuseNavCardFooter $side="left">
                <S.MuseNavCardEyebrow>
                  <S.MuseNavCardKbd>←</S.MuseNavCardKbd> Previous
                </S.MuseNavCardEyebrow>
                <S.MuseNavCardName>{nav.prev.firstName}</S.MuseNavCardName>
              </S.MuseNavCardFooter>
            </>
          )}
        </S.MuseNavCard>
      )}
      {(nav.next || navLoading) && (
        <S.MuseNavCard
          type="button"
          $side="right"
          $accent={nav.next?.useAccent ? nav.next.accent : undefined}
          title={nav.next ? `Next: ${navName(nav.next)}` : "Loading…"}
          aria-label="Next character"
          onClick={handleNextMuse}
          disabled={navLoading || museLoading}
        >
          {!nav.next ? (
            <S.CardBackgroundShimmer />
          ) : (
            <>
              <S.MuseNavCardImage
                $src={navNextVisual?.src ?? ""}
                $bgSize={navNextVisual?.bgSize}
                $bgPosition={navNextVisual?.bgPosition}
              />
              <S.MuseNavCardVeil $side="right" />
              <S.MuseNavCardRail $side="right">
                <S.MuseNavCardChevron $accent={nav.next.useAccent ? nav.next.accent : undefined}>
                  <FiChevronRight size={18} />
                </S.MuseNavCardChevron>
                <S.MuseNavCardRailName>{nav.next.firstName}</S.MuseNavCardRailName>
              </S.MuseNavCardRail>
              <S.MuseNavCardFooter $side="right">
                <S.MuseNavCardEyebrow>
                  Next <S.MuseNavCardKbd>→</S.MuseNavCardKbd>
                </S.MuseNavCardEyebrow>
                <S.MuseNavCardName>{nav.next.firstName}</S.MuseNavCardName>
              </S.MuseNavCardFooter>
            </>
          )}
        </S.MuseNavCard>
      )}
      {(nav.prev || navLoading) && (
        <S.MuseNavTab
          type="button"
          $side="left"
          $accent={nav.prev?.useAccent ? nav.prev.accent : undefined}
          title={nav.prev ? `Previous: ${navName(nav.prev)}` : "Loading…"}
          aria-label="Previous character"
          onClick={handlePrevMuse}
          disabled={navLoading || museLoading}
        >
          {!nav.prev ? (
            <S.CardBackgroundShimmer />
          ) : (
            <>
              <S.MuseNavTabImage $src={navPrevVisual?.src ?? ""} />
              <S.MuseNavTabVeil $side="left" />
              <S.MuseNavTabContent>
                <S.MuseNavTabChevron $accent={nav.prev.useAccent ? nav.prev.accent : undefined}>
                  <FiChevronLeft size={14} />
                </S.MuseNavTabChevron>
                <S.MuseNavTabName>{nav.prev.firstName}</S.MuseNavTabName>
              </S.MuseNavTabContent>
            </>
          )}
        </S.MuseNavTab>
      )}
      {(nav.next || navLoading) && (
        <S.MuseNavTab
          type="button"
          $side="right"
          $accent={nav.next?.useAccent ? nav.next.accent : undefined}
          title={nav.next ? `Next: ${navName(nav.next)}` : "Loading…"}
          aria-label="Next character"
          onClick={handleNextMuse}
          disabled={navLoading || museLoading}
        >
          {!nav.next ? (
            <S.CardBackgroundShimmer />
          ) : (
            <>
              <S.MuseNavTabImage $src={navNextVisual?.src ?? ""} />
              <S.MuseNavTabVeil $side="right" />
              <S.MuseNavTabContent>
                <S.MuseNavTabChevron $accent={nav.next.useAccent ? nav.next.accent : undefined}>
                  <FiChevronRight size={14} />
                </S.MuseNavTabChevron>
                <S.MuseNavTabName>{nav.next.firstName}</S.MuseNavTabName>
              </S.MuseNavTabContent>
            </>
          )}
        </S.MuseNavTab>
      )}

      {/* Main character card */}
      <S.CardWrapper>
        <S.ImageWrapper>
          {museVisual ? (
            <S.CardBackground
              banner={cardBgSrc}
              $bgSize={cardBgCss?.bgSize}
              $bgPosition={cardBgCss?.bgPosition}
            />
          ) : (
            <S.CardBackgroundShimmer />
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
      <S.SideMenu aria-label="Character sections">
        <S.MenuButton
          type="button"
          onClick={() => transition("MUSE_INFO")}
          className={is("MUSE_INFO") ? "selected" : ""}
          $accent={accent}
        >
          <S.MenuButtonIcon>
            <TiInfoLarge size={20} />
          </S.MenuButtonIcon>
          <S.MenuText>INFO</S.MenuText>
        </S.MenuButton>
        <S.MenuButton
          type="button"
          onClick={() => transition("BACK_STORY")}
          className={is("BACK_STORY") ? "selected" : ""}
          $accent={accent}
        >
          <S.MenuButtonIcon>
            <GiBookCover size={20} />
          </S.MenuButtonIcon>
          <S.MenuText>STORY</S.MenuText>
        </S.MenuButton>
        <S.MenuButton
          type="button"
          onClick={() => transition("PROMPTS")}
          className={is("PROMPTS") ? "selected" : ""}
          $accent={accent}
        >
          <S.MenuButtonIcon>
            <BiSolidConversation size={20} />
          </S.MenuButtonIcon>
          <S.MenuText>POSTS</S.MenuText>
        </S.MenuButton>
        <S.MenuButton
          type="button"
          onClick={() => transition("CARD_IMAGE")}
          className={`card-image-mobile-only ${is("CARD_IMAGE") ? "selected" : ""}`}
          $accent={accent}
        >
          <S.MenuButtonIcon>
            <FaImagePortrait size={20} />
          </S.MenuButtonIcon>
          <S.MenuText>CARD</S.MenuText>
        </S.MenuButton>
        <S.MenuButton
          type="button"
          onClick={() => transition("GALLERY")}
          className={is("GALLERY") ? "selected" : ""}
          $accent={accent}
        >
          <S.MenuButtonIcon>
            <MdPhotoLibrary size={20} />
          </S.MenuButtonIcon>
          <S.MenuText>GALLERY</S.MenuText>
        </S.MenuButton>
        <S.MenuButton
          type="button"
          onClick={() => transition("MORE")}
          className={is("MORE") ? "selected" : ""}
          $accent={accent}
        >
          <S.MenuButtonIcon>
            <FiMoreVertical size={20} />
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
              onPan={handleCardBgPan}
              onScaleChange={handleCardBgScaleChange}
              onReset={resetCardBgCrop}
              onFit={handleCardBgFit}
              autoFit={cardBgAutoFit}
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
