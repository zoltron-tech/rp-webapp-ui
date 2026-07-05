"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Form, Separator } from "radix-ui";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HexColorPicker } from "react-colorful";
import { BsArrowLeft, BsAspectRatio, BsPencil, BsUpload } from "react-icons/bs";
import { MdOutlineBrush, MdTune } from "react-icons/md";
import { getMuseMediaAction, setMuseAvatarAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { ImageCropFilter, NWImage } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { LoaderAction } from "../common/loader-action";
import { PrivacyIcon } from "../common/privacy-icon";
import { AppAlertDialog } from "../dialog";
import AvatarCropDialog from "../dialog/avatar-crop-dialog";
import { ErrorBox } from "../error-box";
import { PromptPrivacySelect } from "../prompt-input/privacy-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const PRIVACY_LABELS: Record<string, string> = {
  CUSTOM: "Custom",
  FRIENDS: "Friends",
  ONLY_ME: "Only Me",
  PUBLIC: "Public",
};

/** Height ÷ width of the muse card (9:16 portrait). Used to compute the
 *  "fit smaller side" zoom for the card image. */
const CARD_ASPECT_H_OVER_W = 16 / 9;

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"];
const isImageUrl = (url: string) => {
  const lower = url.toLowerCase().split("?")[0];
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function toCropFilter(src: string, x: number, y: number, scale: number): ImageCropFilter {
  const scalePct = Math.round(scale * 100);
  return { height: scalePct, src, width: scalePct, x: Math.round(x), y: Math.round(y) };
}

type TempUploads = {
  image?: string;
  wallpaper?: string;
  cardBackground?: string;
};

type Props = {
  isWizard?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  onBack?: () => void;
  onDone: (savedId?: string) => void;
  onSkip?: () => void;
};

export function AppearanceSection({
  isWizard,
  stepIndex = 0,
  totalSteps = 3,
  onBack,
  onDone,
  onSkip,
}: Props) {
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const image = useMuseState("image");
  const avatar = useMuseState("avatar");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const privacy = useMuseState("privacy");
  // Verses inherit privacy from their parent and can't change it here either.
  const originalVerseId = useMuseState("originalVerseId");
  const accent = useMuseState("accent");
  const useAccent = useMuseState("useAccent");
  const useExtraImages = useMuseState("useExtraImages");
  const setMuseState = useMuseStoreSet();
  const { save, loading } = useMuseSave();
  const { uploadMedia } = useUploadMedia();
  const { successToast, errorToast } = useUIContext();

  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempAccent, setTempAccent] = useState("#ff0000");
  const [tempUploads, setTempUploads] = useState<TempUploads>({});

  // Combined extra-images dialog
  const [extraDialogOpen, setExtraDialogOpen] = useState(false);
  const [openedFromCheckbox, setOpenedFromCheckbox] = useState(false);
  const [tempWallpaper, setTempWallpaper] = useState<NWImage | null>(null);
  const [tempCardBg, setTempCardBg] = useState<NWImage | null>(null);
  const [tempFilterValues, setTempFilterValues] = useState({
    blur: 0,
    brightness: 100,
    greyscale: 0,
  });

  // Media picker (within the dialog)
  const [pickerTarget, setPickerTarget] = useState<
    "wallpaper" | "cardBackground" | null
  >(null);
  const [museMedia, setMuseMedia] = useState<string[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // ── Avatar crop dialog ──────────────────────────────────────────────────────
  const avatarViewportRef = useRef<HTMLDivElement>(null);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState("");
  const [avatarX, setAvatarX] = useState(50);
  const [avatarY, setAvatarY] = useState(50);
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarTempUpload, setAvatarTempUpload] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  // ── Card crop state ────────────────────────────────────────────────────────
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const cropDragStart = useRef<{
    px: number;
    py: number;
    bx: number;
    by: number;
  } | null>(null);
  const [cropBgX, setCropBgX] = useState(50);
  const [cropBgY, setCropBgY] = useState(50);
  const [cropScale, setCropScale] = useState(1);
  // Live position/zoom applied imperatively to the card face during drag so no
  // React state churns per frame; committed to state/tempCardBg only on release.
  const liveCrop = useRef({ x: 50, y: 50, scale: 1 });

  const buildNWImage = (
    src: string,
    filterValues = { blur: 0, brightness: 100, greyscale: 0 },
  ): NWImage => ({
    crop: { height: 500, src, width: 500, x: 0, y: 0 },
    filterValues,
    src,
  });

  const openAvatarCropDialog = (src: string) => {
    setPendingAvatarSrc(src);
    setAvatarX(50);
    setAvatarY(50);
    setAvatarScale(1);
    setAvatarCropOpen(true);
  };

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setMediaError("File type not supported. Allowed: .png, .jpg, .gif");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setMediaError("File too large (max 50 MB).");
        return;
      }
      setMediaError(null);

      // Show a data URL immediately in the crop dialog while S3 uploads in parallel
      const reader = new FileReader();
      reader.onloadend = () => openAvatarCropDialog(reader.result as string);
      reader.readAsDataURL(file);

      if (avatarTempUpload) await deleteMedia(avatarTempUpload);

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      if (id) formData.append("prefix", id);
      const url = await uploadMedia(formData);
      setImageUploading(false);

      if (url === API_MESSAGE.MediaError) {
        setError("Failed to upload avatar. Please try again.");
        setAvatarCropOpen(false);
        return;
      }
      setAvatarTempUpload(url);
      setPendingAvatarSrc(url);
    },
    [id, avatarTempUpload, uploadMedia],
  );

  // Dragging is handled imperatively inside AvatarCropDialog; it commits the
  // final position here once the gesture settles.
  const handleAvatarPan = (nx: number, ny: number) => {
    setAvatarX(clamp(nx, 0, 100));
    setAvatarY(clamp(ny, 0, 100));
  };

  const handleAvatarScaleChange = (v: number) => {
    setAvatarScale(clamp(v, 1, 3));
  };

  const resetAvatarCrop = useCallback(() => {
    setAvatarX(50);
    setAvatarY(50);
    setAvatarScale(1);
  }, []);

  const handleAvatarCropConfirm = useCallback(() => {
    if (!id) return;
    const crop = toCropFilter(pendingAvatarSrc, avatarX, avatarY, avatarScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingAvatarSrc,
    };
    setAvatarSaving(true);
    setMuseAvatarAction(id, nwImage).then((result) => {
      setAvatarSaving(false);
      if (result && typeof result === "object" && "message" in result) {
        errorToast("Failed to update avatar.");
        return;
      }
      setAvatarTempUpload(null);
      setMuseState({ avatar: result as NWImage });
      successToast("Avatar updated.");
    });
  }, [id, pendingAvatarSrc, avatarX, avatarY, avatarScale, setMuseState, errorToast, successToast]);

  const handleAvatarCropCancel = useCallback(async () => {
    if (avatarTempUpload && avatarTempUpload === pendingAvatarSrc) {
      await deleteMedia(avatarTempUpload);
      setAvatarTempUpload(null);
    }
    setAvatarCropOpen(false);
  }, [avatarTempUpload, pendingAvatarSrc]);

  const openExtraDialog = useCallback(
    (fromCheckbox: boolean) => {
      setTempWallpaper(wallpaper);
      setTempCardBg(cardBackground);
      setTempFilterValues(
        wallpaper?.filterValues ?? { blur: 0, brightness: 100, greyscale: 0 },
      );
      setOpenedFromCheckbox(fromCheckbox);
      setPickerTarget(null);
      setExtraDialogOpen(true);
      if (id && museMedia.length === 0) {
        setMediaLoading(true);
        getMuseMediaAction(id).then((result) => {
          setMediaLoading(false);
          if (Array.isArray(result)) setMuseMedia(result);
        });
      }
    },
    [wallpaper, cardBackground, id, museMedia.length],
  );

  const handleExtraDialogSave = useCallback(() => {
    const src = tempWallpaper?.src || image || "";
    setMuseState({
      cardBackground: tempCardBg,
      useExtraImages: true,
      wallpaper: {
        crop: { height: 500, src, width: 500, x: 0, y: 0 },
        filterValues: tempFilterValues,
        src,
      },
    });
    setTempUploads((prev) => ({
      ...prev,
      cardBackground: undefined,
      wallpaper: undefined,
    }));
    setExtraDialogOpen(false);
  }, [tempWallpaper, tempCardBg, tempFilterValues, image, setMuseState]);

  const handleExtraDialogCancel = useCallback(() => {
    if (tempUploads.wallpaper) deleteMedia(tempUploads.wallpaper);
    if (tempUploads.cardBackground) deleteMedia(tempUploads.cardBackground);
    setTempUploads((prev) => ({
      ...prev,
      cardBackground: undefined,
      wallpaper: undefined,
    }));
    if (openedFromCheckbox) setMuseState({ useExtraImages: false });
    setExtraDialogOpen(false);
  }, [openedFromCheckbox, setMuseState, tempUploads]);

  const handlePickerUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      const target = pickerTarget;
      if (!target) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setMediaError("File type not supported. Allowed: .png, .jpg, .gif");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setMediaError("File too large (max 50 MB).");
        return;
      }
      setMediaError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (target === "wallpaper") {
          setTempWallpaper(buildNWImage(dataUrl, tempFilterValues));
        } else {
          setTempCardBg(buildNWImage(dataUrl));
        }
      };
      reader.readAsDataURL(file);

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      if (id) formData.append("prefix", id);
      const url = await uploadMedia(formData);
      setImageUploading(false);

      if (url === API_MESSAGE.MediaError) {
        setMediaError("Failed to upload media. Please try again.");
        return;
      }

      const nwImg =
        target === "wallpaper"
          ? buildNWImage(url, tempFilterValues)
          : buildNWImage(url);
      if (target === "wallpaper") {
        setTempWallpaper(nwImg);
        setTempUploads((prev) => ({ ...prev, wallpaper: url }));
      } else {
        setTempCardBg(nwImg);
        setTempUploads((prev) => ({ ...prev, cardBackground: url }));
      }
      setMuseMedia((prev) => (prev.includes(url) ? prev : [url, ...prev]));
      setPickerTarget(null);
    },
    [pickerTarget, tempFilterValues, id, uploadMedia],
  );

  const handleMediaSelect = useCallback(
    (url: string) => {
      if (pickerTarget === "wallpaper") {
        setTempWallpaper(buildNWImage(url, tempFilterValues));
      } else if (pickerTarget === "cardBackground") {
        setTempCardBg(buildNWImage(url));
      }
      setPickerTarget(null);
    },
    [pickerTarget, tempFilterValues],
  );

  const handleCardCropChange = useCallback((crop: ImageCropFilter) => {
    setTempCardBg((prev) =>
      prev ? { ...prev, crop } : buildNWImage(crop.src ?? ""),
    );
  }, []);

  // Sync crop visual state when the card image source changes
  useEffect(() => {
    const crop = tempCardBg?.crop;
    if (crop && crop.width > 0 && crop.width <= 300) {
      setCropBgX(crop.x);
      setCropBgY(crop.y);
      setCropScale(crop.width / 100);
    } else {
      setCropBgX(50);
      setCropBgY(50);
      setCropScale(1);
    }
  }, [tempCardBg?.src]); // only re-seed on src change, not on every crop update

  // Keep the live crop in sync with externally-driven changes (re-seed, fit,
  // slider, wheel) whenever we are not mid-drag.
  useEffect(() => {
    if (!cropDragStart.current) {
      liveCrop.current = { scale: cropScale, x: cropBgX, y: cropBgY };
    }
  }, [cropBgX, cropBgY, cropScale]);

  const emitCropChange = useCallback(
    (x: number, y: number, s: number) => {
      const scalePct = Math.round(s * 100);
      handleCardCropChange({
        height: scalePct,
        src: tempCardBg?.src || image || "",
        width: scalePct,
        x: Math.round(x),
        y: Math.round(y),
      });
    },
    [tempCardBg?.src, image, handleCardCropChange],
  );

  const onCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.isPrimary === false) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cropDragStart.current = {
      bx: liveCrop.current.x,
      by: liveCrop.current.y,
      px: e.clientX,
      py: e.clientY,
    };
  };

  const onCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = cropDragStart.current;
    if (!start || !cropViewportRef.current) return;
    const rect = cropViewportRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = ((e.clientX - start.px) / rect.width) * 100;
    const dy = ((e.clientY - start.py) / rect.height) * 100;
    const newX = Math.min(100, Math.max(0, start.bx - dx));
    const newY = Math.min(100, Math.max(0, start.by - dy));
    // Imperative update only — no setState, no styled-component class churn.
    liveCrop.current = { ...liveCrop.current, x: newX, y: newY };
    cropViewportRef.current.style.backgroundPosition = `${newX}% ${newY}%`;
  };

  const onCropPointerUp = () => {
    const start = cropDragStart.current;
    cropDragStart.current = null;
    if (!start) return;
    // Commit the final position to React state / tempCardBg once.
    const { x, y, scale } = liveCrop.current;
    setCropBgX(x);
    setCropBgY(y);
    emitCropChange(x, y, scale);
  };

  const onCropWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const next = Math.min(3, Math.max(1, liveCrop.current.scale + delta));
    liveCrop.current = { ...liveCrop.current, scale: next };
    setCropScale(next);
    emitCropChange(liveCrop.current.x, liveCrop.current.y, next);
  };

  // ── Fit card image so the smaller side fills the card ───────────────────────
  // Loads the image's natural dimensions and zooms so that:
  //   • wider-than-tall  → height fits the card top/bottom (width overflows)
  //   • taller-than-wide → width fits the card sides (height overflows)
  // The result is centered. We reuse the existing `width% auto` encoding, so the
  // computed scale = cardAspect × (imgWidth / imgHeight) reproduces a height-fit.
  const handleFitCardImage = useCallback(() => {
    const src = tempCardBg?.src || image || "";
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const nextScale = iw >= ih ? CARD_ASPECT_H_OVER_W * (iw / ih) : 1;
      const clamped = Math.min(6, Math.max(1, nextScale));
      setCropBgX(50);
      setCropBgY(50);
      setCropScale(clamped);
      emitCropChange(50, 50, clamped);
    };
    img.src = src;
  }, [tempCardBg?.src, image, emitCropChange]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      // Verses inherit privacy from their parent — no "privacy" field is
      // rendered for them, so there's nothing to read from the form; `save()`
      // falls back to the store value already seeded from the parent.
      let privacyValue: any;
      if (!originalVerseId) {
        privacyValue = (e.target as HTMLFormElement).privacy?.value;
        setMuseState({ privacy: privacyValue });
      }
      const result = await save(privacyValue);
      if (!result.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setTempUploads({});
      onDone(result.id);
    },
    [save, onDone, originalVerseId, setMuseState],
  );

  const handleCancel = useCallback(async () => {
    for (const url of Object.values(tempUploads)) {
      if (url) await deleteMedia(url);
    }
    onBack?.();
  }, [tempUploads, onBack]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit}>
        <S.TopBar>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            {!isWizard && onBack && (
              <S.BackButton type="button" onClick={handleCancel}>
                <BsArrowLeft size={18} />
              </S.BackButton>
            )}
            <S.FormHeading>
              <MdOutlineBrush />
              <h1>Appearance</h1>
            </S.FormHeading>
          </div>
          <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
            {isWizard && (
              <S.StepBadge>
                Step {stepIndex + 2} of {totalSteps + 1}
              </S.StepBadge>
            )}
            {originalVerseId ? (
              <S.InheritedPrivacyBadge title="Privacy is inherited from the original character">
                <PrivacyIcon privacy={privacy} />
                <span>{PRIVACY_LABELS[privacy] ?? privacy}</span>
              </S.InheritedPrivacyBadge>
            ) : (
              <PromptPrivacySelect
                className="muse-privacy-select"
                initial={privacy}
                blockedOptions={["CUSTOM"]}
              />
            )}
          </div>
        </S.TopBar>

        {isWizard && (
          <S.StepDots>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <S.StepDot
                key={i}
                $active={i === stepIndex}
                $done={i < stepIndex}
              />
            ))}
          </S.StepDots>
        )}

        <Separator.Root className="separator" orientation="horizontal" />

        {/* Avatar */}
        <S.BasicInfoFields>
          <S.MediaUploadSectionContainer>
            <Form.Field className="avatar-field" name="avatar">
              <Form.Label className="media-label">
                <AvatarUploadField
                  src={avatar?.src || image}
                  alt={firstName || "Avatar"}
                />
                <span>Avatar</span>
              </Form.Label>
              <Form.Control
                aria-label="Avatar"
                name="avatar"
                type="file"
                onChange={handleAvatarChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={imageUploading || avatarSaving}
                hidden
              />
            </Form.Field>
            <Form.Field className="field checkbox" name="consent">
              <Form.Control
                aria-label="Custom card and wallpaper"
                type="checkbox"
                disabled={loading}
                checked={useExtraImages}
                onChange={() => {
                  if (!useExtraImages) {
                    openExtraDialog(true);
                  } else {
                    setMuseState({ useExtraImages: false });
                  }
                }}
              />
              <Form.Label>Set custom card image and wallpaper</Form.Label>
              {useExtraImages && (
                <S.PaletteButton
                  type="button"
                  onClick={() => openExtraDialog(false)}
                >
                  <MdTune size={15} />
                  Edit
                </S.PaletteButton>
              )}
            </Form.Field>
          </S.MediaUploadSectionContainer>
        </S.BasicInfoFields>

        {/* Avatar crop dialog */}
        <AppAlertDialog
          open={avatarCropOpen}
          onOpenChange={(open) => {
            if (!open) handleAvatarCropCancel();
            setAvatarCropOpen(open);
          }}
          heading="Adjust avatar"
          text="Drag to reposition. Use the slider or scroll to zoom."
          showConfirm={false}
          isCancelHidden={true}
          body={
            <S.AvatarCropBody>
              <AvatarCropDialog
                open={avatarCropOpen}
                src={pendingAvatarSrc}
                x={avatarX}
                y={avatarY}
                scale={avatarScale}
                onOpenChange={setAvatarCropOpen}
                onPan={handleAvatarPan}
                onScaleChange={handleAvatarScaleChange}
                onReset={resetAvatarCrop}
                onCancel={handleAvatarCropCancel}
                onConfirm={handleAvatarCropConfirm}
                isUploading={imageUploading}
                viewportRef={avatarViewportRef}
              />
            </S.AvatarCropBody>
          }
        />

        {/* Combined extra-images / visual settings dialog */}
        <AppAlertDialog
          open={extraDialogOpen}
          onOpenChange={setExtraDialogOpen}
          heading="Visual Settings"
          text=""
          actionButtonLabel="Save"
          closeButtonText="Cancel"
          actionColor="neutral"
          showConfirm={pickerTarget === null}
          isConfirmDisabled={imageUploading}
          onConfirm={handleExtraDialogSave}
          onCancel={handleExtraDialogCancel}
          body={
            pickerTarget ? (
              <S.FilterDialogBody>
                <S.MediaPickerHeader>
                  <S.MediaPickerBackBtn
                    type="button"
                    onClick={() => setPickerTarget(null)}
                  >
                    <BsArrowLeft size={14} />
                    Back
                  </S.MediaPickerBackBtn>
                  <span>
                    Select{" "}
                    {pickerTarget === "wallpaper"
                      ? "Wallpaper"
                      : "Card Background"}
                  </span>
                </S.MediaPickerHeader>
                <ShouldRender if={Boolean(mediaError)}>
                  <ErrorBox className="error">
                    <p>{mediaError}</p>
                  </ErrorBox>
                </ShouldRender>
                <ShouldRender if={mediaLoading}>
                  <S.MediaPickerEmpty>Loading media…</S.MediaPickerEmpty>
                </ShouldRender>
                <ShouldRender if={!mediaLoading}>
                  <S.MediaPickerGrid>
                    {museMedia.filter(isImageUrl).map((url) => (
                      <S.MediaPickerThumb
                        key={url}
                        type="button"
                        $selected={
                          pickerTarget === "wallpaper"
                            ? tempWallpaper?.src === url
                            : tempCardBg?.src === url
                        }
                        onClick={() => handleMediaSelect(url)}
                      >
                        <img src={url} alt="" />
                      </S.MediaPickerThumb>
                    ))}
                    <S.MediaPickerUploadLabel>
                      <BsUpload size={18} />
                      <span>Upload new</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePickerUpload}
                        disabled={imageUploading}
                        hidden
                      />
                    </S.MediaPickerUploadLabel>
                  </S.MediaPickerGrid>
                  <ShouldRender if={museMedia.filter(isImageUrl).length === 0}>
                    <S.MediaPickerEmpty>
                      No gallery images yet. Upload a new image.
                    </S.MediaPickerEmpty>
                  </ShouldRender>
                </ShouldRender>
              </S.FilterDialogBody>
            ) : (
              <S.FilterDialogBody>
                {/* ── Unified preview: wallpaper background + interactive card face ── */}
                <S.FilterPreviewWrap>
                  <S.FilterPreviewBanner
                    $src={tempWallpaper?.src || image || ""}
                    $greyscale={tempFilterValues.greyscale}
                    $brightness={tempFilterValues.brightness}
                    $blur={tempFilterValues.blur}
                  />
                  <S.FilterPreviewLayout>
                    {/* Drag on the card to reposition; scroll/slider to zoom */}
                    <S.InteractiveCardFace
                      ref={cropViewportRef}
                      style={{
                        backgroundImage:
                          tempCardBg?.src || image
                            ? `url(${tempCardBg?.src || image})`
                            : undefined,
                        backgroundSize: `${cropScale * 100}% auto`,
                        backgroundPosition: `${cropBgX}% ${cropBgY}%`,
                      }}
                      onPointerDown={onCropPointerDown}
                      onPointerMove={onCropPointerMove}
                      onPointerUp={onCropPointerUp}
                      onPointerLeave={onCropPointerUp}
                      onPointerCancel={onCropPointerUp}
                      onWheel={onCropWheel}
                    />
                    <S.FilterPreviewPanel>
                      <S.FilterPreviewAvatar $src={avatar?.src || image || ""} />
                      <S.FilterPreviewMuseName>
                        {firstName || "Character Name"}
                      </S.FilterPreviewMuseName>
                      <S.FilterPreviewAttrGrid>
                        <S.FilterPreviewAttr />
                        <S.FilterPreviewAttr />
                        <S.FilterPreviewAttr />
                        <S.FilterPreviewAttr />
                      </S.FilterPreviewAttrGrid>
                    </S.FilterPreviewPanel>
                  </S.FilterPreviewLayout>
                </S.FilterPreviewWrap>

                {/* ── Card Image section ── */}
                <S.SliderSection>
                  <S.SliderSectionHeader>
                    <span>Card Image</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <S.PaletteButton
                        type="button"
                        onClick={handleFitCardImage}
                        title="Scale so the image's smaller side fits the card"
                      >
                        <BsAspectRatio size={12} />
                        Fit
                      </S.PaletteButton>
                      <S.PaletteButton
                        type="button"
                        onClick={() => setPickerTarget("cardBackground")}
                      >
                        <BsUpload size={12} />
                        Change
                      </S.PaletteButton>
                    </div>
                  </S.SliderSectionHeader>
                  <S.CropScaleRow>
                    <label htmlFor="card-crop-scale">Zoom</label>
                    <input
                      id="card-crop-scale"
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={Math.min(cropScale, 3)}
                      style={
                        {
                          "--fill": `${((Math.min(cropScale, 3) - 1) / 2) * 100}%`,
                        } as React.CSSProperties
                      }
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setCropScale(next);
                        emitCropChange(cropBgX, cropBgY, next);
                      }}
                    />
                    <span className="value">{cropScale.toFixed(2)}×</span>
                  </S.CropScaleRow>
                </S.SliderSection>

                {/* ── Wallpaper section ── */}
                <S.SliderSection>
                  <S.SliderSectionHeader>
                    <span>Wallpaper</span>
                    <S.PaletteButton
                      type="button"
                      onClick={() => setPickerTarget("wallpaper")}
                    >
                      <BsUpload size={12} />
                      Change
                    </S.PaletteButton>
                  </S.SliderSectionHeader>
                  <S.FilterSliderGroup>
                    <S.FilterSliderRow>
                      <label htmlFor="filter-greyscale">Greyscale</label>
                      <input
                        id="filter-greyscale"
                        type="range"
                        min={0}
                        max={100}
                        value={tempFilterValues.greyscale}
                        style={
                          {
                            "--fill": `${tempFilterValues.greyscale}%`,
                          } as React.CSSProperties
                        }
                        onChange={(e) =>
                          setTempFilterValues((prev) => ({
                            ...prev,
                            greyscale: Number(e.target.value),
                          }))
                        }
                      />
                      <span className="value">
                        {tempFilterValues.greyscale}%
                      </span>
                    </S.FilterSliderRow>
                    <S.FilterSliderRow>
                      <label htmlFor="filter-brightness">Brightness</label>
                      <input
                        id="filter-brightness"
                        type="range"
                        min={0}
                        max={200}
                        value={tempFilterValues.brightness}
                        style={
                          {
                            "--fill": `${tempFilterValues.brightness / 2}%`,
                          } as React.CSSProperties
                        }
                        onChange={(e) =>
                          setTempFilterValues((prev) => ({
                            ...prev,
                            brightness: Number(e.target.value),
                          }))
                        }
                      />
                      <span className="value">
                        {tempFilterValues.brightness}%
                      </span>
                    </S.FilterSliderRow>
                    <S.FilterSliderRow>
                      <label htmlFor="filter-blur">Blur</label>
                      <input
                        id="filter-blur"
                        type="range"
                        min={0}
                        max={20}
                        value={tempFilterValues.blur}
                        style={
                          {
                            "--fill": `${(tempFilterValues.blur / 20) * 100}%`,
                          } as React.CSSProperties
                        }
                        onChange={(e) =>
                          setTempFilterValues((prev) => ({
                            ...prev,
                            blur: Number(e.target.value),
                          }))
                        }
                      />
                      <span className="value">{tempFilterValues.blur}px</span>
                    </S.FilterSliderRow>
                  </S.FilterSliderGroup>
                </S.SliderSection>

                <ShouldRender if={imageUploading}>
                  <S.MediaPickerEmpty style={{ padding: "8px 0" }}>
                    Uploading image…
                  </S.MediaPickerEmpty>
                </ShouldRender>
              </S.FilterDialogBody>
            )
          }
        />

        {/* Accent color */}
        <Separator.Root className="separator" orientation="horizontal" />
        <S.MediaUploadSectionContainer>
          <Form.Field className="field checkbox" name="accentEnabled">
            <Form.Control
              aria-label="Accent Enabled"
              type="checkbox"
              checked={useAccent}
              onChange={() => setMuseState({ useAccent: !useAccent })}
            />
            <Form.Label>Set custom profile color</Form.Label>
            {useAccent && (
              <S.AccentColorRow>
                <S.AccentColorSwatch
                  type="button"
                  aria-label="Edit accent color"
                  style={{ backgroundColor: accent ?? "var(--accent)" }}
                  onClick={() => {
                    setTempAccent(accent ?? "#ff0000");
                    setColorPickerOpen(true);
                  }}
                />
                <S.AccentEditButton
                  type="button"
                  aria-label="Edit accent color"
                  onClick={() => {
                    setTempAccent(accent ?? "#ff0000");
                    setColorPickerOpen(true);
                  }}
                >
                  <BsPencil size={14} />
                </S.AccentEditButton>
              </S.AccentColorRow>
            )}
          </Form.Field>
          <AppAlertDialog
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            heading="Pick an accent color"
            text=""
            actionButtonLabel="Select"
            closeButtonText="Cancel"
            actionColor="neutral"
            onConfirm={() => {
              setMuseState({ accent: tempAccent });
              setColorPickerOpen(false);
            }}
            onCancel={() => setColorPickerOpen(false)}
            body={
              <S.AccentPickerDialogBody>
                <HexColorPicker color={tempAccent} onChange={setTempAccent} />
                <div className="hex-input-row">
                  <span>Hex:</span>
                  <input
                    type="text"
                    value={tempAccent}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val && val[0] !== "#") val = `#${val}`;
                      setTempAccent(val);
                    }}
                    placeholder="#ff0000"
                  />
                </div>
              </S.AccentPickerDialogBody>
            }
          />
        </S.MediaUploadSectionContainer>

        <ShouldRender if={Boolean(error)}>
          <ErrorBox className="error">
            <p>{error}</p>
          </ErrorBox>
        </ShouldRender>

        <Separator.Root className="separator" orientation="horizontal" />
        <S.WizardActions>
          {isWizard ? (
            <>
              <S.SkipButton type="button" onClick={onSkip}>
                Skip
              </S.SkipButton>
              <Form.Submit
                className="submit-button"
                disabled={loading || imageUploading}
              >
                <LoaderAction
                  loading={imageUploading}
                  text="Save & Continue"
                  loadingText="Uploading..."
                />
              </Form.Submit>
            </>
          ) : (
            <>
              <S.ResetButton
                type="button"
                onClick={handleCancel}
                disabled={loading || imageUploading}
              >
                Cancel
              </S.ResetButton>
              <Form.Submit
                className="submit-button"
                disabled={loading || imageUploading}
              >
                <LoaderAction
                  loading={loading || imageUploading}
                  text="Save"
                  loadingText={imageUploading ? "Uploading..." : "Saving..."}
                />
              </Form.Submit>
            </>
          )}
        </S.WizardActions>
      </Form.Root>
    </S.FormContainer>
  );
}
