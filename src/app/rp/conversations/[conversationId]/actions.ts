"use server";

import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import type { Conversation, ConversationParticipant, Message } from "@/types";
import type { DataType } from "@/types/common";
import type { MentionDataItem } from "@/types/novelist";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { getConversationsAction } from "../actions";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

const getAuthHeaders = async () => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  return headers;
};

export const getConversationByIdAction = async (
  conversationId: string,
): Promise<DataType<Conversation>> => {
  const conversations = await getConversationsAction(1, 100);

  if (!conversations || "message" in conversations) {
    return null;
  }

  return (
    conversations.find((conversation) => conversation.id === conversationId) ||
    null
  );
};

export const getConversationMembersAction = async (
  conversationId: string,
  page = 1,
  pageSize = 20,
): Promise<DataType<ConversationParticipant[]>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(conversationId)}/members?pageNumber=${page}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getConversationMembersAction", response.status);

  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const members: ConversationParticipant[] = await response.json();
  return members;
};

export const updateGroupAction = async (
  groupId: string,
  payload: { name?: string; image?: string },
): Promise<DataType<Conversation>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(groupId)}`;

  const response = await fetch(URL, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers,
    method: "PUT",
  });

  Logger.debug("updateGroupAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const conversation: Conversation = await response.json();
  return conversation;
};

export const addGroupMembersAction = async (
  groupId: string,
  participantIds: string[],
): Promise<DataType<boolean>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(groupId)}/members`;

  const response = await fetch(URL, {
    body: JSON.stringify(participantIds),
    cache: "no-store",
    headers,
    method: "POST",
  });

  Logger.debug("addGroupMembersAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return true;
};

export const removeGroupMemberAction = async (
  groupId: string,
  novelistId: string,
): Promise<DataType<boolean>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(groupId)}/members/${encodeURIComponent(novelistId)}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
    method: "DELETE",
  });

  Logger.debug("removeGroupMemberAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return true;
};

export const leaveGroupAction = async (
  groupId: string,
): Promise<DataType<boolean>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(groupId)}/leave`;

  const response = await fetch(URL, {
    body: JSON.stringify({}),
    cache: "no-store",
    headers,
    method: "POST",
  });

  Logger.debug("leaveGroupAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return true;
};

export const deleteGroupAction = async (
  groupId: string,
): Promise<DataType<boolean>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(groupId)}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
    method: "DELETE",
  });

  Logger.debug("deleteGroupAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return true;
};

export const getConversationMessagesAction = async (
  conversationId: string,
  page = 1,
  pageSize = 20,
): Promise<DataType<Message[]>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(conversationId)}/messages?pageNumber=${page}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getConversationMessagesAction", response.status);

  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const messages: Message[] = await response.json();
  return messages;
};

export const sendConversationMessageAction = async (input: {
  conversationId: string;
  message: string;
}): Promise<DataType<boolean>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(input.conversationId)}/sendMessage`;

  const response = await fetch(URL, {
    body: JSON.stringify({ message: input.message }),
    cache: "no-store",
    headers,
    method: "POST",
  });

  Logger.debug("sendConversationMessageAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return true;
};

export const getConversationMusesAction = async (
  conversationId: string,
  prefix = "",
): Promise<MentionDataItem[]> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/search/musesByConversation/${encodeURIComponent(conversationId)}?prefix=${encodeURIComponent(prefix)}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getConversationMusesAction", response.status);

  if (!response.ok) {
    return [];
  }

  const muses: MentionDataItem[] = await response.json();
  return muses;
};

export const reportMessageAction = async (
  messageId: string,
): Promise<DataType<boolean>> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/report`;

  const response = await fetch(URL, {
    body: JSON.stringify({
      reason: "",
      targetId: messageId,
      targetType: "MESSAGE",
    }),
    cache: "no-store",
    headers,
    method: "POST",
  });

  Logger.debug("reportMessageAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return true;
};

export const markConversationReadAction = async (
  conversationId: string,
): Promise<void> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(conversationId)}/markRead`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
    method: "POST",
  });

  Logger.debug("markConversationReadAction", response.status);
};
