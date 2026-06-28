"use client";

import { ShouldRender } from "@novelist-world/ui";
import { RadioGroup, Separator } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { MdOutlineBrush } from "react-icons/md";
import { AvatarPickerDialog } from "@/components/avatar-picker-dialog";
import { AvatarUploadField } from "@/components/common/avatar-upload-field";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import { useGlobalState } from "@/context/store/stores";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { ImageCropFilter, NWImage } from "@/types";
import { ACCENT_LEVEL_REQUIREMENT, ACCENT_MAP, type Accent } from "@/types/theme";
import { API_MESSAGE } from "@/utils/constants";
import { deleteMedia } from "../actions";
import { NoteDialogBody } from "./note-dialog-body";
import { useProfileState, useProfileStoreSet } from "./profile.store";
import * as S from "./styled";
import { useProfileSave } from "./use-profile-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Detect GIFs by magic bytes (GIF87a / GIF89a) — not by file extension or MIME type. */
async function isGifFile(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 6).arrayBuffer());
  return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46; // G I F
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Build an ImageCropFilter from background-position state.
 * x/y are CSS background-position percentages (0–100, 50 = centered).
 * width/height encode the zoom as scale*100 (100 = 1×, 300 = 3×).
 * This mirrors the Muse cardBackground encoding: a fit-by-width display that
 * is resolution- and aspect-ratio-independent.
 */
function toCropFilter(
  src: string,
  x: number,
  y: number,
  scale: number,
): ImageCropFilter {
  const scalePct = Math.round(scale * 100);
  return {
    height: scalePct,
    src,
    width: scalePct,
    x: Math.round(x),
    y: Math.round(y),
  };
}

type Props = {
  onBack: () => void;
};

