"use client";

import { Form } from "radix-ui";
import {
  type ChangeEventHandler,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GrAttachment } from "react-icons/gr";
import { MdGif } from "react-icons/md";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  MediaTray,
  type TrayTab,
} from "@/components/send-message-composer/media-tray";
import { API_MESSAGE } from "@/utils/constants";
import { uploadMedia } from "@/utils/upload-media";
import {
  useEventThreadInputState,
  useEventThreadInputStoreSet,
} from "./event-thread-input.store";
import { EventThreadEvent, useRunOn } from "./helpers";
import * as S from "./styles";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

/**
 * GIF + image-attachment controls for the event thread composer. Mirrors the
 * prompt composer's media input: selections are queued on the store and the
 * text field's effects embed them inline into the rich text editor (via the
 * same editor handle used by the prompt composer). Attachments are images —
 * they embed inline, exactly like the prompt composer's inline images.
 */
export const EventThreadMediaInput: FC = () => {
  const mediaUploadError = useEventThreadInputState("mediaUploadError");
  const set = useEventThreadInputStoreSet();

  const isMobile = useIsMobile();
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(320);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capture the soft-keyboard height so the mobile tray matches it.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const gap = window.innerHeight - vv.height;
      if (gap > 100) setKeyboardHeight(gap);
    };
    onResize();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const handleClear = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    set({ mediaUploadError: null, mediaUploading: false });
  }, [set]);

  useRunOn([EventThreadEvent.Sent], handleClear);

  useEffect(() => {
    if (mediaUploadError) {
      const t = setTimeout(() => set({ mediaUploadError: null }), 2000);
      return () => clearTimeout(t);
    }
  }, [mediaUploadError, set]);

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      const file = e.currentTarget.files?.[0] ?? null;
      // Reset the input so the same file can be re-selected after an error.
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (file === null) return;

      if (file.size > MAX_FILE_SIZE) {
        set({ mediaUploadError: "FILE_TOO_LARGE", mediaUploading: false });
        return;
      }

      // Embed the image inline with a local placeholder, then swap in the
      // final storage URL once the upload resolves.
      const objectUrl = URL.createObjectURL(file);
      set({ mediaUploading: true, uploadingImage: { objectUrl } });

      const formData = new FormData();
      formData.append("file", file);
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
    },
    [set],
  );

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      set({ gifToInsert: gifUrl });
      setShowGifPicker(false);
      setTrayTab(null);
    },
    [set],
  );

  const handleGifButtonClick = useCallback(() => {
    if (isMobile) {
      setTrayTab((prev) => (prev === "gif" ? null : "gif"));
    } else {
      setShowGifPicker(true);
    }
  }, [isMobile]);

  return (
    <>
      <S.MediaActions>
        <S.MediaSelect name="threadMedia">
          <Form.Label className="form-label" tabIndex={0} title="Attach image">
            <GrAttachment />
          </Form.Label>
          <Form.Control asChild>
            <input
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="media-input"
              type="file"
              accept="image/*"
            />
          </Form.Control>
        </S.MediaSelect>

        <S.ToolButton
          type="button"
          aria-label="Insert GIF"
          title="Insert GIF"
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
    </>
  );
};
