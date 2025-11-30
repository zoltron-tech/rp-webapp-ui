"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT } from "@/app/actions";
import type { Comment, Reply } from "@/types";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
  MEDIA_JSON_HEADER_VALUE,
} from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const reportPromptCommentReply = async (
  replyId: string,
  reason: string,
  targetType: string,
) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/report`;
  const body = {
    reason,
    targetId: replyId,
    targetType: targetType,
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

export const getCommentAction = async (commentId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/comment/${commentId}`;

  const response = await fetch(URL, {
    cache: "no-store",
  });

  Logger.debug("getCommentAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
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
  } else if (!response.ok) {
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
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const comments: Comment[] = await response.json();

  return comments;
};

export const deleteReplyAction = async (replyId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/reply/${replyId}`;
  const jwt = await authenticateAndGetJWT();

  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
    [AUTH_HEADER_NAME]: jwt,
  };

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
    method: "DELETE",
  });

  Logger.debug("deleteReplyAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }
  const result = await response.json();
  return result;
};

export const deleteCommentAction = async (commentId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/comment/${commentId}`;
  const jwt = await authenticateAndGetJWT();

  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
    [AUTH_HEADER_NAME]: jwt,
  };

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
    method: "DELETE",
  });

  Logger.debug("deleteCommentAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }
  const result = await response.json();
  return result;
};

export const deletePromptAction = async (promptId: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/prompt/${promptId}`;
  const jwt = await authenticateAndGetJWT();

  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
    [AUTH_HEADER_NAME]: jwt,
  };

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
    method: "DELETE",
  });

  Logger.debug("deletePromptAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }
  const result = await response.json();
  return result;
};
