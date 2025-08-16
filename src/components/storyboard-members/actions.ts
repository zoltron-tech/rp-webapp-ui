"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT } from "@/app/actions";
import type { StoryBoardMember } from "@/types";
import type { WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const addStoryBoardMember = async (
  _storyboardMember: StoryBoardMember,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/member`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_storyboardMember),
    cache: "no-store",
  });

  console.log(response);

  Logger.debug("addStoryBoardMember", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const removeStoryBoardMember = async (
  _storyboardMember: StoryBoardMember,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/member`;

  const response = await fetch(URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    body: JSON.stringify(_storyboardMember),
    cache: "no-store",
  });

  Logger.debug("removeStoryBoardMember", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result: WithMessage = await response.json();

  return result;
};
