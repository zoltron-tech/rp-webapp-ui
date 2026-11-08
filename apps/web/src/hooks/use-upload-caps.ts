import { capForType, type UploadCaps } from "@nw/utils";
import { useCallback, useEffect, useState } from "react";
import { getUploadCaps } from "@/app/rp/profile/actions";

/**
 * The service's per-file upload caps (`limits.caps` on `GET /s3/usage`,
 * AWS_COST_SECURITY_PLAN.md D7), for a picker's own check before it does any
 * work, and for hint text. Read through the shared loader's short cache, which
 * the app primes after login, so this is usually ready on first render.
 *
 * `caps` is `null` until loaded, or when the limits could not be read; `capFor`
 * is then `Infinity` — nothing is refused here and the upload helpers (which
 * check again before sending) and the service decide. No number lives in the
 * client.
 */
export const useUploadCaps = () => {
  const [caps, setCaps] = useState<UploadCaps | null>(null);

  useEffect(() => {
    let live = true;
    getUploadCaps()
      .catch(() => null)
      .then((result) => {
        if (live) setCaps(result);
      });
    return () => {
      live = false;
    };
  }, []);

  const capFor = useCallback(
    (contentType: string | null | undefined) => capForType(contentType, caps),
    [caps],
  );

  return { capFor, caps };
};
