import { Tagged } from "./common";

export interface Prompt extends Tagged {
  _tag: "Prompt";
  id: string;
  source: PromptSource;
  text: string;
  media: string;
  comments: Comment[];
  createdOn: string;
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
};

export type SubmitPromptType = "prompt" | "comment" | "reply";
