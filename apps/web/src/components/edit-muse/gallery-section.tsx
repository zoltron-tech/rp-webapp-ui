"use client";

import { Separator } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { FaCheck, FaPlay, FaRegTrashCan } from "react-icons/fa6";
import { FiCheckCircle, FiPlus, FiUploadCloud, FiX } from "react-icons/fi";
import { MdPhotoLibrary } from "react-icons/md";
import {
  addMuseMediaAction,
  deleteMuseMediaAction,
  getMuseMediaAction,
} from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { AppAlertDialog } from "@/components/dialog";
import { classifyUrlForUpload } from "@/hooks/use-nsfw-check";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { useMuseState } from "./muse.store";
import * as S from "./styled";

function getInUseLabels(
  url: string,
  image: string | null,
  wallpaper: { src?: string; crop?: { src?: string } } | null,
  cardBackground: { src?: string; crop?: { src?: string } } | null,
): string[] {
  const labels: string[] = [];
  if (image && image === url) labels.push("avatar");
  if (wallpaper?.src && wallpaper.src === url) labels.push("wallpaper");
  if (
    wallpaper?.crop?.src &&
    wallpaper.crop.src === url &&
    !labels.includes("wallpaper")
  )
    labels.push("wallpaper (crop)");
  if (cardBackground?.src && cardBackground.src === url)
    labels.push("card background");
  if (
    cardBackground?.crop?.src &&
    cardBackground.crop.src === url &&
    !labels.includes("card background")
  )
    labels.push("card background (crop)");
  return labels;
}

const MAX_TOTAL = 20; // max files per muse gallery
const VALID_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "video/mp4",
];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

type PendingFile = {
  file: File;
  previewUrl: string;
  isVideo: boolean;
  isChecking: boolean;
};

type Props = {
  onBack: () => void;
};

