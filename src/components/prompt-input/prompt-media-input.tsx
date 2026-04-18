"use client";

import { Form } from "radix-ui";
import {
  type ChangeEventHandler,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrAttachment } from "react-icons/gr";
import { MdGif } from "react-icons/md";
import { deleteMedia, uploadMedia } from "@/app/rp/profile/actions";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import { API_MESSAGE } from "@/utils/constants";
import { PromptEvent, useRunOn } from "./helpers";
import {
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import * as S from "./styles";

export const PromptMediaInput: FC = () => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const media = usePromptInputState("media");
  const mediaUploading = usePromptInputState("mediaUploading");
  const set = usePromptInputStoreSet();

  const [showGifPicker, setShowGifPicker] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showUploadButton = useMemo(() => {
    return !media && !mediaUploading;
  }, [media, mediaUploading]);

  const handleClear = useCallback(() => {
    if (urlInputRef.current) urlInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
    set({ media: null, mediaUploadError: null, mediaUploading: false });
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

      // 🔴 SIZE CHECK
      if (file.size > MAX_FILE_SIZE) {
        set({
          media: null,
          mediaUploadError: "FILE_TOO_LARGE",
          mediaUploading: false,
        });
        fileInputRef.current.value = "";
        return;
      }

      set({ media: file, mediaUploading: true });

      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadMedia(formData);
      if (uploaded === API_MESSAGE.MediaError) {
        set({ mediaUploadError: "UPLOAD_FAILED", mediaUploading: false });
        fileInputRef.current.value = "";
        return;
      }

      urlInputRef.current.value = uploaded;
      set({ mediaUploadError: null, mediaUploading: false });
    },
    [urlInputRef, set],
  );

  useEffect(() => {
    if (mediaUploadError) {
      setTimeout(() => set({ mediaUploadError: null }), 2000);
    }
  }, [mediaUploadError, set]);

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      set({ gifToInsert: gifUrl });
      setShowGifPicker(false);
    },
    [set],
  );

  return (
    <>
      <S.MediaActions>
        <S.MediaSelect name="media">
          {showUploadButton && (
            <Form.Label className="form-label" tabIndex={0}>
              <GrAttachment />
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
            {mediaUploadError === "FILE_TOO_LARGE" && (
              <span>Attachment should not be larger than 10MB.</span>
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

        <S.ToolButton
          type="button"
          aria-label="Insert GIF"
          onClick={() => setShowGifPicker(true)}
        >
          <MdGif />
        </S.ToolButton>

        <AppAlertDialog
          heading="Insert GIF"
          text=""
          body={<GifPicker onSelect={handleGifSelect} />}
          open={showGifPicker}
          onOpenChange={setShowGifPicker}
          showConfirm={false}
          closeButtonText="Close"
        />
      </S.MediaActions>

      <Form.Field hidden name="mediaUrl">
        <Form.Control asChild>
          <input ref={urlInputRef} type="text" />
        </Form.Control>
      </Form.Field>
    </>
  );
};
