import type { ApiClient } from "@nw/api";
import {
  checkUploadAllowed,
  describeUploadRefusal,
  getUploadCaps,
  invalidateStorageUsage,
} from "@nw/api/endpoints/profile";
import {
  oversizeMessage,
  type UploadCaps,
  type UploadPurpose,
  type UploadRefusal,
} from "@nw/utils";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import {
  type DirectUploadDeps,
  type DirectUploadFile,
  type DirectUploadOptions,
  runDirectUpload,
} from "./direct-upload";

/**
 * Picking a file off the phone and getting it into storage — every upload on
 * the phone (muse and profile editors, gallery, music, group pictures, the
 * post composer, chat attachments) goes through {@link uploadFileDirect}.
 *
 * Always the presigned path: the bytes go straight to S3
 * (AWS_COST_SECURITY_PLAN.md §2.1–2.2, owner decision 2026-11-08). It is also
 * what puts a file where it belongs. A muse's gallery is not a list in the
 * database: the service lists the bucket under `app-media/<account>/<muse>/`,
 * which is the key a presigned upload with the muse id as its prefix
 * produces. The steps themselves are in `direct-upload.ts`.
 */

export interface PickedMedia {
  contentType: string;
  fileSize: number;
  uri: string;
}

const contentTypeOf = (asset: ImagePicker.ImagePickerAsset): string => {
  if (asset.mimeType) return asset.mimeType;
  if (asset.type === "video") return "video/mp4";
  const extension = asset.uri.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
};

const toPicked = (asset: ImagePicker.ImagePickerAsset): PickedMedia => ({
  contentType: contentTypeOf(asset),
  fileSize: asset.fileSize ?? 0,
  uri: asset.uri,
});

/** One picture from the library, or nothing if the person backed out. */
export const pickImage = async (): Promise<PickedMedia | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.92,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return asset ? toPicked(asset) : null;
};

/** Several pictures or clips at once, for the gallery. */
export const pickMedia = async (limit: number): Promise<PickedMedia[]> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    mediaTypes: ["images", "videos"],
    quality: 0.92,
    selectionLimit: Math.max(1, limit),
  });
  if (result.canceled) return [];
  return result.assets.map(toPicked);
};

/**
 * One audio file, or `null` if the person backed out.
 *
 * Required when asked for, because the picker is native code a build made before
 * it was added does not hold: importing it at the top of this file would stop
 * those builds opening at all. There it rejects, and the caller says so. Not
 * `import()`: Metro's lazy bundles cannot resolve a hoisted package here.
 */
export const pickAudio = async (): Promise<
  (PickedMedia & { name: string }) | null
> => {
  const picker: typeof import("expo-document-picker") = require("expo-document-picker");
  const result = await picker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "audio/*",
  });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  return {
    contentType: asset.mimeType ?? "audio/mpeg",
    fileSize: asset.size ?? 0,
    name: asset.name,
    uri: asset.uri,
  };
};

/**
 * What an upload came to. `url` is null on any failure; `rejected` says the
 * failure was the service's NSFW check refusing the picture, which wants its
 * own message rather than "try again". `refused` says the upload guardrails
 * turned it away (over the size cap, today's limit, storage full) and that
 * the person has already been told why — the caller shows nothing more.
 */
export interface UploadResult {
  url: string | null;
  rejected: boolean;
  refused: boolean;
}

/**
 * The one message for a picture the NSFW check refused, so every upload path
 * says the same thing (APP_STORE_REVIEW_PLAN.md H1).
 */
export const MEDIA_REJECTED_TITLE = "Image not allowed";
export const MEDIA_REJECTED_MESSAGE =
  "This image appears to contain sexual content, which isn't allowed on Novelist World. Please choose another.";

let lastRejectedAlert = 0;

/** Once per batch: several refused pictures from one pick say it once. */
export const alertMediaRejected = () => {
  const now = Date.now();
  if (now - lastRejectedAlert < 2000) return;
  lastRejectedAlert = now;
  Alert.alert(MEDIA_REJECTED_TITLE, MEDIA_REJECTED_MESSAGE);
};

// ─── Upload guardrails (AWS_COST_SECURITY_PLAN.md §2.1–2.2) ─────────────────

let lastRefusedAlert = 0;

/**
 * Once per batch, like {@link alertMediaRejected}: a gallery batch that hits
 * today's limit says so once, not once per file.
 */
const alertUploadRefused = (message: string) => {
  const now = Date.now();
  if (now - lastRefusedAlert < 2000) return;
  lastRefusedAlert = now;
  Alert.alert("Upload not possible", message);
};

/**
 * The service's per-family caps (`limits.caps` on `GET /s3/usage`,
 * AWS_COST_SECURITY_PLAN.md D7), through the shared loader's short cache.
 * `null` when they could not be read: nothing is refused on the phone then,
 * and the service decides. No number lives in the app.
 */
export const loadUploadCaps = (api: ApiClient): Promise<UploadCaps | null> =>
  getUploadCaps(api).catch(() => null);

/**
 * A picker's own check, before it does any work with the file (a crop, an
 * inline preview): the "too large" line when the file is over the service's
 * cap for its family, else `null` (also while the caps are unknown).
 */
export const pickedOversizeMessage = async (
  api: ApiClient,
  file: { contentType: string; fileSize: number },
): Promise<string | null> =>
  oversizeMessage(
    { size: file.fileSize, type: file.contentType },
    await loadUploadCaps(api),
  );

