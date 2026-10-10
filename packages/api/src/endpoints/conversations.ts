import type { Conversation, ConversationChanges, IceBreaker } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { DataType, WithMessage } from "@nw/types/common";
import type { ApiClient } from "../client";

const CHAT = "/rp/portfolio/chat";
const ICE_BREAKERS = "/rp/portfolio/ice-breakers";

/**
 * The novelist list.
 *
 * This existed twice — once here and once in `novelists/actions.ts` — and the
 * copies disagreed: one returned `null` on 404 with optional auth, the other
 * `[]` with mandatory auth. `[]` is the honest answer for a list endpoint, so
 * that is what both callers now get.
 */
export const getConversations = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Conversation[]>> =>
  api.requestNullable<Conversation[]>(
    `${CHAT}/conversations?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getConversationsAction", notFound: "empty-array" },
  );

/**
 * The inbox since `since` (an ISO date-time): conversations modified after
 * it, newest first and capped at `limit`, plus the ids the caller has left.
 * A backend without the route answers 404, which comes back as `null` so a
 * client can fall back to the paged list.
 */
export const getConversationChanges = (
  api: ApiClient,
  since: string,
  limit = 50,
): Promise<DataType<ConversationChanges> | null> =>
  api.requestNullable<ConversationChanges>(
    `${CHAT}/conversations/changes?since=${encodeURIComponent(since)}&limit=${limit}`,
    { label: "getConversationChangesAction", notFound: "null" },
  );

export const getGroupCount = (api: ApiClient): Promise<DataType<number>> =>
  api.request<number>(`${CHAT}/group/count`, { label: "getGroupCountAction" });

export const createGroup = (
  api: ApiClient,
  name: string,
  participantIds: string[],
): Promise<DataType<Conversation>> =>
  api.request<Conversation>(`${CHAT}/conversation/createGroup`, {
    body: { name, participantIds },
    label: "createGroupAction",
    method: "POST",
  });

export const getUnreadConversationIds = (
  api: ApiClient,
): Promise<DataType<string[]>> =>
  api.requestNullable<string[]>(`${CHAT}/conversations/unread`, {
    label: "getUnreadConversationIdsAction",
    notFound: "null",
  });

export const getConversationByUsername = (
  api: ApiClient,
  username: string,
): Promise<DataType<Conversation>> =>
  api.requestNullable<Conversation>(
    `${CHAT}/conversation/byUsername/${username}`,
    { label: "getConversationByUsernameAction", notFound: "null" },
  );

export const createConversationIfNotExist = (
  api: ApiClient,
  targetNovelistId: string,
): Promise<DataType<Conversation>> =>
  api.request<Conversation>(
    `${CHAT}/conversation/${targetNovelistId}/createIfNotExist`,
    { label: "createConversationIfNotExistAction", method: "POST" },
  );

export const getIceBreakers = (
  api: ApiClient,
): Promise<DataType<IceBreaker[]>> =>
  api.request<IceBreaker[]>(ICE_BREAKERS, { label: "getIceBreakersAction" });

export const createIceBreaker = async (
  api: ApiClient,
  sourceId: string,
  sourceType: "NOVELIST" | "MUSE",
  message: string,
  color?: string | null,
): Promise<WithMessage> => {
  const response = await api.raw(ICE_BREAKERS, {
    body: { color, message, sourceId, sourceType },
    label: "createIceBreakerAction",
    method: "POST",
  });
  return { message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};

export const deleteIceBreaker = async (
  api: ApiClient,
  sourceId: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ICE_BREAKERS}/${sourceId}`, {
    label: "deleteIceBreakerAction",
    method: "DELETE",
  });
  return { message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};
