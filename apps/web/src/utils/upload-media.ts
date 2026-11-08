/**
 * Every web media upload (AWS_COST_SECURITY_PLAN.md §2.1–2.2).
 *
 * The bytes go straight to storage and never through the service: the shared
 * `uploadMediaDirect` checks the file against the service's limits from
 * `/s3/usage`, asks for a URL signed with the exact size, PUTs the bytes with
 * the signed `Content-Type`, then confirms with `/s3/moderate` (the ledger's
 * confirm and the NSFW screen). A refusal — made on this side or by the
 * service — is worded by the shared copy and toasted here, so every upload
 * surface says the same thing without each screen knowing the codes. No limit
 * is written into the client.
 *
 * First, the one fixup that has to happen in the browser: iPhones default to
 * HEVC, which Chrome/Firefox cannot play in `<video>`, so the file is
 * re-encoded to H.264 before it goes anywhere (WebCodecs only exists here).
 */

import type { DirectUploadResult } from "@nw/api/endpoints/profile";
import {
  capForType,
  oversizeMessage,
  UPLOAD_FAILED_MESSAGE,
  type UploadCandidate,
  type UploadPurpose,
} from "@nw/utils";
import {
  getUploadCaps,
  uploadMediaDirectAction,
} from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";
import { generateToastError } from "@/utils/helpers/toast";
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
    file instanceof File ? file.type : (formData.get("contentType") as string);

  return {
    changed: !!file && file !== rawFile,
    contentType,
    file: file as Blob,
  };
};

/**
 * An error toast outside React. The toast helpers take the theme for a
 * signature they no longer use (they style through CSS classes), so none is
 * needed here.
 */
const toastError = (message: string) =>
  generateToastError(message, undefined as never);

/**
 * The service's cap for a MIME type, for a picker's own check before it does
 * any work (a crop, a preview). `Infinity` when the limits could not be read:
 * nothing is refused here then, and the service decides.
 */
export const loadUploadCap = async (contentType: string): Promise<number> =>
  capForType(contentType, await getUploadCaps().catch(() => null));

/**
 * The "too large" line for a picked file over the service's cap for its
 * family, or `null` (also while the caps are unknown).
 */
export const loadOversizeMessage = async (
  file: UploadCandidate,
): Promise<string | null> =>
  oversizeMessage(file, await getUploadCaps().catch(() => null));

const PURPOSES: readonly UploadPurpose[] = ["personal", "post", "storyboard"];

/** The form's `purpose`, `personal` when absent or not one of the three. */
const purposeOf = (formData: FormData): UploadPurpose => {
  const value = formData.get("purpose");
  return PURPOSES.find((purpose) => purpose === value) ?? "personal";
};

/**
 * The form fields that say what an upload is for, for the callers that set
 * them: `post` for prompt, comment and reply media; `storyboard` with the
 * storyboard's id (stored under it, `scoped=false`, on its own limit).
 * Personal uploads set nothing.
 */
export const appendUploadPurpose = (
  formData: FormData,
  purpose: Exclude<UploadPurpose, "personal">,
  storyboardId?: string | null,
): void => {
  formData.append("purpose", purpose);
  if (purpose === "storyboard" && storyboardId) {
    formData.append("storyboardId", storyboardId);
  }
};

/**
 * Uploads the `file` entry of `formData` straight to storage and says how it
 * went. Reads `prefix`, `mediaBucket` (`APP_MEDIA` unless given; `CHAT_MEDIA`
 * for private messages), `scoped` (`"false"` drops the account segment),
 * `purpose` (`personal` unless given) and `storyboardId` (for `storyboard`;
 * without it the upload fails rather than land under the account) off the
 * same form — see {@link appendUploadPurpose}. A refusal's shared copy is
 * toasted here; a plain failure is left to the caller. Never throws.
 */
export const uploadMediaWithResult = async (
  formData: FormData,
): Promise<DirectUploadResult> => {
  const { file, contentType } = await prepareUploadFile(formData);
  const result = await uploadMediaDirectAction({
    body: file,
    contentType,
    mediaBucket: (formData.get("mediaBucket") as string | null) || null,
    prefix: (formData.get("prefix") as string | null) || null,
    purpose: purposeOf(formData),
    scoped: formData.get("scoped") !== "false",
    size: file?.size ?? null,
    storyboardId: (formData.get("storyboardId") as string | null) || null,
  }).catch(
    (): DirectUploadResult => ({
      message: UPLOAD_FAILED_MESSAGE,
      ok: false,
      refused: false,
      stage: "put",
    }),
  );
  if (!result.ok && result.refused) toastError(result.message);
  return result;
};

/**
 * {@link uploadMediaWithResult}, as the URL or `MediaError` — the shape every
 * upload surface compares against.
 */
export const uploadMedia = async (
  formData: FormData,
): Promise<string | API_MESSAGE.MediaError> => {
  const result = await uploadMediaWithResult(formData);
  return result.ok ? result.fileUrl : API_MESSAGE.MediaError;
};
