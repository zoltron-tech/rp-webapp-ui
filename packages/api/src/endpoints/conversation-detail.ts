import type {
  Conversation,
  ConversationParticipant,
  MentionDataItem,
  Message,
} from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { DataType } from "@nw/types/common";
import type { ApiClient } from "../client";
import { getConversations } from "./conversations";

const CHAT = "/rp/portfolio/chat/conversation";
const id = (value: string) => encodeURIComponent(value);

/** Success is an acknowledgement, not a payload. */
const ack = async (
  api: ApiClient,
  path: string,
  label: string,
  init: { method: "POST" | "DELETE" | "PUT"; body?: unknown },
): Promise<DataType<boolean>> => {
  const response = await api.raw(path, { ...init, label });
  if (!response.ok) return { message: API_MESSAGE.Error };
  return true;
};

/**
 * One conversation, by id, shaped as the inbox shapes it.
 *
 * Read from `/conversation/byId/{id}`, which answers 404 — `null` here — for
 * a conversation the caller is not in, or a DM hidden from them by a block.
 * The UI used to pick it out of the first page of the inbox instead, which
 * cannot find an archived one (BLOCK_BLACKLIST_PLAN.md B6); that scan, over
 * both lists, is kept only for an error from the route.
 */
export const getConversationById = async (
  api: ApiClient,
  conversationId: string,
): Promise<DataType<Conversation>> => {
  const direct = await api.requestNullable<Conversation>(
    `${CHAT}/byId/${id(conversationId)}`,
    { label: "getConversationByIdAction", notFound: "null" },
  );
  if (direct === null) return null;
  if (!("message" in direct)) return direct;

  for (const bucket of ["INBOX", "ARCHIVED"] as const) {
    const conversations = await getConversations(api, 1, 100, bucket);
    if (!conversations || "message" in conversations) return null;
    const found = conversations.find((c) => c.id === conversationId);
    if (found) return found;
  }
  return null;
};

export const getConversationMembers = (
  api: ApiClient,
  conversationId: string,
  page = 1,
  pageSize = 20,
): Promise<DataType<ConversationParticipant[]>> =>
  api.requestNullable<ConversationParticipant[]>(
    `${CHAT}/${id(conversationId)}/members?pageNumber=${page}&pageSize=${pageSize}`,
    { label: "getConversationMembersAction", notFound: "empty-array" },
  );

export const updateGroup = (
  api: ApiClient,
  groupId: string,
  payload: { name?: string; image?: string },
): Promise<DataType<Conversation>> =>
  api.request<Conversation>(`${CHAT}/${id(groupId)}`, {
    body: payload,
    label: "updateGroupAction",
    method: "PUT",
  });

export const addGroupMembers = (
  api: ApiClient,
  groupId: string,
  participantIds: string[],
): Promise<DataType<boolean>> =>
  ack(api, `${CHAT}/${id(groupId)}/members`, "addGroupMembersAction", {
    body: participantIds,
    method: "POST",
  });

export const removeGroupMember = (
  api: ApiClient,
  groupId: string,
  novelistId: string,
): Promise<DataType<boolean>> =>
  ack(
    api,
    `${CHAT}/${id(groupId)}/members/${id(novelistId)}`,
    "removeGroupMemberAction",
    { method: "DELETE" },
  );

export const leaveGroup = (
  api: ApiClient,
  groupId: string,
): Promise<DataType<boolean>> =>
  ack(api, `${CHAT}/${id(groupId)}/leave`, "leaveGroupAction", {
    body: {},
    method: "POST",
  });

export const deleteGroup = (
  api: ApiClient,
  groupId: string,
): Promise<DataType<boolean>> =>
  ack(api, `${CHAT}/${id(groupId)}`, "deleteGroupAction", { method: "DELETE" });

export const getConversationMessages = (
  api: ApiClient,
  conversationId: string,
  page = 1,
  pageSize = 20,
): Promise<DataType<Message[]>> =>
  api.requestNullable<Message[]>(
    `${CHAT}/${id(conversationId)}/messages?pageNumber=${page}&pageSize=${pageSize}`,
    { label: "getConversationMessagesAction", notFound: "empty-array" },
  );

/**
 * Messages created after `after` (an ISO date-time), newest first, at most
 * `pageSize` — the delta read for a client holding a local copy. A backend
 * that does not know `after` ignores it and answers page one, which the
 * caller must treat as a full page rather than a delta.
 *
 * The boundary is not exact: the column holds microseconds and `createdAt`
 * on the wire is coarser, so asking "after the newest message I have" can
 * return that message again. Upsert by id.
 */
export const getConversationMessagesAfter = (
  api: ApiClient,
  conversationId: string,
  after: string,
  pageSize = 50,
): Promise<DataType<Message[]>> =>
  api.requestNullable<Message[]>(
    `${CHAT}/${id(conversationId)}/messages?pageSize=${pageSize}&after=${encodeURIComponent(after)}`,
    { label: "getConversationMessagesAfterAction", notFound: "empty-array" },
  );

/**
 * Ids of messages deleted from the conversation after `since`. `null` from a
 * backend that does not have the route yet.
 */
export const getDeletedMessageIds = (
  api: ApiClient,
  conversationId: string,
  since: string,
): Promise<DataType<string[]> | null> =>
  api.requestNullable<string[]>(
    `${CHAT}/${id(conversationId)}/messages/deleted?since=${encodeURIComponent(since)}`,
    { label: "getDeletedMessageIdsAction", notFound: "null" },
  );

export const sendConversationMessage = (
  api: ApiClient,
  input: { conversationId: string; message: string },
): Promise<DataType<boolean>> =>
  ack(
    api,
    `${CHAT}/${id(input.conversationId)}/sendMessage`,
    "sendConversationMessageAction",
    { body: { message: input.message }, method: "POST" },
  );

/** Falls back to an empty list — the mention dropdown has nothing to say on failure. */
export const getConversationMuses = async (
  api: ApiClient,
  conversationId: string,
  prefix = "",
): Promise<MentionDataItem[]> => {
  const response = await api.raw(
    `/rp/portfolio/muse/search/musesByConversation/${id(conversationId)}?prefix=${encodeURIComponent(prefix)}`,
    { label: "getConversationMusesAction" },
  );
  if (!response.ok) return [];
  return (await response.json()) as MentionDataItem[];
};

export const reportMessage = (
  api: ApiClient,
  messageId: string,
): Promise<DataType<boolean>> =>
  ack(api, "/rp/portfolio/report", "reportMessageAction", {
    body: { reason: "", targetId: messageId, targetType: "MESSAGE" },
    method: "POST",
  });

/** Fire-and-forget: the caller does not act on the outcome. */
export const markConversationRead = async (
  api: ApiClient,
  conversationId: string,
): Promise<void> => {
  await api.raw(`${CHAT}/${id(conversationId)}/markRead`, {
    label: "markConversationReadAction",
    method: "POST",
  });
};

// ─── A sent message, taken back ─────────────────────────────────────────────
//
// The route sits beside the conversation ones, one level up: the message id
// is enough, the backend finds the conversation from it. The socket is the
// first choice — chat-server deletes through this same route and then tells
// everyone — and this is the fallback for a client whose socket is down,
// where the other side learns on its next sync instead.

const MESSAGE = "/rp/portfolio/chat/message";

/** Hard delete, with a tombstone left for clients that were offline. */
export const deleteConversationMessage = (
  api: ApiClient,
  messageId: string,
): Promise<DataType<boolean>> =>
  ack(api, `${MESSAGE}/${id(messageId)}`, "deleteConversationMessageAction", {
    method: "DELETE",
  });
