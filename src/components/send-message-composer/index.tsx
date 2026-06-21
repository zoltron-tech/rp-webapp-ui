"use client";

import type { EmojiClickData } from "emoji-picker-react";
import { Theme as EmojiTheme } from "emoji-picker-react";
import dynamic from "next/dynamic";
import type { FC, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FcAddImage } from "react-icons/fc";
import { HiFaceSmile, HiGif, HiPaperAirplane } from "react-icons/hi2";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { RiEmojiStickerLine } from "react-icons/ri";
import { BsPencil } from "react-icons/bs";
import { TiArrowSortedUp } from "react-icons/ti";
import { deleteMedia } from "@/app/rp/profile/actions";
import type { ChatRichInputHandle } from "@/components/chat-rich-input";
import { ChatRichInput } from "@/components/chat-rich-input";
import { ClipPicker } from "@/components/clip-picker";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import { StickerPicker } from "@/components/sticker-picker";
import { useGlobalState } from "@/context/store/stores";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { MentionDataItem, Muse, Novelist } from "@/types";
import type { Message } from "@/types/conversation";
import { API_MESSAGE } from "@/utils/constants";
import { Flex } from "../edit-muse-card/styles";
import { MediaTray, type TrayTab } from "./media-tray";
import * as S from "./styled";
import { EmojiPickerGlobalStyle } from "./styled";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export type ComposerSender = {
  id: string;
  type: "NOVELIST" | "MUSE";
  name: string;
  image: string | null;
};

const MAX_MEDIA_FILES = 10;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MEDIA_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "video/mp4",
]);
const MEDIA_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,video/mp4";

type FileValidationResult = { valid: File[]; errors: string[] };

const validateMediaFiles = (files: File[]): FileValidationResult => {
  const valid: File[] = [];
  const errors: string[] = [];
  for (const f of files) {
    if (!ALLOWED_MEDIA_TYPES.has(f.type)) {
      errors.push(
        `"${f.name}" — unsupported type. Allowed: PNG, JPG, GIF, WebP, MP4.`,
      );
    } else if (f.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`"${f.name}" — exceeds the 50 MB size limit.`);
    } else {
      valid.push(f);
    }
  }
  return { errors, valid };
};

type MediaFile = {
  file: File;
  localUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
  uploadError: boolean;
};

type MediaPickerBodyProps = {
  mediaFiles: MediaFile[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onSend: () => void;
};

const MediaPickerBody: FC<MediaPickerBodyProps> = ({
  mediaFiles,
  onAdd,
  onRemove,
  onSend,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_MEDIA_FILES - mediaFiles.length;
  const [errors, setErrors] = useState<string[]>([]);

  const applyValidated = (raw: File[]) => {
    const { valid, errors: errs } = validateMediaFiles(raw);
    const allowed = valid.slice(0, remaining);
    const overflowErrors =
      valid.length > remaining
        ? [
            `Maximum ${MAX_MEDIA_FILES} files allowed. ${valid.length - remaining} file${valid.length - remaining !== 1 ? "s" : ""} were not added.`,
          ]
        : [];
    setErrors([...errs, ...overflowErrors]);
    if (allowed.length) onAdd(allowed);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyValidated(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    applyValidated(Array.from(e.dataTransfer.files));
  };

  return (
    <S.MediaPickerDialogBody>
      {errors.length > 0 && (
        <S.MediaPickerError>
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </S.MediaPickerError>
      )}
      {mediaFiles.length < MAX_MEDIA_FILES && (
        <S.MediaPickerDropZone
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <FcAddImage size={28} />
          <span>Click or drag to add images / videos</span>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-small)",
            }}
          >
            {mediaFiles.length} / {MAX_MEDIA_FILES}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={MEDIA_ACCEPT}
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </S.MediaPickerDropZone>
      )}

      {mediaFiles.length > 0 && (
        <S.MediaPickerGrid>
          {mediaFiles.map(({ file, localUrl, uploading, uploadError }, idx) => (
            <S.MediaPickerThumb key={localUrl}>
              {file.type.startsWith("video/") ? (
                <S.MediaPickerThumbVideo src={localUrl} muted playsInline />
              ) : (
                <S.MediaPickerThumbImg src={localUrl} alt={file.name} />
              )}
              {uploading && (
                <S.MediaUploadOverlay>
                  <S.MediaUploadSpinner />
                </S.MediaUploadOverlay>
              )}
              {uploadError && !uploading && (
                <S.MediaUploadErrorBadge>⚠</S.MediaUploadErrorBadge>
              )}
              <S.MediaPickerRemoveBtn
                type="button"
                onClick={() => onRemove(idx)}
                aria-label="Remove"
              >
                ×
              </S.MediaPickerRemoveBtn>
            </S.MediaPickerThumb>
          ))}
        </S.MediaPickerGrid>
      )}

      {mediaFiles.length > 0 && (
        <S.MediaPickerSendBtn type="button" onClick={onSend}>
          Add
        </S.MediaPickerSendBtn>
      )}
    </S.MediaPickerDialogBody>
  );
};

