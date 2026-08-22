import type { Comment, Prompt } from "@nw/types";
import type { DataType, ErrorType, WithMessage } from "@nw/types/common";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/prompt";

export const getPrompt = (
  api: ApiClient,
  promptId: string,
): Promise<DataType<Prompt>> =>
  api.requestNullable<Prompt>(`${BASE}/${promptId}`, {
    label: "getPromptAction",
    notFound: "null",
  });

export const getPromptComments = (
  api: ApiClient,
  promptId: string,
): Promise<DataType<Comment[]>> =>
  api.requestNullable<Comment[]>(`${BASE}/${promptId}/comments`, {
    label: "getPropmptCommentsAction",
    notFound: "null",
  });

export const getPromptsByMuse = (
  api: ApiClient,
  museId: string,
): Promise<DataType<Prompt[]>> =>
  api.requestNullable<Prompt[]>(`${BASE}/by/${museId}`, {
    label: "getPromptsByMuseAction",
    notFound: "null",
  });

export const updatePrompt = async (
  api: ApiClient,
  prompt: Prompt,
): Promise<Prompt | ErrorType> => {
  const result = await api.request<Prompt>(BASE, {
    body: prompt,
    label: "updatePromptAction",
    method: "POST",
  });

  if ("message" in result) return result;

  // The service echoes a `message` alongside the prompt; strip it so callers
  // can keep using `"message" in result` to mean failure.
  return { ...result, message: undefined } as Prompt;
};

export const updatePromptComment = (
  api: ApiClient,
  promptId: string,
  updatedText: string,
  promptType: "prompt" | "comment" | "reply",
): Promise<WithMessage> => {
  const slug = promptType !== "prompt" ? `${promptType}/` : "";
  return api.request<WithMessage>(`${BASE}/${slug}${promptId}`, {
    body: { updatedText },
    label: "updatePromptCommentAction",
    method: "PUT",
  });
};
