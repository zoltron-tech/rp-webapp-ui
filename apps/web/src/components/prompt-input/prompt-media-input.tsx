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
import { deleteMedia } from "@/app/rp/profile/actions";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  MediaTray,
  type TrayTab,
} from "@/components/send-message-composer/media-tray";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { API_MESSAGE } from "@/utils/constants";
import { appendUploadPurpose, uploadMedia } from "@/utils/upload-media";
import { PromptEvent, useRunOn } from "./helpers";
import {
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import * as S from "./styles";
import { usePostMediaRoom } from "./use-post-media-room";

/** Tracks whether the viewport is at a mobile width. */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
};

export const PromptMediaInput: FC = () => {
  // The service's cap for the file's family (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const media = usePromptInputState("media");
  const mediaUploading = usePromptInputState("mediaUploading");
  const set = usePromptInputStoreSet();
  // Five media items at most per prompt, comment or reply.
  const room = usePostMediaRoom();
  const { ensureRoom } = room;

  const isMobile = useIsMobile();
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const keyboardHeightRef = useRef(320);
  const [keyboardHeight, setKeyboardHeight] = useState(320);

  // Capture the soft-keyboard height so the tray matches it.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const gap = window.innerHeight - vv.height;
      if (gap > 100) {
        keyboardHeightRef.current = gap;
        setKeyboardHeight(gap);
      }
    };
    onResize();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

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
      const file = e.currentTarget.files?.[0] ?? null;
      // Reset the input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (file === null) return;
      // The post's media limit, in case it filled while the picker was open.
      if (!ensureRoom()) return;

      // 🔴 SIZE CHECK
      if (file.size > capFor(file.type)) {
        set({
          media: null,
          mediaUploadError: "FILE_TOO_LARGE",
          mediaUploading: false,
        });
        return;
      }

      const isImage = file.type.startsWith("image/");

      if (isImage) {
        // Embed image inline in the editor rather than as a separate attachment
        const objectUrl = URL.createObjectURL(file);
        set({ mediaUploading: true, uploadingImage: { objectUrl } });

        const formData = new FormData();
        formData.append("file", file);
        // Post media: not the account's storage.
        appendUploadPurpose(formData, "post");
        const uploaded = await uploadMedia(formData);

        if (uploaded === API_MESSAGE.MediaError) {
          set({
            mediaUploadError: "UPLOAD_FAILED",
            mediaUploading: false,
            uploadFailedImage: { objectUrl },
            uploadingImage: null,
          });
          return;
        }

        set({
          mediaUploadError: null,
          mediaUploading: false,
          uploadedImage: { finalUrl: uploaded, objectUrl },
          uploadingImage: null,
        });
      } else {
        // Non-image (audio / video) — keep existing attachment behaviour
        if (!urlInputRef.current) return;
        set({ media: file, mediaUploading: true });

        const formData = new FormData();
        formData.append("file", file);
        // Post media: not the account's storage.
        appendUploadPurpose(formData, "post");
        const uploaded = await uploadMedia(formData);

        if (uploaded === API_MESSAGE.MediaError) {
          set({ mediaUploadError: "UPLOAD_FAILED", mediaUploading: false });
          return;
        }

        urlInputRef.current.value = uploaded;
        set({ mediaUploadError: null, mediaUploading: false });
      }
    },
    [urlInputRef, set, capFor, ensureRoom],
  );

  useEffect(() => {
    if (mediaUploadError) {
      setTimeout(() => set({ mediaUploadError: null }), 2000);
    }
  }, [mediaUploadError, set]);

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      setShowGifPicker(false);
      setTrayTab(null);
      // A Klipy GIF never counts toward the media limit (owner decision
      // 2026-11-08), so it is never checked for room.
      set({ gifToInsert: gifUrl });
    },
    [set],
  );

  const handleGifButtonClick = useCallback(() => {
    // GIFs do not count toward the media limit: the picker always opens.
    if (isMobile && trayTab === "gif") {
      setTrayTab(null);
      return;
    }
    if (isMobile) {
      setTrayTab("gif");
    } else {
      setShowGifPicker(true);
    }
  }, [isMobile, trayTab]);

  return (
    <>
      <S.MediaActions>
        <S.MediaSelect name="media">
          {showUploadButton && (
            <Form.Label
              className="form-label"
              tabIndex={0}
              aria-disabled={room.full || undefined}
              title={room.full ? room.message : undefined}
              // At the limit the file picker does not open; the toast says why.
              onClick={(event) => {
                if (!ensureRoom()) event.preventDefault();
              }}
            >
              <GrAttachment />
            </Form.Label>
          )}
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
          onClick={handleGifButtonClick}
        >
          <MdGif />
        </S.ToolButton>

        {/* Desktop: dialog */}
        {!isMobile && (
          <AppAlertDialog
            heading="Insert GIF"
            text=""
            body={<GifPicker onSelect={handleGifSelect} />}
            open={showGifPicker}
            onOpenChange={setShowGifPicker}
            showConfirm={false}
            closeButtonText="Close"
          />
        )}
      </S.MediaActions>

      {/* Mobile: bottom tray */}
      {isMobile && (
        <MediaTray
          tab={trayTab}
          tabs={["gif"]}
          keyboardHeight={keyboardHeight}
          onTabChange={setTrayTab}
          onRequestKeyboard={() => setTrayTab(null)}
          onSelectGif={handleGifSelect}
        />
      )}

      <Form.Field hidden name="mediaUrl">
        <Form.Control asChild>
          <input ref={urlInputRef} type="text" />
        </Form.Control>
      </Form.Field>
    </>
  );
};