type SendMessageComposerProps = {
  value: string;
  sending: boolean;
  conversationId?: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  onSendGif?: (gifUrl: string) => Promise<void> | void;
  onSendSticker?: (stickerUrl: string) => Promise<void> | void;
  onSendClip?: (clipUrl: string) => Promise<void> | void;
  onSendMedia?: (urls: string[]) => Promise<void> | void;
  selectedSender?: ComposerSender | null;
  onSenderChange?: (sender: ComposerSender) => void;
  mentionItems?: MentionDataItem[];
  onHtmlChange?: (html: string) => void;
  getMentionMuseItems?: (prefix: string) => Promise<MentionDataItem[]>;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
};

const novelistToSender = (n: Novelist): ComposerSender => ({
  id: n.id,
  image: n.image ?? null,
  name: `${n.firstName} ${n.lastName}`.trim() || n.username,
  type: "NOVELIST",
});

const museToSender = (m: Muse): ComposerSender => ({
  id: m.id ?? "",
  image: m.image ?? null,
  name: `${m.firstName} ${m.lastName}`.trim(),
  type: "MUSE",
});

/** Tracks whether the viewport is at a mobile/tablet width. Used to decide
 *  between the desktop dialog pickers and the mobile bottom tray. */
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

const SenderRow: FC<{
  sender: ComposerSender;
  isActive: boolean;
  onSelect: (sender: ComposerSender) => void;
}> = ({ sender, isActive, onSelect }) => (
  <S.SenderListItem
    type="button"
    onClick={() => onSelect(sender)}
    $active={isActive}
  >
    <AvatarNew src={sender.image} alt={sender.name} />
    <S.SenderInfo>
      <S.SenderName>{sender.name}</S.SenderName>
      <S.SenderType>
        {sender.type === "NOVELIST" ? "Novelist" : "Muse"}
      </S.SenderType>
    </S.SenderInfo>
    {isActive && (
      <S.SenderSelectedMark>
        <IoCheckmark size={16} />
      </S.SenderSelectedMark>
    )}
  </S.SenderListItem>
);

