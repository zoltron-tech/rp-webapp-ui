import { useCallback } from "react";
import { getPresignedFileUploadObject } from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { prepareUploadFile } from "@/utils/upload-media";
import { useUIContext } from "./use-ui-context";

/**
 * The presigned upload path: the browser asks the service for a signed URL and
 * then PUTs straight to S3, so the file never passes through nginx.
 */
export const useUploadMedia = () => {
  const { errorToast } = useUIContext();

  const uploadMedia = useCallback(
    async (formData: FormData) => {
      const { file, contentType } = await prepareUploadFile(formData);

      // The presign request carries only the metadata — sending the file here
      // would upload it twice.
      const presignRequest = new FormData();
      presignRequest.append("contentType", contentType);
      for (const key of ["prefix", "mediaBucket", "scoped"] as const) {
        const value = formData.get(key) as string | null;
        if (value) presignRequest.append(key, value);
      }

      const presignedRes = await getPresignedFileUploadObject(presignRequest);

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
        Logger.error("Failed to upload to S3", s3Res.status, s3Res.statusText);
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
