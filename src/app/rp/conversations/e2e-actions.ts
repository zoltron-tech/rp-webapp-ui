import { getE2EConversationSecret } from "@nw/api/endpoints/e2e";
import { api } from "@/lib/api";

export const getE2EConversationSecretAction = (conversationId: string) =>
  getE2EConversationSecret(api, conversationId);
