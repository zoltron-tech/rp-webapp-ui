import { useCallback } from "react";
import { API_MESSAGE } from "@/utils/constants";
import { uploadMediaWithResult } from "@/utils/upload-media";
import { useUIContext } from "./use-ui-context";

/**
 * The upload hook the editors use. The browser asks the service for a signed
 * URL and PUTs straight to storage, so the file never passes through nginx;
 * the work is the shared direct upload in `utils/upload-media`, which also
 * toasts any refusal (size cap, storage, daily limit, paused, refused image).
 */
export const useUploadMedia = () => {
  const { errorToast } = useUIContext();

  const uploadMedia = useCallback(
    async (formData: FormData): Promise<string | API_MESSAGE.MediaError> => {
      const result = await uploadMediaWithResult(formData);
      if (result.ok) return result.fileUrl;
      // A signed URL that could not be had for no stated reason: say so, as
      // this hook always has. Later failures are left to the caller.
      if (!result.refused && result.stage === "presign") {
        errorToast?.("Failed to upload");
      }
      return API_MESSAGE.MediaError;
    },
    [errorToast],
  );

  return {
    uploadMedia,
  };
};