export function AppearanceSection({ onBack }: Props) {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const isGifLocked = (novelist?.level ?? 1) < 2;
  const novelistLevel = novelist?.level ?? 1;
  const image = useProfileState("image");
  const avatar = useProfileState("avatar");
  const noteObj = useProfileState("note");
  const palette = useProfileState("palette");
  const setProfileState = useProfileStoreSet();
  const { saveAll, loading } = useProfileSave();
  const { uploadMedia } = useUploadMedia();

  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(
    null,
  );
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [tempNote, setTempNote] = useState("");
  const [tempNoteColor, setTempNoteColor] = useState<string | null>(null);
  const [tempNoteEmoji, setTempNoteEmoji] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState("");
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropScale, setCropScale] = useState(1);
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const cropDragStart = useRef<{
    px: number;
    py: number;
    bx: number;
    by: number;
  } | null>(null);
  const lastPinchDist = useRef<number | null>(null);

  // Track whether avatar was changed in this editing session
  const [avatarChanged, setAvatarChanged] = useState(false);

  // When a GIF/Sticker is picked we stash the URL here and open the crop
  // dialog only after the avatar picker portal has fully closed.
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarDialogOpen && pendingMediaUrl) {
      openCropDialog(pendingMediaUrl);
      setPendingMediaUrl(null);
    }
    // openCropDialog is stable (only uses setters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarDialogOpen, pendingMediaUrl]);

  const originalRef = useRef({
    avatar: novelist?.avatar ?? (null as NWImage | null),
    image: novelist?.image ?? "",
    note: novelist?.note ?? null,
    palette: user?.palette ?? 0,
  });

  useEffect(() => {
    originalRef.current = {
      avatar: novelist?.avatar ?? null,
      image: novelist?.image ?? "",
      note: novelist?.note ?? null,
      palette: user?.palette ?? 0,
    };
  }, [novelist?.image, novelist?.note, novelist?.avatar, user?.palette]);

  const noteText = noteObj?.text ?? "";
  const isDirty =
    avatarChanged ||
    (image ?? "") !== originalRef.current.image ||
    noteObj !== originalRef.current.note ||
    Number(palette) !== Number(originalRef.current.palette);

  // ── Avatar upload from device ───────────────────────────────────────────────

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setError("File type not supported. Allowed: .png, .jpg, .gif");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 10 MB).");
      return;
    }

    // Level gate — detect GIF by magic bytes, not extension/MIME type
    if (isGifLocked && (await isGifFile(file))) {
      setError(
        "✦ GIF avatars are a Level 2 perk — keep writing to level up and unlock animated avatars!",
      );
      return;
    }

    setError(null);

    // Show a data URL immediately in the crop dialog so the user can adjust
    // position/zoom before we finish uploading.
    const reader = new FileReader();
    reader.onloadend = () => {
      openCropDialog(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload in parallel; the crop confirmation will swap the data URL for
    // the real CDN URL.
    if (tempUploadedImage) {
      await deleteMedia(tempUploadedImage);
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const url = await uploadMedia(formData);
    setImageUploading(false);

    if (url === API_MESSAGE.MediaError) {
      setError("Failed to upload image. Please try again.");
      setCropDialogOpen(false);
      return;
    }

    setTempUploadedImage(url);
    // Replace the data URL in the pending crop source so the confirmed NWImage
    // points to the CDN URL rather than the base64 string.
    setPendingCropSrc(url);
  };

  // ── Avatar from GIF / Sticker library ──────────────────────────────────────

  const handleMediaSelect = (url: string) => {
    // Level gate — the dialog already blocks this when isGifLocked, but guard here too
    if (isGifLocked) {
      setError(
        "✦ GIF avatars are a Level 2 perk — keep writing to level up and unlock animated avatars!",
      );
      return;
    }
    setError(null);
    // Defer until AvatarPickerDialog finishes closing (see useEffect above)
    setPendingMediaUrl(url);
  };

  // ── Crop dialog helpers ─────────────────────────────────────────────────────

  const openCropDialog = (src: string) => {
    setPendingCropSrc(src);
    setCropX(50);
    setCropY(50);
    setCropScale(1);
    setCropDialogOpen(true);
  };

  const handleCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.isPrimary === false) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cropDragStart.current = {
      bx: cropX,
      by: cropY,
      px: e.clientX,
      py: e.clientY,
    };
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cropDragStart.current || !cropViewportRef.current) return;
    const rect = cropViewportRef.current.getBoundingClientRect();
    // Convert px drag → background-position percentage. Dragging right reveals
    // the left of the image, so the position percentage decreases.
    const dx = ((e.clientX - cropDragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - cropDragStart.current.py) / rect.height) * 100;
    setCropX(clamp(cropDragStart.current.bx - dx, 0, 100));
    setCropY(clamp(cropDragStart.current.by - dy, 0, 100));
  };

  const handleCropPointerUp = () => {
    cropDragStart.current = null;
  };

  const handleCropWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setCropScale((prev) => clamp(prev + delta, 1, 3));
  };

  const handleCropTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  };

  const handleCropTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const delta = (dist - lastPinchDist.current) * 0.01;
      lastPinchDist.current = dist;
      setCropScale((prev) => clamp(prev + delta, 1, 3));
    }
  };

  const handleCropScaleChange = (v: number) => {
    setCropScale(clamp(v, 1, 3));
  };

  const handleCropConfirm = useCallback(() => {
    const crop = toCropFilter(pendingCropSrc, cropX, cropY, cropScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingCropSrc,
    };
    setProfileState({ avatar: nwImage, image: pendingCropSrc });
    setAvatarChanged(true);
    setCropDialogOpen(false);
  }, [pendingCropSrc, cropX, cropY, cropScale, setProfileState]);

  const handleCropCancel = useCallback(async () => {
    // If there was a temp upload for this session, delete it
    if (tempUploadedImage && tempUploadedImage === pendingCropSrc) {
      await deleteMedia(tempUploadedImage);
      setTempUploadedImage(null);
    }
    setCropDialogOpen(false);
  }, [tempUploadedImage, pendingCropSrc]);

  const resetCrop = useCallback(() => {
    setCropX(50);
    setCropY(50);
    setCropScale(1);
  }, []);

  // ── Save / reset / back ─────────────────────────────────────────────────────

  const handleSave = async () => {
    setError(null);
    if (isPaletteLocked) return;
    // Defensive gate: block if a GIF/library avatar somehow reached state for a level < 2 novelist
    if (
      isGifLocked &&
      avatarChanged &&
      ((image ?? "").includes("klipy.com") || (image ?? "").endsWith(".gif"))
    ) {
      setError(
        "✦ GIF avatars are a Level 2 perk — keep writing to level up and unlock animated avatars!",
      );
      return;
    }
    const result = await saveAll();
    if (!result.ok) {
      setError("Failed to save changes. Please try again.");
      return;
    }
    setTempUploadedImage(null);
    setAvatarChanged(false);
    onBack();
  };

  const handleReset = () => {
    setProfileState({
      avatar: originalRef.current.avatar,
      image: originalRef.current.image,
      note: originalRef.current.note,
      palette: originalRef.current.palette as Accent,
    });
    setTempNote("");
    setTempNoteColor(null);
    setTempNoteEmoji(null);
    setAvatarChanged(false);
    setError(null);
  };

  const handleBack = () => {
    if (isDirty || imageUploading) {
      setDiscardOpen(true);
      return;
    }
    onBack();
  };

  const handleConfirmDiscard = async () => {
    if (tempUploadedImage) {
      await deleteMedia(tempUploadedImage);
    }
    handleReset();
    setDiscardOpen(false);
    onBack();
  };

  const openNoteDialog = () => {
    setTempNote(noteObj?.text ?? "");
    setTempNoteColor(noteObj?.color ?? null);
    setTempNoteEmoji(noteObj?.emoji ?? null);
    setNoteDialogOpen(true);
  };

  const confirmNote = () => {
    setProfileState({
      note: tempNote.trim()
        ? { text: tempNote, color: tempNoteColor, emoji: tempNoteEmoji }
        : null,
    });
    setNoteDialogOpen(false);
  };

  const previewAccentClass =
    ACCENT_MAP[Number(palette) as Accent] ?? ACCENT_MAP[0];

  const selectedPaletteRequiredLevel =
    ACCENT_LEVEL_REQUIREMENT[Number(palette) as Accent] ?? 0;
  const isPaletteLocked = selectedPaletteRequiredLevel > novelistLevel;

  // The displayed avatar src — use the crop src when an avatar NWImage is set
  const displayAvatarSrc = avatar?.src || image || null;

  return (
    <S.AppearancePreviewScope className={previewAccentClass}>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={handleBack}>
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <MdOutlineBrush />
            <h1>Appearance</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.AppearanceSectionBody>
        <S.BasicInfoFields>
          <div className="avatar-field">
            <AvatarUploadField
              src={displayAvatarSrc}
              alt="Avatar"
              note={noteText}
              onNoteClick={openNoteDialog}
              onAvatarClick={() => setAvatarDialogOpen(true)}
              nwImage={avatar}
            />
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </S.BasicInfoFields>

        <ShouldRender if={Boolean(error)}>
          <S.LandingErrorBanner>{error}</S.LandingErrorBanner>
        </ShouldRender>

        <S.AppearanceFieldGroup>
          <S.AppearanceFieldLabel>Theme color</S.AppearanceFieldLabel>
          <S.PaletteGroup
            value={String(palette)}
            onValueChange={(v) =>
              setProfileState({ palette: Number(v) as Accent })
            }
          >
            {[
              Object.entries(ACCENT_MAP).filter(
                ([key]) => !ACCENT_LEVEL_REQUIREMENT[Number(key) as Accent],
              ),
              Object.entries(ACCENT_MAP).filter(
                ([key]) => !!ACCENT_LEVEL_REQUIREMENT[Number(key) as Accent],
              ),
            ].map((rowEntries, rowIdx) => (
              <S.PaletteRow key={rowIdx}>
                {rowEntries.map(([key, color]) => {
                  const requiredLevel =
                    ACCENT_LEVEL_REQUIREMENT[Number(key) as Accent];
                  const isLocked =
                    requiredLevel !== undefined && novelistLevel < requiredLevel;
                  return (
                    <S.RadioItemContainer key={key} className={color}>
                      <div style={{ position: "relative" }}>
                        <RadioGroup.Item
                          className="radio-item"
                          value={key}
                          id={`palette-${key}`}
                          aria-label={
                            isLocked
                              ? `${color} (requires Level ${requiredLevel})`
                              : `Palette ${color}`
                          }
                        />
                        {isLocked && (
                          <S.PaletteLockBadge>
                            {requiredLevel}
                          </S.PaletteLockBadge>
                        )}
                      </div>
                    </S.RadioItemContainer>
                  );
                })}
              </S.PaletteRow>
            ))}
          </S.PaletteGroup>
          {isPaletteLocked && (
            <S.PaletteLockNote>
              ✦ This theme unlocks at Level {selectedPaletteRequiredLevel} —
              keep writing to earn XP and level up!
            </S.PaletteLockNote>
          )}
        </S.AppearanceFieldGroup>
      </S.AppearanceSectionBody>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.FormActions>
        <S.ResetButton
          type="button"
          onClick={handleReset}
          disabled={!isDirty || loading || imageUploading}
        >
          Reset
        </S.ResetButton>
        <S.LandingHeroSaveButton
          type="button"
          onClick={handleSave}
          disabled={
            !isDirty ||
            loading ||
            imageUploading ||
            isPaletteLocked ||
            (isGifLocked &&
              avatarChanged &&
              ((image ?? "").includes("klipy.com") ||
                (image ?? "").endsWith(".gif")))
          }
        >
          {loading ? "Saving..." : imageUploading ? "Uploading..." : "Save"}
        </S.LandingHeroSaveButton>
      </S.FormActions>

      {/* Avatar source picker */}
      <AvatarPickerDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        onUploadSelect={() => fileInputRef.current?.click()}
        onMediaSelect={handleMediaSelect}
        isGifLocked={isGifLocked}
      />

      {/* Avatar crop / adjust dialog */}
      <AppAlertDialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCropCancel();
          setCropDialogOpen(open);
        }}
        heading="Adjust avatar"
        text="Drag to reposition. Use the slider or scroll to zoom."
        showConfirm={false}
        isCancelHidden={true}
        body={
          <S.AvatarCropBody>
            {/* Use the new presentational AvatarCropDialog inside the generic dialog portal */}
            {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
            <AvatarCropDialog
              open={cropDialogOpen}
              src={pendingCropSrc}
              x={cropX}
              y={cropY}
              scale={cropScale}
              onOpenChange={setCropDialogOpen}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onWheel={handleCropWheel}
              onScaleChange={handleCropScaleChange}
              onReset={resetCrop}
              onCancel={handleCropCancel}
              onConfirm={handleCropConfirm}
              isUploading={imageUploading}
              viewportRef={cropViewportRef}
            />
          </S.AvatarCropBody>
        }
      />

      <AppAlertDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        heading="Edit your note"
        text="A short note shown next to your avatar."
        actionButtonLabel="Save"
        closeButtonText="Cancel"
        actionColor="neutral"
        onConfirm={confirmNote}
        onCancel={() => setNoteDialogOpen(false)}
        body={
          <NoteDialogBody
            value={tempNote}
            onChange={setTempNote}
            color={tempNoteColor}
            onColorChange={setTempNoteColor}
            emoji={tempNoteEmoji}
            onEmojiChange={setTempNoteEmoji}
            level={novelistLevel}
          />
        }
      />

      <AppAlertDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        heading="Discard unsaved changes?"
        text="You have unsaved changes that will be lost."
        actionButtonLabel="Discard"
        closeButtonText="Stay"
        actionColor="negative"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardOpen(false)}
      />
    </S.AppearancePreviewScope>
  );
}
