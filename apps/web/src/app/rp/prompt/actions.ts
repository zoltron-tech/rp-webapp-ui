import {
  getPrompt,
  getPromptComments,
  getPromptsByMuse,
  updatePrompt,
  updatePromptComment,
} from "@nw/api/endpoints/prompt";
import type { Prompt } from "@nw/types";
import { api, authedApi } from "@/lib/api";

export const getPromptAction = (promptId: string) => getPrompt(api, promptId);

export const getPropmptCommentsAction = (promptId: string) =>
  getPromptComments(api, promptId);

export const getPromptsByMuseAction = (museId: string) =>
  getPromptsByMuse(api, museId);

export const updatePromptAction = (_prompt: Prompt) =>
  updatePrompt(authedApi, _prompt);

export const updatePromptCommentAction = (
  promptId: string,
  updatedText: string,
  promptType: "prompt" | "comment" | "reply",
) => updatePromptComment(authedApi, promptId, updatedText, promptType);
