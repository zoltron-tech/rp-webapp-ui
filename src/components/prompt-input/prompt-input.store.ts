import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { SubmitPromptType } from "@/types";

type MediaUploadError =
  | "INVALID_FILE_TYPE"
  | "UPLOAD_FAILED"
  | "FILE_TOO_LARGE"
  | null;

export type PromptInputState = {
  parentId: string;
  type: SubmitPromptType;
  mediaUploading: boolean;
  mediaUploadError: MediaUploadError;
  media: File | null;
  promptText: string | null;
  gifToInsert: string | null;
};

export const INITIAL_STATE: PromptInputState = {
  gifToInsert: null,
  media: null,
  mediaUploadError: null,
  mediaUploading: false,
  parentId: "",
  promptText: "",
  type: "prompt",
};

type PromptInputStoreKey = keyof PromptInputState;

export const usePromptInputState = <K extends PromptInputStoreKey>(key: K) => {
  const getFunction = createGetFunction<PromptInputState, K>(key);
  return useStoreState<PromptInputState, K>("prompt-input", getFunction);
};

export const usePromptInputStoreSet = () => {
  return useStoreSet<PromptInputState>("prompt-input");
};
