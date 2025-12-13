"use server";
import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import type { PromptThreadComment } from "@/types";
import type { DataType } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getOutgoingThreadsAction = async (): Promise<
  DataType<PromptThreadComment[]>
> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/outgoing`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getOutgoingThreadsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard = await response.json();

  return storyBoard;
};
