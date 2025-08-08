"use server";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import { StoryBoard, StoryBoardEvent, StoryBoardEventThread } from "@/types";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getAllStoryboardsByUsernameAction = async (username: string) => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/by/${username}`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  Logger.debug("getAllStoryboardsByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard[] = await response.json();

  return storyBoard;
};

export const getStoryboardAction = async (storyboardId: string) => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  Logger.debug("getStoryboardAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard = await response.json();

  return storyBoard;
};

export const getAllStoryboardsAction = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getAllStoriesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_storyboard),
    cache: "no-store",
  });

  if (response.status !== 200) {
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
    }
  );

  return storyboard;
};

export const updateStoryBoardEventAction = async (
  _storyboardEvent: StoryBoardEvent
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event`;

  console.log(_storyboardEvent);

  Logger.debug("updateStoryBoardEvent", _storyboardEvent);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_storyboardEvent),
    cache: "no-store",
  });

  console.log(response);

  if (response.status !== 200) {
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
    }
  );

  return storyboardEvent;
};

export const getStoryboardEventAction = async (storyboardEventId: string) => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  Logger.debug("getStoryboardEventAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  console.log(response);

  const storyBoardEvent: StoryBoardEvent = await response.json();

  return storyBoardEvent;
};

export const getStoryboardEventThreadsAction = async (
  storyboardEventId: string
) => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/threads`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  Logger.debug("getStoryboardEventThreadsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoardEventThreads: StoryBoardEventThread[] = await response.json();

  return storyBoardEventThreads;
};
