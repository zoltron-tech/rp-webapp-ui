import { createGetFunction, useStoreState } from "@/context/store/use-store";
import { Prompt as PromptType } from "@/types";

export type PromptStoreType = PromptType & {
  threadOpen: boolean;
};

type PromptInputStoreKey = keyof PromptStoreType;

export const usePromptState = <K extends PromptInputStoreKey>(key: K) => {
  const getFunction = createGetFunction<PromptStoreType, K>(key);
  return useStoreState<PromptStoreType, K>("prompt", getFunction);
};
