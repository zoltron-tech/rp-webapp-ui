import { useApi } from "@nw/features";
import { capForType, formatBytes } from "@nw/utils";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { loadUploadCaps, uploadFileDirect } from "@/lib/media-upload";

/**
 * Picking images and videos off the phone and getting them into a message.
 *
 * The upload path is the web app's, deliberately: ask portfolio-service for a
 * presigned S3 URL, then PUT the bytes straight to S3. The file never passes
 * through nginx, and the two clients produce URLs of the same shape in the same
 * bucket — an attachment sent from a phone is indistinguishable from one sent
 * from a browser, which is the point.
 *
 * The steps (size off the disk, the shared pre-check, presign, the PUT through
 * `expo-file-system` — `fetch` cannot send a `file://` URI as a raw body —
 * and `/s3/moderate`) are `uploadFileDirect`'s, shared with every other upload
 * on the phone. For chat media the confirm only records the real size and
 * enforces the cap: private messages are not screened (owner decision,
 * APP_STORE_REVIEW_PLAN.md H1), and the service answers 200 for chat-media/
 * keys without looking.
 *
 * ## Uploads start immediately
 *
 * Not on send. A 20 MB video uploading while you type is a video that is ready
 * when you press send; uploading at send time is a progress bar in front of a
 * message someone has already finished writing. The cost is orphaned objects in
 * S3 when an attachment is picked and then removed — the web composer has the
 * same trade and deletes on removal, which needs a signed-in delete call this
 * hook deliberately does not make (see `remove`).
 */

/**
 * Matches the web composer. Size is held to the service's cap for each file's
 * family (`limits.caps` on `/s3/usage`, AWS_COST_SECURITY_PLAN.md D7); no
 * number lives here.
 */
const MAX_FILES = 10;

/** What `CHAT_MEDIA` accepts, and what both message renderers can draw. */
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "video/mp4",
]);

export interface PendingAttachment {
  /** Stable across the upload; the key for lists and the handle for removal. */
  id: string;
  /** The local file, shown as the thumbnail before (and during) the upload. */
  localUri: string;
  contentType: string;
  /** The picker's reported size, for the pre-check when the file cannot be measured. */
  fileSize?: number | null;
  /** Set once S3 has the bytes. Null while uploading, and after a failure. */
  url: string | null;
  uploading: boolean;
  failed: boolean;
}

/** The extension an S3 key should carry, derived from the picked asset. */
const contentTypeOf = (asset: ImagePicker.ImagePickerAsset): string => {
  if (asset.mimeType) return asset.mimeType;
  // `mimeType` is absent on some Android providers. The extension is the only
  // other thing the asset carries, and S3 needs *a* content type to sign.
  const extension = asset.uri.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (asset.type === "video") return "video/mp4";
  if (extension === "png") return "image/png";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
};

