"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Muse } from "@nw/types";
import type { MediaMetadata } from "@nw/types/activity";
import { pluralize } from "@nw/utils";
import { reverseWsrvUrl } from "@nw/utils/image";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaPlay, FaRegTrashCan } from "react-icons/fa6";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import styled from "styled-components";
import {
  addMuseMediaAction,
  deleteMuseMediaAction,
  editMediaDescriptionAction,
  getMuseMediaMetadataAction,
} from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { EmptyGalleryArt } from "@/components/book-art";
import { HeartIcon } from "@/components/common/heart-icon";
import { LikeButton as LikeS } from "@/components/common/like-button/styled";
import { AppAlertDialog } from "@/components/dialog";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { VideoViewer } from "@/components/image-viewer/VideoViewer";
import { MarkdownLite } from "@/components/markdown-lite";
import { ReactionLikersDialog } from "@/components/reaction-likers-dialog";
import { useGlobalState } from "@/context/store/stores";
import { classifyUrlForUpload } from "@/hooks/use-nsfw-check";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { getMuseAppearance } from "../appearance";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

const GALLERY_GAP = 10;
const GALLERY_TARGET_HEIGHT = 300;

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".quicktime"];
function isVideoUrl(url: string) {
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function GalleryImageItem({
  url,
  width,
  height,
  onItemClick,
  isAvatar,
  isCardBg,
  isWallpaper,
  isOwner,
  onDelete,
  selecting,
  selected,
  onToggle,
}: {
  url: string;
  width: number;
  height: number;
  onItemClick: () => void;
  isAvatar: boolean;
  isCardBg: boolean;
  isWallpaper: boolean;
  isOwner: boolean;
  onDelete: () => void;
  /** Select mode: a click toggles the tile instead of opening it. */
  selecting: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const hasBadge = isOwner && (isAvatar || isCardBg || isWallpaper);
  return (
    <GallerySelectableItem
      style={{ height, width }}
      onClick={selecting ? onToggle : onItemClick}
      $selectable={selecting}
      $selected={selected}
      role={selecting ? "checkbox" : undefined}
      aria-checked={selecting ? selected : undefined}
      tabIndex={selecting ? 0 : undefined}
      onKeyDown={
        selecting
          ? (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onToggle();
              }
            }
          : undefined
      }
    >
      <S.GalleryImage src={url} alt="Gallery media" />
      {hasBadge && (
        <S.GalleryBadgeRow>
          {isAvatar && <S.GalleryBadge>Avatar</S.GalleryBadge>}
          {isCardBg && <S.GalleryBadge>Card BG</S.GalleryBadge>}
          {isWallpaper && <S.GalleryBadge>Wallpaper</S.GalleryBadge>}
        </S.GalleryBadgeRow>
      )}
      {selecting && (
        <GallerySelectMark $selected={selected} aria-hidden>
          {selected && <FaCheck size={11} />}
        </GallerySelectMark>
      )}
      {isOwner && !selecting && (
        <S.GalleryDeleteBtn
          type="button"
          aria-label="Delete media"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <FaRegTrashCan size={11} />
        </S.GalleryDeleteBtn>
      )}
    </GallerySelectableItem>
  );
}

function JustifiedGallery({
  mediaUrls,
  onItemClick,
  avatarSrc,
  cardBgSrc,
  wallpaperSrc,
  isOwner,
  onDeleteItem,
  selecting,
  selected,
  onToggle,
}: {
  /** Select mode: tiles toggle instead of opening; see `GallerySection`. */
  selecting: boolean;
  selected: ReadonlySet<string>;
  onToggle: (url: string) => void;
  mediaUrls: string[];
  onItemClick: (idx: number) => void;
  avatarSrc?: string;
  cardBgSrc?: string;
  wallpaperSrc?: string;
  isOwner: boolean;
  onDeleteItem: (url: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    for (const url of mediaUrls) {
      if (isVideoUrl(url)) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          if (video.videoWidth && video.videoHeight) {
            const r = video.videoWidth / video.videoHeight;
            setRatios((prev) =>
              prev[url] === r ? prev : { ...prev, [url]: r },
            );
          }
          video.src = "";
        };
        video.src = url;
      } else {
        const img = new Image();
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            const r = img.naturalWidth / img.naturalHeight;
            setRatios((prev) =>
              prev[url] === r ? prev : { ...prev, [url]: r },
            );
          }
        };
        img.src = url;
      }
    }
  }, [mediaUrls]);

  const rows = useMemo(() => {
    if (!containerWidth) return [];
    type Item = { url: string; isVideo: boolean; ratio: number };
    const items: Item[] = mediaUrls.map((url) => ({
      isVideo: isVideoUrl(url),
      ratio: ratios[url] ?? (isVideoUrl(url) ? 16 / 9 : 1),
      url,
    }));

    type RowItem = {
      url: string;
      isVideo: boolean;
      width: number;
      height: number;
    };
    const result: RowItem[][] = [];
    let row: Item[] = [];

    for (const item of items) {
      row.push(item);
      const totalW =
        row.reduce((s, i) => s + i.ratio * GALLERY_TARGET_HEIGHT, 0) +
        (row.length - 1) * GALLERY_GAP;

      if (totalW >= containerWidth || row.length === 4) {
        const sumR = row.reduce((s, i) => s + i.ratio, 0);
        const h = (containerWidth - (row.length - 1) * GALLERY_GAP) / sumR;
        result.push(
          row.map((i) => ({
            height: Math.floor(h),
            isVideo: i.isVideo,
            url: i.url,
            width: Math.floor(i.ratio * h),
          })),
        );
        row = [];
      }
    }

    if (row.length > 0) {
      result.push(
        row.map((i) => ({
          height: GALLERY_TARGET_HEIGHT,
          isVideo: i.isVideo,
          url: i.url,
          width: Math.floor(i.ratio * GALLERY_TARGET_HEIGHT),
        })),
      );
    }

    return result;
  }, [mediaUrls, ratios, containerWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${GALLERY_GAP}px`,
        padding: GALLERY_GAP / 2,
        paddingTop: "4px",
        width: "100%",
      }}
    >
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: `${GALLERY_GAP}px` }}>
          {row.map((item) =>
            item.isVideo ? (
              <GallerySelectableItem
                key={item.url}
                style={{
                  cursor: "pointer",
                  height: item.height,
                  width: item.width,
                }}
                $selectable={selecting}
                $selected={selected.has(item.url)}
                role={selecting ? "checkbox" : undefined}
                aria-checked={selecting ? selected.has(item.url) : undefined}
                tabIndex={selecting ? 0 : undefined}
                onClick={() =>
                  selecting
                    ? onToggle(item.url)
                    : onItemClick(mediaUrls.indexOf(item.url))
                }
                onKeyDown={
                  selecting
                    ? (e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          onToggle(item.url);
                        }
                      }
                    : undefined
                }
              >
                <S.GalleryVideo
                  src={`${item.url}#t=0.3`}
                  preload="metadata"
                  muted
                />
                <S.GalleryPlayOverlay>
                  <S.GalleryPlayCircle>
                    <FaPlay size={18} />
                  </S.GalleryPlayCircle>
                </S.GalleryPlayOverlay>
                {selecting && (
                  <GallerySelectMark
                    $selected={selected.has(item.url)}
                    aria-hidden
                  >
                    {selected.has(item.url) && <FaCheck size={11} />}
                  </GallerySelectMark>
                )}
                {isOwner && !selecting && (
                  <S.GalleryDeleteBtn
                    type="button"
                    aria-label="Delete media"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.url);
                    }}
                  >
                    <FaRegTrashCan size={11} />
                  </S.GalleryDeleteBtn>
                )}
              </GallerySelectableItem>
            ) : (
              <GalleryImageItem
                key={item.url}
                url={item.url}
                width={item.width}
                height={item.height}
                onItemClick={() => onItemClick(mediaUrls.indexOf(item.url))}
                isAvatar={item.url === avatarSrc}
                isCardBg={item.url === cardBgSrc}
                isWallpaper={item.url === wallpaperSrc}
                isOwner={isOwner}
                onDelete={() => onDeleteItem(item.url)}
                selecting={selecting}
                selected={selected.has(item.url)}
                onToggle={() => onToggle(item.url)}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Caption region rendered inside the gallery image/video viewer: shows the
 * media description (owner can edit inline) and a heart reaction toggle.
 */
function MediaCaption({
  museId,
  url,
  meta,
  isOwner,
  onMetaChange,
}: {
  museId: string;
  url: string;
  meta: MediaMetadata | undefined;
  isOwner: boolean;
  onMetaChange: (url: string, meta: MediaMetadata) => void;
}) {
  const { successToast, errorToast } = useUIContext();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(meta?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [reacted, setReacted] = useState(meta?.reacted ?? false);
  const [count, setCount] = useState(meta?.reactionCount ?? 0);
  const [likersOpen, setLikersOpen] = useState(false);
  const [unliked, setUnliked] = useState(false);
  const reactBusyRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Wrap the current textarea selection (or caret) with `marker` on both sides.
  const wrapSelection = useCallback((marker: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setDraft((prev) => {
      const selected = prev.slice(start, end) || "text";
      const next =
        prev.slice(0, start) + marker + selected + marker + prev.slice(end);
      // Restore selection around the wrapped text on the next frame.
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(
          start + marker.length,
          start + marker.length + selected.length,
        );
      });
      return next;
    });
  }, []);

  const { toggleLike } = useToggleLike({
    id: meta?.id ?? "",
    liked: reacted,
    type: "media",
  });

  // Re-sync when the viewer moves to a different item.
  useEffect(() => {
    setDraft(meta?.description ?? "");
    setReacted(meta?.reacted ?? false);
    setCount(meta?.reactionCount ?? 0);
    setEditing(false);
  }, [meta]);

  const handleReact = useCallback(async () => {
    if (!meta?.id) return; // no metadata row yet — nothing to react to
    if (reactBusyRef.current) return; // a toggle is already in flight
    const next = !reacted;
    if (!next) {
      // The shared heart's `unliked` shake, keyed off the press.
      setUnliked(true);
      setTimeout(() => setUnliked(false), 500);
    }
    reactBusyRef.current = true;
    setReacted(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const result = await toggleLike().catch(() => null);
      if (result && "reactions" in result) {
        setReacted(result.reacted);
        setCount(result.reactions);
        onMetaChange(url, {
          ...meta,
          reacted: result.reacted,
          reactionCount: result.reactions,
        });
      } else {
        setReacted(!next);
        setCount((c) => Math.max(0, c + (next ? -1 : 1)));
        errorToast?.(
          next
            ? "Couldn't like this media. Please try again."
            : "Couldn't unlike this media. Please try again.",
        );
      }
    } finally {
      reactBusyRef.current = false;
    }
  }, [meta, reacted, toggleLike, onMetaChange, url, errorToast]);

  const handleOpenLikers = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count <= 0) return;
    setLikersOpen(true);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    const res = await editMediaDescriptionAction(museId, url, draft.trim());
    setSaving(false);
    if (res && "id" in res) {
      onMetaChange(url, res);
      setEditing(false);
      successToast?.("Description saved.");
    } else {
      errorToast?.("Couldn't save description.");
    }
  }, [museId, url, draft, onMetaChange, successToast, errorToast]);

  const description = meta?.description ?? "";
  const likesSentence =
    count > 0
      ? `${count} ${pluralize("novelist", count)} ${count === 1 ? "likes" : "like"} this`
      : "Be the first to like this";

  return (
    <MediaCaptionBar>
      {editing ? (
        <>
          <MediaCaptionToolbar>
            <MediaFormatBtn
              type="button"
              aria-label="Bold"
              title="Bold (**text**)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrapSelection("**")}
            >
              <strong>B</strong>
            </MediaFormatBtn>
            <MediaFormatBtn
              type="button"
              aria-label="Italic"
              title="Italic (*text*)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrapSelection("*")}
            >
              <em>I</em>
            </MediaFormatBtn>
          </MediaCaptionToolbar>
          <MediaCaptionTextarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe this media…  (**bold**, *italic*)"
            maxLength={1000}
            rows={3}
          />
          <MediaCaptionActions>
            <MediaCaptionCancel
              type="button"
              onClick={() => {
                setDraft(description);
                setEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </MediaCaptionCancel>
            <MediaCaptionSave
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </MediaCaptionSave>
          </MediaCaptionActions>
        </>
      ) : (
        <>
          {description ? (
            <MediaCaptionText>
              <MarkdownLite text={description} />
            </MediaCaptionText>
          ) : (
            isOwner && (
              <MediaCaptionEmpty type="button" onClick={() => setEditing(true)}>
                <FiEdit2 size={13} />
                Add a caption
              </MediaCaptionEmpty>
            )
          )}

          {/*
            One row under the caption, as under a post: the heart is the
            toggle and only the toggle; the sentence beside it is the count and
            opens who — two controls, two targets, rather than a number nested
            inside the button that changes it.
          */}
          <MediaFooterRow>
            <MediaLikeGroup>
              <MediaHeartBtn
                type="button"
                className={classNames({ liked: reacted, unliked })}
                aria-label={reacted ? "Unlike this media" : "Like this media"}
                aria-pressed={reacted}
                onClick={handleReact}
                disabled={!meta?.id}
              >
                <HeartIcon filled={reacted} />
              </MediaHeartBtn>
              <MediaLikesBtn
                type="button"
                onClick={handleOpenLikers}
                disabled={count <= 0}
                aria-label={
                  count > 0 ? `${likesSentence}. See who.` : likesSentence
                }
              >
                {likesSentence}
              </MediaLikesBtn>
            </MediaLikeGroup>
            {isOwner && description && (
              <MediaToolBtn
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit caption"
              >
                <FiEdit2 size={13} />
                <span>Edit</span>
              </MediaToolBtn>
            )}
          </MediaFooterRow>
        </>
      )}
      <ReactionLikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        targetId={meta?.id ?? ""}
        initialCount={count}
      />
    </MediaCaptionBar>
  );
}

type Props = {
  muse: Muse | null;
  media: string[] | null;
};

const MAX_TOTAL = 20;
const VALID_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];
const MAX_FILE_SIZE = 30 * 1024 * 1024;

