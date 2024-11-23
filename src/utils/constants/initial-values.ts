import { Novelist, Muse, NovelistTier, Friend } from "@/types";
import { None } from "@/types/common";
import { StoryBoard, StoryBoardEvent } from "@/types/story-board";

export const STANDARD_TIER: NovelistTier = {
  name: "STANDARD",
  museLimit: 20,
  storyBoardLimit: 10,
  eventLimit: 20,
  mediaLimit: 500,
};

export const EMPTY_FRIEND: Friend = {
  _tag: "Friend",
  id: "",
  username: "",
  image: "",
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
  events: [],
  createdBy: EMPTY_FRIEND,
};

export const INITIAL_STORY_BOARD_EVENT: StoryBoardEvent = {
  _tag: "StoryBoardEvent",
  id: null,
  storyBoardId: "",
  name: "",
  description: "",
  image: null,
  location: null,
  eventTime: null,
  createdAt: null,
};

export const NONE: None = {
  _tag: "None",
};
