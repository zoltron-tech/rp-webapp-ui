import type { StoreState } from "@/types/state";
import { createGetFunction, useStoreSet, useStoreState } from "./use-store";

type GlobalStoreKey = keyof StoreState;

export const useGlobalState = <K extends GlobalStoreKey>(key: K) => {
  const getFunction = createGetFunction<StoreState, K>(key);
  return useStoreState<StoreState, K>("global-store", getFunction);
};

export const useGlobalStoreSet = () => {
  return useStoreSet<StoreState>("global-store");
};
