import { Tagged } from "./common";

export interface Prompt extends Tagged {
  _tag: "Prompt";
  id: string;
  source: PromptSource;
  text: string;
  media: string;
  comments: Comment[];
  createdOn: number;
}

export interface Comment extends Tagged {
  _tag: "Comment";
  id: string;
  promptId: string;
  source: PromptSource;
  text: string;
  media: string;
  replies: Reply[];
  createdOn: number;
}

export interface Reply extends Tagged {
  _tag: "Reply";
  id: string;
  commentId: string;
  source: PromptSource;
  text: string;
  media: string;
  createdOn: number;
}

export interface PromptSource extends Tagged {
  _tag: "PromptSource";
  sourceId: string;
  name: string;
  image: string;
}
