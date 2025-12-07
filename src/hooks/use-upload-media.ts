import { useCallback } from "react";
import { getPresignedFileUploadObject } from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";
import { useUIContext } from "./use-ui-context";

export const useUploadMedia = () => {
  const { errorToast } = useUIContext();

  const uploadMedia = useCallback(
    async (formData: FormData) => {
      const formDataWithoutFile = new FormData();
      const file = formData.get("file") as Blob;
      const contentType = formData.get("contentType") as string;
      const prefix = formData.get("prefix") as string;

      formDataWithoutFile.append("contentType", contentType);
      formDataWithoutFile.append("prefix", prefix);
      const presignedRes =
        await getPresignedFileUploadObject(formDataWithoutFile);

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
