"use server";
import { authenticateAndGetJWT } from "@/app/actions";
import { Muse } from "@/types";
import { WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getMuseAction = async (museId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getMuseAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse = await response.json();

  return muse;
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
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  return muse;
};

export const updateMuseAction = async (_muse: Muse) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse`;

  Logger.debug("updateMuse", _muse);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_muse),
    cache: "no-store",
  });

  if (response.status !== 200) {
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
};