type PendingFile = {
  file: File;
  previewUrl: string;
  isVideo: boolean;
  isChecking: boolean;
};

function UploadPanel({
  museId,
  existingCount,
  onUploaded,
}: {
  museId: string;
  existingCount: number;
  onUploaded: (urls: string[]) => void;
}) {
  const { uploadMedia } = useUploadMedia();
  const { successToast, errorToast } = useUIContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      for (const f of pendingFiles) URL.revokeObjectURL(f.previewUrl);
    };
  }, [pendingFiles]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      setError(null);
      const remaining = MAX_TOTAL - existingCount - pendingFiles.length;
      if (remaining <= 0) {
        setError(`Gallery is full (${MAX_TOTAL} files maximum).`);
        return;
      }
      const newFiles: PendingFile[] = [];
      for (const file of files.slice(0, remaining)) {
        if (!VALID_TYPES.includes(file.type)) {
          setError("Unsupported type. Allowed: PNG, JPG, GIF, WEBP, MP4, MOV.");
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("A file exceeds the 30 MB limit.");
          continue;
        }
        const isVideo =
          file.type === "video/mp4" || file.type === "video/quicktime";
        newFiles.push({
          file,
          isChecking: !isVideo,
          isVideo,
          previewUrl: URL.createObjectURL(file),
        });
      }
      if (newFiles.length === 0) return;
      setPendingFiles((prev) => [...prev, ...newFiles]);

      for (const pending of newFiles) {
        if (pending.isVideo) continue;
        classifyUrlForUpload(pending.previewUrl).then((isNsfw) => {
          if (isNsfw) {
            URL.revokeObjectURL(pending.previewUrl);
            setPendingFiles((prev) =>
              prev.filter((f) => f.previewUrl !== pending.previewUrl),
            );
            setError(
              "An image contains sensitive content and cannot be uploaded.",
            );
          } else {
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.previewUrl === pending.previewUrl
                  ? { ...f, isChecking: false }
                  : f,
              ),
            );
          }
        });
      }
    },
    [existingCount, pendingFiles.length],
  );

  const removePending = useCallback((index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!museId || pendingFiles.length === 0) return;
    if (pendingFiles.some((f) => f.isChecking)) return;
    setUploading(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const pending of pendingFiles) {
        const formData = new FormData();
        formData.append("file", pending.file);
        formData.append("contentType", pending.file.type);
        formData.append("prefix", museId);
        const url = await uploadMedia(formData).catch(() => null);
        if (!url || url === API_MESSAGE.MediaError) {
          setError("One or more files failed to upload. Please try again.");
          return;
        }
        uploadedUrls.push(url);
      }
      const result = await addMuseMediaAction(museId, uploadedUrls).catch(
        () => null,
      );
      if (result?.message !== API_MESSAGE.Success) {
        // Keep the picks so the user can retry.
        errorToast?.(
          "Couldn't add the media to the gallery. Please try again.",
        );
        return;
      }
      for (const f of pendingFiles) URL.revokeObjectURL(f.previewUrl);
      setPendingFiles([]);
      successToast?.("Media uploaded.");
      onUploaded(uploadedUrls);
    } finally {
      setUploading(false);
    }
  }, [museId, pendingFiles, uploadMedia, successToast, errorToast, onUploaded]);

  const canAddMore = existingCount + pendingFiles.length < MAX_TOTAL;
  const anyChecking = pendingFiles.some((f) => f.isChecking);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const SCROLL_STEP = 98; // thumb width (90) + gap (8)

  const scrollRow = useCallback((dir: "left" | "right") => {
    scrollRowRef.current?.scrollBy({
      behavior: "smooth",
      left: dir === "left" ? -SCROLL_STEP : SCROLL_STEP,
    });
  }, []);

  return (
    <UploadPanelRoot>
      {error && <UploadError>{error}</UploadError>}

      {pendingFiles.length > 0 && (
        <UploadPreviewRow>
          {pendingFiles.length > 1 && (
            <UploadScrollBtn
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollRow("left")}
            >
              <FiChevronLeft size={14} />
            </UploadScrollBtn>
          )}
          <UploadPreviewGrid ref={scrollRowRef}>
            {pendingFiles.map((f, i) => (
              <UploadThumb key={f.previewUrl}>
                {f.isVideo ? (
                  <video
                    src={f.previewUrl}
                    muted
                    style={{
                      display: "block",
                      height: "100%",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                ) : (
                  <img
                    src={f.previewUrl}
                    alt="Preview"
                    style={{
                      display: "block",
                      filter: f.isChecking ? "blur(8px)" : undefined,
                      height: "100%",
                      objectFit: "cover",
                      transition: "filter 0.3s ease",
                      width: "100%",
                    }}
                  />
                )}
                {f.isChecking && (
                  <UploadCheckingOverlay>Checking…</UploadCheckingOverlay>
                )}
                <UploadThumbRemove
                  type="button"
                  aria-label="Remove"
                  onClick={() => removePending(i)}
                  disabled={uploading}
                >
                  <FaRegTrashCan size={12} />
                </UploadThumbRemove>
              </UploadThumb>
            ))}
          </UploadPreviewGrid>
          {pendingFiles.length > 1 && (
            <UploadScrollBtn
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollRow("right")}
            >
              <FiChevronRight size={14} />
            </UploadScrollBtn>
          )}
        </UploadPreviewRow>
      )}

      <UploadHint>
        {existingCount < MAX_TOTAL
          ? `You can add up to ${MAX_TOTAL - existingCount} more file${MAX_TOTAL - existingCount === 1 ? "" : "s"} · PNG, JPG, GIF, WEBP, MP4, MOV · max 30 MB each`
          : `Gallery full — ${MAX_TOTAL} files maximum.`}
      </UploadHint>

      <UploadActions>
        {canAddMore && (
          <UploadPickBtn
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <FiPlus size={15} />
            {pendingFiles.length === 0 ? "Select files" : "Add more"}
          </UploadPickBtn>
        )}
        {pendingFiles.length > 0 && (
          <UploadSubmitBtn
            type="button"
            onClick={handleUpload}
            disabled={uploading || anyChecking}
          >
            <FiUploadCloud size={15} />
            {uploading
              ? `Uploading ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}…`
              : anyChecking
                ? "Checking images…"
                : `Upload ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}`}
          </UploadSubmitBtn>
        )}
      </UploadActions>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/quicktime"
        hidden
        onChange={handleFileSelect}
        disabled={uploading}
      />
    </UploadPanelRoot>
  );
}

