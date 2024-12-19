"use server";
import { Prompt } from "@/types";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";
import { authenticateAndGetJWT } from "@/app/actions";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getPromptAction = async (promptId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/${promptId}`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getPromptAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const prompt: Prompt = await response.json();

  return prompt;
};

export const getPromptsByMuseAction = async (museId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/by/${museId}`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getPromptsByMuseAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
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

  if (response.status !== 200) {
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
    }
  );

  return prompt;
};
