"use server";
import { Prompt } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";

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
