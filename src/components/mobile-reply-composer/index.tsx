"use client";

import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrAttachment } from "react-icons/gr";
import { HiPaperAirplane } from "react-icons/hi2";
import { MdGif } from "react-icons/md";
import { submitPrompt, uploadMedia } from "@/app/rp/profile/actions";
import {
  MediaTray,
  type TrayTab,
} from "@/components/send-message-composer/media-tray";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type {
  PromptSource,
  SubmitPromptInput,
  SubmitPromptType,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import {
  getParentIdKeyFromPromptType,
  museToSource,
  novelistToSource,
  PromptEvent,
  usePromptInputEvents,
  useRunOn,
} from "../prompt-input/helpers";
import {
  INITIAL_STATE,
  type PromptInputState,
  usePromptInputState,
  usePromptInputStoreSet,
} from "../prompt-input/prompt-input.store";
import { PromptMediaPreview } from "../prompt-input/prompt-media-preview";
import { PromptMuseSelect } from "../prompt-input/prompt-muse-select";
import { PromptTextField } from "../prompt-input/prompt-text-field";
import * as S from "./styled";

export type MobileReplyComposerProps = {
  parentId: string;
  /** Only "reply" or "comment" — not "prompt" (no privacy controls here). */
  type: Exclude<SubmitPromptType, "prompt">;
  dropdownSelection: "NOVELIST" | "MUSE" | "ALL";
  initialSelection?: PromptSource;
  onSend?: () => void;
};

const submitLabel: Record<Exclude<SubmitPromptType, "prompt">, string> = {
  comment: "Comment",
  reply: "Reply",
};

const MobileReplyComposerInner: FC<MobileReplyComposerProps> = ({
  parentId,
  type,
  dropdownSelection,
  initialSelection,
  onSend,
}) => {
  const [sending, setSending] = useState(false);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const keyboardHeightRef = useRef(320);
  const [keyboardHeight, setKeyboardHeight] = useState(320);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const novelist = useGlobalState("novelist");
  const promptText = usePromptInputState("promptText");
  const mediaUploading = usePromptInputState("mediaUploading");
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const { successToast, errorToast } = useUIContext();
  const setPromptInputState = usePromptInputStoreSet();
  const { emit } = usePromptInputEvents();

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

  const sources = useMemo(() => {
    if (!novelist) return [];
    const novelistSource = novelistToSource(novelist);
    const museSources = (novelist.muses ?? []).map(museToSource);
    switch (dropdownSelection) {
      case "NOVELIST":
        return [novelistSource];
      case "MUSE":
        return museSources;
      default:
        return [novelistSource, ...museSources];
    }
  }, [novelist, dropdownSelection]);

  const hasContent = Boolean(promptText?.trim());

  const submitDisabled = useMemo(
    () => mediaUploading || Boolean(mediaUploadError) || sending,
    [mediaUploading, mediaUploadError, sending],
  );

  const submitText = useMemo(() => {
    if (sending) return "Sending...";
    if (mediaUploading) return "Uploading...";
    return submitLabel[type] ?? "Send";
  }, [type, sending, mediaUploading]);

  // ── Inline image upload (replaces PromptMediaInput for images) ───────────
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0] ?? null;
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        errorToast("Image should not be larger than 10 MB.");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPromptInputState({
        mediaUploading: true,
        uploadingImage: { objectUrl },
      });
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadMedia(formData);
      if (uploaded === API_MESSAGE.MediaError) {
        setPromptInputState({
          mediaUploadError: "UPLOAD_FAILED",
          mediaUploading: false,
          uploadFailedImage: { objectUrl },
          uploadingImage: null,
        });
        return;
      }
      setPromptInputState({
        mediaUploadError: null,
        mediaUploading: false,
        uploadedImage: { finalUrl: uploaded, objectUrl },
        uploadingImage: null,
      });
    },
    [setPromptInputState, errorToast],
  );

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      setPromptInputState({ gifToInsert: gifUrl });
      setTrayTab(null);
    },
    [setPromptInputState],
  );

  // Clean up media state on successful send (mirrors PromptMediaInput cleanup)
  useRunOn([PromptEvent.Sent], () => {
    if (urlInputRef.current) urlInputRef.current.value = "";
    setPromptInputState({
      media: null,
      mediaUploadError: null,
      mediaUploading: false,
    });
  });

  const handleSend: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!promptText?.trim()) {
        errorToast("Reply cannot be empty.");
        return;
      }
      const formData = new FormData(e.currentTarget);
      const museId = String(formData.get("muse"));
      const selectedSource = sources.find((s) => s.sourceId === museId);
      if (!selectedSource) return;

      const payload: SubmitPromptInput = {
        media: String(formData.get("mediaUrl")),
        source: selectedSource,
        text: promptText,
        [getParentIdKeyFromPromptType(type)]: parentId,
      };

      setSending(true);
      const response = await submitPrompt(payload, type);

      if (response.message !== API_MESSAGE.Success) {
        errorToast("Failed to send. Please try again.");
        setSending(false);
        emit(PromptEvent.Error, response.message);
        return;
      }

      successToast("Sent successfully");
      emit(PromptEvent.Sent, { muse: selectedSource, payload, type });
      setSending(false);
      setPromptInputState({ media: null, promptText: "" });
      onSend?.();
    },
    [
      sources,
      promptText,
      parentId,
      type,
      emit,
      onSend,
      errorToast,
      successToast,
      setPromptInputState,
    ],
  );

  return (
    <S.ComposerRoot>
      <Form.Root onSubmit={handleSend}>
        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        {/* Hidden mediaUrl field keeps form submission intact */}
        <Form.Field hidden name="mediaUrl">
          <Form.Control asChild>
            <input ref={urlInputRef} type="text" defaultValue="" />
          </Form.Control>
        </Form.Field>

        {/* ── Meta row: sender + GIF + Image buttons ──────────────────── */}
        <S.MetaRow>
          <S.MuseWrap>
            <PromptMuseSelect
              sources={sources}
              dropdownSelection={dropdownSelection}
              initialSelection={initialSelection}
            />
          </S.MuseWrap>
          <S.MediaWrap>
            <S.MediaIconBtn
              type="button"
              title="Insert image"
              onClick={() => fileInputRef.current?.click()}
            >
              <GrAttachment size={16} />
            </S.MediaIconBtn>
            <S.MediaIconBtn
              type="button"
              title="Insert GIF"
              onClick={() =>
                setTrayTab((prev) => (prev === "gif" ? null : "gif"))
              }
            >
              <MdGif size={16} />
            </S.MediaIconBtn>
          </S.MediaWrap>
        </S.MetaRow>

        {/* ── Editor area ──────────────────────────────────────────────── */}
        <S.EditorArea>
          <PromptTextField compact />

          <S.SubmitTrailing>
            {hasContent && (
              <Form.Submit asChild>
                <S.SendIconBtn disabled={submitDisabled} title={submitText}>
                  <HiPaperAirplane size={16} />
                </S.SendIconBtn>
              </Form.Submit>
            )}
          </S.SubmitTrailing>
        </S.EditorArea>

        {/* Staged media preview (non-image attachments) */}
        <PromptMediaPreview />
      </Form.Root>

      {/* GIF media tray */}
      <MediaTray
        tab={trayTab}
        tabs={["gif"]}
        keyboardHeight={keyboardHeight}
        onTabChange={setTrayTab}
        onRequestKeyboard={() => setTrayTab(null)}
        onSelectGif={handleGifSelect}
      />
    </S.ComposerRoot>
  );
};

/**
 * Mobile-only fixed-bottom reply / comment composer.
 * Drop this next to the desktop `<PromptInput>` and gate each with `isMobile`.
 * The component is hidden via CSS on screens wider than 800 px as a safety net.
 */
export const MobileReplyComposer: FC<MobileReplyComposerProps> = (props) => (
  <StoreProvider<PromptInputState>
    storeId="prompt-input"
    initial={{ ...INITIAL_STATE, parentId: props.parentId, type: props.type }}
  >
    <MobileReplyComposerInner {...props} />
  </StoreProvider>
);
