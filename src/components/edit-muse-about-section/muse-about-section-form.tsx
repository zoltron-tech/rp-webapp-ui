"use client";

import { useCallback, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoCloseOutline } from "react-icons/io5";
import { MdGif } from "react-icons/md";
import {
  addMuseAboutSectionAction,
  updateMuseAboutSectionAction,
} from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { MuseAboutSection } from "@/types/novelist";
import { API_MESSAGE } from "@/utils/constants";
import * as S from "./styled";

export type MuseAboutSectionFormProps = {
  museId: string;
  /** Provide an existing section for edit mode; omit for create mode. */
  section?: MuseAboutSection;
  /** Used to set the initial ordinal for a new section. */
  sectionCount: number;
  onSave: (section: MuseAboutSection) => void;
  onCancel: () => void;
};

export function MuseAboutSectionForm({
  museId,
  section,
  sectionCount,
  onSave,
  onCancel,
}: MuseAboutSectionFormProps) {
  const { successToast, errorToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();

  const editorRef = useRef<RichTextEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(section?.id);

  const [text, setText] = useState(section?.text ?? "");
  const [ordinal, setOrdinal] = useState(section?.ordinal ?? sectionCount + 1);
  const [imageUrl, setImageUrl] = useState<string | null>(
    section?.image ?? null,
  );
  const [tempUpload, setTempUpload] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleGifSelect = useCallback((gifUrl: string) => {
    setShowGifPicker(false);
    editorRef.current?.insertGif(gifUrl);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0] ?? null;
      input.value = "";
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        setError("File too large (max 10 MB)");
        return;
      }
      setError(null);

      if (file.type.startsWith("image/")) {
        // Insert inline into the editor (same as prompt input)
        const objectUrl = URL.createObjectURL(file);
        editorRef.current?.insertUploadingImage(objectUrl);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentType", file.type);
        formData.append("prefix", "muse-about");
        const url = await uploadMedia(formData);
        if (url === API_MESSAGE.MediaError) {
          setError("Failed to upload image");
          editorRef.current?.removeImageBySrc(objectUrl);
          URL.revokeObjectURL(objectUrl);
          return;
        }
        editorRef.current?.replaceImageSrc(objectUrl, url);
        URL.revokeObjectURL(objectUrl);
      } else {
        // Non-image (audio / video) — keep as attachment
        setImageUploading(true);
        if (tempUpload) {
          await deleteMedia(tempUpload);
          setTempUpload(null);
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentType", file.type);
        formData.append("prefix", "muse-about");
        const url = await uploadMedia(formData);
        if (url === API_MESSAGE.MediaError) {
          setError("Failed to upload attachment");
          setImageUploading(false);
          return;
        }
        setImageUrl(url);
        setTempUpload(url);
        setImageUploading(false);
      }
    },
    [uploadMedia, tempUpload, MAX_FILE_SIZE],
  );

  const handleRemoveAttachment = useCallback(async () => {
    if (tempUpload) {
      await deleteMedia(tempUpload);
      setTempUpload(null);
    }
    setImageUrl(null);
  }, [tempUpload]);

  const handleSubmit = useCallback(async () => {
    if (!text || text.trim() === "") {
      setError("Section text is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response: MuseAboutSection | { message: string };

      if (isEditMode && section?.id) {
        response = await updateMuseAboutSectionAction(
          section.id,
          text,
          ordinal,
          imageUrl,
        );
      } else {
        response = await addMuseAboutSectionAction(
          museId,
          text,
          ordinal,
          imageUrl,
        );
      }

      if ("message" in response) {
        setError("Failed to save section");
        errorToast("Failed to save section");
        return;
      }

      setTempUpload(null);
      successToast(isEditMode ? "Section updated" : "Section added");
      onSave(response);
    } catch {
      setError("An error occurred while saving");
      errorToast("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  }, [
    museId,
    text,
    ordinal,
    imageUrl,
    section,
    isEditMode,
    successToast,
    errorToast,
    onSave,
  ]);

  const handleCancel = useCallback(async () => {
    if (tempUpload) {
      await deleteMedia(tempUpload);
    }
    onCancel();
  }, [tempUpload, onCancel]);

  const submitLabel = isEditMode
    ? loading
      ? "Saving..."
      : "Update"
    : loading
      ? "Adding..."
      : "Add";

  return (
    <S.FormRoot>
      {/* Top bar */}
      <S.FPTopBar>
        <S.FPBackButton
          type="button"
          aria-label="Close"
          onClick={handleCancel}
          disabled={loading}
        >
          <IoCloseOutline />
        </S.FPBackButton>
        <S.FormTitle>{isEditMode ? "Edit Section" : "New Section"}</S.FormTitle>
        <S.FPSubmitButton
          type="button"
          disabled={loading || imageUploading}
          onClick={handleSubmit}
        >
          {submitLabel}
        </S.FPSubmitButton>
      </S.FPTopBar>

      {/* Meta row */}
      <S.FPMetaRow>
        <S.FPOrdinalLabel>Order</S.FPOrdinalLabel>
        <S.OrdinalStepper>
          <S.OrdinalStepBtn
            type="button"
            aria-label="Decrease order"
            disabled={loading || ordinal <= 0}
            onClick={() => setOrdinal((n) => Math.max(0, n - 1))}
          >
            −
          </S.OrdinalStepBtn>
          <S.OrdinalValue>{ordinal}</S.OrdinalValue>
          <S.OrdinalStepBtn
            type="button"
            aria-label="Increase order"
            disabled={loading}
            onClick={() => setOrdinal((n) => n + 1)}
          >
            +
          </S.OrdinalStepBtn>
        </S.OrdinalStepper>
        <S.FPMetaRight>
          <S.FPAttachButton
            htmlFor="msf-attach-input"
            aria-label="Attach image"
            style={{ marginRight: "0.5rem" }}
          >
            <GrAttachment />
          </S.FPAttachButton>
          <input
            id="msf-attach-input"
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <S.FPGifButton
            type="button"
            aria-label="Insert GIF"
            onClick={() => setShowGifPicker(true)}
          >
            <MdGif />
          </S.FPGifButton>
        </S.FPMetaRight>
      </S.FPMetaRow>

      {error && <S.FPErrorMessage>{error}</S.FPErrorMessage>}

      <S.FPEditorArea>
        <RichTextEditor
          ref={editorRef}
          placeholder="Write the section content..."
          value={text}
          onChange={setText}
          fullPage
        />
      </S.FPEditorArea>

      {(imageUrl || imageUploading) && (
        <S.FPMediaPreviewArea>
          {imageUploading ? (
            <S.FPMediaUploadingText>Uploading…</S.FPMediaUploadingText>
          ) : (
            imageUrl && (
              <>
                <S.FPMediaPreviewImg src={imageUrl} alt="Attachment preview" />
                <S.FPMediaRemoveButton
                  type="button"
                  aria-label="Remove attachment"
                  onClick={handleRemoveAttachment}
                >
                  <IoCloseOutline />
                </S.FPMediaRemoveButton>
              </>
            )
          )}
        </S.FPMediaPreviewArea>
      )}

      <AppAlertDialog
        heading="Insert GIF"
        text=""
        body={<GifPicker onSelect={handleGifSelect} />}
        open={showGifPicker}
        onOpenChange={setShowGifPicker}
        showConfirm={false}
        closeButtonText="Close"
      />
    </S.FormRoot>
  );
}
