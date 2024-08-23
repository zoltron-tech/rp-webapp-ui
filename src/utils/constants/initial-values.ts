import { Novelist, Muse } from "@/types";
import { None } from "@/types/common";
import { StoryBoard } from "@/types/story-board";

export const INITIAL_NOVELIST: Novelist = {
  _tag: "Novelist",
  id: "",
  username: "",
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
  story: "",
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
