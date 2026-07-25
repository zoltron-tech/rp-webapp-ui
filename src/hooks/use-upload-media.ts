import { useCallback } from "react";
import { getPresignedFileUploadObject } from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";
import { ensureWebCompatibleVideo } from "@/utils/video-transcode";
import { useUIContext } from "./use-ui-context";

export const useUploadMedia = () => {
  const { errorToast } = useUIContext();

  const uploadMedia = useCallback(
    async (formData: FormData) => {
      const formDataWithoutFile = new FormData();
      const rawFile = formData.get("file") as Blob;
      const prefix = formData.get("prefix") as string | null;
      const mediaBucket = formData.get("mediaBucket") as string | null;
      const scoped = formData.get("scoped") as string | null;

      // iPhones default to HEVC, which Chrome/Firefox can't play in <video>.
      // Re-encode to H.264 in-browser before it ever reaches S3, falling back
      // to the original file when transcoding isn't needed or isn't possible.
      const file =
        rawFile instanceof File
          ? await ensureWebCompatibleVideo(rawFile)
          : rawFile;
      const contentType =
        file instanceof File
          ? file.type
          : (formData.get("contentType") as string);

      formDataWithoutFile.append("contentType", contentType);
      if (prefix) {
        formDataWithoutFile.append("prefix", prefix);
      }
      if (mediaBucket) {
        formDataWithoutFile.append("mediaBucket", mediaBucket);
      }
      if (scoped) {
        formDataWithoutFile.append("scoped", scoped);
      }

      const presignedRes =
        await getPresignedFileUploadObject(formDataWithoutFile);

      console.log("Presigned URL response", presignedRes);
      if (!presignedRes || typeof presignedRes === "string") {
        errorToast?.("Failed to upload");
        return API_MESSAGE.MediaError;
      }

      const { uploadUrl, fileUrl, method } = presignedRes;

      const s3Res = await fetch(uploadUrl, {
        body: file,
        headers: {
          "Content-Type": contentType,
        },
        method,
      });

      if (!s3Res.ok) {
        console.error("Failed to upload to S3", s3Res.status, s3Res.statusText);
        return API_MESSAGE.MediaError;
      }

      return fileUrl;
    },
    [errorToast],
  );

  return {
    uploadMedia,
  };
};
