"use server";
import { authenticateAndGetJWT } from "@/app/actions";
import { Muse, Novelist, StoryBoard, StoryBoardMember } from "@/types";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";
import { WithMessage } from "@/types/common";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const addStoryBoardMember = async (
  _storyboardMember: StoryBoardMember
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
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const removeStoryBoardMember = async (
  _storyboardMember: StoryBoardMember
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
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const result: WithMessage = await response.json();

  return result;
};