export const useAttachments = (conversationId: string | undefined) => {
  const api = useApi();
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const counter = useRef(0);

  /**
   * The storage URL, or `null` on any failure. A refusal (the cap, today's
   * limit — chat media counts toward the daily limit, not the storage total)
   * has been shown by then; the tile reads as failed either way, with retry.
   */
  const upload = useCallback(
    async (entry: PendingAttachment): Promise<string | null> => {
      const result = await uploadFileDirect(
        api,
        {
          contentType: entry.contentType,
          fileSize: entry.fileSize,
          uri: entry.localUri,
        },
        {
          mediaBucket: "CHAT_MEDIA",
          // The same prefix web sends, so chat media from the two clients
          // lands in the same place in the bucket, not in two parallel trees.
          prefix: conversationId ?? "chat-media",
        },
      );
      return result.url;
    },
    [api, conversationId],
  );

  /** Fires one upload and folds its result back into the entry. */
  const start = useCallback(
    (entry: PendingAttachment) => {
      void upload(entry)
        .catch(() => null)
        .then((url) => {
          setAttachments((previous) =>
            previous.map((item) =>
              item.id === entry.id
                ? { ...item, failed: !url, uploading: false, url }
                : item,
            ),
          );
        });
    },
    [upload],
  );

  const add = useCallback(
    async (assets: ImagePicker.ImagePickerAsset[]) => {
      const room = MAX_FILES - attachments.length;
      const rejected: string[] = [];
      // Unknown caps refuse nothing here; the upload check and service decide.
      const caps = await loadUploadCaps(api);

      const accepted = assets.filter((asset) => {
        const type = contentTypeOf(asset);
        if (!ALLOWED.has(type)) {
          rejected.push("Only PNG, JPG, GIF, WebP and MP4 can be sent.");
          return false;
        }
        const limit = capForType(type, caps);
        if ((asset.fileSize ?? 0) > limit) {
          rejected.push(
            `"${asset.fileName ?? "That file"}" is over ${formatBytes(limit)}.`,
          );
          return false;
        }
        return true;
      });

      if (rejected.length) {
        Alert.alert("Not attached", [...new Set(rejected)].join("\n"));
      }
      if (accepted.length === 0) return;

      const entries: PendingAttachment[] = accepted
        .slice(0, room)
        .map((asset) => {
          counter.current += 1;
          return {
            contentType: contentTypeOf(asset),
            failed: false,
            fileSize: asset.fileSize ?? null,
            id: `attachment-${Date.now()}-${counter.current}`,
            localUri: asset.uri,
            uploading: true,
            url: null,
          };
        });

      setAttachments((previous) => [...previous, ...entries]);
      for (const entry of entries) start(entry);
    },
    [api, attachments.length, start],
  );

  /**
   * Uploads one entry again after a failure.
   *
   * The local file is still on disk and the entry still holds its URI, so a
   * retry costs one request rather than sending the person back to the picker
   * to find the same photo — which is what a failed tile with no retry amounts
   * to. A new presigned URL is requested each time: signatures expire, and a
   * retry minutes later against the old one is a second failure that looks
   * identical to the first.
   */
  const retry = useCallback(
    (id: string) => {
      const entry = attachments.find((item) => item.id === id);
      if (!entry || entry.uploading) return;
      setAttachments((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, failed: false, uploading: true } : item,
        ),
      );
      start({ ...entry, failed: false, uploading: true });
    },
    [attachments, start],
  );

  /**
   * The system photo picker.
   *
   * No permission request in front of it: SDK 54's picker uses the platform's
   * own limited-access flow, which grants access to exactly the items the
   * person chose and needs no library permission at all on either OS. Asking
   * for the whole library first is a prompt people decline, and declining it
   * used to disable the feature outright.
   */
  const pick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images", "videos"],
      quality: 0.9,
      selectionLimit: MAX_FILES - attachments.length,
    });
    if (result.canceled) return;
    void add(result.assets);
  }, [add, attachments.length]);

  const capture = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera unavailable",
        "Novelist World needs camera access to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (result.canceled) return;
    void add(result.assets);
  }, [add]);

  /**
   * Drops an attachment from the draft.
   *
   * The uploaded object is left in S3 rather than deleted. Web deletes it, and
   * can: it holds a session in a cookie and the delete is a same-origin call.
   * Here the same call would race the upload it is cancelling — the URL only
   * exists once the PUT finishes — and a delete for a half-written object
   * returns success while leaving the bytes behind. Lifecycle rules on the
   * bucket are the right place for unreferenced chat media, not a best-effort
   * call from a phone that may be about to lose signal.
   */
  const remove = useCallback((id: string) => {
    setAttachments((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setAttachments([]), []);

  return {
    add,
    attachments,
    capture,
    clear,
    /** How many uploads are sitting in a failed state, for the strip's label. */
    failedCount: attachments.filter((item) => item.failed).length,
    /** True while anything is still going up — the send button waits on it. */
    isUploading: attachments.some((item) => item.uploading),
    pick,
    remove,
    retry,
    /** What goes on the wire: the ones that actually made it to S3. */
    uploadedUrls: attachments
      .filter((item) => item.url)
      .map((item) => item.url as string),
  };
};
