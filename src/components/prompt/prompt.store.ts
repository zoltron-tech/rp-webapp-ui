import type { Prompt as PromptType } from "@nw/types";
import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";

export type PromptStoreType = PromptType & {
  threadOpen: boolean;
  promptAlert: "report" | "delete" | null;
};

type PromptInputStoreKey = keyof PromptStoreType;

export const usePromptState = <K extends PromptInputStoreKey>(key: K) => {
  const getFunction = createGetFunction<PromptStoreType, K>(key);
  return useStoreState<PromptStoreType, K>("prompt", getFunction);
};

export const usePromptStateSet = () => {
  return useStoreSet<PromptStoreType>("prompt");
};
