"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type { Comment, Prompt } from "@/types";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getPromptAction = async (promptId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/${promptId}`;

  const jwt = await getJWTIfExists();
  const headers = {
    "Content-Type": "application/json",
    ...(jwt
      ? {
          [AUTH_HEADER_NAME]: jwt,
        }
      : {}),
  };

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getPromptAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const prompt: Prompt = await response.json();

  return prompt;
};

export const getPropmptCommentsAction = async (promptId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/${promptId}/comments`;
  const jwt = await getJWTIfExists();
  const headers = {
    "Content-Type": "application/json",
    ...(jwt
      ? {
          [AUTH_HEADER_NAME]: jwt,
        }
      : {}),
  };

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const comments: Comment[] = await response.json();
  return comments;
};

export const getPromptsByMuseAction = async (museId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/by/${museId}`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getPromptsByMuseAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const prompt: Prompt[] = await response.json();

  return prompt;
};

export const updatePromptAction = async (_prompt: Prompt) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_prompt),
    cache: "no-store",
  });

  if (!response.ok) {
    Logger.debug("error", response.status, response.statusText);
    return { message: API_MESSAGE.Error };
  }

  const result: Prompt = await response.json();
  Logger.debug("updateStoryBoard", result);

  const prompt: Prompt = Object.assign(
    {},
    {
      ...result,
      message: undefined,
    },
  );

  return prompt;
};
