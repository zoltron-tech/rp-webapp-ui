"use server";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import { Fandom, Muse } from "@/types";
import { WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getMuseAction = async (museId: string) => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const response = await fetch(URL, {
    headers,
    cache: "no-store",
  });

  Logger.debug("getMuseAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse = await response.json();

  return muse;
};

export const getAllMusesByUsernameAction = async (username: string) => {
  const jwt = await getJWTIfExists();
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/by/${username}`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  Logger.debug("getAllMusesByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  return muse;
};

export const searchFandomsAction = async (prefix: string) => {
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const URL = `${RP_SERVICE_URL}/rp/portfolio/fandom/search?prefix=${prefix}`;

  const response = await fetch(URL, {
    headers: headers,
    cache: "no-store",
  });

  Logger.debug("searchFandomsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const fandoms: Fandom[] = await response.json();

  return fandoms;
};

export const getAllMusesAction = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/all`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  Logger.debug("getAllMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  return muse;
};

export const getHeroPageMusesAction = async () => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/random`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  Logger.debug("getHeroPageMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  return muse;
};

export const updateMuseAction = async (_muse: Muse) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse`;

  Logger.debug("updateMuse", _muse);

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      body: JSON.stringify(_muse),
      cache: "no-store",
    });

    console.log(JSON.stringify(_muse));

    console.log(response);

    if (!response.ok) {
      Logger.debug("error", response.status, response.statusText);
      return { message: API_MESSAGE.Error };
    }

    const result: WithMessage<Muse> = await response.json();
    Logger.debug("updateMuse", result);

    const novelist: Muse = Object.assign(
      {},
      {
        ...result,
        message: undefined,
      }
    );

    return novelist;
  } catch (e) {
    console.log(e, JSON.stringify(_muse));
    return { message: API_MESSAGE.Error };
  }
};
