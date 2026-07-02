"use server";
import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import type { Prompt } from "@/types";
import type { DataType } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getPostsByNovelistAction = async (
  novelistId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Prompt[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const url = `${RP_SERVICE_URL}/rp/portfolio/prompt/posts/by/${novelistId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getPostsByNovelistAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const prompts: Prompt[] = await response.json();

  return prompts;
};

export const getPromptsByNovelistAction = async (
  novelistId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Prompt[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const url = `${RP_SERVICE_URL}/rp/portfolio/prompt/posts/muses/by/${novelistId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getPromptsByNovelistAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const prompts: Prompt[] = await response.json();

  return prompts;
};
