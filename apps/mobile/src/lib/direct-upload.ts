import type { ApiClient } from "@nw/api";
import {
  readUploadRefusal,
  requestPresignedUpload,
} from "@nw/api/endpoints/profile";
import { API_MESSAGE } from "@nw/types";
import {
  isUploadRefusal,
  type UploadPurpose,
  type UploadRefusal,
} from "@nw/utils";

/**
 * The direct upload, step by step, with the phone's parts handed in — so it
 * holds no React Native import and runs under `node --test`
 * (`apps/mobile/test/direct-upload.test.ts`). `media-upload.ts` wires the
 * real parts (`expo-file-system`, the shared pre-check, the alerts) and is
 * what every screen calls.
 *
 * The bytes never pass through the service (AWS_COST_SECURITY_PLAN.md
 * §2.1–2.2): presign with the exact size → PUT straight to S3 → confirm
 * through `/s3/moderate`, which records the real size in the ledger, deletes
 * a file over its family's cap (413) and screens pictures (422).
 */

const MODERATE_PATH = "/rp/portfolio/s3/moderate";

export type UploadBucket = "APP_MEDIA" | "CHAT_MEDIA";

export interface DirectUploadFile {
  uri: string;
  /** The exact MIME type: it is signed into the URL and sent on the PUT. */
  contentType: string;
  /** The picker's number. Only for the pre-check when the file can't be measured. */
  fileSize?: number | null;
}

export interface DirectUploadOptions {
  /** `APP_MEDIA` unless said otherwise. */
  mediaBucket?: UploadBucket;
  /** The folder under the account: a muse id for its gallery, a conversation id for chat. */
  prefix?: string | null;
  /** False drops the per-user segment from the key (left to the service's default when unset). */
  scoped?: boolean;
  /**
   * What the upload is for: `personal` (the default, counts toward the
   * account's storage), `post` (prompt, comment and reply media) or
   * `storyboard` (needs `storyboardId`, which becomes the key prefix with
   * `scoped=false`).
   */
  purpose?: UploadPurpose;
  /** The storyboard the file goes into, for `purpose: "storyboard"`. */
  storyboardId?: string | null;
}

export interface DirectUploadDeps {
  /** The file's exact length on disk, or `null` when it can't be read. */
  measure: (uri: string) => Promise<number | null>;
  /**
   * The client's check before any byte goes: a refusal, or `null` to go
   * ahead. The purpose decides whether the account's storage total applies.
   */
  precheck: (
    contentType: string,
    size: number,
    purpose: UploadPurpose,
  ) => Promise<UploadRefusal | null>;
  /** The PUT to the signed URL; resolves to the HTTP status. */
  put: (
    url: string,
    uri: string,
    request: { method: string; contentType: string },
  ) => Promise<number>;
  /** Called once the bytes are in storage, whatever the confirm says next. */
  stored?: () => void;
}

export type DirectUploadOutcome =
  | { kind: "uploaded"; url: string; size: number | null }
  /** The pre-check, the presign or the confirm said no; nothing is stored. */
  | { kind: "refused"; refusal: UploadRefusal }
  /** The NSFW screen refused the picture and deleted it. */
  | { kind: "rejected" }
  | { kind: "failed"; stage: "presign" | "put" | "error" };

/**
 * `POST /s3/moderate` for a file just PUT: `"ok"`, `"rejected"` (422, the
 * screen refused it and the object is gone) or the refusal off a 413
 * (`size_over_cap`, deleted). Anything else — 400, 401, a network failure, a
 * service that predates the route — is `"ok"`: the check fails open, as
 * `moderateUpload` and the service do. Chat media answers 200 unscreened.
 *
 * Its own call rather than `moderateUpload` because that one folds the 413
 * into "allowed", which would hand back the URL of a deleted object.
 */
export const confirmUpload = async (
  api: ApiClient,
  fileUrl: string,
): Promise<"ok" | "rejected" | UploadRefusal> => {
  try {
    const response = await api.raw(MODERATE_PATH, {
      body: { fileUrl },
      label: "moderateUpload",
      method: "POST",
    });
    if (response.status === 422) return "rejected";
    return (await readUploadRefusal(response)) ?? "ok";
  } catch {
    return "ok";
  }
};

const positive = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;

/** Never throws: every failure is an outcome. */
export const runDirectUpload = async (
  api: ApiClient,
  file: DirectUploadFile,
  options: DirectUploadOptions,
  deps: DirectUploadDeps,
): Promise<DirectUploadOutcome> => {
  try {
    const purpose = options.purpose ?? "personal";
    // A storyboard upload with no storyboard to put it in goes nowhere:
    // `requestPresignedUpload` would refuse it too, but nothing is measured
    // or checked first.
    if (purpose === "storyboard" && !options.storyboardId?.trim()) {
      return { kind: "failed", stage: "presign" };
    }

    // Measured, not the picker's number: a re-encoding picker can report the
    // original's size, and S3 refuses a PUT of any length but the signed one.
    // Unknown is sent as no size at all (the service allows that for one
    // release cycle, §2.1).
    const size = positive(await deps.measure(file.uri).catch(() => null));

    const refusal = await deps
      .precheck(file.contentType, size ?? positive(file.fileSize) ?? 0, purpose)
      .catch(() => null);
    if (refusal) return { kind: "refused", refusal };

    const presigned = await requestPresignedUpload(api, {
      contentType: file.contentType,
      mediaBucket: options.mediaBucket ?? "APP_MEDIA",
      prefix: options.prefix ?? null,
      purpose,
      scoped: options.scoped,
      size,
      storyboardId: options.storyboardId ?? null,
    });
    if (isUploadRefusal(presigned)) {
      return { kind: "refused", refusal: presigned };
    }
    if (presigned === API_MESSAGE.MediaError) {
      return { kind: "failed", stage: "presign" };
    }

    const status = await deps.put(presigned.uploadUrl, file.uri, {
      contentType: file.contentType,
      method: presigned.method || "PUT",
    });
    if (status < 200 || status >= 300) return { kind: "failed", stage: "put" };
    deps.stored?.();

    const verdict = await confirmUpload(api, presigned.fileUrl);
    if (verdict === "rejected") return { kind: "rejected" };
    if (verdict !== "ok") return { kind: "refused", refusal: verdict };
    return { kind: "uploaded", size, url: presigned.fileUrl };
  } catch {
    return { kind: "failed", stage: "error" };
  }
};