/**
 * Words a refused upload and shows it — every upload path on the phone goes
 * through here, so the copy is the same everywhere.
 */
export const notifyUploadRefused = async (
  api: ApiClient,
  refusal: UploadRefusal,
  contentType?: string | null,
): Promise<void> => {
  const message = await describeUploadRefusal(api, refusal, contentType).catch(
    () => null,
  );
  // The figures behind it have moved (or were stale): read them again next time.
  invalidateStorageUsage();
  if (message) alertUploadRefused(message);
};

/**
 * The check before any byte is sent (AWS_COST_SECURITY_PLAN.md §2.2), from
 * `/s3/usage`: over the service's cap for the family; and, only while the
 * service enforces them, today's bytes left or today's file count, and — for
 * a `personal` upload only — the storage left (post and storyboard media do
 * not count toward it). Alerts the shared copy and returns `false` when
 * refused; `true` when the limits could not be read — the service decides.
 */
export const checkUploadAllowance = async (
  api: ApiClient,
  contentType: string,
  size: number,
  purpose: UploadPurpose = "personal",
): Promise<boolean> => {
  const refusal = await checkUploadAllowed(
    api,
    { size, type: contentType },
    purpose,
  ).catch(() => null);
  if (!refusal) return true;
  await notifyUploadRefused(api, refusal, contentType);
  return false;
};

/**
 * After a file went up: the cached usage is now behind, so the next check in
 * a batch reads `/s3/usage` again rather than counting against old figures.
 */
export const noteUploadDone = (): void => invalidateStorageUsage();

/**
 * The file's exact length on disk, which is what the presign signs and what
 * `uploadAsync` will send. Measured rather than taken from the picker: a
 * picker that re-encodes (the `quality` option) may report the original's
 * size, and a signed length that is off by one byte fails the PUT. `null`
 * when it can't be read (a content:// URI some providers hand out) — the
 * upload then goes without a size, which the service accepts for now
 * (AWS_COST_SECURITY_PLAN.md §2.1).
 */
export const measureUploadSize = async (
  uri: string,
): Promise<number | null> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && !info.isDirectory && info.size > 0) return info.size;
  } catch {
    // Fall through: unknown.
  }
  return null;
};

/**
 * The PUT itself. `expo-file-system/legacy`'s `uploadAsync` with
 * `BINARY_CONTENT` streams the file as the raw body, which is what the
 * signature was issued for; `fetch` can only send a `file://` URI inside
 * multipart, which S3 would store verbatim. SDK 54's new `File` API has no
 * upload, and the package's top-level `uploadAsync` is the deprecated shim.
 */
const putFile = async (
  url: string,
  uri: string,
  { contentType, method }: { contentType: string; method: string },
): Promise<number> => {
  const result = await FileSystem.uploadAsync(url, uri, {
    headers: { "Content-Type": contentType },
    httpMethod: method as "PUT" | "POST" | "PATCH",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });
  return result.status;
};

const nativeDeps = (api: ApiClient): DirectUploadDeps => ({
  measure: measureUploadSize,
  precheck: (contentType, size, purpose) =>
    checkUploadAllowed(api, { size, type: contentType }, purpose),
  put: putFile,
  // The bytes are in storage: the next check in a batch reads usage again.
  stored: noteUploadDone,
});

/**
 * Every upload on the phone: the bytes go straight to S3, never through the
 * service (AWS_COST_SECURITY_PLAN.md §2.1–2.2). Size off the disk → the
 * shared pre-check → presign → PUT → `/s3/moderate`. A refusal at any step
 * (over the cap, today's limit, storage full, deleted as over the cap after
 * the PUT) is worded and shown here and comes back as `refused`; a picture
 * the NSFW screen refused comes back as `rejected` for the caller to say so
 * ({@link alertMediaRejected}). Never throws.
 */
export const uploadFileDirect = async (
  api: ApiClient,
  file: DirectUploadFile,
  options: DirectUploadOptions = {},
): Promise<UploadResult> => {
  const outcome = await runDirectUpload(api, file, options, nativeDeps(api));
  switch (outcome.kind) {
    case "uploaded":
      return { refused: false, rejected: false, url: outcome.url };
    case "rejected":
      return { refused: false, rejected: true, url: null };
    case "refused":
      await notifyUploadRefused(api, outcome.refusal, file.contentType);
      return { refused: true, rejected: false, url: null };
    default:
      return { refused: false, rejected: false, url: null };
  }
};

/**
 * {@link uploadFileDirect} into app media, the muse and profile editors'
 * shorthand. `prefix` is the folder under the account: a muse id for its
 * gallery, as web sends. Personal media: counts toward the account's storage.
 */
export const uploadFile = (
  api: ApiClient,
  file: PickedMedia,
  prefix?: string,
): Promise<UploadResult> => uploadFileDirect(api, file, { prefix });

/**
 * {@link uploadFileDirect} into a storyboard: keyed under the storyboard
 * (`purpose: "storyboard"`, its id as the prefix, `scoped=false`) and charged
 * to the storyboard's own limit, not the account's storage.
 */
export const uploadStoryboardFile = (
  api: ApiClient,
  file: PickedMedia,
  storyboardId: string,
): Promise<UploadResult> =>
  uploadFileDirect(api, file, { purpose: "storyboard", storyboardId });
