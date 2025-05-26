import { Tag, Tagged } from "./common";
import { Friend } from "./novelist";

export interface StoryBoard extends Tagged {
  _tag: "StoryBoard";
  id: string | null;
  name: string;
  image: string | null;
  members: StoryBoardMember[];
  events: StoryBoardEvent[];
  privacy: string;
  tags: Tag[];
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
  ordinal: number;
  name: string;
  description: string;
  image: string | null;
  location: string | null;
  eventTime: string | null;
  createdAt: string | null;
}

export interface StoryBoardEventThread extends Tagged {
  _tag: "StoryBoardEventThread";
  id: string | null;
  storyBoardEventId: string;
  sender: StoryBoardEventThreadSender;
  type: string;
  message: string | null;
  attachments: StoryBoardEventThreadAttachement[];
  createdAt: string | null;
}

export interface StoryBoardEventThreadSender extends Tagged {
  _tag: "StoryBoardEventThreadSender";
  sourceId: string;
  name: string;
  image: string;
}

export interface StoryBoardEventThreadAttachement extends Tagged {
  _tag: "StoryBoardEventThreadAttachement";
  id: string;
  url: string;
  createdAt: string;
}
