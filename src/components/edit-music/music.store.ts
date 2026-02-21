import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { Tag } from "@/types/common";

export type MusicState = {
  id: string | null;
  name: string;
  description: string;
  url: string;
  tags: Tag[];
};

export const INITIAL_STATE: MusicState = {
  description: "",
  id: null,
  name: "",
  tags: [],
  url: "",
};

type MusicStoreKey = keyof MusicState;

export const useMusicState = <K extends MusicStoreKey>(key: K) => {
  const getFunction = createGetFunction<MusicState, K>(key);
  return useStoreState<MusicState, K>("music", getFunction);
};

export const useMusicStoreSet = () => {
  return useStoreSet<MusicState>("music");
};
