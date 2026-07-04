"use server";

import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import type { Conversation, IceBreaker } from "@/types";
import type { DataType, WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getConversationsAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Conversation[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversations?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getConversationsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const conversations: Conversation[] = await response.json();

  return conversations;
};

export const getGroupCountAction = async (): Promise<DataType<number>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/group/count`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getGroupCountAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const count: number = await response.json();

  return count;
};

export const createGroupAction = async (
  name: string,
  participantIds: string[],
): Promise<DataType<Conversation>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/createGroup`;

  const response = await fetch(URL, {
    body: JSON.stringify({ name, participantIds }),
    cache: "no-store",
    headers: headers,
    method: "POST",
  });

  Logger.debug("createGroupAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const conversation: Conversation = await response.json();

  return conversation;
};

export const getUnreadConversationIdsAction = async (): Promise<
  DataType<string[]>
> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversations/unread`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getUnreadConversationIdsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const ids: string[] = await response.json();

  return ids;
};

export const getConversationByUsernameAction = async (
  username: string,
): Promise<DataType<Conversation>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/byUsername/${username}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getConversationByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const conversation: Conversation = await response.json();

  return conversation;
};

export const createConversationIfNotExistAction = async (
  targetNovelistId: string,
): Promise<DataType<Conversation>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversation/${targetNovelistId}/createIfNotExist`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
    method: "POST",
  });

  Logger.debug("createConversationIfNotExistAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const conversation: Conversation = await response.json();

  return conversation;
};

export const getIceBreakersAction = async (): Promise<
  DataType<IceBreaker[]>
> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/ice-breakers`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getIceBreakersAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const iceBreakers: IceBreaker[] = await response.json();

  return iceBreakers;
};

export const createIceBreakerAction = async (
  sourceId: string,
  sourceType: "NOVELIST" | "MUSE",
  message: string,
  color?: string | null,
): Promise<WithMessage> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/ice-breakers`;

  const response = await fetch(URL, {
    body: JSON.stringify({ color, message, sourceId, sourceType }),
    cache: "no-store",
    headers: headers,
    method: "POST",
  });

  Logger.debug("createIceBreakerAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const deleteIceBreakerAction = async (
  sourceId: string,
): Promise<WithMessage> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/ice-breakers/${sourceId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
    method: "DELETE",
  });

  Logger.debug("deleteIceBreakerAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};
