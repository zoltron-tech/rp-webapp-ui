"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT } from "@/app/actions";
import type { DataType } from "@/types/common";
import type { Song } from "@/types/music";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getOwnMusicAction = async (): Promise<DataType<Song[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/songs`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getOwnMusicAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const songs: Song[] = await response.json();

  return songs;
};

export const getSongAction = async (id: string): Promise<Song | null> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/songs/${id}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getSongAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return null;
  }

  const song: Song = await response.json();

  return song;
};

export const createSongAction = async (songData: {
  name: string;
  description: string | null;
  url: string;
  tags: Array<{ label: string; color: string }>;
}): Promise<Song | typeof API_MESSAGE.UncategorizedError> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/songs`;

  const response = await fetch(URL, {
    body: JSON.stringify(songData),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("createSongAction", response.status);

  if (!response.ok) {
    return API_MESSAGE.UncategorizedError;
  }

  const song: Song = await response.json();

  return song;
};

export const updateSongAction = async (
  id: string,
  songData: {
    name: string;
    description: string | null;
    tags: Array<{ label: string; color: string }>;
  },
): Promise<Song | typeof API_MESSAGE.UncategorizedError> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/songs/${id}`;

  const response = await fetch(URL, {
    body: JSON.stringify(songData),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "PUT",
  });

  Logger.debug("updateSongAction", response.status);

  if (!response.ok) {
    return API_MESSAGE.UncategorizedError;
  }

  const song: Song = await response.json();

  return song;
};

export const deleteSongAction = async (
  id: string,
): Promise<{ message: string } | null> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/songs/${id}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteSongAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return null;
  }

  return { message: API_MESSAGE.Success };
};
