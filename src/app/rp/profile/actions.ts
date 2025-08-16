"use server";

import getConfig from "next/config";
import { authenticateAndGetJWT } from "@/app/actions";
import type { SubmitPromptInput, SubmitPromptType } from "@/types";
import type { WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const uploadMedia = async (formData: FormData) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/upload`;
  const file = formData.get("file");
  Logger.debug("file", file);

  const response = await fetch(URL, {
    body: formData,
    cache: "no-store",
    headers: {
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
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
    body: formData,
    cache: "no-store",
    method: "POST",
  });

  if (!response.ok) {
    Logger.debug("error", response.status, response.statusText);
    return API_MESSAGE.MediaError;
  }

  const result: string = await response.json();

  return result;
};

export const deleteMedia = async (filename: string) => {
  const parsedFilename = filename.replace("/", "-slash-");
  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/delete/${parsedFilename}`;

  console.log("removing media", URL);

  await fetch(URL, {
    cache: "no-store",
    method: "DELETE",
  });
};

export const sendFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/invoke`;
  const body = {
    connectionType: "PENDING_FRIEND_REQUEST",
    targetId: novelistId,
  };

  const response = await fetch(URL, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

export const acceptFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/react`;
  const body = {
    connectionType: "FRIEND",
    sourceId: novelistId,
  };

  const response = await fetch(URL, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

export const deleteFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/delete`;
  const body = {
    connectionType: "PENDING_FRIEND_REQUEST",
    sourceId: novelistId,
  };
  const response = await fetch(URL, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

export const cancelFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/cancel`;
  const body = {
    connectionType: "PENDING_FRIEND_REQUEST",
    targetId: novelistId,
  };

  const response = await fetch(URL, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

type PromptResponse = {
  message: API_MESSAGE;
};

export const submitPrompt = async (
  prompt: SubmitPromptInput,
  type: SubmitPromptType = "prompt",
): Promise<PromptResponse> => {
  const jwt = await authenticateAndGetJWT();

  const promptWithoutTag = { ...prompt };

  let URL = `${RP_SERVICE_URL}/rp/portfolio/prompt`;

  if (type !== "prompt") {
    URL += `/${type}`;
  }

  const response = await fetch(URL, {
    body: JSON.stringify(promptWithoutTag),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  switch (response.status) {
    case 400:
      return { message: API_MESSAGE.BadPayload };
    case 401:
      return { message: API_MESSAGE.Unauthorized };
    case 403:
      return { message: API_MESSAGE.AccessDenied };
    case 500:
      return { message: API_MESSAGE.ServerError };
  }

  if (!response.ok) {
    console.log(
      "error",
      promptWithoutTag,
      URL,
      response.status,
      response.statusText,
    );
    return { message: API_MESSAGE.UncategorizedError };
  }

  const result = await response.json();

  return result;
};
