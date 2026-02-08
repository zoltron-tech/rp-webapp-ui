import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { EventThreadType } from "@/types";

type MediaUploadError =
  | "INVALID_FILE_TYPE"
  | "UPLOAD_FAILED"
  | "FILE_TOO_LARGE"
  | null;

export type EventThreadInputState = {
  storyBoardEventId: string;
  type: EventThreadType;
  mediaUploading: boolean;
  mediaUploadError: MediaUploadError;
  media: File | null;
  promptText: string | null;
};

export const INITIAL_STATE: EventThreadInputState = {
  media: null,
  mediaUploadError: null,
  mediaUploading: false,
  promptText: "",
  storyBoardEventId: "",
  type: "NARRATION",
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
