"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type {
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventThread,
} from "@/types";
import type { DataType } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getAllStoryboardsByUsernameAction = async (
  username: string,
): Promise<DataType<StoryBoard[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/by/${username}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getAllStoryboardsByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard[] = await response.json();

  return storyBoard;
};

export const getStoryboardAction = async (
  storyboardId: string,
): Promise<DataType<StoryBoard>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getStoryboardAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard = await response.json();

  return storyBoard;
};

export const getAllStoryboardsAction = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getAllStoriesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard[] = await response.json();

  return storyBoard;
};

export const updateStoryBoardAction = async (_storyboard: StoryBoard) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story`;

  Logger.debug("updateStoryBoard", _storyboard);

  const response = await fetch(URL, {
    body: JSON.stringify(_storyboard),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    Logger.debug("error", response.status, response.statusText);
    return { message: API_MESSAGE.Error };
  }

  const result: StoryBoard = await response.json();
  Logger.debug("updateStoryBoard", result);

  const storyboard: StoryBoard = Object.assign(
    {},
    {
      ...result,
      message: undefined,
    },
  );

  return storyboard;
};

export const updateStoryBoardEventAction = async (
  _storyboardEvent: StoryBoardEvent,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event`;

  Logger.debug("updateStoryBoardEvent", _storyboardEvent);

  const response = await fetch(URL, {
    body: JSON.stringify(_storyboardEvent),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    Logger.debug("error", response.status, response.statusText);
    return { message: API_MESSAGE.Error };
  }

  const result: StoryBoardEvent = await response.json();
  Logger.debug("updateStoryBoard", result);

  const storyboardEvent: StoryBoardEvent = Object.assign(
    {},
    {
      ...result,
      message: undefined,
    },
  );

  return storyboardEvent;
};

export const getStoryboardEventAction = async (
  storyboardEventId: string,
): Promise<DataType<StoryBoardEvent>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getStoryboardEventAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  console.log(response);

  const storyBoardEvent: StoryBoardEvent = await response.json();

  return storyBoardEvent;
};

export const getStoryboardEventThreadsAction = async (
  storyboardEventId: string,
): Promise<DataType<StoryBoardEventThread[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/threads`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getStoryboardEventThreadsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoardEventThreads: StoryBoardEventThread[] = await response.json();

  return storyBoardEventThreads;
};
