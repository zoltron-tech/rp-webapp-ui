import { Tagged } from "./common";

export type PrivacyLevel = "PUBLIC" | "FRIENDS" | "ONLY_ME";

export interface Prompt extends Tagged {
  _tag: "Prompt";
  id: string;
  source: PromptSource;
  text: string;
  media: string;
  privacy: PrivacyLevel;
  createdOn: string;
  canInteract: boolean;
  reacted: boolean;
  commentCount: number;
  reactions: number;
}

export interface Comment extends Tagged {
  _tag: "Comment";
  id: string;
  prompt: Prompt | null;
  promptId: string;
  source: PromptSource;
  text: string;
  media: string;
  replies: Reply[];
  replyCount: number;
  createdOn: string;
  reactions: number;
  reacted: boolean;
}

export interface Reply extends Tagged {
  _tag: "Reply";
  id: string;
  commentId: string;
  source: PromptSource;
  text: string;
  media: string;
  createdOn: string;
}

export interface PromptSource extends Tagged {
  _tag: "PromptSource";
  sourceId: string;
  name: string;
  image: string;
}

export type SubmitPromptInput = {
  source: PromptSource;
  text: string;
  media: string;
  promptId?: string;
  commentId?: string;
  privacy?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
};

export type SubmitPromptType = "prompt" | "comment" | "reply";
