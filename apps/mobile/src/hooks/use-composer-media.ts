import { deleteMedia, uploadMedia } from "@nw/api/endpoints/profile";
import { useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

/**
 * Pictures into the post, and one video alongside it — web's
 * `PromptMediaInput` and `PromptTextField` between them.
 *
 * Web's rule, kept: an *image* goes into the text as an inline picture, and
 * anything else — a video — becomes the prompt's `media` attachment, shown
 * under the text. It is a rule worth keeping because the two are stored in
 * different places (the body's HTML versus the prompt's `media` column) and a
 * phone that put pictures where web puts videos would render on web as a
 * post with a picture *and* an empty body.
 *
 * ## Uploading through the service, not straight to S3
 *
 * The chat composer PUTs to a presigned URL. This uses `POST /s3/upload`
 * through the portfolio service, because that is what web's prompt input
 * does, and the two have to land in the same bucket under the same prefix —
 * an inline picture posted from a phone should be indistinguishable from one
 * posted from a browser, and `deleteMedia` (which web calls when a picture is
 * removed before posting) has to be able to find it.
 *
 * React Native's `FormData` takes `{ uri, name, type }` for a file part and
 * `fetch` streams the file as multipart, which is exactly what the endpoint
 * reads. The presigned path is the wrong tool here for the reason
 * `use-attachments` gives about multipart — the service, unlike S3, wants
 * multipart.
 *
 * ## Cleaning up
 *
 * An uploaded picture that is then removed from the post — or a post that is
 * discarded with pictures in it — leaves an object in storage nobody refers
 * to. Web deletes on removal (`prompt-text-field`'s tracked URLs) and on
 * unmount; the same two moments here, through `reconcile` and `discard`.
 * Sending clears the list without deleting anything: the post now owns them.
 */

/** Web's `MAX_FILE_SIZE`. */
const MAX_BYTES = 10 * 1024 * 1024;

export interface ComposerAttachment {
  /** The local file, shown while uploading. */
  localUri: string;
  /** Storage URL once uploaded; null while uploading or after a failure. */
  url: string | null;
  contentType: string;
  uploading: boolean;
  failed: boolean;
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

export const useComposerMedia = ({
  onImageInserted,
  onImageFailed,
  onImageUploaded,
}: {
  /** The picture's local URI, to draw at once while it uploads. */
  onImageInserted: (localUri: string) => void;
  /** The local URI swapped for the storage URL. */
  onImageUploaded: (localUri: string, url: string) => void;
  onImageFailed: (localUri: string) => void;
}) => {
  const api = useApi();
  const [uploadingSources, setUploadingSources] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [attachment, setAttachment] = useState<ComposerAttachment | null>(null);

  /** Storage URLs this composer put there and has not yet sent. */
  const tracked = useRef(new Set<string>());

  const callbacks = useRef({ onImageFailed, onImageInserted, onImageUploaded });
  callbacks.current = { onImageFailed, onImageInserted, onImageUploaded };

  const upload = useCallback(
    async (uri: string, type: string): Promise<string | null> => {
      const form = new FormData();
      form.append("file", filePart(uri, type));
      const result = await uploadMedia(api, form).catch(
        () => API_MESSAGE.MediaError,
      );
      return result === API_MESSAGE.MediaError ? null : result;
    },
    [api],
  );

  const accept = useCallback((asset: ImagePicker.ImagePickerAsset): boolean => {
    if ((asset.fileSize ?? 0) > MAX_BYTES) {
      Alert.alert("Attachment is too large", "Maximum file size is 10 MB.");
      return false;
    }
    return true;
  }, []);

  /** A picture from the library, into the text. */
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset || !accept(asset)) return;

    const local = asset.uri;
    const type = contentTypeOf(asset);
    setUploadingSources((current) => new Set(current).add(local));
    callbacks.current.onImageInserted(local);

    const url = await upload(local, type);
    setUploadingSources((current) => {
      const next = new Set(current);
      next.delete(local);
      return next;
    });

    if (!url) {
      callbacks.current.onImageFailed(local);
      Alert.alert("Upload failed", "Please try again.");
      return;
    }
    tracked.current.add(url);
    callbacks.current.onImageUploaded(local, url);
  }, [accept, upload]);

  /** A video, as the post's attachment. */
  const pickVideo = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset || !accept(asset)) return;

    const entry: ComposerAttachment = {
      contentType: contentTypeOf(asset),
      failed: false,
      localUri: asset.uri,
      uploading: true,
      url: null,
    };
    setAttachment(entry);

    const url = await upload(entry.localUri, entry.contentType);
    setAttachment((current) =>
      current?.localUri === entry.localUri
        ? { ...current, failed: !url, uploading: false, url }
        : current,
    );
    if (url) tracked.current.add(url);
    else Alert.alert("Upload failed", "Please try again.");
  }, [accept, upload]);

  /** A clip from the tray: already hosted, nothing to upload. */
  const attachUrl = useCallback((url: string, contentType: string) => {
    setAttachment({
      contentType,
      failed: false,
      localUri: url,
      uploading: false,
      url,
    });
  }, []);

  const removeAttachment = useCallback(() => {
    setAttachment((current) => {
      if (current?.url && tracked.current.has(current.url)) {
        tracked.current.delete(current.url);
        void deleteMedia(api, current.url);
      }
      return null;
    });
  }, [api]);

  /**
   * Called with the pictures the document still refers to; anything this
   * composer uploaded that is no longer among them is deleted from storage.
   */
  const reconcile = useCallback(
    (sources: string[]) => {
      const present = new Set(sources);
      for (const url of tracked.current) {
        if (!present.has(url)) {
          tracked.current.delete(url);
          void deleteMedia(api, url);
        }
      }
    },
    [api],
  );

  /** The post was sent: everything uploaded now belongs to it. */
  const commit = useCallback(() => {
    tracked.current.clear();
    setAttachment(null);
    setUploadingSources(new Set());
  }, []);

  /** The post was abandoned: nothing uploaded belongs to anyone. */
  const discard = useCallback(() => {
    for (const url of tracked.current) void deleteMedia(api, url);
    tracked.current.clear();
    setAttachment(null);
    setUploadingSources(new Set());
  }, [api]);

  // The composer unmounting mid-draft is a discard, as web's unmount is.
  const discardRef = useRef(discard);
  discardRef.current = discard;
  useEffect(() => () => discardRef.current(), []);

  return {
    attachment,
    attachUrl,
    commit,
    discard,
    isUploading: uploadingSources.size > 0 || Boolean(attachment?.uploading),
    pickImage,
    pickVideo,
    reconcile,
    removeAttachment,
    uploadingSources,
  };
};
