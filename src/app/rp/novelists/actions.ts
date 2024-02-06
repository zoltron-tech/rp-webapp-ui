"use server";
import { authenticateAndGetJWT, logoutAction } from "@/app/actions";
import { Novelist } from "@/types";
import { SearchResult, WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getNovelists = async () => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/all`;

  const response = await fetch(URL, { cache: "no-store" });
  Logger.log("getNovelists", response.status);

  if (response.status === 404) {
    return [];
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const novelists: Novelist[] = await response.json();

  return novelists;
};

export const getNovelistAction = async (username: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/${username}`;

  const response = await fetch(URL, { cache: "no-store" });

  console.log("getNovelistAction", response.status);

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
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    Logger.log(API_MESSAGE.Error, response.status, response.statusText);
    logoutAction();
  }

  const novelist: Novelist = await response.json();

  return novelist;
};

export const updateUserNovelist = async (_novelist: Novelist) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist`;

  Logger.log("updateUserNovelist", _novelist);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_novelist),
    cache: "no-store",
  });

  if (response.status !== 200) {
    Logger.log("error", response.status, response.statusText);
    return { message: API_MESSAGE.Error };
  }

  const result: WithMessage<Novelist> = await response.json();
  Logger.log("updateUserNovelist", result);

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
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  Logger.log("searchAction", response.status);
  if (response.status === 404) {
    return [];
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = (await response.json()) as SearchResult[];
  return result;
};