export function GallerySection({ onBack }: Props) {
  const id = useMuseState("id");
  const image = useMuseState("image");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const { successToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null);
  const [inUseConfirmUrl, setInUseConfirmUrl] = useState<string | null>(null);
  const [inUseLabels, setInUseLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  /*
   * Select mode: tiles toggle instead of opening, a bar counts them, and one
   * confirmation deletes the lot. The service deletes one URL per request,
   * so the lot goes one after another; what fails is put back on screen.
   */
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Anything that left the gallery leaves the selection too.
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set([...prev].filter((u) => existingMedia.includes(u)));
      return next.size === prev.size ? prev : next;
    });
  }, [existingMedia]);

  // Load existing media on mount
  useEffect(() => {
    if (!id) return;
    setLoadingMedia(true);
    getMuseMediaAction(id).then((res) => {
      if (Array.isArray(res)) setExistingMedia(res);
      setLoadingMedia(false);
    });
  }, [id]);

  // Revoke object URLs on unmount
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

      const remaining = MAX_TOTAL - existingMedia.length - pendingFiles.length;
      if (remaining <= 0) {
        setError(`Your gallery is full (${MAX_TOTAL} files maximum).`);
        return;
      }

      const newFiles: PendingFile[] = [];
      for (const file of files.slice(0, remaining)) {
        if (!VALID_TYPES.includes(file.type)) {
          setError("Unsupported file type. Allowed: PNG, JPG, GIF, WEBP, MP4.");
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("A file exceeds the 30 MB limit.");
          continue;
        }
        const isVideo = file.type === "video/mp4";
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
    [existingMedia.length, pendingFiles.length],
  );

  const removePending = useCallback((index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!id || pendingFiles.length === 0) return;
    if (pendingFiles.some((f) => f.isChecking)) return;
    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];

    for (const pending of pendingFiles) {
      const formData = new FormData();
      formData.append("file", pending.file);
      formData.append("contentType", pending.file.type);
      formData.append("prefix", id);

      const url = await uploadMedia(formData);
      if (!url || url === API_MESSAGE.MediaError) {
        setError("One or more files failed to upload. Please try again.");
        setUploading(false);
        return;
      }
      uploadedUrls.push(url);
    }

    // S3 uploads all succeeded — update UI immediately
    for (const f of pendingFiles) URL.revokeObjectURL(f.previewUrl);
    setPendingFiles([]);
    setExistingMedia((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
    successToast?.("Media uploaded successfully.");

    // Best-effort: register URLs with the backend (don't block or error on failure)
    try {
      await addMuseMediaAction(id, uploadedUrls);
    } catch {
      // silently ignore — files are already on S3 and visible in the gallery
    }
  }, [id, pendingFiles, uploadMedia, successToast]);

  const anyChecking = pendingFiles.some((f) => f.isChecking);

  const handleDelete = useCallback(
    async (url: string) => {
      if (!id) return;
      setConfirmDeleteUrl(null);

      // Remove from UI immediately
      setExistingMedia((prev) => prev.filter((u) => u !== url));
      successToast?.("Media removed.");

      // Off the muse (its metadata row, hearts and notifications), then out
      // of storage — the order the profile gallery deletes in. Storage alone
      // left a row behind that the profile kept listing.
      await deleteMuseMediaAction(id, url);
      await deleteMedia(url);
    },
    [id, successToast],
  );

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

  const selectedInUse = useMemo(
    () =>
      [...selected].filter(
        (url) =>
          getInUseLabels(url, image, wallpaper, cardBackground).length > 0,
      ).length,
    [selected, image, wallpaper, cardBackground],
  );

  const handleDeleteSelected = useCallback(async () => {
    setConfirmBulk(false);
    if (!id) return;
    const urls = [...selected];
    if (urls.length === 0) return;
    setBulkDeleting(true);
    setError(null);
    setExistingMedia((prev) => prev.filter((u) => !urls.includes(u)));

    const failed: string[] = [];
    for (const url of urls) {
      try {
        const result = await deleteMuseMediaAction(id, url);
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
      setExistingMedia((prev) => [...prev, ...failed]);
      setError(
        `${failed.length} of ${urls.length} files could not be deleted. Please try again.`,
      );
      return;
    }
    successToast?.(
      `${urls.length} file${urls.length === 1 ? "" : "s"} removed.`,
    );
  }, [id, selected, stopSelecting, successToast]);

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={onBack} aria-label="Back">
            <BsArrowLeft />
          </S.BackButton>
          <S.FormHeading>
            <MdPhotoLibrary />
            <h1>Gallery</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      {/* ── Upload new media ──────────────────────────── */}
      <GallerySectionHeading>Upload new media</GallerySectionHeading>
      <GalleryUploadNote>
        {existingMedia.length < MAX_TOTAL
          ? `You can add up to ${
              MAX_TOTAL - existingMedia.length
            } more file${MAX_TOTAL - existingMedia.length === 1 ? "" : "s"} (${MAX_TOTAL} total · PNG, JPG, GIF, WEBP, MP4 · max 30 MB each).`
          : `Gallery full — ${MAX_TOTAL} files maximum. Delete some to upload more.`}
      </GalleryUploadNote>

      {error && <S.LandingErrorBanner>{error}</S.LandingErrorBanner>}

      {/* Pending previews */}
      {pendingFiles.length > 0 && (
        <GalleryGrid>
          {pendingFiles.map((f, i) => (
            <GalleryThumb key={f.previewUrl} $deleting={false}>
              {f.isVideo ? (
                <>
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
                  <GalleryThumbVideoIcon>
                    <FaPlay size={10} />
                  </GalleryThumbVideoIcon>
                </>
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
                <GalleryCheckingOverlay>Checking…</GalleryCheckingOverlay>
              )}
              <GalleryThumbDelete
                type="button"
                aria-label="Remove"
                onClick={() => removePending(i)}
                disabled={uploading}
              >
                <FaRegTrashCan size={13} />
              </GalleryThumbDelete>
            </GalleryThumb>
          ))}
        </GalleryGrid>
      )}

      {/* Pick files button */}
      {existingMedia.length + pendingFiles.length < MAX_TOTAL && (
        <GalleryPickButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <FiPlus size={16} />
          {pendingFiles.length === 0 ? "Select files" : "Add more"}
        </GalleryPickButton>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp,video/mp4"
        hidden
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {/* Upload button */}
      {pendingFiles.length > 0 && (
        <GalleryUploadButton
          type="button"
          onClick={handleUpload}
          disabled={uploading || anyChecking}
        >
          <FiUploadCloud size={16} />
          {uploading
            ? `Uploading ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}…`
            : anyChecking
              ? "Checking images…"
              : `Upload ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}`}
        </GalleryUploadButton>
      )}

      <Separator.Root className="separator" orientation="horizontal" />

      {/* ── Existing media grid ───────────────────────── */}
      {selecting ? (
        <GallerySelectionBar aria-live="polite">
          <span className="count">
            {selected.size === 0 ? "Select files" : `${selected.size} selected`}
          </span>
          <div className="actions">
            <GallerySelectionButton
              type="button"
              disabled={bulkDeleting || existingMedia.length === 0}
              onClick={() =>
                setSelected(
                  selected.size === existingMedia.length
                    ? new Set()
                    : new Set(existingMedia),
                )
              }
            >
              {selected.size === existingMedia.length ? "None" : "All"}
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
        <GalleryHeadingRow>
          <GallerySectionHeading>
            Current media
            {existingMedia.length > 0
              ? ` (${existingMedia.length}/${MAX_TOTAL})`
              : ""}
          </GallerySectionHeading>
          {existingMedia.length > 0 && (
            <GallerySelectButton
              type="button"
              onClick={() => setSelecting(true)}
            >
              <FiCheckCircle size={13} />
              Select
            </GallerySelectButton>
          )}
        </GalleryHeadingRow>
      )}

      {loadingMedia ? (
        <GalleryEmptyNote>Loading…</GalleryEmptyNote>
      ) : existingMedia.length === 0 ? (
        <GalleryEmptyNote>No media yet. Upload some above.</GalleryEmptyNote>
      ) : (
        <GalleryGrid>
          {existingMedia.map((url) => {
            const isVideo = url.toLowerCase().endsWith(".mp4");
            const chosen = selected.has(url);
            return (
              <GalleryThumb
                key={url}
                $deleting={false}
                $selectable={selecting}
                $selected={chosen}
                role={selecting ? "checkbox" : undefined}
                aria-checked={selecting ? chosen : undefined}
                tabIndex={selecting ? 0 : undefined}
                onClick={selecting ? () => toggleSelected(url) : undefined}
                onKeyDown={
                  selecting
                    ? (e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          toggleSelected(url);
                        }
                      }
                    : undefined
                }
              >
                {selecting && (
                  <GallerySelectMark $selected={chosen} aria-hidden>
                    {chosen && <FaCheck size={11} />}
                  </GallerySelectMark>
                )}
                {isVideo ? (
                  <>
                    <video
                      src={`${url}#t=0.3`}
                      preload="metadata"
                      muted
                      style={{
                        display: "block",
                        height: "100%",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                    <GalleryThumbVideoIcon>
                      <FaPlay size={10} />
                    </GalleryThumbVideoIcon>
                  </>
                ) : (
                  <img
                    src={url}
                    alt="Gallery item"
                    style={{
                      display: "block",
                      height: "100%",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                )}
                {!selecting && (
                  <GalleryThumbDelete
                    type="button"
                    aria-label="Remove"
                    onClick={() => {
                      const labels = getInUseLabels(
                        url,
                        image,
                        wallpaper,
                        cardBackground,
                      );
                      if (labels.length > 0) {
                        setInUseLabels(labels);
                        setInUseConfirmUrl(url);
                      } else {
                        setConfirmDeleteUrl(url);
                      }
                    }}
                  >
                    <FaRegTrashCan size={13} />
                  </GalleryThumbDelete>
                )}
              </GalleryThumb>
            );
          })}
        </GalleryGrid>
      )}

      <AppAlertDialog
        open={confirmDeleteUrl !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteUrl(null);
        }}
        heading="Delete media?"
        text="This will permanently remove the file from your gallery. This action cannot be undone."
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={() => {
          if (confirmDeleteUrl) handleDelete(confirmDeleteUrl);
        }}
        onCancel={() => setConfirmDeleteUrl(null)}
      />

      <AppAlertDialog
        open={inUseConfirmUrl !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInUseConfirmUrl(null);
            setInUseLabels([]);
          }
        }}
        heading="Media is currently in use"
        text={`This image is being used as your ${inUseLabels.join(" and ")}. Deleting it will permanently remove it from your gallery but will not automatically update those fields. Are you sure you want to delete it?`}
        actionButtonLabel="Delete anyway"
        actionColor="negative"
        onConfirm={() => {
          if (inUseConfirmUrl) handleDelete(inUseConfirmUrl);
          setInUseConfirmUrl(null);
          setInUseLabels([]);
        }}
        onCancel={() => {
          setInUseConfirmUrl(null);
          setInUseLabels([]);
        }}
      />

      <AppAlertDialog
        open={confirmBulk}
        onOpenChange={(open) => {
          if (!open) setConfirmBulk(false);
        }}
        heading={
          selectedInUse > 0
            ? "Some media is in use"
            : `Delete ${selected.size} file${selected.size === 1 ? "" : "s"}?`
        }
        text={
          selectedInUse > 0
            ? `${selectedInUse === 1 ? "One of the selected files is" : `${selectedInUse} of the selected files are`} your avatar, wallpaper or card background. Deleting removes them from your gallery but will not update those fields. Delete ${selected.size} file${selected.size === 1 ? "" : "s"} anyway?`
            : `This will permanently remove ${selected.size === 1 ? "the file" : "these files"} from your gallery. This action cannot be undone.`
        }
        actionButtonLabel={selectedInUse > 0 ? "Delete anyway" : "Delete"}
        actionColor="negative"
        onConfirm={() => void handleDeleteSelected()}
        onCancel={() => setConfirmBulk(false)}
      />
    </>
  );
}

// ── Inline styled components (gallery-specific) ────────────────────────────

import styled from "styled-components";

const GallerySectionHeading = styled.h2`
  all: unset;
  display: block;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  margin-top: 16px;
  margin-bottom: 10px;
`;

const GalleryEmptyNote = styled.p`
  margin: 0 0 16px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-style: italic;
`;

const GalleryUploadNote = styled.p`
  margin: 0 0 12px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

const GalleryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
`;

const GalleryThumb = styled.div<{
  $deleting: boolean;
  $selectable?: boolean;
  $selected?: boolean;
}>`
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid
    ${({ $selected }) => ($selected ? "var(--accent)" : "var(--bg-6)")};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 2px var(--accent)" : "none"};
  background: var(--bg-3);
  opacity: ${({ $deleting }) => ($deleting ? 0.5 : 1)};
  transition: opacity 0.2s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  cursor: ${({ $selectable }) => ($selectable ? "pointer" : "default")};

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

/* ── Select mode ──────────────────────────────────────────────────────── */

const GalleryHeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 10px;

  & > h2 {
    margin: 0;
  }
`;

const GallerySelectButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--bg-8);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const GallerySelectionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 10px;
  padding: 6px 6px 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);

  .count {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
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
    ${({ $danger }) => ($danger ? "var(--tomato-9)" : "var(--bg-8)")};
  background: ${({ $danger }) => ($danger ? "var(--tomato-9)" : "var(--bg-3)")};
  color: ${({ $danger }) => ($danger ? "#fff" : "var(--text)")};
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $danger }) =>
      $danger ? "var(--tomato-10)" : "var(--bg-4)"};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
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
  color: var(--text-secondary);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--bg-4);
    color: var(--text);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const GallerySelectMark = styled.span<{ $selected: boolean }>`
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 3;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid
    ${({ $selected }) => ($selected ? "var(--accent)" : "rgba(255, 255, 255, 0.9)")};
  background: ${({ $selected }) =>
    $selected ? "var(--accent)" : "rgba(0, 0, 0, 0.35)"};
  color: #fff;
  pointer-events: none;
  transition: background 0.15s ease, border-color 0.15s ease;
`;

const GalleryCheckingOverlay = styled.div`
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

const GalleryThumbDelete = styled.button`
  all: unset;
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--tomato-9);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const GalleryThumbVideoIcon = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GalleryPickButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 4px;
  border: 1px dashed var(--bg-8);
  background: var(--bg-2);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
  margin-bottom: 12px;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GalleryUploadButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
  border-radius: 4px;
  background: var(--accent);
  color: #fff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background 0.15s ease;
  margin-bottom: 20px;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
