import { deleteMedia } from "@nw/api/endpoints/profile";
import { useApi } from "@nw/features";
import type { NWImage } from "@nw/types";
import { cropToEditorState } from "@nw/utils";
import { reverseWsrvUrl } from "@nw/utils/image";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import type { CropState } from "@/hooks/use-muse-edit";
import { MAX_IMAGE_BYTES, pickImage, uploadFile } from "@/lib/media-upload";

/**
 * Pick → upload → crop → save, for the avatar and the card background.
 *
 * Web's two dialogs share this flow: the camera button opens the *existing*
 * picture for adjusting when there is one and the picker when there is not;
 * "Replace" inside the dialog picks a new file; a new file uploads while the
 * person is already dragging it into place, and the save writes the storage
 * URL with the crop. Cancelling after an upload deletes the orphan — the
 * same `deleteMedia` web calls — so a change of mind does not leave a file
 * in the bucket.
 *
 * The hook owns every piece of that state; `ImageCropEditor` draws it and
 * `useMuseEdit` writes it.
 */
export const useImageCropFlow = ({
  onSave,
  prefix,
}: {
  /** The storage URL and the final crop. Resolves `true` on success. */
  onSave: (src: string, crop: CropState) => Promise<boolean>;
  /** The S3 key prefix — the muse id, as web passes it. */
  prefix: string | null | undefined;
}) => {
  const api = useApi();
  const [visible, setVisible] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [initial, setInitial] = useState<CropState>({ scale: 1, x: 50, y: 50 });
  const [autoFit, setAutoFit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  /** The URL the save will write: the existing picture's, or the new upload's. */
  const remote = useRef<string | null>(null);
  /** A fresh upload nobody has saved yet, to be deleted on cancel or replace. */
  const orphan = useRef<string | null>(null);
  /** Uploads that finish after the person has moved on are discarded. */
  const generation = useRef(0);

  const discardOrphan = useCallback(() => {
    const url = orphan.current;
    orphan.current = null;
    if (url) void deleteMedia(api, url);
  }, [api]);

  const pickAndUpload = useCallback(async (): Promise<boolean> => {
    const file = await pickImage();
    if (!file) return false;
    if (file.fileSize > MAX_IMAGE_BYTES) {
      Alert.alert("Picture is too large", "Maximum file size is 10 MB.");
      return false;
    }
    if (!file.contentType.startsWith("image/")) {
      Alert.alert("Not a picture", "Choose a PNG, JPG, WEBP or GIF.");
      return false;
    }

    discardOrphan();
    const run = ++generation.current;
    remote.current = null;
    setUri(file.uri);
    setInitial({ scale: 1, x: 50, y: 50 });
    setAutoFit(true);
    setUploading(true);
    setVisible(true);

    const url = await uploadFile(api, file, prefix ?? undefined);
    if (run !== generation.current) {
      if (url) void deleteMedia(api, url);
      return false;
    }
    setUploading(false);
    if (!url) {
      Alert.alert("Upload failed", "Please try again.");
      setVisible(false);
      return false;
    }
    remote.current = url;
    orphan.current = url;
    return true;
  }, [api, discardOrphan, prefix]);

  /** The camera button: adjust what is there, or pick when there is nothing. */
  const open = useCallback(
    (existing: NWImage | null | undefined) => {
      if (existing?.src) {
        remote.current = reverseWsrvUrl(existing.src) ?? existing.src;
        setUri(remote.current);
        setInitial(cropToEditorState(existing.crop));
        setAutoFit(false);
        setUploading(false);
        setVisible(true);
        return;
      }
      void pickAndUpload();
    },
    [pickAndUpload],
  );

  const close = useCallback(() => {
    generation.current += 1;
    discardOrphan();
    setVisible(false);
    setUploading(false);
  }, [discardOrphan]);

  const confirm = useCallback(
    async (crop: CropState) => {
      const src = remote.current;
      if (!src) return;
      setSaving(true);
      const ok = await onSave(src, crop);
      setSaving(false);
      if (!ok) {
        Alert.alert("Not saved", "The picture could not be saved. Try again.");
        return;
      }
      // Saved: it belongs to the muse now, and is nobody's orphan.
      orphan.current = null;
      setVisible(false);
    },
    [onSave],
  );

  return {
    autoFit,
    close,
    confirm,
    initial,
    open,
    /** "Replace" inside the tray: a different file, same flow. */
    replace: pickAndUpload,
    saving,
    uploading,
    uri,
    visible,
  };
};
