"use server";
import { authenticateAndGetJWT } from "@/app/actions";
import { StoryBoard } from "@/types";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getAllStoryboardsByUsernameAction = async (username: string) => {
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

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
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}`;

  const response = await fetch(URL, {
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
