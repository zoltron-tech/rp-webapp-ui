"use server";
import getConfig from "next/config";
import {
  authenticateAndGetJWT,
  getJWTIfExists,
  logoutAction,
} from "@/app/actions";
import type {
  Novelist,
  NovelistWorldNotification,
  UpdateNovelistPayload,
} from "@/types";
import type { DataType, SearchResult, WithMessage } from "@/types/common";
import type { Conversation, Message } from "@/types/conversation";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
  MEDIA_JSON_HEADER_VALUE,
} from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getNovelists = async () => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/all`;

  const response = await fetch(URL, { cache: "no-store" });
  Logger.debug("getNovelists", response.status);

  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const novelists: Novelist[] = await response.json();

  return novelists;
};

export const getNovelistAction = async (
  username: string,
): Promise<DataType<Novelist>> => {
  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };

  const jwt = await getJWTIfExists();
  if (jwt) {
    headers[AUTH_HEADER_NAME as string] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/get?username=${username}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const novelist: Novelist = await response.json();

  return novelist;
};

export const getUserNovelist = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  console.log(response);

  if (response.status === 404) {
    return {
      message: API_MESSAGE.NotFound,
    };
  } else if (!response.ok) {
    Logger.debug(API_MESSAGE.Error, response.status, response.statusText);
    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const novelist: Novelist = await response.json();

  return novelist;
};

export const getNotifications = async (): Promise<
  DataType<NovelistWorldNotification[]>
> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/notification`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  if (response.status === 404) {
    return null;
  }

  const notifications: NovelistWorldNotification[] = await response.json();

  return notifications;
};

export const patchNotifications = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/notification`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "PATCH",
  });

  if (response.status === 404) {
    return null;
  }

  return "success";
};

export const updateUserNovelist = async (
  _novelist: UpdateNovelistPayload,
  create = false,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist`;

  Logger.debug("updateUserNovelist", _novelist);

  const response = await fetch(URL, {
    body: JSON.stringify(_novelist),
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    method: create ? "POST" : "PUT",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result: WithMessage<Novelist> = await response.json();
  Logger.debug("updateUserNovelist", result);

  const novelist: Novelist = Object.assign(
    {},
    {
      ...result,
      message: undefined,
    },
  );

  return novelist;
};

export const searchAction = async (searchTerm: string, type = "novelist") => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/${type}/search?prefix=${searchTerm}`;

  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("searchAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = (await response.json()) as SearchResult[];
  return result;
};

export const chatAction = async (targetUserName: string | null) => {
  if (targetUserName === null) return;
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/getMessages/${targetUserName}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("chatAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = (await response.json()) as Message[];
  return result;
};

export const getConversationsAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Conversation[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversations?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getConversationsAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = (await response.json()) as Conversation[];
  return result;
};