export function GallerySection({ muse, media }: Props) {
  const user = useGlobalState("user");
  const { errorToast, successToast } = useUIContext();
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null);
  const [localMedia, setLocalMedia] = useState<string[]>(media ?? []);
  const [metaByUrl, setMetaByUrl] = useState<Record<string, MediaMetadata>>({});
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { hideExpandedBackground } = getMuseAppearance(muse);
  const isMediaLoading = media === null;

  // Keep localMedia in sync when the parent refreshes the prop
  useEffect(() => {
    setLocalMedia(media ?? []);
  }, [media]);

  // Load per-media metadata (description + reactions), keyed by media URL.
  useEffect(() => {
    if (!muse?.id) return;
    getMuseMediaMetadataAction(muse.id).then((res) => {
      if (Array.isArray(res)) {
        const map: Record<string, MediaMetadata> = {};
        for (const m of res) map[m.mediaUrl] = m;
        setMetaByUrl(map);
      }
    });
  }, [muse?.id]);

  const handleMetaChange = useCallback((url: string, m: MediaMetadata) => {
    setMetaByUrl((prev) => ({ ...prev, [url]: m }));
  }, []);

  const isOwner = user?.username === muse?.pennedBy?.username;

  const currentItem = galleryIndex !== null ? localMedia[galleryIndex] : null;
  const currentIsVideo = currentItem ? isVideoUrl(currentItem) : false;

  const goPrev =
    galleryIndex !== null && galleryIndex > 0
      ? () => setGalleryIndex((i) => Math.max(0, (i ?? 0) - 1))
      : undefined;
  const goNext =
    galleryIndex !== null && galleryIndex < localMedia.length - 1
      ? () =>
          setGalleryIndex((i) => Math.min(localMedia.length - 1, (i ?? 0) + 1))
      : undefined;

  // Adjacent media sources for the live-drag carousel — passed to both
  // viewers regardless of media type. Each viewer renders neighbor slots as
  // either <img> or <video> based on the URL, so cross-type swipes (image ↔
  // video) slide in the correct element type. When the snap completes, the
  // gallery's index update flips `currentIsVideo` and the dialogs swap; the
  // destination viewer mounts with the same URL the source already had
  // pre-loaded as a peek, making the swap visually near-seamless.
  const galleryPrevSrc =
    galleryIndex !== null && galleryIndex > 0
      ? localMedia[galleryIndex - 1]
      : undefined;
  const galleryNextSrc =
    galleryIndex !== null && galleryIndex < localMedia.length - 1
      ? localMedia[galleryIndex + 1]
      : undefined;

  const handleUploaded = useCallback((urls: string[]) => {
    setLocalMedia((prev) => [...prev, ...urls]);
    setUploadOpen(false);
  }, []);

  const handleDeleteMedia = useCallback((url: string) => {
    setConfirmDeleteUrl(url);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!muse?.id || !confirmDeleteUrl) return;
    const url = confirmDeleteUrl;
    const removedAt = localMedia.indexOf(url);
    setConfirmDeleteUrl(null);
    setLocalMedia((prev) => prev.filter((u) => u !== url));
    setGalleryIndex(null);
    const result = await deleteMuseMediaAction(muse.id, url).catch(() => null);
    if (result?.message !== API_MESSAGE.Success) {
      // Put the tile back where it was.
      setLocalMedia((prev) => {
        if (prev.includes(url)) return prev;
        const next = [...prev];
        next.splice(removedAt < 0 ? next.length : removedAt, 0, url);
        return next;
      });
      errorToast?.("Couldn't delete the media. Please try again.");
      return;
    }
    successToast?.("Media deleted.");
    await deleteMedia(url).catch(() => null);
  }, [muse?.id, confirmDeleteUrl, localMedia, successToast, errorToast]);

  /*
   * Select mode: tiles toggle instead of opening, a bar counts them, and one
   * confirmation deletes the lot — the same shape as the edit page and the
   * app. The service deletes one URL per request, so the lot goes one after
   * another; whatever fails is put back on screen.
   */
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Anything that left the gallery leaves the selection too; and the mode
  // belongs to the owner alone.
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set([...prev].filter((u) => localMedia.includes(u)));
      return next.size === prev.size ? prev : next;
    });
  }, [localMedia]);
  useEffect(() => {
    if (!isOwner) {
      setSelecting(false);
      setSelected(new Set());
    }
  }, [isOwner]);

  const stopSelecting = useCallback(() => {
    setSelecting(false);
    setSelected(new Set());
  }, []);

  const toggleSelected = useCallback((url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    setConfirmBulk(false);
    if (!muse?.id) return;
    const museId = muse.id;
    const urls = [...selected];
    if (urls.length === 0) return;
    setBulkDeleting(true);
    setLocalMedia((prev) => prev.filter((u) => !urls.includes(u)));
    setGalleryIndex(null);

    const failed: string[] = [];
    for (const url of urls) {
      try {
        const result = await deleteMuseMediaAction(museId, url);
        if (!result || result.message !== API_MESSAGE.Success) {
          failed.push(url);
          continue;
        }
        await deleteMedia(url);
      } catch {
        failed.push(url);
      }
    }

    setBulkDeleting(false);
    stopSelecting();
    if (failed.length > 0) {
      setLocalMedia((prev) => [...prev, ...failed]);
      errorToast?.(
        `${failed.length} of ${urls.length} files could not be deleted.`,
      );
      return;
    }
    successToast?.(
      `${urls.length} file${urls.length === 1 ? "" : "s"} deleted.`,
    );
  }, [muse?.id, selected, stopSelecting, successToast, errorToast]);

  return (
    <S.CardExpandedWrapper $hideChrome={hideExpandedBackground}>
      <S.CardBack
        className="muse-card"
        accent={accent}
        $hideBackground={hideExpandedBackground}
      >
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.InfoSectionLabel>Gallery</S.InfoSectionLabel>
          <S.ScrollableContent accent={accent}>
            <ShouldRender if={isMediaLoading}>
              <S.ShimmerGrid>
                <S.ShimmerBlock $height="130px" />
                <S.ShimmerBlock $height="130px" />
                <S.ShimmerBlock $height="100px" />
                <S.ShimmerBlock $height="100px" />
                <S.ShimmerBlock $height="115px" />
                <S.ShimmerBlock $height="115px" />
              </S.ShimmerGrid>
            </ShouldRender>

            <ShouldRender if={!isMediaLoading}>
              {/* Owner: always-visible Add Media button, and Select beside it */}
              <ShouldRender if={isOwner}>
                {selecting ? (
                  <GallerySelectionBar aria-live="polite">
                    <span className="count">
                      {selected.size === 0
                        ? "Select files"
                        : `${selected.size} selected`}
                    </span>
                    <div className="actions">
                      <GallerySelectionButton
                        type="button"
                        disabled={bulkDeleting || localMedia.length === 0}
                        onClick={() =>
                          setSelected(
                            selected.size === localMedia.length
                              ? new Set()
                              : new Set(localMedia),
                          )
                        }
                      >
                        {selected.size === localMedia.length ? "None" : "All"}
                      </GallerySelectionButton>
                      <GallerySelectionButton
                        type="button"
                        $danger
                        disabled={bulkDeleting || selected.size === 0}
                        onClick={() => setConfirmBulk(true)}
                        aria-label={`Delete ${selected.size} selected`}
                      >
                        <FaRegTrashCan size={12} />
                        {bulkDeleting ? "Deleting…" : "Delete"}
                      </GallerySelectionButton>
                      <GallerySelectionClose
                        type="button"
                        aria-label="Stop selecting"
                        disabled={bulkDeleting}
                        onClick={stopSelecting}
                      >
                        <FiX size={16} />
                      </GallerySelectionClose>
                    </div>
                  </GallerySelectionBar>
                ) : (
                  <GalleryToolRow>
                    <GalleryAddMediaBtn
                      type="button"
                      onClick={() => setUploadOpen(true)}
                    >
                      <FiPlus size={14} />
                      Add Media
                    </GalleryAddMediaBtn>
                    {localMedia.length > 0 && (
                      <GalleryAddMediaBtn
                        type="button"
                        onClick={() => setSelecting(true)}
                      >
                        <FiCheckCircle size={14} />
                        Select
                      </GalleryAddMediaBtn>
                    )}
                  </GalleryToolRow>
                )}
              </ShouldRender>

              <ShouldRender if={localMedia.length === 0}>
                <S.SectionEmptyWrap>
                  <EmptyGalleryArt accent={accent} />
                  <S.SectionEmpty>No media yet.</S.SectionEmpty>
                </S.SectionEmptyWrap>
              </ShouldRender>
            </ShouldRender>

            <ShouldRender if={!isMediaLoading && localMedia.length > 0}>
              <AppImageViewer
                src={!currentIsVideo ? (currentItem ?? "") : ""}
                alt="Gallery media"
                open={galleryIndex !== null && !currentIsVideo}
                onOpenChange={(o) => {
                  if (!o) setGalleryIndex(null);
                }}
                prevSrc={galleryPrevSrc}
                nextSrc={galleryNextSrc}
                onPrev={goPrev}
                onNext={goNext}
                overlay={
                  currentItem && !currentIsVideo && muse?.id ? (
                    <MediaCaption
                      museId={muse.id}
                      url={currentItem}
                      meta={metaByUrl[currentItem]}
                      isOwner={isOwner}
                      onMetaChange={handleMetaChange}
                    />
                  ) : null
                }
              />
              <VideoViewer
                src={currentIsVideo ? (currentItem ?? "") : ""}
                open={galleryIndex !== null && currentIsVideo}
                onOpenChange={(o) => {
                  if (!o) setGalleryIndex(null);
                }}
                prevSrc={galleryPrevSrc}
                nextSrc={galleryNextSrc}
                onPrev={goPrev}
                onNext={goNext}
                overlay={
                  currentItem && currentIsVideo && muse?.id ? (
                    <MediaCaption
                      museId={muse.id}
                      url={currentItem}
                      meta={metaByUrl[currentItem]}
                      isOwner={isOwner}
                      onMetaChange={handleMetaChange}
                    />
                  ) : null
                }
              />
              <JustifiedGallery
                mediaUrls={localMedia}
                onItemClick={setGalleryIndex}
                isOwner={isOwner}
                onDeleteItem={handleDeleteMedia}
                selecting={selecting}
                selected={selected}
                onToggle={toggleSelected}
                avatarSrc={
                  isOwner ? reverseWsrvUrl(muse?.avatar?.src) : undefined
                }
                cardBgSrc={
                  isOwner && muse?.useExtraImages
                    ? reverseWsrvUrl(muse?.cardBackground?.src)
                    : undefined
                }
                wallpaperSrc={
                  isOwner && muse?.useExtraImages
                    ? reverseWsrvUrl(muse?.wallpaper?.src)
                    : undefined
                }
              />
            </ShouldRender>
          </S.ScrollableContent>
        </S.InfoCardContent>
      </S.CardBack>

      {/* Upload overlay */}
      <AppAlertDialog
        heading="Add Media"
        text=""
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        showConfirm={false}
        closeButtonText="Done"
        body={
          muse?.id ? (
            <UploadPanel
              museId={muse.id}
              existingCount={localMedia.length}
              onUploaded={handleUploaded}
            />
          ) : null
        }
      />

      {/* Delete confirmation */}
      <AppAlertDialog
        open={confirmDeleteUrl !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteUrl(null);
        }}
        heading="Delete media?"
        text="This will permanently remove the file from your gallery. This action cannot be undone."
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteUrl(null)}
      />

      {/* Bulk delete confirmation */}
      <AppAlertDialog
        open={confirmBulk}
        onOpenChange={(open) => {
          if (!open) setConfirmBulk(false);
        }}
        heading={`Delete ${selected.size} file${selected.size === 1 ? "" : "s"}?`}
        text={`This will permanently remove ${selected.size === 1 ? "the file" : "these files"} from your gallery. This action cannot be undone.`}
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={() => void handleDeleteSelected()}
        onCancel={() => setConfirmBulk(false)}
      />
    </S.CardExpandedWrapper>
  );
}

