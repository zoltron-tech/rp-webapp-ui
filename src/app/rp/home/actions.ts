"use server";
import { authenticateAndGetJWT } from "@/app/actions";
import { Muse, Novelist, StoryBoard } from "@/types";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";
import { Activity } from "@/types/activity";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getStrangerNovelistsAction = async (
  pageNumber: number,
  pageSize: number
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/suggestions?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getAllStoryboardsByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const novelists: Novelist[] = await response.json();

  return novelists;
};

export const getMusesAction = async (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown"
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muses: Muse[] = await response.json();

  return muses;
};

export const getMusesWithVideosAction = async (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown"
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${type}/videos?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muses: Muse[] = await response.json();

  return muses;
};

export const getUserActivities = async (
  username: string,
  pageNumber: number,
  pageSize: number
) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/activity/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, { cache: "no-store" });
  Logger.debug("getUserActivities", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const activities: Activity[] = await response.json();

  return activities;
};

export const getFriendActivities = async (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown"
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/activity/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getFriendActivities", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const activities: Activity[] = await response.json();

  return activities;
};

export const getRandomStories = async (
  pageNumber: number,
  pageSize: number
) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/random?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, { cache: "no-store" });
  Logger.debug("getNovelists", response.status);

  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyboards: StoryBoard[] = await response.json();

  return storyboards;
};
