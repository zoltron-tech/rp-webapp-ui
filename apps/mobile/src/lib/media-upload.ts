import type { ApiClient } from "@nw/api";
import {
  moderateUpload,
  requestPresignedUpload,
} from "@nw/api/endpoints/profile";
import { API_MESSAGE } from "@nw/types";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/**
 * Picking a file off the phone and getting it into storage, for the muse
 * editors.
 *
 * The presigned path web uses, because *where* the file lands is what the
 * gallery is. A muse's gallery is not a list in the database: the service
 * lists the bucket under `app-media/<account>/<muse>/`, which is the key a
 * presigned upload with the muse id as its prefix produces. This used to go
 * through `POST /s3/upload` instead, whose key is
 * `<account>/uploads/temp…` — the upload succeeded, the activity feed said
 * "uploaded a new video", and the gallery never showed it, because the file
 * was in a folder the listing does not look at. The chat's attachments
 * (`use-attachments`) take the same presigned route for the same reason;
 * see there for why the body goes through `expo-file-system` and not
 * `fetch`.
 */

/** Web's muse editors: 10 MB for a picture, 30 MB for gallery media. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_GALLERY_BYTES = 30 * 1024 * 1024;

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
 * own message rather than "try again".
 */
export interface UploadResult {
  url: string | null;
  rejected: boolean;
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

/**
 * Asks the service to screen a picture just PUT to a presigned URL — the PUT
 * goes straight to S3, so this is the only point the service sees it. `true`
 * when it may be used; `false` when it was refused, by which time the service
 * has deleted it. Video and audio are not screened (nor are they on web).
 */
export const screenUpload = (
  api: ApiClient,
  fileUrl: string,
  contentType: string,
): Promise<boolean> =>
  contentType.startsWith("image/")
    ? moderateUpload(api, fileUrl)
    : Promise.resolve(true);

/**
 * The bytes to storage, then through the NSFW check. Never throws, so a caller
 * decides whether a failure is an alert or a quiet retry.
 */
export const uploadFile = async (
  api: ApiClient,
  file: PickedMedia,
  /** The folder under the account: a muse id for its gallery, as web sends. */
  prefix?: string,
): Promise<UploadResult> => {
  const failed: UploadResult = { rejected: false, url: null };
  try {
    const presigned = await requestPresignedUpload(api, {
      contentType: file.contentType,
      mediaBucket: "APP_MEDIA",
      prefix: prefix ?? null,
    });
    if (presigned === API_MESSAGE.MediaError) return failed;

    const result = await FileSystem.uploadAsync(presigned.uploadUrl, file.uri, {
      headers: { "Content-Type": file.contentType },
      httpMethod: presigned.method as "PUT" | "POST",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });
    if (result.status < 200 || result.status >= 300) return failed;

    if (!(await screenUpload(api, presigned.fileUrl, file.contentType))) {
      return { rejected: true, url: null };
    }
    return { rejected: false, url: presigned.fileUrl };
  } catch {
    return failed;
  }
};
