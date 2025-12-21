export type PrivacyLevel = "PUBLIC" | "FRIENDS" | "ONLY_ME";

export interface Prompt {
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

export interface PromptThreadComment {
  id: string;
  tyoe: "COMMENT" | "REPLY";
  parentId: string;
  source: PromptSource;
  target: PromptSource;
  text: string;
  media: string;
  createdOn: number;
  replyCount: number;
}

export interface Comment {
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

export interface Reply {
  id: string;
  commentId: string;
  source: PromptSource;
  text: string;
  media: string;
  createdOn: string;
}

export interface PromptSource {
  sourceId: string;
  name: string;
  image: string;
  sourceType: "NOVELIST" | "MUSE";
  urlProp: string;
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
