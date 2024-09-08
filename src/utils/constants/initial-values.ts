import { Novelist, Muse, NovelistTier } from "@/types";
import { None } from "@/types/common";
import { StoryBoard } from "@/types/story-board";

export const STANDARD_TIER: NovelistTier = {
  name: "STANDARD",
  museLimit: 20,
  storyBoardLimit: 10,
  eventLimit: 20,
  mediaLimit: 500,
};

export const INITIAL_NOVELIST: Novelist = {
  _tag: "Novelist",
  id: "",
  username: "",
  tier: STANDARD_TIER,
  firstName: "",
  lastName: "",
  note: "",
  image: "",
  muses: [],
  friends: [],
};

export const INITIAL_MUSE: Muse = {
  _tag: "Muse",
  id: null,
  pennedBy: INITIAL_NOVELIST,
  firstName: "",
  lastName: "",
  note: "",
  story: '{"type":"doc","content":[{"type":"paragraph"}]}',
  image: "",
  connections: [],
};

export const INITIAL_STORY_BOARD: StoryBoard = {
  _tag: "StoryBoard",
  id: null,
  name: "",
  image: null,
  members: [],
};

export const NONE: None = {
  _tag: "None",
};
