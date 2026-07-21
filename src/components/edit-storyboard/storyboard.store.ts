import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { Fandom, NWImage, StoryBoardMember } from "@/types";
import type { Genre, Tag } from "@/types/common";

export type StoryboardState = {
  id: string | null;
  name: string;
  description: string;
  image: string | null;
  avatar: NWImage | null;
  isPublic: boolean;
  tags: Tag[];
  fandom: Fandom | null;
  genres: Genre[];
  members: StoryBoardMember[];
  createdByUsername: string | null;
};

export const INITIAL_STATE: StoryboardState = {
  avatar: null,
  createdByUsername: null,
  description: "",
  fandom: null,
  genres: [],
  id: null,
  image: null,
  isPublic: false,
  members: [],
  name: "",
  tags: [],
};

type StoryboardStoreKey = keyof StoryboardState;

export const useStoryboardState = <K extends StoryboardStoreKey>(key: K) => {
  const getFunction = createGetFunction<StoryboardState, K>(key);
  return useStoreState<StoryboardState, K>("storyboard", getFunction);
};

export const useStoryboardStoreSet = () => {
  return useStoreSet<StoryboardState>("storyboard");
};
