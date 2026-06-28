"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Separator } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsArrowLeft, BsPersonCircle } from "react-icons/bs";
import { ImProfile } from "react-icons/im";
import {
  MdAlternateEmail,
  MdOutlineBrush,
  MdOutlineInfo,
} from "react-icons/md";
import { AvatarPickerDialog } from "@/components/avatar-picker-dialog";
import { AvatarUploadField } from "@/components/common/avatar-upload-field";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { ImageCropFilter, NWImage } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { deleteMedia } from "../actions";
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

type ProfileView = "landing" | "appearance" | "about" | "account";

type Props = {
  onSelect: (view: ProfileView) => void;
};

export function LandingSection({ onSelect }: Props) {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const isGifLocked = (novelist?.level ?? 1) < 2;
  const avatar = useProfileState("avatar");
  const firstName = useProfileState("firstName");
  const lastName = useProfileState("lastName");
  const image = useProfileState("image");
  const about = useProfileState("about");
  const noteObj = useProfileState("note");
  const setProfileState = useProfileStoreSet();
  const { saveNovelist, loading } = useProfileSave();
  const { uploadMedia } = useUploadMedia();
  const { routeToPage } = usePageRouter();

  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(
    null,
  );
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarDialogOpen, pendingMediaUrl]);

  const originalRef = useRef({
    avatar: novelist?.avatar ?? (null as NWImage | null),
    firstName: novelist?.firstName ?? "",
    image: novelist?.image ?? "",
    lastName: novelist?.lastName ?? "",
  });

  // Keep snapshot in sync if novelist refreshes
  useEffect(() => {
    originalRef.current = {
      avatar: novelist?.avatar ?? null,
      firstName: novelist?.firstName ?? "",
      image: novelist?.image ?? "",
      lastName: novelist?.lastName ?? "",
    };
  }, [
    novelist?.firstName,
    novelist?.lastName,
    novelist?.image,
    novelist?.avatar,
  ]);

  const isDirty =
    avatarChanged ||
    (firstName ?? "") !== originalRef.current.firstName ||
    (lastName ?? "") !== originalRef.current.lastName ||
    (image ?? "") !== originalRef.current.image;

  const handleAvatarClick = () => {
    setAvatarDialogOpen(true);
  };

  const handleMediaSelect = async (url: string) => {
    // Level gate — the dialog already blocks this when isGifLocked, but guard here too
    if (isGifLocked) {
      setError(
        "✦ GIF avatars are a Level 2 perk — keep writing to level up and unlock animated avatars!",
      );
      return;
    }
    setError(null);
    setPendingMediaUrl(url);
  };

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

    const reader = new FileReader();
    reader.onloadend = () => {
      openCropDialog(reader.result as string);
    };
    reader.readAsDataURL(file);

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
    setPendingCropSrc(url);
  };

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

  const handleSave = async () => {
    setError(null);
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
    const result = await saveNovelist();
    if (!result.ok) {
      setError("Failed to save profile. Please try again.");
      return;
    }
    setTempUploadedImage(null);
  };

  const handleReset = () => {
    setProfileState({
      avatar: originalRef.current.avatar,
      firstName: originalRef.current.firstName,
      image: originalRef.current.image,
      lastName: originalRef.current.lastName,
    });
    setAvatarChanged(false);
    setError(null);
  };

  const handleBack = () => {
    if (isDirty || imageUploading) {
      setDiscardDialogOpen(true);
      return;
    }
    routeToPage(ROUTES.Profile.Index);
  };

  const handleConfirmDiscard = async () => {
    if (tempUploadedImage) {
      await deleteMedia(tempUploadedImage);
    }
    setDiscardDialogOpen(false);
    routeToPage(ROUTES.Profile.Index);
  };

  const aboutHasContent = Boolean((about ?? "").replace(/<[^>]*>/g, "").trim());
  const themeColor = user?.palette;
  const isVerified = novelist?.isVerified ?? user?.emailVerified ?? false;

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={handleBack} title="Back">
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <ImProfile />
            <h1>Edit your profile</h1>
          </S.FormHeading>
        </div>
        {isDirty && (
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <S.LandingHeroResetButton
              type="button"
              onClick={handleReset}
              disabled={loading || imageUploading}
            >
              Reset
            </S.LandingHeroResetButton>
            <S.LandingHeroSaveButton
              type="button"
              onClick={handleSave}
              disabled={
                loading ||
                imageUploading ||
                (isGifLocked &&
                  avatarChanged &&
                  ((image ?? "").includes("klipy.com") ||
                    (image ?? "").endsWith(".gif")))
              }
            >
              {loading ? "Saving..." : imageUploading ? "Uploading..." : "Save"}
            </S.LandingHeroSaveButton>
          </div>
        )}
      </S.TopBar>

      {error && <S.LandingErrorBanner>{error}</S.LandingErrorBanner>}

      <Separator.Root className="separator" orientation="horizontal" />

      <S.LandingHero>
        <S.LandingHeroAvatarWrap>
          <AvatarUploadField
            src={avatar?.src || image || null}
            note={noteObj?.text || ""}
            alt={firstName || "Avatar"}
            nwImage={avatar}
            onAvatarClick={handleAvatarClick}
          />
        </S.LandingHeroAvatarWrap>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleAvatarChange}
        />
        <AvatarPickerDialog
          open={avatarDialogOpen}
          onOpenChange={setAvatarDialogOpen}
          onUploadSelect={() => fileInputRef.current?.click()}
          onMediaSelect={handleMediaSelect}
          isGifLocked={isGifLocked}
        />
        <S.LandingHeroEditRow>
          <S.LandingHeroNameRow>
            <S.LandingHeroInput
              type="text"
              placeholder="First name"
              value={firstName ?? ""}
              onChange={(e) => setProfileState({ firstName: e.target.value })}
              maxLength={50}
            />
            <S.LandingHeroInput
              type="text"
              placeholder="Last name"
              value={lastName ?? ""}
              onChange={(e) => setProfileState({ lastName: e.target.value })}
              maxLength={50}
            />
          </S.LandingHeroNameRow>
          <S.LandingHeroMeta>
            <ShouldRender if={Boolean(user?.username)}>
              <S.LandingMetaPill>@{user?.username}</S.LandingMetaPill>
            </ShouldRender>
          </S.LandingHeroMeta>
        </S.LandingHeroEditRow>
      </S.LandingHero>

      <S.LandingSubtitle>Choose a section to customize</S.LandingSubtitle>

      <S.LandingGrid>
        <S.LandingCard type="button" onClick={() => onSelect("appearance")}>
          <S.LandingCardIconArea className="appearance">
            <MdOutlineBrush className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Appearance</S.LandingCardTitle>
            <S.LandingCardDesc>
              Avatar, status note and theme color.
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={Boolean(image)}>
              Avatar
            </S.LandingCardChip>
            <S.LandingCardChip $active={Boolean(noteObj?.text)}>Note</S.LandingCardChip>
            <S.LandingCardChip $active={themeColor != null}>
              Theme
            </S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>

        <S.LandingCard type="button" onClick={() => onSelect("about")}>
          <S.LandingCardIconArea className="about">
            <MdOutlineInfo className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>About</S.LandingCardTitle>
            <S.LandingCardDesc>Tell people about yourself.</S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={aboutHasContent}>
              {aboutHasContent ? "Bio added" : "No bio yet"}
            </S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>

        <S.LandingCard type="button" onClick={() => onSelect("account")}>
          <S.LandingCardIconArea className="account">
            <BsPersonCircle className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Account</S.LandingCardTitle>
            <S.LandingCardDesc>Email, username and password.</S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={isVerified}>
              <MdAlternateEmail style={{ marginRight: 4 }} />
              {isVerified ? "Verified" : "Unverified"}
            </S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>
      </S.LandingGrid>

      <AppAlertDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        heading="Discard unsaved changes?"
        text="You have unsaved changes that will be lost if you leave this page."
        actionButtonLabel="Discard"
        closeButtonText="Stay"
        actionColor="negative"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardDialogOpen(false)}
      />

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
    </>
  );
}
