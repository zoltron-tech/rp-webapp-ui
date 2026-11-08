import { invalidateStorageUsage } from "@nw/api/endpoints/profile";
import { useApi } from "@nw/features";
import type { UploadCaps } from "@nw/utils";
import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";
import { loadUploadCaps } from "@/lib/media-upload";

/**
 * The service's per-file upload caps (`limits.caps` on `GET /s3/usage`,
 * AWS_COST_SECURITY_PLAN.md D7), for hint text next to a picker. Read through
 * the shared loader's short cache, so screens that mount together ask once.
 * `null` until loaded or when unreadable: a hint then leaves the number out
 * rather than show one the service did not send.
 */
export const useUploadCaps = (): UploadCaps | null => {
  const api = useApi();
  const [caps, setCaps] = useState<UploadCaps | null>(null);

  useEffect(() => {
    let live = true;
    void loadUploadCaps(api).then((result) => {
      if (live) setCaps(result);
    });
    return () => {
      live = false;
    };
  }, [api]);

  return caps;
};

/**
 * Reads the service's upload limits once after sign-in, once the launch has
 * settled: the media hosts reach `toMediaUrl` (AWS_COST_SECURITY_PLAN.md §3.2)
 * and the caps are ready for the first picker. Leaving the signed-in state
 * drops the cached usage, which is the account's own.
 */
export const usePrimeUploadLimits = (signedIn: boolean): void => {
  const api = useApi();

  useEffect(() => {
    if (!signedIn) {
      invalidateStorageUsage();
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      void loadUploadCaps(api);
    });
    return () => task.cancel();
  }, [api, signedIn]);
};
