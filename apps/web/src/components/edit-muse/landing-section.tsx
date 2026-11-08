"use client";

import type { NWImage } from "@nw/types";
import {
  clamp,
  cropToEditorState,
  fileTooLargeMessage,
  toCropFilter,
  VALID_IMAGE_TYPES,
} from "@nw/utils";
import { Separator } from "radix-ui";
import { useCallback, useRef, useState } from "react";
import {
  BsArrowLeft,
  BsInfoCircle,
  BsLightbulb,
  BsPeopleFill,
} from "react-icons/bs";
import { ImProfile } from "react-icons/im";
import {
  MdAutoStories,
  MdOpenInNew,
  MdOutlineBrush,
  MdPhotoLibrary,
} from "react-icons/md";
import { setMuseAvatarAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { AppAlertDialog } from "../dialog";
import AvatarCropDialog from "../dialog/avatar-crop-dialog";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";


type EditView =
  | "appearance"
  | "information"
  | "story"
  | "gallery"
  | "connections"
  | "headcanons";

type Props = {
  onBack: () => void;
  onSelect: (view: EditView) => void;
};

export function LandingSection({ onBack, onSelect }: Props) {
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
  const avatar = useMuseState("avatar");
  const fandom = useMuseState("fandom");
  const nicknames = useMuseState("nicknames");
  const story = useMuseState("story");
  const note = useMuseState("note");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const accent = useMuseState("accent");
  const useAccent = useMuseState("useAccent");
  const extraAttributes = useMuseState("extraAttributes");
  const id = useMuseState("id");
  const setMuseState = useMuseStoreSet();
  const { save, loading: saving } = useMuseSave();
  const { uploadMedia } = useUploadMedia();
  // The service's cap for the file's family (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();

  // Snapshot values at mount for dirty detection
  const originalRef = useRef({
    firstName: firstName ?? "",
    image: image ?? "",
    lastName: lastName ?? "",
  });

  // Pending navigation is stored in a ref to avoid function-in-state issues
  const pendingNavRef = useRef<(() => void) | null>(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [tempUpload, setTempUpload] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Avatar crop dialog ──────────────────────────────────────────────────────
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState("");
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [cropScale, setCropScale] = useState(1);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const isDirty =
    (firstName ?? "") !== originalRef.current.firstName ||
    (lastName ?? "") !== originalRef.current.lastName ||
    (image ?? "") !== originalRef.current.image;

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your Character";
  const isFandomless = !fandom?.id || fandom.id === "FANDOMLESS";
  const fandomLabel = isFandomless
    ? "Original Character"
    : fandom?.name || fandom?.id?.replaceAll("_", " ");
  const fandomColor = fandom?.color;

  const nicknameCount = nicknames?.length ?? 0;
  const attrCount = extraAttributes ? Object.keys(extraAttributes).length : 0;
  const hasStory =
    story &&
    story !== '{"type":"doc","content":[{"type":"paragraph"}]}' &&
    story.length > 50;
  const hasNote = Boolean(note?.trim());

  /** Guard any navigation: show discard dialog if there are unsaved changes. */
  const guardNav = useCallback(
    (navFn: () => void) => {
      if (isDirty || imageUploading) {
        pendingNavRef.current = navFn;
        setDialogOpen(true);
      } else {
        navFn();
      }
    },
    [isDirty, imageUploading],
  );

  const handleSave = useCallback(async () => {
    setSaveError(null);
    const result = await save();
    if (!result.ok) {
      setSaveError("Failed to save. Please try again.");
      return;
    }
    originalRef.current = {
      firstName: firstName ?? "",
      image: image ?? "",
      lastName: lastName ?? "",
    };
    setTempUpload(null);
  }, [save, firstName, lastName, image]);

  const handleDiscard = useCallback(async () => {
    setMuseState({
      firstName: originalRef.current.firstName,
      image: originalRef.current.image,
      lastName: originalRef.current.lastName,
    });
    if (tempUpload) {
      await deleteMedia(tempUpload);
      setTempUpload(null);
    }
  }, [setMuseState, tempUpload]);

  const handleDialogConfirm = useCallback(async () => {
    await handleDiscard();
    setDialogOpen(false);
    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    nav?.();
  }, [handleDiscard]);

  const handleDialogCancel = useCallback(() => {
    pendingNavRef.current = null;
    setDialogOpen(false);
  }, []);

  const openCropDialog = (src: string) => {
    setPendingCropSrc(src);
    setCropX(50);
    setCropY(50);
    setCropScale(1);
    setCropDialogOpen(true);
  };

  /** Clicking the hero avatar adjusts the one that is there, seeded from its
   *  stored crop; "Replace" inside the dialog reaches the picker. Without an
   *  avatar there is nothing to adjust, so the picker opens directly. */
  const handleAvatarClick = useCallback(() => {
    const existing = avatar?.src ? avatar : null;
    if (!existing) {
      avatarInputRef.current?.click();
      return;
    }
    const { scale, x, y } = cropToEditorState(existing.crop);
    setPendingCropSrc(existing.src);
    setCropX(x);
    setCropY(y);
    setCropScale(scale);
    setCropDialogOpen(true);
  }, [avatar]);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setSaveError("File type not supported. Allowed: .png, .jpg, .gif");
        return;
      }
      if (file.size > capFor(file.type)) {
        setSaveError(fileTooLargeMessage(capFor(file.type)));
        return;
      }

      setSaveError(null);

      // Show a data URL immediately in the crop dialog while S3 uploads in parallel
      const reader = new FileReader();
      reader.onloadend = () => openCropDialog(reader.result as string);
      reader.readAsDataURL(file);

      if (tempUpload) await deleteMedia(tempUpload);

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      if (id) formData.append("prefix", id);
      const s3Url = await uploadMedia(formData);
      setImageUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setSaveError("Failed to upload avatar. Please try again.");
        setCropDialogOpen(false);
        return;
      }

      setTempUpload(s3Url);
      setPendingCropSrc(s3Url);
    },
    [capFor, id, tempUpload, uploadMedia],
  );

  // Dragging is handled imperatively inside AvatarCropDialog; it commits the
  // final position here once the gesture settles.
  const handleCropPan = (nx: number, ny: number) => {
    setCropX(clamp(nx, 0, 100));
    setCropY(clamp(ny, 0, 100));
  };

  const handleCropScaleChange = (v: number) => {
    setCropScale(clamp(v, 1, 3));
  };

  const resetCrop = useCallback(() => {
    setCropX(50);
    setCropY(50);
    setCropScale(1);
  }, []);

  const handleCropConfirm = useCallback(() => {
    if (!id) return;
    const crop = toCropFilter(pendingCropSrc, cropX, cropY, cropScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingCropSrc,
    };
    setAvatarSaving(true);
    setMuseAvatarAction(id, nwImage)
      .then((result) => {
        if (result && typeof result === "object" && "message" in result) {
          errorToast("Failed to update avatar.");
          return;
        }
        setTempUpload(null);
        setMuseState({ avatar: result as NWImage });
        successToast("Avatar updated.");
      })
      .catch(() => errorToast("Failed to update avatar."))
      .finally(() => setAvatarSaving(false));
  }, [
    id,
    pendingCropSrc,
    cropX,
    cropY,
    cropScale,
    setMuseState,
    errorToast,
    successToast,
  ]);

  const handleCropCancel = useCallback(async () => {
    if (tempUpload && tempUpload === pendingCropSrc) {
      await deleteMedia(tempUpload);
      setTempUpload(null);
    }
    setCropDialogOpen(false);
  }, [tempUpload, pendingCropSrc]);

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton
            type="button"
            onClick={() => guardNav(onBack)}
            aria-label="Back to character list"
          >
            <BsArrowLeft />
          </S.BackButton>
          <S.FormHeading>
            <ImProfile />
            <h1>Edit character</h1>
          </S.FormHeading>
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 6,
            marginLeft: "auto",
          }}
        >
          {isDirty && (
            <>
              <S.LandingHeroResetButton
                type="button"
                onClick={handleDiscard}
                disabled={saving || imageUploading}
              >
                Reset
              </S.LandingHeroResetButton>
              <S.LandingHeroSaveButton
                type="button"
                onClick={handleSave}
                disabled={saving || imageUploading}
              >
                {saving
                  ? "Saving\u2026"
                  : imageUploading
                    ? "Uploading\u2026"
                    : "Save"}
              </S.LandingHeroSaveButton>
            </>
          )}
          {id && (
            <S.LandingVisitButton
              type="button"
              onClick={() => routeToPage(ROUTES.Muse.View(id))}
              title="Visit muse profile"
            >
              <ImProfile size={14} />
              View {firstName}'s Profile
            </S.LandingVisitButton>
          )}
        </div>
      </S.TopBar>

      {saveError && <S.LandingErrorBanner>{saveError}</S.LandingErrorBanner>}

      <Separator.Root className="separator" orientation="horizontal" />

      <S.LandingHero>
        {/* Clickable avatar upload */}
        <S.LandingHeroAvatarWrap>
          <AvatarUploadField
            src={avatar?.src || image}
            alt={fullName}
            nwImage={avatar}
            onAvatarClick={handleAvatarClick}
          />
          <input
            ref={avatarInputRef}
            id="landing-avatar-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={handleAvatarChange}
            disabled={imageUploading || avatarSaving}
          />
        </S.LandingHeroAvatarWrap>

        {/* Inline-editable name + fandom meta */}
        <S.LandingHeroInfo>
          <S.LandingHeroEditRow>
            <S.LandingHeroInput
              type="text"
              placeholder="First name"
              value={firstName ?? ""}
              aria-label="First name"
              onChange={(e) => setMuseState({ firstName: e.target.value })}
            />
            <S.LandingHeroInput
              type="text"
              placeholder="Last name"
              value={lastName ?? ""}
              aria-label="Last name"
              onChange={(e) => setMuseState({ lastName: e.target.value })}
            />
          </S.LandingHeroEditRow>
          <S.LandingHeroMeta>
            <S.LandingFandomBadge $color={fandomColor}>
              {fandomLabel}
            </S.LandingFandomBadge>
            {nicknameCount > 0 && (
              <S.LandingMetaPill>
                {nicknameCount} {nicknameCount === 1 ? "nickname" : "nicknames"}
              </S.LandingMetaPill>
            )}
            {attrCount > 0 && (
              <S.LandingMetaPill>
                {attrCount} {attrCount === 1 ? "attribute" : "attributes"}
              </S.LandingMetaPill>
            )}
          </S.LandingHeroMeta>
        </S.LandingHeroInfo>
      </S.LandingHero>

      <S.LandingSubtitle>Choose a section to customize</S.LandingSubtitle>

      <S.LandingGrid>
        {/* Appearance */}
        <S.LandingCard
          type="button"
          onClick={() => guardNav(() => onSelect("appearance"))}
        >
          <S.LandingCardIconArea $hue="appearance">
            <MdOutlineBrush className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Appearance</S.LandingCardTitle>
            <S.LandingCardDesc>
              Avatar, card background, wallpaper & profile color
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={Boolean(avatar?.src || image)}>
              Avatar {avatar?.src || image ? "✓" : "—"}
            </S.LandingCardChip>
            <S.LandingCardChip $active={Boolean(wallpaper?.src)}>
              Wallpaper {wallpaper?.src ? "✓" : "—"}
            </S.LandingCardChip>
            <S.LandingCardChip $active={Boolean(cardBackground?.src)}>
              Card BG {cardBackground?.src ? "✓" : "—"}
            </S.LandingCardChip>
            {useAccent && accent && (
              <S.LandingCardAccentChip $color={accent}>
                Profile Color
              </S.LandingCardAccentChip>
            )}
          </S.LandingCardChips>
        </S.LandingCard>

        {/* Information */}
        <S.LandingCard
          type="button"
          onClick={() => guardNav(() => onSelect("information"))}
        >
          <S.LandingCardIconArea $hue="information">
            <BsInfoCircle className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Information</S.LandingCardTitle>
            <S.LandingCardDesc>
              Name, fandom, nicknames & extra attributes
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingFandomBadge $color={fandomColor}>
              {isFandomless ? "No fandom" : fandomLabel}
            </S.LandingFandomBadge>
            <S.LandingCardChip $active={nicknameCount > 0}>
              {nicknameCount > 0
                ? `${nicknameCount} ${nicknameCount === 1 ? "nickname" : "nicknames"}`
                : "No nicknames"}
            </S.LandingCardChip>
            <S.LandingCardChip $active={attrCount > 0}>
              {attrCount > 0
                ? `${attrCount} ${attrCount === 1 ? "attribute" : "attributes"}`
                : "No attributes"}
            </S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>

        {/* Story */}
        <S.LandingCard
          type="button"
          onClick={() => guardNav(() => onSelect("story"))}
        >
          <S.LandingCardIconArea $hue="story">
            <MdAutoStories className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Story</S.LandingCardTitle>
            <S.LandingCardDesc>
              Backstory, personality & character lore
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={Boolean(hasStory)}>
              Backstory {hasStory ? "✓" : "—"}
            </S.LandingCardChip>
            <S.LandingCardChip $active={hasNote}>
              Quote {hasNote ? "✓" : "—"}
            </S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>

        {/* Gallery */}
        <S.LandingCard
          type="button"
          onClick={() => guardNav(() => onSelect("gallery"))}
        >
          <S.LandingCardIconArea $hue="gallery">
            <MdPhotoLibrary className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Gallery</S.LandingCardTitle>
            <S.LandingCardDesc>
              Upload and manage images &amp; videos for this character
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={false}>Media</S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>

        {/* Connections */}
        <S.LandingCard
          type="button"
          onClick={() => guardNav(() => onSelect("connections"))}
        >
          <S.LandingCardIconArea $hue="connections">
            <BsPeopleFill className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Connections</S.LandingCardTitle>
            <S.LandingCardDesc>
              Relationships, bonds &amp; links to other characters
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={false}>Bonds</S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>

        {/* Headcanons */}
        <S.LandingCard
          type="button"
          onClick={() => guardNav(() => onSelect("headcanons"))}
        >
          <S.LandingCardIconArea $hue="headcanons">
            <BsLightbulb className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Headcanons</S.LandingCardTitle>
            <S.LandingCardDesc>
              Traits, quick facts &amp; the little truths canon never told
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardChip $active={false}>Traits</S.LandingCardChip>
            <S.LandingCardChip $active={false}>Quick facts</S.LandingCardChip>
          </S.LandingCardChips>
        </S.LandingCard>
      </S.LandingGrid>

      {/* Avatar crop dialog */}
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
              onPan={handleCropPan}
              onScaleChange={handleCropScaleChange}
              onReset={resetCrop}
              onCancel={handleCropCancel}
              onConfirm={handleCropConfirm}
              onReplace={() => avatarInputRef.current?.click()}
              isUploading={imageUploading}
              viewportRef={cropViewportRef}
            />
          </S.AvatarCropBody>
        }
      />

      {/* Navigation guard dialog */}
      <AppAlertDialog
        closeOnConfirm
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDialogCancel();
        }}
        heading="Unsaved changes"
        text="Your name or avatar has unsaved changes that will be lost if you continue."
        actionButtonLabel="Discard & Continue"
        closeButtonText="Keep Editing"
        actionColor="negative"
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </>
  );
}
