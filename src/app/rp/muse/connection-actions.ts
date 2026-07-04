"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type { MuseConnectionGroup } from "@/types";
import type { DataType, WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const createMuseConnectionAction = async (
  title: string,
  description: string | null,
  museIds: string[],
): Promise<MuseConnectionGroup | WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/connection`;
  try {
    const response = await fetch(URL, {
      body: JSON.stringify({ description, museIds, title }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "POST",
    });

    Logger.debug("createMuseConnectionAction", response.status);

    if (!response.ok) {
      return { message: API_MESSAGE.Error };
    }

    return response.json();
  } catch (e) {
    Logger.error("createMuseConnectionAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const getMuseConnectionsByMuseAction = async (
  museId: string,
): Promise<DataType<MuseConnectionGroup[]>> => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/connection/by/${museId}`;

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

  Logger.debug("getMuseConnectionsByMuseAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return response.json();
};

export const reactToMuseConnectionAction = async (
  connectionId: string,
  accepted: boolean,
): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/connection/${connectionId}/react`;
  try {
    const response = await fetch(URL, {
      body: JSON.stringify({ accepted }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "POST",
    });

    Logger.debug("reactToMuseConnectionAction", response.status);

    if (!response.ok) {
      return { message: API_MESSAGE.Error };
    }
    return { message: API_MESSAGE.Success };
  } catch (e) {
    Logger.error("reactToMuseConnectionAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const reRequestMuseConnectionAction = async (
  connectionId: string,
): Promise<MuseConnectionGroup | WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/connection/${connectionId}/rerequest`;
  try {
    const response = await fetch(URL, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "POST",
    });

    Logger.debug("reRequestMuseConnectionAction", response.status);

    if (!response.ok) {
      return { message: API_MESSAGE.Error };
    }

    return response.json();
  } catch (e) {
    Logger.error("reRequestMuseConnectionAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const updateMuseConnectionAction = async (
  connectionId: string,
  title: string,
  description: string | null,
): Promise<MuseConnectionGroup | WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/connection/${connectionId}`;
  try {
    const response = await fetch(URL, {
      body: JSON.stringify({ description, title }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "PUT",
    });

    Logger.debug("updateMuseConnectionAction", response.status);

    if (!response.ok) {
      return { message: API_MESSAGE.Error };
    }

    return response.json();
  } catch (e) {
    Logger.error("updateMuseConnectionAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const deleteMuseConnectionAction = async (
  connectionId: string,
): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/connection/${connectionId}`;
  try {
    const response = await fetch(URL, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "DELETE",
    });

    Logger.debug("deleteMuseConnectionAction", response.status);

    if (!response.ok) {
      return { message: API_MESSAGE.Error };
    }
    return { message: API_MESSAGE.Success };
  } catch (e) {
    Logger.error("deleteMuseConnectionAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};
