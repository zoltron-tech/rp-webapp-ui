"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoCloseOutline } from "react-icons/io5";
import { MdGif } from "react-icons/md";
import {
  addMuseAboutSectionAction,
  getMuseAboutSectionAction,
  updateMuseAboutSectionAction,
} from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { MuseAboutSection } from "@/types/novelist";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

export type FullPageEditMuseAboutSectionProps = {
  museId: string;
  sectionId?: string;
  sectionCount?: number;
};

export const FullPageEditMuseAboutSection = ({
  museId,
  sectionId,
  sectionCount,
}: FullPageEditMuseAboutSectionProps) => {
  const authState = useGlobalState("authState");
  const { stopPageLoading, baseDataLoader, routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();

  const editorRef = useRef<RichTextEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState<string>("");
  const [ordinal, setOrdinal] = useState<number>(0);

  // Once sectionCount resolves from the parent fetch, set the initial ordinal
  useEffect(() => {
    if (!sectionId && sectionCount !== undefined) {
      setOrdinal(sectionCount + 1);
    }
  }, [sectionCount, sectionId]);
  const [resolvedSectionId, setResolvedSectionId] = useState<string | null>(
    sectionId ?? null,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tempUpload, setTempUpload] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Fetch existing section data on edit
  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    if (!sectionId) {
      stopPageLoading();
      return;
    }

    const fetchData = async () => {
      const section = await baseDataLoader(() =>
        getMuseAboutSectionAction(sectionId),
      );
      if (section) {
        setText(section.text ?? "");
        setOrdinal(section.ordinal ?? 0);
        setResolvedSectionId(section.id ?? null);
        setImageUrl(section.image ?? null);
      }
    };

    fetchData();
  }, [authState]);

  const handleGifSelect = useCallback((gifUrl: string) => {
    setShowGifPicker(false);
    editorRef.current?.insertGif(gifUrl);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0] ?? null;
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        setError("File too large (max 10 MB)");
        return;
      }
      setImageUploading(true);
      setError(null);
      // Delete previous temp upload if user swaps file
      if (tempUpload) {
        await deleteMedia(tempUpload);
        setTempUpload(null);
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      formData.append("prefix", "muse-about");
      const url = await uploadMedia(formData);
      console.log("Upload response:", url);
      if (url === API_MESSAGE.MediaError) {
        setError("Failed to upload attachment");
        setImageUploading(false);
        return;
      }
      setImageUrl(url);
      setTempUpload(url);
      setImageUploading(false);
      // Reset input so the same file can be re-selected
      input.value = "";
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
    if (!museId) {
      setError("Invalid muse ID");
      return;
    }
    if (!text || text.trim() === "") {
      setError("Section text is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response: MuseAboutSection | { message: string };

      if (resolvedSectionId) {
        response = await updateMuseAboutSectionAction(
          resolvedSectionId,
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

      successToast(
        resolvedSectionId
          ? "Section updated successfully"
          : "Section created successfully",
      );
      // Temp upload is now permanently saved — stop tracking it
      setTempUpload(null);
      routeToPage(ROUTES.Profile.Muses.About(museId));
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
    resolvedSectionId,
    routeToPage,
    successToast,
    errorToast,
  ]);

  const handleBack = useCallback(async () => {
    if (tempUpload) {
      await deleteMedia(tempUpload);
    }
    routeToPage(ROUTES.Profile.Muses.About(museId));
  }, [museId, tempUpload, routeToPage]);

  const submitText = resolvedSectionId
    ? loading
      ? "Saving..."
      : "Update"
    : loading
      ? "Saving..."
      : "Add";

  return (
    <S.FPRoot>
      {/* Top bar: back ← | title | Save */}
      <S.FPTopBar>
        <S.FPBackButton type="button" aria-label="Go back" onClick={handleBack}>
          <IoCloseOutline />
        </S.FPBackButton>
        <S.FPSubmitButton
          type="button"
          disabled={loading}
          onClick={handleSubmit}
        >
          {submitText}
        </S.FPSubmitButton>
      </S.FPTopBar>

      {/* Meta row: ordinal + attachment + Klipy GIF button */}
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
            htmlFor="fp-attach-input"
            aria-label="Attach image"
            style={{ marginRight: "0.5rem" }}
          >
            <GrAttachment />
          </S.FPAttachButton>
          <input
            id="fp-attach-input"
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

      {/* Error strip */}
      {error && <S.FPErrorMessage>{error}</S.FPErrorMessage>}

      {/* Full-height editor */}
      <S.FPEditorArea>
        <RichTextEditor
          ref={editorRef}
          placeholder="Write the about section content..."
          value={text}
          onChange={setText}
          fullPage
        />
      </S.FPEditorArea>

      {/* Media preview / uploading indicator */}
      {(imageUrl || imageUploading) && (
        <S.FPMediaPreviewArea>
          {imageUploading ? (
            <S.FPMediaUploadingText>Uploading...</S.FPMediaUploadingText>
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
    </S.FPRoot>
  );
};

export default FullPageEditMuseAboutSection;
