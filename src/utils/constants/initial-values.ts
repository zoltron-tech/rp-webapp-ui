import type { Fandom, Friend, Muse, Novelist, NovelistTier } from "@/types";
import type { StoryBoard, StoryBoardEvent } from "@/types/story-board";

export const STANDARD_TIER: NovelistTier = {
  eventLimit: 20,
  mediaLimit: 500,
  museLimit: 20,
  name: "STANDARD",
  storyBoardLimit: 10,
};

export const EMPTY_FRIEND: Friend = {
  connection: null,
  firstName: "",
  id: "",
  image: "",
  isVerified: false,
  lastName: null,
  muses: [],
  mutualFriendCount: 0,
  username: "",
};

export const INITIAL_NOVELIST: Novelist = {
  about: null,
  connection: null,
  createdAt: "",
  firstName: "",
  friends: [],
  friendsCount: 0,
  id: "",
  image: "",
  isOnboarded: false,
  isVerified: false,
  lastName: "",
  museCount: 0,
  muses: [],
  note: "",
  palette: 0,
  tier: STANDARD_TIER,
  username: "",
};

export const FANDOMLESS: Fandom = {
  color: "rgb(51, 102, 153)",
  description: "rgb(51, 102, 153)",
  id: "FANDOMLESS",
  name: "Fandomless Original Characters",
};

export const INITIAL_MUSE: Muse = {
  accent: null,
  avatar: null,
  cardBackground: null,
  connections: [],
  extraAttributes: null,
  fandom: FANDOMLESS,
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
  useAccent: false,
  useExtraImages: false,
  video: null,
  wallpaper: null,
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
