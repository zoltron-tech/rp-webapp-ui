import type { Fandom, Friend, Muse, Novelist, NovelistTier } from "@nw/types";
import type { StoryBoard, StoryBoardEvent } from "@nw/types/story-board";
import { DEFAULT_ASTERISM_STYLE } from "@/components/asterism-styles";

export const STANDARD_TIER: NovelistTier = {
  eventLimit: 20,
  groupLimit: 10,
  mediaLimit: 500,
  museLimit: 50,
  musicLimit: 10,
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
  level: 1,
  muses: [],
  mutualFriendCount: 0,
  totalPoints: 0,
  username: "",
};

export const INITIAL_NOVELIST: Novelist = {
  about: null,
  avatar: null,
  banner: null,
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
  level: 0,
  museCount: 0,
  muses: [],
  note: null,
  palette: 0,
  tier: STANDARD_TIER,
  totalPoints: 0,
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
  featuredSong: null,
  firstName: "",
  id: null,
  image: null,
  lastName: "",
  level: 0,
  next: null,
  nicknames: [],
  note: "",
  pennedBy: INITIAL_NOVELIST,
  prev: null,
  privacy: "PUBLIC",
  song: null,
  story: '{"type":"doc","content":[{"type":"paragraph"}]}',
  tags: [],
  totalPoints: 0,
  useAccent: false,
  useExtraImages: false,
  video: null,
  wallpaper: null,
};

export const INITIAL_STORY_BOARD: StoryBoard = {
  avatar: null,
  createdBy: EMPTY_FRIEND,
  events: [],
  id: null,
  image: null,
  isPublic: false,
  members: [],
  name: "",
  tags: [],
};

export const INITIAL_STORY_BOARD_EVENT: StoryBoardEvent = {
  avatar: null,
  createdAt: null,
  description: "",
  eventTime: null,
  id: null,
  image: null,
  location: null,
  name: "",
  ordinal: 1,
  overtureAsterism: DEFAULT_ASTERISM_STYLE,
  passageAsterism: DEFAULT_ASTERISM_STYLE,
  song: null,
  storyBoardId: "",
};
