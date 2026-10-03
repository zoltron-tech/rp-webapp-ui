import type { ApiClient } from "@nw/api";
import { uploadMedia } from "@nw/api/endpoints/profile";
import { API_MESSAGE } from "@nw/types";
import * as ImagePicker from "expo-image-picker";

/**
 * Picking a file off the phone and getting it into storage, for the muse
 * editors.
 *
 * The same `POST /s3/upload` the post composer uses (`use-composer-media`),
 * because a picture attached to a character from a phone must land in the
 * same bucket under the same shape as one attached from a browser — the
 * backend deletes and replaces by URL, and two URL shapes would be two files
 * it cannot match.
 */

/** Web's muse editors: 10 MB for a picture, 30 MB for gallery media. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_GALLERY_BYTES = 30 * 1024 * 1024;

export interface PickedMedia {
  contentType: string;
  fileSize: number;
  uri: string;
}

/** A React Native multipart file part, which the DOM `FormData` type lacks. */
const filePart = (uri: string, type: string): Blob => {
  const name = uri.split("/").pop() ?? "upload";
  return { name, type, uri } as unknown as Blob;
};

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
 * The bytes to storage. `null` on any failure, so a caller decides whether
 * that is an alert or a quiet retry.
 */
export const uploadFile = async (
  api: ApiClient,
  file: PickedMedia,
  prefix?: string,
): Promise<string | null> => {
  const form = new FormData();
  form.append("file", filePart(file.uri, file.contentType));
  form.append("contentType", file.contentType);
  if (prefix) form.append("prefix", prefix);
  const result = await uploadMedia(api, form).catch(
    () => API_MESSAGE.MediaError,
  );
  return result === API_MESSAGE.MediaError ? null : result;
};
