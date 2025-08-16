"use client";

import { Form } from "radix-ui";
import {
  type ChangeEventHandler,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { GrAttachment } from "react-icons/gr";
import { deleteMedia, uploadMedia } from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";
import { PromptEvent, useRunOn } from "./helpers";
import {
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import * as S from "./styles";

export const PromptMediaInput: FC = () => {
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const media = usePromptInputState("media");
  const mediaUploading = usePromptInputState("mediaUploading");
  const set = usePromptInputStoreSet();

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showUploadButton = useMemo(() => {
    return !media && !mediaUploading;
  }, [media, mediaUploading]);

  const handleClear = useCallback(() => {
    if (urlInputRef.current) urlInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
    set({ media: null, mediaUploading: false, mediaUploadError: null });
  }, [set]);

  const handleRemoveMedia = useCallback(() => {
    if (!urlInputRef.current || !fileInputRef.current) return;
    const url = urlInputRef.current.value;
    deleteMedia(url);
    handleClear();
  }, [handleClear]);

  useRunOn([PromptEvent.Sent], handleClear);
  useRunOn([PromptEvent.MediaDeleted], handleRemoveMedia);

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      if (!urlInputRef.current || !fileInputRef.current) return;

      const file = e.currentTarget.files?.[0] ?? null;
      if (file === null) {
        urlInputRef.current.value = "";
        return;
      }
      set({ mediaUploading: true, media: file });

      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadMedia(formData);
      if (uploaded === API_MESSAGE.MediaError) {
        set({ mediaUploadError: "UPLOAD_FAILED", mediaUploading: false });
        fileInputRef.current.value = "";
        return;
      }

      urlInputRef.current.value = uploaded;
      set({ mediaUploading: false, mediaUploadError: null });
    },
    [urlInputRef, set],
  );

  useEffect(() => {
    if (mediaUploadError) {
      setTimeout(() => set({ mediaUploadError: null }), 2000);
    }
  }, [mediaUploadError, set]);

  return (
    <>
      <S.MediaSelect name="media">
        {showUploadButton && (
          <Form.Label className="form-label" tabIndex={0}>
            <GrAttachment />
            Add attachment
          </Form.Label>
        )}
        <Form.Message
          className="form-message"
          forceMatch={Boolean(mediaUploadError)}
        >
          {mediaUploadError === "INVALID_FILE_TYPE" && (
            <span>Invalid file type. Please upload a valid file.</span>
          )}
          {mediaUploadError === "UPLOAD_FAILED" && (
            <span>File upload failed. Please try again.</span>
          )}
        </Form.Message>
        <Form.Control asChild>
          <input
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="media-input"
            type="file"
            accept={"audio/*,video/*,image/*"}
          />
        </Form.Control>
      </S.MediaSelect>
      <Form.Field hidden name="mediaUrl">
        <Form.Control asChild>
          <input ref={urlInputRef} type="text" />
        </Form.Control>
      </Form.Field>
    </>
  );
};
