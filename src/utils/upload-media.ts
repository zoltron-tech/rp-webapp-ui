/**
 * Client-side wrapper around the `uploadMedia` server action. The action
 * runs on the server and has no access to WebCodecs, so the HEVC → H.264
 * compatibility fixup (see `video-transcode.ts`) has to happen here, before
 * the file ever leaves the browser.
 */

import { uploadMedia as uploadMediaAction } from "@/app/rp/profile/actions";
import { ensureWebCompatibleVideo } from "./video-transcode";

export const uploadMedia = async (formData: FormData) => {
  const rawFile = formData.get("file");
  if (rawFile instanceof File) {
    const file = await ensureWebCompatibleVideo(rawFile);
    if (file !== rawFile) {
      formData.set("file", file);
      formData.set("contentType", file.type);
    }
  }

  return uploadMediaAction(formData);
};
