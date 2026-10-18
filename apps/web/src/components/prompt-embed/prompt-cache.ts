import type { Prompt } from "@nw/types";
import { getPromptAction } from "@/app/rp/prompt/actions";

/**
 * Prompts fetched for embeds, kept for the page's lifetime — the same shape
 * as the muse cache, for the same reasons: one request per id however many
 * cards show it, 404 (private, deleted, blocked) remembered, network failures
 * not.
 */
const inflight = new Map<string, Promise<Prompt | null>>();

const isPrompt = (value: unknown): value is Prompt =>
  !!value &&
  typeof value === "object" &&
  "source" in value &&
  "text" in value &&
  !("message" in value);

export const fetchEmbeddedPrompt = (
  promptId: string,
): Promise<Prompt | null> => {
  const cached = inflight.get(promptId);
  if (cached) return cached;

  const request = getPromptAction(promptId)
    .then((result) => (isPrompt(result) ? result : null))
    .catch((error: unknown) => {
      inflight.delete(promptId);
      throw error;
    });

  inflight.set(promptId, request);
  return request;
};
