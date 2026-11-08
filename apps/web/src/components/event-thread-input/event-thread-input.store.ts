import {
  DEFAULT_DIALOG_DESIGN,
  type DialogDesign,
} from "@/components/rich-text-editor-input/dialog-designs";
import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";

type MediaUploadError = "UPLOAD_FAILED" | "FILE_TOO_LARGE" | null;

export type EventThreadInputState = {
  storyBoardEventId: string;
  /**
   * The storyboard the chapter belongs to: pictures in a passage are
   * storyboard media, stored under it and charged to its own limit. Empty
   * until known, and an upload then fails rather than land under the account.
   */
  storyBoardId: string;
  /** Set when editing an existing thread; null when composing a new one. */
  threadId: string | null;
  /** Rich text HTML (may contain embedded muse dialogs). */
  promptText: string | null;
  /** The dialog style fixed on this thread, chosen once at compose time. */
  dialogDesign: DialogDesign;
  /** True while an image is being uploaded to storage. */
  mediaUploading: boolean;
  /** Transient error surfaced by the media (GIF/attachment) controls. */
  mediaUploadError: MediaUploadError;
  /** A GIF URL queued to embed inline in the editor. */
  gifToInsert: string | null;
  /** A local object URL for an image being uploaded (inline placeholder). */
  uploadingImage: { objectUrl: string } | null;
  /** Maps the local placeholder to its final storage URL once uploaded. */
  uploadedImage: { objectUrl: string; finalUrl: string } | null;
  /** A local placeholder whose upload failed and must be removed inline. */
  uploadFailedImage: { objectUrl: string } | null;
};

export const INITIAL_STATE: EventThreadInputState = {
  dialogDesign: DEFAULT_DIALOG_DESIGN,
  gifToInsert: null,
  mediaUploadError: null,
  mediaUploading: false,
  promptText: "",
  storyBoardEventId: "",
  storyBoardId: "",
  threadId: null,
  uploadedImage: null,
  uploadFailedImage: null,
  uploadingImage: null,
};

type EventThreadInputStoreKey = keyof EventThreadInputState;

export const useEventThreadInputState = <K extends EventThreadInputStoreKey>(
  key: K,
) => {
  const getFunction = createGetFunction<EventThreadInputState, K>(key);
  return useStoreState<EventThreadInputState, K>(
    "event-thread-input",
    getFunction,
  );
};

export const useEventThreadInputStoreSet = () => {
  return useStoreSet<EventThreadInputState>("event-thread-input");
};
