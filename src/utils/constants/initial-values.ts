import type { Friend, Muse, Novelist, NovelistTier } from "@/types";
import type { None } from "@/types/common";
import type { StoryBoard, StoryBoardEvent } from "@/types/story-board";

export const STANDARD_TIER: NovelistTier = {
  eventLimit: 20,
  mediaLimit: 500,
  museLimit: 20,
  name: "STANDARD",
  storyBoardLimit: 10,
};

export const EMPTY_FRIEND: Friend = {
  _tag: "Friend",
  id: "",
  image: "",
  username: "",
};

export const INITIAL_NOVELIST: Novelist = {
  _tag: "Novelist",
  connection: null,
  createdAt: "",
  firstName: "",
  friends: [],
  friendsCount: 0,
  id: "",
  image: "",
  lastName: "",
  museCount: 0,
  muses: [],
  note: "",
  tier: STANDARD_TIER,
  username: "",
};

export const INITIAL_MUSE: Muse = {
  _tag: "Muse",
  connections: [],
  extraAttributes: null,
  fandom: {
    color: "rgb(51, 102, 153)",
    description: "rgb(51, 102, 153)",
    id: "FANDOMLESS",
    name: "Fandomless Original Characters",
  },
  firstName: "",
  id: null,
  image: null,
  lastName: "",
  nicknames: [],
  note: "",
  pennedBy: INITIAL_NOVELIST,
  privacy: "PUBLIC",
  song: null,
  story: '{"type":"doc","content":[{"type":"paragraph"}]}',
  tags: [],
  video: null,
};

export const INITIAL_STORY_BOARD: StoryBoard = {
  createdBy: EMPTY_FRIEND,
  events: [],
  id: null,
  image: null,
  members: [],
  name: "",
  privacy: "PUBLIC",
  tags: [],
};

export const INITIAL_STORY_BOARD_EVENT: StoryBoardEvent = {
  createdAt: null,
  description: "",
  eventTime: null,
  id: null,
  image: null,
  location: null,
  name: "",
  ordinal: 1,
  storyBoardId: "",
};

export const NONE: None = {
  _tag: "None",
};