export const SendMessageComposer: FC<SendMessageComposerProps> = ({
  value,
  sending,
  conversationId,
  onChange,
  onSubmit,
  onSendGif,
  onSendSticker,
  onSendClip,
  onSendMedia,
  selectedSender,
  onSenderChange,
  mentionItems = [],
  onHtmlChange,
  getMentionMuseItems,
  editingMessage,
  onCancelEdit,
}) => {
  const novelist = useGlobalState("novelist");
  const [internalSender, setInternalSender] = useState<ComposerSender | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaToolbarOpen, setMediaToolbarOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [clipPickerOpen, setClipPickerOpen] = useState(false);
  const [selectedClipUrl, setSelectedClipUrl] = useState<string | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const toolbarFileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatRichInputHandle>(null);
  const [search, setSearch] = useState("");

  // ── Mobile bottom tray (Discord-style) ─────────────────────────────────────
  const isMobile = useIsMobile();
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const keyboardHeightRef = useRef(320);
  const [keyboardHeight, setKeyboardHeight] = useState(320);

  const trayTabs = useMemo<TrayTab[]>(() => {
    const list: TrayTab[] = [];
    if (onSendGif) list.push("gif");
    if (onSendSticker) list.push("sticker");
    if (onSendClip) list.push("clip");
    return list;
  }, [onSendGif, onSendSticker, onSendClip]);

  // Remember the soft-keyboard height so the tray can match it exactly.
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

  // While the tray is open reserve matching space below the composer so it
  // rests just above the tray (see ComposerWrapper `--media-tray-height`).
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--media-tray-height",
      trayTab ? `${keyboardHeightRef.current}px` : "0px",
    );
  }, [trayTab]);

  // Always clear the reserved space when the composer unmounts.
  useEffect(
    () => () => {
      document.documentElement.style.setProperty("--media-tray-height", "0px");
    },
    [],
  );

  const openTray = useCallback((tab: TrayTab) => {
    // Dismiss the keyboard and any desktop popovers before sliding up.
    chatInputRef.current?.blur();
    setEmojiPickerOpen(false);
    setGifPickerOpen(false);
    setStickerPickerOpen(false);
    setClipPickerOpen(false);
    setTrayTab(tab);
  }, []);

  // Keyboard button: bring the keyboard back. focus() must run inside the tap
  // gesture for iOS Safari to honour it.
  const closeTrayToKeyboard = useCallback(() => {
    chatInputRef.current?.focus();
    setTrayTab(null);
  }, []);

  const { uploadMedia } = useUploadMedia();

  const addMediaFiles = useCallback(
    (files: File[]) => {
      const newEntries: MediaFile[] = files.map((f) => ({
        file: f,
        localUrl: URL.createObjectURL(f),
        uploadError: false,
        uploadedUrl: null,
        uploading: true,
      }));
      setMediaFiles((prev) => [...prev, ...newEntries]);
      for (const entry of newEntries) {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("contentType", entry.file.type);
        formData.append("prefix", conversationId ?? "chat-media");
        formData.append("mediaBucket", "CHAT_MEDIA");
        uploadMedia(formData).then((result) => {
          const success =
            typeof result === "string" && result !== API_MESSAGE.MediaError;
          if (success) console.log("[chat-media] uploaded:", result);
          setMediaFiles((prev) =>
            prev.map((mf) =>
              mf.localUrl === entry.localUrl
                ? {
                    ...mf,
                    uploadError: !success,
                    uploadedUrl: success ? result : null,
                    uploading: false,
                  }
                : mf,
            ),
          );
        });
      }
    },
    [uploadMedia],
  );

  const removeMediaFile = useCallback(
    (idx: number) => {
      const entry = mediaFiles[idx];
      if (!entry) return;
      URL.revokeObjectURL(entry.localUrl);
      if (entry.uploadedUrl) {
        deleteMedia(entry.uploadedUrl).catch(() => {});
      }
      setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
    },
    [mediaFiles],
  );

  useEffect(() => {
    if (novelist && !internalSender) {
      setInternalSender(novelistToSender(novelist));
    }
  }, [novelist, internalSender]);

  useEffect(() => {
    if (!emojiPickerOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-emoji-toggle]")) return;
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [emojiPickerOpen]);

  const activeSender =
    selectedSender !== undefined ? selectedSender : internalSender;

  const senderOptions = useMemo<ComposerSender[]>(() => {
    if (!novelist) return [];
    return [
      novelistToSender(novelist),
      ...(novelist.muses ?? []).map(museToSender),
    ];
  }, [novelist]);

  const novelistSender = useMemo(
    () => senderOptions.find((s) => s.type === "NOVELIST") ?? null,
    [senderOptions],
  );

  const museSenders = useMemo(
    () => senderOptions.filter((s) => s.type === "MUSE"),
    [senderOptions],
  );

  const filteredMuses = useMemo(() => {
    const q = search.toLowerCase();
    const list = museSenders;
    const filtered = q
      ? list.filter((s) => s.name.toLowerCase().includes(q))
      : list;
    // Promote selected muse to top of muse section
    if (!activeSender || activeSender.type !== "MUSE") return filtered;
    const selected = filtered.find((s) => s.id === activeSender.id);
    const rest = filtered.filter((s) => s.id !== activeSender.id);
    return selected ? [selected, ...rest] : filtered;
  }, [museSenders, search, activeSender]);

  const hasValue = value.trim().length > 0;
  const isEditing = !!editingMessage;

  // While editing an existing message, media attachments and sender switching
  // are not allowed — close anything that may be open.
  useEffect(() => {
    if (isEditing) {
      setMediaToolbarOpen(false);
      setTrayTab(null);
    }
  }, [isEditing]);

  // Hide the media toolbar whenever a picker is open (mobile tray or any of the
  // desktop popovers/dialogs) so it doesn't show behind/above the open picker.
  const anyPickerOpen =
    trayTab !== null ||
    gifPickerOpen ||
    stickerPickerOpen ||
    clipPickerOpen ||
    imagePickerOpen ||
    emojiPickerOpen;

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const hasMedia = mediaFiles.length > 0;
    if ((!hasValue && !hasMedia) || sending) return;
    if (mediaFiles.some((mf) => mf.uploading)) return;
    if (hasMedia) {
      const uploadedUrls = mediaFiles
        .filter((mf) => mf.uploadedUrl)
        .map((mf) => mf.uploadedUrl!);
      onSendMedia?.(uploadedUrls);
      mediaFiles.forEach((mf) => URL.revokeObjectURL(mf.localUrl));
      setMediaFiles([]);
    } else if (hasValue) {
      await onSubmit();
    }
    setMediaToolbarOpen(false);
  };

  const handleSelectSender = (sender: ComposerSender) => {
    setInternalSender(sender);
    onSenderChange?.(sender);
    setSearch("");
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) setSearch("");
    setDialogOpen(open);
  };

  return (
    <>
      <S.ComposerWrapper
        style={
          trayExpanded
            ? { opacity: 0, pointerEvents: "none", visibility: "hidden" }
            : undefined
        }
      >
        <EmojiPickerGlobalStyle />
        {emojiPickerOpen && (
          <S.EmojiPickerWrap ref={emojiPickerRef}>
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) => {
                chatInputRef.current?.insertText(emojiData.emoji);
              }}
              theme={EmojiTheme.DARK}
              width={300}
              height={380}
              lazyLoadEmojis
            />
          </S.EmojiPickerWrap>
        )}
        <S.MediaToolbar
          $open={
            (mediaToolbarOpen || mediaFiles.length > 0) &&
            !anyPickerOpen &&
            !isEditing
          }
        >
          {mediaFiles.length > 0 ? (
            <S.MediaToolbarPreviewRow>
              {mediaFiles.map(
                ({ file, localUrl, uploading, uploadError }, idx) => (
                  <S.MediaToolbarThumb key={localUrl}>
                    {file.type.startsWith("video/") ? (
                      <S.MediaToolbarThumbVideo
                        src={localUrl}
                        muted
                        playsInline
                      />
                    ) : (
                      <S.MediaToolbarThumbImg src={localUrl} alt={file.name} />
                    )}
                    {uploading && (
                      <S.MediaUploadOverlay>
                        <S.MediaUploadSpinner />
                      </S.MediaUploadOverlay>
                    )}
                    {uploadError && !uploading && (
                      <S.MediaUploadErrorBadge>⚠</S.MediaUploadErrorBadge>
                    )}
                    <S.MediaToolbarRemoveBtn
                      type="button"
                      onClick={() => removeMediaFile(idx)}
                      aria-label="Remove"
                    >
                      ×
                    </S.MediaToolbarRemoveBtn>
                  </S.MediaToolbarThumb>
                ),
              )}
              {mediaFiles.length < MAX_MEDIA_FILES && (
                <>
                  <S.MediaToolbarAddBtn
                    type="button"
                    title="Add more"
                    onClick={() => toolbarFileInputRef.current?.click()}
                  >
                    +
                  </S.MediaToolbarAddBtn>
                  <input
                    ref={toolbarFileInputRef}
                    type="file"
                    accept={MEDIA_ACCEPT}
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const { valid } = validateMediaFiles(
                        Array.from(e.target.files ?? []),
                      );
                      const remaining = MAX_MEDIA_FILES - mediaFiles.length;
                      const allowed = valid.slice(0, remaining);
                      if (allowed.length) {
                        addMediaFiles(allowed);
                      }
                      e.target.value = "";
                    }}
                  />
                </>
              )}
            </S.MediaToolbarPreviewRow>
          ) : (
            <>
              <Flex justify="space-evenly">
                {onSendGif && (
                  <S.GifButton
                    type="button"
                    title="Send a GIF"
                    data-active={
                      (isMobile ? trayTab === "gif" : gifPickerOpen)
                        ? "true"
                        : undefined
                    }
                    onPointerDown={(e) => {
                      if (isMobile) e.preventDefault();
                    }}
                    onClick={() => {
                      if (isMobile) {
                        openTray("gif");
                        return;
                      }
                      setGifPickerOpen((prev) => !prev);
                      setStickerPickerOpen(false);
                      setClipPickerOpen(false);
                    }}
                  >
                    <HiGif color="#0394fc" size={28} />
                  </S.GifButton>
                )}
                {onSendSticker && (
                  <S.StickerButton
                    type="button"
                    title="Send a sticker"
                    data-active={
                      (isMobile ? trayTab === "sticker" : stickerPickerOpen)
                        ? "true"
                        : undefined
                    }
                    onPointerDown={(e) => {
                      if (isMobile) e.preventDefault();
                    }}
                    onClick={() => {
                      if (isMobile) {
                        openTray("sticker");
                        return;
                      }
                      setStickerPickerOpen((prev) => !prev);
                      setGifPickerOpen(false);
                      setClipPickerOpen(false);
                    }}
                  >
                    <RiEmojiStickerLine color="#c9478f" size={28} />
                  </S.StickerButton>
                )}
                {onSendClip && (
                  <S.ClipButton
                    type="button"
                    title="Send a clip"
                    data-active={
                      (isMobile ? trayTab === "clip" : clipPickerOpen)
                        ? "true"
                        : undefined
                    }
                    onPointerDown={(e) => {
                      if (isMobile) e.preventDefault();
                    }}
                    onClick={() => {
                      if (isMobile) {
                        openTray("clip");
                        return;
                      }
                      setClipPickerOpen((prev) => !prev);
                      setGifPickerOpen(false);
                      setStickerPickerOpen(false);
                    }}
                  >
                    <MdOutlineSlowMotionVideo color="#8b5cf6" size={28} />
                  </S.ClipButton>
                )}
                {onSendMedia && (
                  <S.ImageButton
                    type="button"
                    title="Send images / videos"
                    data-active={imagePickerOpen ? "true" : undefined}
                    onClick={() => {
                      setImagePickerOpen(true);
                      setGifPickerOpen(false);
                      setStickerPickerOpen(false);
                      setClipPickerOpen(false);
                    }}
                  >
                    <FcAddImage size={28} />
                  </S.ImageButton>
                )}
                {!isMobile && (
                  <S.EmojiButton
                    type="button"
                    title="Insert emoji"
                    data-emoji-toggle
                    data-active={emojiPickerOpen ? "true" : undefined}
                    onClick={() => {
                      setEmojiPickerOpen((prev) => !prev);
                    }}
                  >
                    <HiFaceSmile color="#f59e0b" size={28} />
                  </S.EmojiButton>
                )}
              </Flex>
            </>
          )}
        </S.MediaToolbar>

        {isEditing && (
          <S.EditBanner>
            <S.EditBannerIcon>
              <BsPencil size={15} />
            </S.EditBannerIcon>
            <S.EditBannerInfo>
              <S.EditBannerLabel>Editing message</S.EditBannerLabel>
            </S.EditBannerInfo>
            <S.EditBannerClose
              type="button"
              title="Cancel editing"
              aria-label="Cancel editing"
              onClick={() => onCancelEdit?.()}
            >
              <IoClose size={18} />
            </S.EditBannerClose>
          </S.EditBanner>
        )}

        <S.Composer
          onSubmit={(e) => handleSubmit(e)}
          onPointerDown={() => {
            // Tapping the input row closes the tray; the tap itself focuses the
            // field and raises the keyboard, so we don't focus programmatically.
            if (trayTab) setTrayTab(null);
          }}
        >
          <S.SenderButton
            type="button"
            title={
              isEditing
                ? "You can't change the sender while editing"
                : (activeSender?.name ?? "Select sender")
            }
            disabled={isEditing}
            onClick={() => setDialogOpen(true)}
          >
            <AvatarNew
              src={activeSender?.image ?? null}
              alt={activeSender?.name ?? "Sender"}
            />
            <S.SenderCaret>
              <TiArrowSortedUp size={10} />
            </S.SenderCaret>
          </S.SenderButton>

          <ChatRichInput
            ref={chatInputRef}
            placeholder={`Send message as ${activeSender?.name?.split(" ")[0] ?? ""}...`}
            value={value}
            onChange={onChange}
            onHtmlChange={onHtmlChange ?? (() => {})}
            onSubmit={() => handleSubmit()}
            mentionItems={mentionItems}
            getMentionMuseItems={getMentionMuseItems}
            trailingAction={
              <>
                {(onSendGif || onSendSticker || onSendClip || onSendMedia) &&
                  mediaFiles.length === 0 &&
                  !isEditing && (
                    <S.MediaToggleButton
                      type="button"
                      title="Media"
                      data-open={mediaToolbarOpen ? "true" : undefined}
                      onClick={() => setMediaToolbarOpen((prev) => !prev)}
                    >
                      <span>+</span>
                    </S.MediaToggleButton>
                  )}
                <S.InlineSendButton
                  type="submit"
                  disabled={sending || mediaFiles.some((mf) => mf.uploading)}
                  title="Send"
                  style={{
                    opacity: hasValue || mediaFiles.length > 0 ? 1 : 0,
                    pointerEvents:
                      hasValue || mediaFiles.length > 0 ? undefined : "none",
                    transition: "opacity 0.15s ease, width 0.15s ease",
                    width: hasValue || mediaFiles.length > 0 ? "28px" : "0",
                  }}
                >
                  {mediaFiles.some((mf) => mf.uploading) ? (
                    <S.MediaUploadSpinner />
                  ) : (
                    <HiPaperAirplane size={15} />
                  )}
                </S.InlineSendButton>
              </>
            }
          />
        </S.Composer>
      </S.ComposerWrapper>

      {isMobile && !isEditing && (
        <MediaTray
          tab={trayTab}
          tabs={trayTabs}
          keyboardHeight={keyboardHeight}
          onTabChange={(tab) => setTrayTab(tab)}
          onRequestKeyboard={closeTrayToKeyboard}
          onSelectGif={
            onSendGif
              ? (url) => {
                  onSendGif(url);
                  setTrayTab(null);
                  setMediaToolbarOpen(false);
                }
              : undefined
          }
          onSelectSticker={
            onSendSticker
              ? (url) => {
                  onSendSticker(url);
                  setTrayTab(null);
                  setMediaToolbarOpen(false);
                }
              : undefined
          }
          onSelectClip={
            onSendClip
              ? (url) => {
                  onSendClip(url);
                  setTrayTab(null);
                  setMediaToolbarOpen(false);
                }
              : undefined
          }
          onExpandedChange={setTrayExpanded}
        />
      )}

      <AppAlertDialog
        heading="Send as"
        text=""
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        showConfirm={false}
        closeButtonText="Done"
        body={
          <S.SenderDialogBody>
            <S.SenderSearch
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <S.SenderList>
              {/* Novelist — always pinned at top */}
              {novelistSender && (
                <SenderRow
                  sender={novelistSender}
                  isActive={activeSender?.id === novelistSender.id}
                  onSelect={handleSelectSender}
                />
              )}

              {/* Divider + muse section */}
              {filteredMuses.length > 0 && (
                <>
                  <S.SenderDivider> characters </S.SenderDivider>
                  {filteredMuses.map((sender) => (
                    <SenderRow
                      key={sender.id || sender.name}
                      sender={sender}
                      isActive={activeSender?.id === sender.id}
                      onSelect={handleSelectSender}
                    />
                  ))}
                </>
              )}

              {novelistSender === null && filteredMuses.length === 0 && (
                <S.SenderEmptyText>No results found.</S.SenderEmptyText>
              )}
            </S.SenderList>
          </S.SenderDialogBody>
        }
      />

      {onSendGif && (
        <AppAlertDialog
          heading="Pick a GIF"
          text=""
          open={gifPickerOpen}
          onOpenChange={(open) => {
            if (!open) setGifPickerOpen(false);
          }}
          showConfirm={false}
          closeButtonText="Close"
          body={
            <GifPicker
              onSelect={(gifUrl) => {
                onSendGif(gifUrl);
                setGifPickerOpen(false);
                setMediaToolbarOpen(false);
              }}
            />
          }
        />
      )}

      {onSendSticker && (
        <AppAlertDialog
          heading="Pick a Sticker"
          text=""
          open={stickerPickerOpen}
          onOpenChange={(open) => {
            if (!open) setStickerPickerOpen(false);
          }}
          showConfirm={false}
          closeButtonText="Close"
          body={
            <StickerPicker
              onSelect={(stickerUrl) => {
                onSendSticker(stickerUrl);
                setStickerPickerOpen(false);
                setMediaToolbarOpen(false);
              }}
            />
          }
        />
      )}

      {onSendClip && (
        <AppAlertDialog
          heading="Pick a Clip"
          text=""
          open={clipPickerOpen}
          onOpenChange={(open) => {
            setClipPickerOpen(open);
            if (!open) setSelectedClipUrl(null);
          }}
          onConfirm={() => {
            if (!selectedClipUrl) return;
            onSendClip(selectedClipUrl);
            setClipPickerOpen(false);
            setMediaToolbarOpen(false);
            setSelectedClipUrl(null);
          }}
          showConfirm
          actionButtonLabel="Send"
          closeButtonText="Close"
          isConfirmDisabled={!selectedClipUrl}
          actionColor="neutral"
          body={<ClipPicker onSelect={setSelectedClipUrl} />}
        />
      )}

      {onSendMedia && (
        <AppAlertDialog
          heading="Add images / videos"
          text=""
          open={imagePickerOpen}
          onOpenChange={(open) => {
            if (!open) setImagePickerOpen(false);
          }}
          showConfirm={false}
          closeButtonText="Close"
          isCancelHidden={mediaFiles.length > 0}
          body={
            <MediaPickerBody
              mediaFiles={mediaFiles}
              onAdd={addMediaFiles}
              onRemove={removeMediaFile}
              onSend={() => {
                setImagePickerOpen(false);
                setMediaToolbarOpen(true);
              }}
            />
          }
        />
      )}
    </>
  );
};

export default SendMessageComposer;
