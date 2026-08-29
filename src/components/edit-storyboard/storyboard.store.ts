import type { Fandom, NWImage, StoryBoardMember } from "@nw/types";
import type { Genre, Tag } from "@nw/types/common";
import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";

export type StoryboardState = {
  id: string | null;
  name: string;
  description: string;
  image: string | null;
  avatar: NWImage | null;
  isPublic: boolean;
  /**
   * Whatever page format the story was saved with.
   *
   * The client no longer picks one or reads it: the book cuts its pages from
   * the screen at read time. It is carried here only so a save round-trips the
   * stored value instead of clearing it.
   */
  pageFormat: string | null;
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
  pageFormat: null,
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
