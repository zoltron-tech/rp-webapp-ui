"use server";

import { authenticateAndGetJWT } from "@/app/actions";
import { WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const uploadAvatar = async (formData: FormData) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/upload`;
  const file = formData.get("file");

  Logger.debug("file", file);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      [AUTH_HEADER_NAME]: jwt,
    },
    body: formData,
    cache: "no-store",
  });

  if (response.status !== 200) {
    Logger.error("error", response.status, response.statusText);
    return API_MESSAGE.MediaError;
  }

  const result: WithMessage = await response.json();

  return result.message;
};

export const enhanceAvatar = async (formData: FormData) => {
  const _jwt = authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/enhance`;

  const file = formData.get("file");

  Logger.debug("file", file);

  const response = await fetch(URL, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (response.status !== 200) {
    Logger.debug("error", response.status, response.statusText);
    return API_MESSAGE.MediaError;
  }

  const result: string = await response.json();

  return result;
};

export const deleteAvatar = async (filename: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/delete/${filename}`;

  Logger.debug("deleteAvatar", filename);
  const response = await fetch(URL, {
    method: "DELETE",
    cache: "no-store",
  });

  Logger.debug("deleteAvatar: response", response);

  if (response.status !== 200) {
    return { message: "Error deleting avatar" };
  }

  const result = await response.json();

  return result;
};

export const sendFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/invoke`;
  const body = {
    targetId: novelistId,
    connectionType: "PENDING_FRIEND_REQUEST",
  };

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

export const acceptFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/react`;
  const body = {
    sourceId: novelistId,
    connectionType: "FRIEND",
  };

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

export const deleteFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/delete`;
  const body = {
    sourceId: novelistId,
    connectionType: "PENDING_FRIEND_REQUEST",
  };
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

export const cancelFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/cancel`;
  const body = {
    targetId: novelistId,
    connectionType: "PENDING_FRIEND_REQUEST",
  };

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};
