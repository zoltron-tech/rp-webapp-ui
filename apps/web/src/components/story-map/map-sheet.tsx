"use client";

import type { StoryMap } from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuImageUp } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import * as S from "./styles";

/** nginx caps uploads at 25MB; refuse earlier so the failure is legible. */
const MAX_MAP_BYTES = 25 * 1024 * 1024;
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
  onSave: (map: StoryMap) => void;
  onDelete?: (map: StoryMap) => void;
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

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oversized, setOversized] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(map?.name ?? "");
    setImage(map?.image ?? null);
    setUploading(false);
    setError(null);
    setOversized(false);
  }, [open, map]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setOversized(false);

    if (!ACCEPTED.split(",").includes(file.type)) {
      setError("Maps must be a PNG, JPG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_MAP_BYTES) {
      setError("That map is over 25MB. Please export it a little smaller.");
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
      confirmDisabled={trimmed.length === 0 || uploading || (!map && !image)}
      onConfirm={() =>
        onSave({
          id: map?.id ?? null,
          image,
          name: trimmed,
          ordinal: map?.ordinal ?? 0,
          pins: map?.pins ?? [],
        })
      }
      onClose={onClose}
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
        <F.DangerButton type="button" onClick={() => onDelete(map)}>
          <FaRegTrashCan size={13} />
          Delete map{map.pins.length > 0 && ` and its ${map.pins.length} pins`}
        </F.DangerButton>
      )}
    </ResponsiveSheet>
  );
};
