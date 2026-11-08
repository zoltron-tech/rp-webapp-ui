import { deleteMedia } from "@nw/api/endpoints/profile";
import { useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import { tooManyMediaMessage, type UploadPurpose } from "@nw/utils";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  alertMediaRejected,
  checkUploadAllowance,
  uploadFileDirect,
} from "@/lib/media-upload";

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
 * ## Straight to S3
 *
 * Through `uploadFileDirect`, like every upload on the phone: presign, PUT,
 * then `/s3/moderate`, which screens the picture (AWS_COST_SECURITY_PLAN.md
 * §2.1–2.2); the bytes never pass through the service. The key is the
 * account's own app-media folder,
 * so `deleteMedia` (called when a picture is removed before posting) still
 * finds it by its URL.
 *
 * ## Cleaning up
 *
 * An uploaded picture that is then removed from the post — or a post that is
 * discarded with pictures in it — leaves an object in storage nobody refers
 * to. Web deletes on removal (`prompt-text-field`'s tracked URLs) and on
 * unmount; the same two moments here, through `reconcile` and `discard`.
 * Sending clears the list without deleting anything: the post now owns them.
 *
 * ## What it is for, and how much
 *
 * `purpose` says where the upload is charged (owner decisions 2026-11-08):
 * `post` for a prompt, comment or reply (not the account's storage),
 * `storyboard` with the `storyboardId` for passages and codex/notes fields
 * (the storyboard's own limit), `personal` otherwise. `maxMedia` caps the
 * pictures in the text plus the attachment (five for posts): at the cap the
 * pickers say so instead of opening, and the save endpoint's 422
 * `too_many_media` is the authority behind it.
 */

/** `upload` gave up because the guardrails refused it, and already said why. */
const REFUSED = "refused" as const;

export interface ComposerAttachment {
  /** The local file, shown while uploading. */
  localUri: string;
  /** Storage URL once uploaded; null while uploading or after a failure. */
  url: string | null;
  contentType: string;
  uploading: boolean;
  failed: boolean;
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

export const useComposerMedia = ({
  limitMessage,
  maxMedia,
  onImageInserted,
  onImageFailed,
  onImageUploaded,
  purpose = "personal",
  storyboardId,
}: {
  /** The picture's local URI, to draw at once while it uploads. */
  onImageInserted: (localUri: string) => void;
  /** The local URI swapped for the storage URL. */
  onImageUploaded: (localUri: string, url: string) => void;
  onImageFailed: (localUri: string) => void;
  /** Where the upload is charged; `personal` unless said otherwise. */
  purpose?: UploadPurpose;
  /** The storyboard the media goes into, for `purpose: "storyboard"`. */
  storyboardId?: string | null;
  /**
   * The most media items the text and the attachment may hold together;
   * unlimited when unset. Counted from the pictures `reconcile` is handed.
   */
  maxMedia?: number;
  /** What to say at the cap; the post line by default. */
  limitMessage?: string;
}) => {
  const api = useApi();
  const [uploadingSources, setUploadingSources] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [attachment, setAttachment] = useState<ComposerAttachment | null>(null);
  /** Pictures in the text, as of the last `reconcile` (local ones included). */
  const [imageCount, setImageCount] = useState(0);

  /** Storage URLs this composer put there and has not yet sent. */
  const tracked = useRef(new Set<string>());

  const callbacks = useRef({ onImageFailed, onImageInserted, onImageUploaded });
  callbacks.current = { onImageFailed, onImageInserted, onImageUploaded };

  // The latest counts for the pickers' check, which runs from callbacks.
  const counts = useRef({ attachment: false, images: 0 });
  counts.current = { attachment: Boolean(attachment), images: imageCount };
  const mediaCount = imageCount + (attachment ? 1 : 0);
  const atMediaLimit = maxMedia !== undefined && mediaCount >= maxMedia;

  /**
   * Whether one more media item fits; says why not (once) when it does not.
   * `replacingAttachment` is for a new video, which takes the place of the
   * attachment rather than adding to it.
   */
  const ensureRoom = useCallback(
    (replacingAttachment = false): boolean => {
      if (maxMedia === undefined) return true;
      const { attachment: hasAttachment, images } = counts.current;
      const used = images + (hasAttachment && !replacingAttachment ? 1 : 0);
      if (used < maxMedia) return true;
      Alert.alert("Media limit reached", limitMessage ?? tooManyMediaMessage());
      return false;
    },
    [limitMessage, maxMedia],
  );

  /**
   * The storage URL, `null` on a failure, `MediaRejected` when the service's
   * NSFW check refused the picture (and deleted it), or `REFUSED` when the
   * upload guardrails turned it away (size cap, today's limit, storage full)
   * — the person has been told why by then. The usage refresh after the PUT
   * happens inside `uploadFileDirect`.
   */
  const upload = useCallback(
    async (
      uri: string,
      type: string,
      fileSize?: number | null,
    ): Promise<string | API_MESSAGE.MediaRejected | typeof REFUSED | null> => {
      const result = await uploadFileDirect(
        api,
        { contentType: type, fileSize, uri },
        { purpose, storyboardId },
      );
      if (result.refused) return REFUSED;
      if (result.rejected) return API_MESSAGE.MediaRejected;
      return result.url;
    },
    [api, purpose, storyboardId],
  );

  /**
   * The service's cap for the family, and its storage and daily limits while
   * enforced (AWS_COST_SECURITY_PLAN.md §2.2) — alerts the shared copy and
   * returns `false` when refused, before the picture is drawn into the text.
   */
  const accept = useCallback(
    (asset: ImagePicker.ImagePickerAsset): Promise<boolean> =>
      checkUploadAllowance(
        api,
        contentTypeOf(asset),
        asset.fileSize ?? 0,
        purpose,
      ),
    [api, purpose],
  );

  /** A picture from the library, into the text. */
  const pickImage = useCallback(async () => {
    if (!ensureRoom()) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset || !(await accept(asset))) return;

    const local = asset.uri;
    const type = contentTypeOf(asset);
    setUploadingSources((current) => new Set(current).add(local));
    callbacks.current.onImageInserted(local);

    const url = await upload(local, type, asset.fileSize);
    setUploadingSources((current) => {
      const next = new Set(current);
      next.delete(local);
      return next;
    });

    if (!url || url === API_MESSAGE.MediaRejected || url === REFUSED) {
      callbacks.current.onImageFailed(local);
      if (url === API_MESSAGE.MediaRejected) alertMediaRejected();
      else if (!url) Alert.alert("Upload failed", "Please try again.");
      return;
    }
    tracked.current.add(url);
    callbacks.current.onImageUploaded(local, url);
  }, [accept, ensureRoom, upload]);

  /** A video, as the post's attachment. */
  const pickVideo = useCallback(async () => {
    if (!ensureRoom(true)) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset || !(await accept(asset))) return;

    const entry: ComposerAttachment = {
      contentType: contentTypeOf(asset),
      failed: false,
      localUri: asset.uri,
      uploading: true,
      url: null,
    };
    setAttachment(entry);

    // Videos are not screened, so this is never `MediaRejected`; the check is
    // for the type's sake.
    const uploaded = await upload(
      entry.localUri,
      entry.contentType,
      asset.fileSize,
    );
    const url =
      uploaded === API_MESSAGE.MediaRejected || uploaded === REFUSED
        ? null
        : uploaded;
    setAttachment((current) =>
      current?.localUri === entry.localUri
        ? { ...current, failed: !url, uploading: false, url }
        : current,
    );
    if (url) tracked.current.add(url);
    else if (uploaded !== REFUSED)
      Alert.alert("Upload failed", "Please try again.");
  }, [accept, ensureRoom, upload]);

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
      setImageCount(sources.length);
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
    setImageCount(0);
  }, []);

  /** The post was abandoned: nothing uploaded belongs to anyone. */
  const discard = useCallback(() => {
    for (const url of tracked.current) void deleteMedia(api, url);
    tracked.current.clear();
    setAttachment(null);
    setUploadingSources(new Set());
    setImageCount(0);
  }, [api]);

  // The composer unmounting mid-draft is a discard, as web's unmount is.
  const discardRef = useRef(discard);
  discardRef.current = discard;
  useEffect(() => () => discardRef.current(), []);

  return {
    atMediaLimit,
    attachment,
    attachUrl,
    commit,
    discard,
    ensureRoom,
    isUploading: uploadingSources.size > 0 || Boolean(attachment?.uploading),
    mediaCount,
    pickImage,
    pickVideo,
    reconcile,
    removeAttachment,
    uploadingSources,
  };
};
