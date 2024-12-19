"use server";
import {
  authenticateAndGetJWT,
  authenticateAndGetJWTIfExists,
  logoutAction,
} from "@/app/actions";
import { Novelist } from "@/types";
import { SearchResult, WithMessage } from "@/types/common";
import { Conversation, Message } from "@/types/conversation";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
  MEDIA_JSON_HEADER_VALUE,
} from "@/utils/constants";
import { Logger } from "@/utils/services";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getNovelists = async () => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/all`;

  const response = await fetch(URL, { cache: "no-store" });
  Logger.debug("getNovelists", response.status);

  if (response.status === 404) {
    return [];
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const novelists: Novelist[] = await response.json();

  return novelists;
};

export const getNovelistAction = async (username: string) => {
  let headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };

  const jwt = await authenticateAndGetJWTIfExists();
  if (jwt) {
    headers[AUTH_HEADER_NAME as string] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/get?username=${username}`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const novelist: Novelist = await response.json();

  return novelist;
};

export const getUserNovelist = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist`;

  const response = await fetch(URL, {
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    Logger.debug(API_MESSAGE.Error, response.status, response.statusText);
    logoutAction();
  }

  const novelist: Novelist = await response.json();

  return novelist;
};

export const getFriendRequests = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/requests`;

  const response = await fetch(URL, {
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    Logger.debug(API_MESSAGE.Error, response.status, response.statusText);
    logoutAction();
  }

  const novelists: Novelist[] = await response.json();

  return novelists;
};

export const updateUserNovelist = async (_novelist: Novelist) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist`;

  Logger.debug("updateUserNovelist", _novelist);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_novelist),
    cache: "no-store",
  });

  if (response.status !== 200) {
    Logger.debug("error", response.status, response.statusText);
    return { message: API_MESSAGE.Error };
  }

  const result: WithMessage<Novelist> = await response.json();
  Logger.debug("updateUserNovelist", result);

  const novelist: Novelist = Object.assign(
    {},
    {
      ...result,
      message: undefined,
    }
  );

  return novelist;
};

export const searchAction = async (searchTerm: string, type = "novelist") => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/${type}/search?prefix=${searchTerm}`;

  const response = await fetch(URL, {
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
    },
    cache: "no-store",
  });

  Logger.debug("searchAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (response.status !== 200) {
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
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("chatAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = (await response.json()) as Message[];
  return result;
};

export const getConversationsAction = async (
  pageNumber: number,
  pageSize: number
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/conversations?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getConversationsAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = (await response.json()) as Conversation[];
  return result;
};
