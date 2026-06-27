"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaRegTrashCan } from "react-icons/fa6";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiUploadCloud,
} from "react-icons/fi";
import styled from "styled-components";
import {
  addMuseMediaAction,
  deleteMuseMediaAction,
} from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { AppAlertDialog } from "@/components/dialog";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { VideoViewer } from "@/components/image-viewer/VideoViewer";
import { useGlobalState } from "@/context/store/stores";
import { classifyUrl } from "@/hooks/use-nsfw-check";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { Muse } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
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
  isCardBg,
  isWallpaper,
  isOwner,
  onDelete,
}: {
  url: string;
  width: number;
  height: number;
  onItemClick: () => void;
  isCardBg: boolean;
  isWallpaper: boolean;
  isOwner: boolean;
  onDelete: () => void;
}) {
  return (
    <S.GalleryItem style={{ height, width }} onClick={onItemClick}>
      <S.GalleryImage src={url} alt="Gallery media" />
      {isCardBg && <S.GalleryBadge>Card BG</S.GalleryBadge>}
      {isWallpaper && (
        <S.GalleryBadge style={{ left: isCardBg ? "70px" : "5px" }}>
          Wallpaper
        </S.GalleryBadge>
      )}
      {isOwner && (
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
    </S.GalleryItem>
  );
}

function JustifiedGallery({
  mediaUrls,
  onItemClick,
  cardBgSrc,
  wallpaperSrc,
  isOwner,
  onDeleteItem,
}: {
  mediaUrls: string[];
  onItemClick: (idx: number) => void;
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
              <S.GalleryItem
                key={item.url}
                style={{
                  cursor: "pointer",
                  height: item.height,
                  width: item.width,
                }}
                onClick={() => onItemClick(mediaUrls.indexOf(item.url))}
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
                {isOwner && (
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
              </S.GalleryItem>
            ) : (
              <GalleryImageItem
                key={item.url}
                url={item.url}
                width={item.width}
                height={item.height}
                onItemClick={() => onItemClick(mediaUrls.indexOf(item.url))}
                isCardBg={item.url === cardBgSrc}
                isWallpaper={item.url === wallpaperSrc}
                isOwner={isOwner}
                onDelete={() => onDeleteItem(item.url)}
              />
            ),
          )}
        </div>
      ))}
    </div>
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

type PendingFile = { file: File; previewUrl: string; isVideo: boolean };

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
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      setError(null);
      const remaining = MAX_TOTAL - existingCount - pendingFiles.length;
      if (remaining <= 0) {
        setError(`Gallery is full (${MAX_TOTAL} files maximum).`);
        return;
      }
      const accepted: PendingFile[] = [];
      for (const file of files.slice(0, remaining)) {
        if (!VALID_TYPES.includes(file.type)) {
          setError("Unsupported type. Allowed: PNG, JPG, GIF, WEBP, MP4, MOV.");
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("A file exceeds the 30 MB limit.");
          continue;
        }
        const isVideo = file.type === "video/mp4" || file.type === "video/quicktime";
        const previewUrl = URL.createObjectURL(file);
        if (!isVideo) {
          const isNsfw = await classifyUrl(previewUrl);
          if (isNsfw) {
            URL.revokeObjectURL(previewUrl);
            setError("This image contains sensitive content and cannot be uploaded.");
            continue;
          }
        }
        accepted.push({ file, isVideo, previewUrl });
      }
      setPendingFiles((prev) => [...prev, ...accepted]);
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
    setUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];
    for (const pending of pendingFiles) {
      const formData = new FormData();
      formData.append("file", pending.file);
      formData.append("contentType", pending.file.type);
      formData.append("prefix", museId);
      const url = await uploadMedia(formData);
      if (!url || url === API_MESSAGE.MediaError) {
        setError("One or more files failed to upload. Please try again.");
        setUploading(false);
        return;
      }
      uploadedUrls.push(url);
    }
    for (const f of pendingFiles) URL.revokeObjectURL(f.previewUrl);
    setPendingFiles([]);
    setUploading(false);
    successToast?.("Media uploaded successfully.");
    try {
      await addMuseMediaAction(museId, uploadedUrls);
    } catch {
      /* silently ignore */
    }
    onUploaded(uploadedUrls);
  }, [museId, pendingFiles, uploadMedia, successToast, onUploaded]);

  const canAddMore = existingCount + pendingFiles.length < MAX_TOTAL;
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
                      height: "100%",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
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
            disabled={uploading}
          >
            <FiUploadCloud size={15} />
            {uploading
              ? `Uploading ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}…`
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
  const { successToast } = useUIContext();
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null);
  const [localMedia, setLocalMedia] = useState<string[]>(media ?? []);
  const accent = muse?.useAccent ? muse.accent : undefined;

  // Keep localMedia in sync when the parent refreshes the prop
  useEffect(() => {
    setLocalMedia(media ?? []);
  }, [media]);

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
    setConfirmDeleteUrl(null);
    setLocalMedia((prev) => prev.filter((u) => u !== url));
    setGalleryIndex(null);
    successToast?.("Media deleted.");
    await deleteMuseMediaAction(muse.id, url);
    await deleteMedia(url);
  }, [muse?.id, confirmDeleteUrl, successToast]);

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.InfoSectionLabel>Gallery</S.InfoSectionLabel>
          <S.ScrollableContent accent={accent}>
            {/* Owner: always-visible Add Media button */}
            <ShouldRender if={isOwner}>
              <GalleryAddMediaBtn
                type="button"
                onClick={() => setUploadOpen(true)}
              >
                <FiPlus size={14} />
                Add Media
              </GalleryAddMediaBtn>
            </ShouldRender>

            <ShouldRender if={localMedia.length === 0}>
              <S.SectionEmpty>No media yet.</S.SectionEmpty>
            </ShouldRender>

            <ShouldRender if={localMedia.length > 0}>
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
              />
              <JustifiedGallery
                mediaUrls={localMedia}
                onItemClick={setGalleryIndex}
                isOwner={isOwner}
                onDeleteItem={handleDeleteMedia}
                cardBgSrc={
                  isOwner && muse?.useExtraImages
                    ? (muse?.cardBackground?.src ?? undefined)
                    : undefined
                }
                wallpaperSrc={
                  isOwner && muse?.useExtraImages
                    ? (muse?.wallpaper?.src ?? undefined)
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
