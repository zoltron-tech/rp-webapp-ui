"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Separator } from "radix-ui";
import { useEffect, useRef, useState } from "react";
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
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { deleteMedia } from "../actions";
import { useProfileState, useProfileStoreSet } from "./profile.store";
import * as S from "./styled";
import { useProfileSave } from "./use-profile-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ProfileView = "landing" | "appearance" | "about" | "account";

type Props = {
  onSelect: (view: ProfileView) => void;
};

export function LandingSection({ onSelect }: Props) {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const firstName = useProfileState("firstName");
  const lastName = useProfileState("lastName");
  const image = useProfileState("image");
  const about = useProfileState("about");
  const note = useProfileState("note");
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

  const originalRef = useRef({
    firstName: novelist?.firstName ?? "",
    image: novelist?.image ?? "",
    lastName: novelist?.lastName ?? "",
  });

  // Keep snapshot in sync if novelist refreshes
  useEffect(() => {
    originalRef.current = {
      firstName: novelist?.firstName ?? "",
      image: novelist?.image ?? "",
      lastName: novelist?.lastName ?? "",
    };
  }, [novelist?.firstName, novelist?.lastName, novelist?.image]);

  const isDirty =
    (firstName ?? "") !== originalRef.current.firstName ||
    (lastName ?? "") !== originalRef.current.lastName ||
    (image ?? "") !== originalRef.current.image;

  const handleAvatarClick = () => {
    setAvatarDialogOpen(true);
  };

  const handleMediaSelect = async (url: string) => {
    setError(null);
    if (tempUploadedImage) {
      await deleteMedia(tempUploadedImage);
      setTempUploadedImage(null);
    }
    setProfileState({ image: url });
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
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () =>
      setProfileState({ image: reader.result as string });
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
      return;
    }

    setTempUploadedImage(url);
    setProfileState({ image: url });
  };

  const handleSave = async () => {
    setError(null);
    const result = await saveNovelist();
    if (!result.ok) {
      setError("Failed to save profile. Please try again.");
      return;
    }
    setTempUploadedImage(null);
  };

  const handleReset = () => {
    setProfileState({
      firstName: originalRef.current.firstName,
      image: originalRef.current.image,
      lastName: originalRef.current.lastName,
    });
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
              disabled={loading || imageUploading}
            >
              {loading ? "Saving..." : imageUploading ? "Uploading..." : "Save"}
            </S.LandingHeroSaveButton>
          </div>
        )}
      </S.TopBar>

      {error && <S.LandingErrorBanner>{error}</S.LandingErrorBanner>}

      <Separator.Root className="separator" orientation="horizontal" />

      <S.LandingHero>
        <S.LandingHeroAvatarWrap onClick={handleAvatarClick}>
          <AvatarUploadField
            src={image || null}
            note={note || ""}
            alt={firstName || "Avatar"}
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
            <S.LandingCardChip $active={Boolean(note)}>Note</S.LandingCardChip>
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
    </>
  );
}
