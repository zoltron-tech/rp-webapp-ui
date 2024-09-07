import { Tagged } from "./common";

export interface StoryBoard extends Tagged {
  _tag: "StoryBoard";
  id: string | null;
  name: string;
  image: string | null;
  members: StoryBoardMember[];
}

export interface StoryBoardMember extends Tagged {
  _tag: "StoryBoardMember";
  username: string;
  storyBoardId: string;
  image: string;
  isAdmin: boolean;
}