// ── Inline styled components ───────────────────────────────────────────────

const GalleryAddMediaBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  margin-bottom: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.95);
  }
`;

/* ── Select mode ──────────────────────────────────────────────────────── */

const GalleryToolRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

/** A gallery tile that can be a checkbox: the ring and a cursor to match. */
const GallerySelectableItem = styled(S.GalleryItem)<{
  $selectable: boolean;
  $selected: boolean;
}>`
  cursor: ${({ $selectable }) => ($selectable ? "pointer" : "zoom-in")};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 2px var(--accent, #fff)" : "none"};
  transition: box-shadow 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--accent, #fff);
    outline-offset: 2px;
  }
`;

const GallerySelectMark = styled.span<{ $selected: boolean }>`
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 4;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid
    ${({ $selected }) =>
      $selected ? "var(--accent, #fff)" : "rgba(255, 255, 255, 0.9)"};
  background: ${({ $selected }) =>
    $selected
      ? "var(--accent, rgba(255, 255, 255, 0.9))"
      : "rgba(0, 0, 0, 0.35)"};
  color: #fff;
  pointer-events: none;
  transition: background 0.15s ease, border-color 0.15s ease;
`;

const GallerySelectionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  padding: 6px 6px 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);

  .count {
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    min-width: 0;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const GallerySelectionButton = styled.button<{ $danger?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $danger }) => ($danger ? "var(--tomato-9)" : "rgba(255, 255, 255, 0.2)")};
  background: ${({ $danger }) =>
    $danger ? "var(--tomato-9)" : "rgba(255, 255, 255, 0.1)"};
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $danger }) =>
      $danger ? "var(--tomato-10)" : "rgba(255, 255, 255, 0.18)"};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const GallerySelectionClose = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const UploadPanelRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
`;

