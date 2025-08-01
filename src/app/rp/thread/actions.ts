"use server";
import { Comment, Reply } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import getConfig from "next/config";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getCommentAction = async (commentId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/comment/${commentId}`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getCommentAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const comment: Comment = await response.json();

  return comment;
};

export const getRepliesAction = async (commentId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/comment/${commentId}/replies`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const replies: Reply[] = await response.json();
  return replies;
};

export const getCommentsByPromptAction = async (promptId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/${promptId}/comments`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getPromptCommentsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    return { message: API_MESSAGE.Error };
  }

  const comments: Comment[] = await response.json();

  return comments;
};
