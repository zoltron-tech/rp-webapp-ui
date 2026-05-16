"use client";

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
import { deleteMedia } from "@/app/rp/profile/actions";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { AppAlertDialog } from "../dialog";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

type EditView = "appearance" | "information" | "story" | "gallery";

type Props = {
  onBack: () => void;
  onSelect: (view: EditView) => void;
};

export function LandingSection({ onBack, onSelect }: Props) {
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
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
  const { routeToPage } = usePageRouter();

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

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setSaveError("File type not supported. Allowed: .png, .jpg, .gif");
        e.target.value = "";
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setSaveError("File too large (max 50 MB).");
        e.target.value = "";
        return;
      }

      setSaveError(null);

      // Show data-URI preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setMuseState({ image: reader.result as string });
      reader.readAsDataURL(file);

      if (tempUpload) await deleteMedia(tempUpload);

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      const s3Url = await uploadMedia(formData);
      setImageUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setSaveError("Failed to upload avatar. Please try again.");
        return;
      }

      setTempUpload(s3Url);
      setMuseState({ image: s3Url });
      e.target.value = "";
    },
    [setMuseState, tempUpload, uploadMedia],
  );

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
          <label htmlFor="landing-avatar-input">
            <AvatarUploadField src={image} alt={fullName} />
          </label>
          <input
            id="landing-avatar-input"
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
            disabled={imageUploading}
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
            <S.LandingCardChip $active={Boolean(image)}>
              Avatar {image ? "✓" : "—"}
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

        {/* Connections — coming soon */}
        <S.LandingCard type="button" disabled>
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
            <S.LandingCardComingSoon>Coming Soon</S.LandingCardComingSoon>
          </S.LandingCardChips>
        </S.LandingCard>

        {/* Headcanons — coming soon */}
        <S.LandingCard type="button" disabled>
          <S.LandingCardIconArea $hue="headcanons">
            <BsLightbulb className="section-icon" />
          </S.LandingCardIconArea>
          <S.LandingCardBody>
            <S.LandingCardTitle>Headcanons</S.LandingCardTitle>
            <S.LandingCardDesc>
              Personal interpretations &amp; lore outside the source
            </S.LandingCardDesc>
          </S.LandingCardBody>
          <S.LandingCardChips>
            <S.LandingCardComingSoon>Coming Soon</S.LandingCardComingSoon>
          </S.LandingCardChips>
        </S.LandingCard>
      </S.LandingGrid>

      {/* Navigation guard dialog */}
      <AppAlertDialog
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
