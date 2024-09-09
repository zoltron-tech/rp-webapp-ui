import { Tagged } from "./common";
import { Friend } from "./novelist";

export interface StoryBoard extends Tagged {
  _tag: "StoryBoard";
  id: string | null;
  name: string;
  image: string | null;
  members: StoryBoardMember[];
  createdBy: Friend;
}

export interface StoryBoardMember extends Tagged {
  _tag: "StoryBoardMember";
  username: string;
  storyBoardId: string;
  image: string;
  isAdmin: boolean;
}
