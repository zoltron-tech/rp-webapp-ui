"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type { Comment, Prompt } from "@/types";
import type { DataType } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getPromptAction = async (
  promptId: string,
): Promise<DataType<Prompt>> => {
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

export const getPromptsByMuseAction = async (
  museId: string,
): Promise<DataType<Prompt[]>> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/by/${museId}`;

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
    body: JSON.stringify(_prompt),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
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

export const updatePromptCommentAction = async (
  promptId: string,
  updatedText: string,
  promptType: "prompt" | "comment" | "reply",
) => {
  const jwt = await authenticateAndGetJWT();

  const slug = promptType !== "prompt" ? `${promptType}/` : "";

  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/${slug}${promptId}`;

  const body = {
    updatedText: updatedText,
  };

  console.log(body, URL);
  const response = await fetch(URL, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "PUT",
  });

  console.log(response);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};
