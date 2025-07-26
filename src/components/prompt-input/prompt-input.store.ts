import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import { SubmitPromptType } from "@/types";

type MediaUploadError = "INVALID_FILE_TYPE" | "UPLOAD_FAILED" | null;

export type PromptInputState = {
  parentId: string;
  type: SubmitPromptType;
  mediaUploading: boolean;
  mediaUploadError: MediaUploadError;
  media: File | null;
};

export const INITIAL_STATE: PromptInputState = {
  parentId: "",
  type: "prompt",
  mediaUploading: false,
  mediaUploadError: null,
  media: null,
};

type PromptInputStoreKey = keyof PromptInputState;

export const usePromptInputState = <K extends PromptInputStoreKey>(key: K) => {
  const getFunction = createGetFunction<PromptInputState, K>(key);
  return useStoreState<PromptInputState, K>("prompt-input", getFunction);
};

export const usePromptInputStoreSet = () => {
  return useStoreSet<PromptInputState>("prompt-input");
};
