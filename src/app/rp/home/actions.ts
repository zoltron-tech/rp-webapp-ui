"use server";

import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type { Muse, Novelist, StoryBoard } from "@/types";
import type { Activity } from "@/types/activity";
import type { DataType } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import {
  transformActivity,
  transformMuse,
  transformNovelist,
} from "@/utils/image";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getStrangerNovelistsAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Novelist[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/suggestions?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getAllStoryboardsByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const novelists: Novelist[] = await response.json();

  for (const n of novelists) transformNovelist(n, "feed");

  return novelists;
};

export const getMusesAction = async (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
): Promise<DataType<Muse[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muses: Muse[] = await response.json();

  for (const m of muses) transformMuse(m, "feed");

  return muses;
};

export const getMusesWithVideosAction = async (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
): Promise<DataType<Muse[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${type}/videos?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muses: Muse[] = await response.json();

  for (const m of muses) transformMuse(m, "feed");

  return muses;
};

export const getUserActivities = async (
  username: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Activity[]>> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/activity/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  // Auth is optional: with a token the backend marks media activities the
  // viewer has reacted to (`reacted`), so their heart renders filled.
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const response = await fetch(URL, { cache: "no-store", headers });
  Logger.debug("getUserActivities", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const activities: Activity[] = await response.json();

  for (const a of activities) transformActivity(a, "feed");

  return activities;
};

export const getFriendActivities = async (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
): Promise<DataType<Activity[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/activity/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getFriendActivities", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const activities: Activity[] = await response.json();

  for (const a of activities) transformActivity(a, "feed");

  return activities;
};

export const getRandomStories = async (
  pageNumber: number,
  pageSize: number,
): Promise<DataType<StoryBoard[]>> => {
  // Auth is optional: without a token only published (public) stories come
  // back; with one, the backend also folds in stories the novelist is a
  // member of (see StoryBoardService.getRandomStoryboards).
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/random?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, { cache: "no-store", headers });
  Logger.debug("getRandomStories", response.status);

  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyboards: StoryBoard[] = await response.json();

  return storyboards;
};
