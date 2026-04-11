"use server";

import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import type { Conversation, Message } from "@/types";
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

export const markConversationReadAction = async (
  conversationId: string,
): Promise<void> => {
  const headers = await getAuthHeaders();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${encodeURIComponent(conversationId)}/markRead`;

  console.log(
    `Marking conversation ${conversationId} as read with URL: ${URL}`,
  );

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
    method: "POST",
  });

  Logger.debug("markConversationReadAction", response.status);
};
