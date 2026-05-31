"use client";

import { ShouldRender } from "@novelist-world/ui";
import { RadioGroup, Separator } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { MdOutlineBrush } from "react-icons/md";
import { AvatarPickerDialog } from "@/components/avatar-picker-dialog";
import { AvatarUploadField } from "@/components/common/avatar-upload-field";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { ACCENT_MAP, type Accent } from "@/types/theme";
import { API_MESSAGE } from "@/utils/constants";
import { deleteMedia } from "../actions";
import { NoteDialogBody } from "./note-dialog-body";
import { useProfileState, useProfileStoreSet } from "./profile.store";
import * as S from "./styled";
import { useProfileSave } from "./use-profile-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Props = {
  onBack: () => void;
};

export function AppearanceSection({ onBack }: Props) {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const image = useProfileState("image");
  const note = useProfileState("note");
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
  const [discardOpen, setDiscardOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originalRef = useRef({
    image: novelist?.image ?? "",
    note: novelist?.note ?? "",
    palette: user?.palette ?? 0,
  });

  useEffect(() => {
    originalRef.current = {
      image: novelist?.image ?? "",
      note: novelist?.note ?? "",
      palette: user?.palette ?? 0,
    };
  }, [novelist?.image, novelist?.note, user?.palette]);

  const isDirty =
    (image ?? "") !== originalRef.current.image ||
    (note ?? "") !== originalRef.current.note ||
    Number(palette) !== Number(originalRef.current.palette);

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

  const handleMediaSelect = async (url: string) => {
    setError(null);
    if (tempUploadedImage) {
      await deleteMedia(tempUploadedImage);
      setTempUploadedImage(null);
    }
    setProfileState({ image: url });
  };

  const handleSave = async () => {
    setError(null);
    const result = await saveAll();
    if (!result.ok) {
      setError("Failed to save changes. Please try again.");
      return;
    }
    setTempUploadedImage(null);
    onBack();
  };

  const handleReset = () => {
    setProfileState({
      image: originalRef.current.image,
      note: originalRef.current.note,
      palette: originalRef.current.palette as Accent,
    });
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
    setTempNote(note ?? "");
    setNoteDialogOpen(true);
  };

  const confirmNote = () => {
    setProfileState({ note: tempNote });
    setNoteDialogOpen(false);
  };

  const previewAccentClass =
    ACCENT_MAP[Number(palette) as Accent] ?? ACCENT_MAP[0];

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
          <div className="avatar-field" style={{ cursor: "pointer" }} onClick={() => setAvatarDialogOpen(true)}>
            <AvatarUploadField
              src={image || null}
              alt="Avatar"
              note={note || ""}
              onNoteClick={openNoteDialog}
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
            {Object.entries(ACCENT_MAP).map(([key, color]) => (
              <S.RadioItemContainer key={key} className={color}>
                <RadioGroup.Item
                  className="radio-item"
                  value={key}
                  id={`palette-${key}`}
                  aria-label={`Palette ${color}`}
                />
              </S.RadioItemContainer>
            ))}
          </S.PaletteGroup>
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
          disabled={!isDirty || loading || imageUploading}
        >
          {loading ? "Saving..." : imageUploading ? "Uploading..." : "Save"}
        </S.LandingHeroSaveButton>
      </S.FormActions>

      <AvatarPickerDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        onUploadSelect={() => fileInputRef.current?.click()}
        onMediaSelect={handleMediaSelect}
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
        body={<NoteDialogBody value={tempNote} onChange={setTempNote} />}
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
