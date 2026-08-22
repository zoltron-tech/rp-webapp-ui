/**
 * Client-side upload preparation.
 *
 * Both upload paths — the `/s3/upload` proxy action and the presigned
 * direct-to-S3 hook — need the same fixup first: iPhones default to HEVC,
 * which Chrome/Firefox cannot play in `<video>`, so the file is re-encoded to
 * H.264 in the browser before it goes anywhere. That has to happen here rather
 * than server-side, because WebCodecs only exists in the browser.
 */

import { uploadMedia as uploadMediaAction } from "@/app/rp/profile/actions";
import { ensureWebCompatibleVideo } from "./video-transcode";

/**
 * The file to actually upload, plus the content type that goes with it.
 *
 * Falls back to the original file when transcoding is unnecessary or
 * unavailable, and to the caller's declared `contentType` when the entry is a
 * plain Blob rather than a File.
 */
export const prepareUploadFile = async (
  formData: FormData,
): Promise<{ file: Blob; contentType: string; changed: boolean }> => {
  const rawFile = formData.get("file") as Blob | null;

  const file =
    rawFile instanceof File ? await ensureWebCompatibleVideo(rawFile) : rawFile;

  const contentType =
    file instanceof File
      ? file.type
      : (formData.get("contentType") as string);

  return {
    changed: !!file && file !== rawFile,
    contentType,
    file: file as Blob,
  };
};

/** Proxy upload: goes through the server action, and so through nginx. */
export const uploadMedia = async (formData: FormData) => {
  const { file, contentType, changed } = await prepareUploadFile(formData);

  if (changed) {
    formData.set("file", file);
    formData.set("contentType", contentType);
  }

  return uploadMediaAction(formData);
};
