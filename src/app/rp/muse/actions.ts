"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type { CreateUpdateMuse, Fandom, Muse } from "@/types";
import type { WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
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
    cache: "no-store",
    headers,
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/by/${username}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const URL = `${RP_SERVICE_URL}/rp/portfolio/fandom/search?prefix=${prefix}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
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
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
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
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
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

export const updateMuseAction = async (
  _museId: string | null,
  _muse: CreateUpdateMuse,
) => {
  console.log("action");
  const jwt = await authenticateAndGetJWT();
  console.log(jwt);
  // Choose URL and HTTP method dynamically
  const isUpdate = !!_museId && _museId.trim() !== "";
  const URL = isUpdate
    ? `${RP_SERVICE_URL}/rp/portfolio/muse/${_museId}`
    : `${RP_SERVICE_URL}/rp/portfolio/muse`;
  const method = isUpdate ? "PUT" : "POST";

  Logger.debug("updateMuseAction", { method, muse: _muse, URL });

  console.log("updating");

  try {
    const response = await fetch(URL, {
      body: JSON.stringify(_muse),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method,
    });

    console.log(response);

    if (!response.ok) {
      Logger.debug(
        "updateMuseAction error",
        response.status,
        response.statusText,
      );
      return { message: API_MESSAGE.Error };
    }

    const result: WithMessage<Muse> = await response.json();
    Logger.debug("updateMuseAction result", result);

    const muse: Muse = Object.assign(
      {},
      {
        ...result,
        message: undefined,
      },
    );

    return muse;
  } catch (e) {
    Logger.error("updateMuseAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};
