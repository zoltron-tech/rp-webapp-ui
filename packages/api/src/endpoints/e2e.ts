import type { E2EConversationSecret } from "@nw/types/e2e";
import type { ApiClient } from "../client";

/**
 * The server half of a conversation's chat message key. Members only — the
 * backend answers 403 for anyone else, and creates the secret on first ask.
 * Uses `raw` rather than `request` because the caller wants null, not the
 * `{ message }` error shape.
 */
export const getE2EConversationSecret = async (
  api: ApiClient,
  conversationId: string,
): Promise<E2EConversationSecret | null> => {
  const response = await api.raw(
    `/rp/portfolio/chat/e2e/conversation/${conversationId}/key`,
    { label: "getE2EConversationSecretAction" },
  );
  if (!response.ok) return null;
  return (await response.json()) as E2EConversationSecret;
};
