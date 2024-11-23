import { Tagged } from "./common";
import { Friend } from "./novelist";

export interface StoryBoard extends Tagged {
  _tag: "StoryBoard";
  id: string | null;
  name: string;
  image: string | null;
  members: StoryBoardMember[];
  events: StoryBoardEvent[];
  createdBy: Friend;
}

export interface StoryBoardMember extends Tagged {
  _tag: "StoryBoardMember";
  username: string;
  storyBoardId: string;
  image: string;
  isAdmin: boolean;
}

export interface StoryBoardEvent extends Tagged {
  _tag: "StoryBoardEvent";
  id: string | null;
  storyBoardId: string;
  name: string;
  description: string;
  image: string | null;
  location: string | null;
  eventTime: string | null;
  createdAt: string | null;
}