const UploadHint = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

const UploadError = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--tomato-9);
`;

const UploadPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UploadScrollBtn = styled.button`
  all: unset;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg-4);
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--bg-6); }
`;

const UploadPreviewGrid = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;

  /* hide scrollbar visually but keep it functional */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const UploadThumb = styled.div`
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  flex-shrink: 0;
`;

const UploadCheckingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  pointer-events: none;
`;

const UploadThumbRemove = styled.button`
  all: unset;
  position: absolute;
  top: 3px;
  right: 3px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: var(--tomato-9); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const UploadActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const UploadPickBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid var(--bg-6);
  border-radius: 6px;
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not(:disabled) { background: var(--bg-4); border-color: var(--bg-8); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const UploadSubmitBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: var(--accent-hover); }
  &:disabled { background: var(--bg-6); color: var(--text-secondary); cursor: not-allowed; }
`;

// ── Media caption (description + reactions) inside the viewer ───────────────

const MediaCaptionBar = styled.div`
  box-sizing: border-box;
  width: min(680px, 92vw);
  margin: 10px auto 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
`;

const MediaFooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
`;

const MediaLikeGroup = styled.div`
  display: inline-flex;
  align-items: center;
  min-width: 0;
`;

/* The shared heart — same blink and wiggle — recoloured for a dark overlay. */
const MediaHeartBtn = styled(LikeS.HeartButton)`
  .heart-icon {
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.92);
  }

  .heart-icon-filled,
  &.liked .heart-icon {
    color: var(--tomato-9);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const MediaLikesBtn = styled(LikeS.CountButton)`
  color: rgba(255, 255, 255, 0.8);
  white-space: normal;
  text-align: left;

  &:hover:not(:disabled) {
    color: #fff;
  }

  &:disabled {
    cursor: default;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.55);
  }
`;

const MediaToolBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.12);
  transition: background-color 0.15s, color 0.15s;

  @media (hover: hover) {
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

const MediaCaptionEmpty = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 6px 10px;
  margin: -2px 0 0 -10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-style: italic;
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.15s, background-color 0.15s;

  @media (hover: hover) {
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const MediaCaptionText = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  color: rgba(255, 255, 255, 0.92);
`;

const MediaCaptionTextarea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
  min-height: 64px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: var(--font-size-input);
  font-family: var(--font);
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const MediaCaptionToolbar = styled.div`
  display: flex;
  gap: 6px;
`;

const MediaFormatBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-small);

  @media (hover: hover) {
    &:hover { background: rgba(255, 255, 255, 0.12); }
  }
`;

const MediaCaptionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const MediaCaptionCancel = styled.button`
  all: unset;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: var(--font-size-small);
  color: rgba(255, 255, 255, 0.8);

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  @media (hover: hover) {
    &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.12); }
  }
`;

const MediaCaptionSave = styled.button`
  all: unset;
  cursor: pointer;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: var(--font-size-small);
  font-weight: 600;
  background: var(--accent);
  color: #fff;

  &:hover:not(:disabled) { background: var(--accent-hover); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
