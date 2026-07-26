"use server";
import getConfig from "next/config";
import {
  authenticateAndGetJWT,
  getJWTIfExists,
  logoutAction,
} from "@/app/actions";
import type {
  Friend,
  Novelist,
  NovelistNote,
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
import { reverseWsrvUrl, transformFriend, transformNovelist } from "@/utils/image";
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

  // Route S3 image URLs through wsrv.nl for resizing. This feeds the landing
  // page's novelist carousel only, so use the carousel sizes — "profile" leaves
  // avatars as un-resized S3 originals, which is what full profile pages want
  // but is far too heavy for eight cards loading at once.
  for (const n of novelists) transformNovelist(n, "carousel");

  return novelists;
};

export const getNovelistByIdAction = async (
  novelistId: string,
): Promise<DataType<Novelist>> => {
  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };

  const jwt = await getJWTIfExists();
  if (jwt) {
    headers[AUTH_HEADER_NAME as string] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/${novelistId}`;

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

  transformNovelist(novelist, "profile");

  return novelist;
};

export const getNovelistAction = async (
  username: string,
): Promise<DataType<Novelist>> => {
  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };

  console.log("getNovelistAction");

  const jwt = await getJWTIfExists();
  if (jwt) {
    headers[AUTH_HEADER_NAME as string] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/get?username=${username}`;

  try {
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

    transformNovelist(novelist, "profile");

    return novelist;
  } catch (e) {
    console.log("error occured in getNovelistAction", e);
    return { message: API_MESSAGE.Error };
  }

  // const response = {
  //   json: async () => ({}) as Novelist,
  //   ok: true,
  //   status: 200,
  // };
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

  transformNovelist(novelist, "profile");

  return novelist;
};

export const getNotifications = async (
  pageNumber: number,
  pageSize: number,
): Promise<DataType<NovelistWorldNotification[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/notification?pageNumber=${pageNumber}&pageSize=${pageSize}`;

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

  // Strip wsrv.nl proxy URLs back to original S3 URLs before sending to the
  // backend. The global novelist state is seeded via getUserNovelist which runs
  // transformNovelist (S3 → wsrv.nl). Sending wsrv.nl URLs causes the backend
  // to detect a URL change, delete the original S3 file, and persist a proxy
  // URL in the DB — the same bug that affects updateMuseAction.
  const novelist: UpdateNovelistPayload = {
    ..._novelist,
    image: reverseWsrvUrl(_novelist.image),
    avatar: _novelist.avatar
      ? {
          ..._novelist.avatar,
          src: reverseWsrvUrl(_novelist.avatar.src),
          crop: _novelist.avatar.crop
            ? {
                ..._novelist.avatar.crop,
                src: reverseWsrvUrl(_novelist.avatar.crop.src),
              }
            : _novelist.avatar.crop,
        }
      : _novelist.avatar,
    banner: _novelist.banner
      ? {
          ..._novelist.banner,
          src: reverseWsrvUrl(_novelist.banner.src),
          crop: _novelist.banner.crop
            ? {
                ..._novelist.banner.crop,
                src: reverseWsrvUrl(_novelist.banner.crop.src),
              }
            : _novelist.banner.crop,
        }
      : _novelist.banner,
  };

  Logger.debug("updateUserNovelist", novelist);

  const response = await fetch(URL, {
    body: JSON.stringify(novelist),
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

  const savedNovelist: Novelist = Object.assign(
    {},
    {
      ...result,
      message: undefined,
    },
  );

  return savedNovelist;
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

export const addNoteAction = async (
  text: string,
  color: string | null,
  emoji: string | null,
): Promise<NovelistNote | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/note`;

  const response = await fetch(URL, {
    body: JSON.stringify({ text, color, emoji }),
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return response.json() as Promise<NovelistNote>;
};

export const deleteBannerAction = async (): Promise<{ message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/banner`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const deleteNoteAction = async (): Promise<{ message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/note`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  // 404 means the note didn't exist — still a success state
  if (!response.ok && response.status !== 404) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const getFriendsByUsernameAction = async (
  username: string,
  pageNumber: number,
  pageSize: number,
): Promise<Friend[]> => {
  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };

  const jwt = await getJWTIfExists();
  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/friends?username=${username}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    return [];
  }

  const friends: Friend[] = await response.json();

  for (const f of friends) transformFriend(f, "feed");

  return friends;
};

export const getReactionLikersAction = async (
  targetId: string,
  pageNumber: number,
  pageSize: number,
): Promise<Friend[]> => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/react/${targetId}/likers?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  if (!response.ok) {
    return [];
  }

  const likers: Friend[] = await response.json();

  for (const f of likers) transformFriend(f, "feed");

  return likers;
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
