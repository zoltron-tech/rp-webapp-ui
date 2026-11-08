"use client";

import type { MuseAboutSection } from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import { fileTooLargeMessage } from "@nw/utils";
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
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useRichTextMediaRoom } from "@/hooks/use-rich-text-media-room";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import {
  useMuseAboutSectionState,
  useMuseAboutSectionStoreSet,
} from "./muse-about-section.store";
import * as S from "./styled";

export default function EditMuseAboutSectionDataCard() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const sectionId = useMuseAboutSectionState("id");
  const parentId = useMuseAboutSectionState("parentId");
  const ordinal = useMuseAboutSectionState("ordinal");
  const text = useMuseAboutSectionState("text");
  const storeImage = useMuseAboutSectionState("image");
  const setSectionState = useMuseAboutSectionStoreSet();
  const { successToast, errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();
  const { uploadMedia } = useUploadMedia();
  // The service's cap for the file's family (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempUpload, setTempUpload] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  // Five media items per rich-text input, as on prompts (2026-11-08).
  const { ensureRoom } = useRichTextMediaRoom(text, storeImage);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = useCallback(
    (value: string) => {
      setSectionState({ text: value });
      setError(null);
    },
    [setSectionState],
  );

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      setShowGifPicker(false);
      if (!ensureRoom()) return;
      editorRef.current?.insertGif(gifUrl);
    },
    [ensureRoom],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0] ?? null;
      if (!file) return;
      if (!ensureRoom()) {
        input.value = "";
        return;
      }
      if (file.size > capFor(file.type)) {
        setError(fileTooLargeMessage(capFor(file.type)));
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
      if (url === API_MESSAGE.MediaError) {
        setError("Failed to upload attachment");
        setImageUploading(false);
        return;
      }
      setSectionState({ image: url });
      setTempUpload(url);
      setImageUploading(false);
      input.value = "";
    },
    [uploadMedia, setSectionState, tempUpload, capFor, ensureRoom],
  );

  const handleRemoveAttachment = useCallback(async () => {
    if (tempUpload) {
      await deleteMedia(tempUpload);
      setTempUpload(null);
    }
    setSectionState({ image: null });
  }, [tempUpload, setSectionState]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!parentId) {
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
        let response: MuseAboutSection | WithMessage;

        // If sectionId exists, update; otherwise, create
        if (sectionId) {
          response = await updateMuseAboutSectionAction(
            sectionId,
            text,
            ordinal,
            storeImage,
          );
        } else {
          response = await addMuseAboutSectionAction(
            parentId,
            text,
            ordinal,
            storeImage,
          );
        }

        if ("message" in response) {
          setError("Failed to save section");
          errorToast("Failed to save section");
          return;
        }

        successToast(
          sectionId
            ? "Section updated successfully"
            : "Section created successfully",
        );
        // Temp upload is now permanently saved — stop tracking it
        setTempUpload(null);
        setSectionState({
          id: response.id,
          image: response.image,
          ordinal: response.ordinal,
          parentId: response.parentId,
          text: response.text,
        });

        // Navigate back or close modal
        if (user?.username) {
          routeToPage(ROUTES.Profile.Muses.About(parentId || ""));
        }
      } catch (err) {
        setError("An error occurred while saving");
        errorToast("An error occurred while saving");
      } finally {
        setLoading(false);
      }
    },
    [
      parentId,
      text,
      ordinal,
      storeImage,
      setSectionState,
      user,
      routeToPage,
      successToast,
      errorToast,
    ],
  );

  const handleCancel = useCallback(async () => {
    if (tempUpload) {
      await deleteMedia(tempUpload);
    }
    if (user?.username) {
      routeToPage(ROUTES.Profile.Muses.About(parentId || ""));
    }
  }, [user, routeToPage, parentId, tempUpload]);

  console.log("EditMuseAboutSectionDataCard rendered with store data:", {
    ordinal,
    parentId,
    sectionId,
    text,
  });

  return (
    <S.Container>
      <form onSubmit={handleSubmit}>
        <S.FormGroup>
          <div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
            <S.FPOrdinalLabel>Order</S.FPOrdinalLabel>
            <S.OrdinalStepper>
              <S.OrdinalStepBtn
                type="button"
                aria-label="Decrease order"
                disabled={loading || ordinal <= 0}
                onClick={() => setSectionState({ ordinal: ordinal - 1 })}
              >
                −
              </S.OrdinalStepBtn>
              <S.OrdinalValue>{ordinal}</S.OrdinalValue>
              <S.OrdinalStepBtn
                type="button"
                aria-label="Increase order"
                disabled={loading}
                onClick={() => setSectionState({ ordinal: ordinal + 1 })}
              >
                +
              </S.OrdinalStepBtn>
            </S.OrdinalStepper>
          </div>
        </S.FormGroup>

        <S.FormGroup>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <S.Label>Section Content</S.Label>
            <div
              style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}
            >
              <S.FPAttachButton
                htmlFor="dc-attach-input"
                aria-label="Attach image"
                onClick={(event) => {
                  if (!ensureRoom()) event.preventDefault();
                }}
              >
                <GrAttachment />
              </S.FPAttachButton>
              <input
                id="dc-attach-input"
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <S.FPGifButton
                type="button"
                aria-label="Insert GIF"
                onClick={() => {
                  if (ensureRoom()) setShowGifPicker(true);
                }}
              >
                <MdGif />
              </S.FPGifButton>
            </div>
          </div>
          <RichTextEditor
            ref={editorRef}
            placeholder="Write the about section content..."
            value={text || ""}
            onChange={handleTextChange}
          />
          {(storeImage || imageUploading) && (
            <S.FPMediaPreviewArea>
              {imageUploading ? (
                <S.FPMediaUploadingText>Uploading...</S.FPMediaUploadingText>
              ) : (
                storeImage && (
                  <>
                    <S.FPMediaPreviewImg
                      src={storeImage}
                      alt="Attachment preview"
                    />
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
        </S.FormGroup>

        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

        <S.ButtonGroup>
          <S.CancelButton
            type="button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </S.CancelButton>
          <S.SubmitButton type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : sectionId
                ? "Update Section"
                : "Create Section"}
          </S.SubmitButton>
        </S.ButtonGroup>
      </form>

      <AppAlertDialog
        heading="Insert GIF"
        text=""
        body={<GifPicker onSelect={handleGifSelect} />}
        open={showGifPicker}
        onOpenChange={setShowGifPicker}
        showConfirm={false}
        closeButtonText="Close"
      />
    </S.Container>
  );
}
