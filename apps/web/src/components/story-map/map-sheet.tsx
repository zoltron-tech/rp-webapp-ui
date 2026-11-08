"use client";

import type { StoryMap } from "@nw/types";
import { fileTooLargeMessage, pluralize } from "@nw/utils";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuImageUp } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { appendUploadPurpose } from "@/utils/upload-media";
import * as S from "./styles";

/** Raster formats only — an SVG map would be an XSS vector, not a picture. */
const ACCEPTED = "image/png,image/jpeg,image/webp,image/avif";
/** Beyond this the browser starts to struggle panning the bitmap. */
const RECOMMENDED_LONG_EDGE = 4096;

type Props = {
  open: boolean;
  /** Null when uploading a new map. */
  map: StoryMap | null;
  storyboardId: string;
  onClose: () => void;
  onSave: (map: StoryMap) => unknown;
  onDelete?: (map: StoryMap) => unknown;
};

/** Upload / rename / replace / delete one map. */
export const MapSheet: FC<Props> = ({
  open,
  map,
  storyboardId,
  onClose,
  onSave,
  onDelete,
}) => {
  const { uploadMedia } = useUploadMedia();
  // The service's image cap: refuse early so the failure is legible (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oversized, setOversized] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Held while a delete is in flight: no save and no closing until it lands.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!map || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(map);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setName(map?.name ?? "");
    setImage(map?.image ?? null);
    setUploading(false);
    setError(null);
    setOversized(false);
    setConfirmDelete(false);
  }, [open, map]);

  const pinCount = map?.pins.length ?? 0;
  const pinsLabel = `${pinCount} ${pluralize("pin", pinCount)}`;

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setOversized(false);

    if (!ACCEPTED.split(",").includes(file.type)) {
      setError("Maps must be a PNG, JPG, WebP or AVIF image.");
      return;
    }
    if (file.size > capFor(file.type)) {
      setError(
        `${fileTooLargeMessage(capFor(file.type))} Please export it a little smaller.`,
      );
      return;
    }

    // Warn rather than refuse: a huge map still works, it just pans heavily.
    const probe = new Image();
    probe.onload = () => {
      if (
        Math.max(probe.naturalWidth, probe.naturalHeight) >
        RECOMMENDED_LONG_EDGE
      ) {
        setOversized(true);
      }
      URL.revokeObjectURL(probe.src);
    };
    probe.src = URL.createObjectURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    // Store maps under app-media/<storyId>/ like the story's own cover.
    formData.append("mediaBucket", "APP_MEDIA");
    formData.append("prefix", storyboardId);
    formData.append("scoped", "false");
    // Storyboard media: the storyboard's own limit, not the account's.
    appendUploadPurpose(formData, "storyboard", storyboardId);

    const uploaded = await uploadMedia(formData);
    setUploading(false);

    if (uploaded === API_MESSAGE.MediaError) {
      setError("Could not upload that map. Please try again.");
      return;
    }
    setImage(uploaded);
  };

  const trimmed = name.trim();

  return (
    <ResponsiveSheet
      open={open}
      title={map ? "Edit map" : "Upload a map"}
      confirmDisabled={
        trimmed.length === 0 || uploading || deleting || (!map && !image)
      }
      onConfirm={() =>
        onSave({
          id: map?.id ?? null,
          image,
          name: trimmed,
          ordinal: map?.ordinal ?? 0,
          pins: map?.pins ?? [],
        })
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      <F.Field>
        Name
        <F.TextInput
          value={name}
          maxLength={80}
          placeholder="The Known World"
          onChange={(e) => setName(e.target.value)}
        />
      </F.Field>

      {image && <S.UploadPreview src={image} alt="" />}

      <S.UploadButton>
        <LuImageUp size={16} />
        {uploading
          ? "Uploading…"
          : image
            ? "Replace the image"
            : "Choose an image"}
        <input
          type="file"
          accept={ACCEPTED}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            // Reset so the same file can be re-picked after an error.
            e.target.value = "";
            handleFile(file);
          }}
        />
      </S.UploadButton>

      {error && (
        <F.Hint style={{ color: "var(--tomato-9, #e5484d)" }}>{error}</F.Hint>
      )}

      {oversized && (
        <F.Hint>
          That image is larger than {RECOMMENDED_LONG_EDGE}px on its long edge.
          It will work, but panning will be smoother if you export it smaller.
        </F.Hint>
      )}

      <F.Hint>
        Pins are stored as a position on this image, so replacing it keeps every
        pin exactly where it was — as long as the new image has the same shape.
      </F.Hint>

      {map && onDelete && (
        <F.DangerButton
          type="button"
          disabled={deleting}
          onClick={() => setConfirmDelete(true)}
        >
          <FaRegTrashCan size={13} />
          Delete map{pinCount > 0 && ` and its ${pinsLabel}`}
        </F.DangerButton>
      )}

      <AppAlertDialog
        heading="Delete this map?"
        text={
          pinCount > 0
            ? `Its ${pinsLabel} ${pinCount === 1 ? "goes" : "go"} with it, for every co-author on this story. This cannot be undone.`
            : "It disappears for every co-author on this story. This cannot be undone."
        }
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Delete"
        actionColor="negative"
        closeOnConfirm
        onConfirm={handleDelete}
      />
    </ResponsiveSheet>
  );
};
