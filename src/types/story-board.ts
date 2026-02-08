import type { Tag } from "./common";
import type { Friend } from "./novelist";
import type { PromptSource } from "./prompt";

export interface StoryBoard {
  id: string | null;
  name: string;
  image: string | null;
  members: StoryBoardMember[];
  events: StoryBoardEvent[];
  privacy: string;
  tags: Tag[];
  createdBy: Friend;
}

export interface StoryBoardMember {
  username: string;
  storyBoardId: string;
  image: string;
  isAdmin: boolean;
}

export interface StoryBoardEvent {
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

export interface StoryBoardEventThread {
  id: string | null;
  storyBoardEventId: string;
  sender: PromptSource;
  type: EventThreadType;
  message: string | null;
  attachments: StoryBoardEventThreadAttachement[];
  createdAt: string | null;
}

export type StoryBoardEventThreadInput = {
  storyBoardEventId: string;
  sender: PromptSource;
  type: EventThreadType;
  message: string | null;
  attachments: StoryBoardEventThreadAttachement[];
};

export interface StoryBoardEventThreadAttachement {
  id: string | null;
  url: string;
  createdAt: string | null;
}

export type EventThreadType = "NARRATION" | "DIALOGUE";
