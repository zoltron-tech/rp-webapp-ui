"use server";

import getConfig from "next/config";
import { authenticateAndGetJWT } from "@/app/actions";
import type {
  Prompt,
  StoryBoardEventThreadInput,
  SubmitPromptInput,
  SubmitPromptType,
} from "@/types";
import type { WithMessage } from "@/types/common";
import type { Friend } from "@/types/novelist";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

type PresignedFileUploadObject = {
  uploadUrl: string;
  fileUrl: string;
  method: string;
};

export const getPresignedFileUploadObject = async (formData: FormData) => {
  const jwt = await authenticateAndGetJWT();

  const contentType = formData.get("contentType") as string;
  const prefix = formData.get("prefix") as string | null;
  const mediaBucket = formData.get("mediaBucket") as string | null;

  // Build query parameters dynamically
  const queryParams = new URLSearchParams({ contentType });
  if (prefix) {
    queryParams.append("prefix", prefix);
  }
  queryParams.append("mediaBucket", mediaBucket ?? "APP_MEDIA");

  console.log("Requesting presigned URL with params:", {
    contentType,
    mediaBucket,
    prefix,
  });

  const presignRes = await fetch(
    `${RP_SERVICE_URL}/rp/portfolio/s3/presigned-url?${queryParams.toString()}`,
    {
      headers: {
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "GET",
    },
  );

  console.log("Presigned URL response status:", presignRes);

  if (!presignRes.ok) {
    console.error(
      "Failed to get presigned URL",
      presignRes.status,
      presignRes.statusText,
    );
    return API_MESSAGE.MediaError;
  }

  const { uploadUrl, fileUrl, method }: PresignedFileUploadObject =
    await presignRes.json();

  return {
    fileUrl,
    method,
    uploadUrl,
  };
};

export const uploadMedia = async (formData: FormData) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/upload`;
  const file = formData.get("file");
  Logger.debug("file", file);

  const response = await fetch(URL, {
    body: formData,
    cache: "no-store",
    headers: {
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    Logger.error("error", response.status, response.statusText);
    return API_MESSAGE.MediaError;
  }

  const result: WithMessage = await response.json();

  return result.message;
};

export const enhanceAvatar = async (formData: FormData) => {
  const _jwt = authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/enhance`;

  const file = formData.get("file");

  Logger.debug("file", file);

  const response = await fetch(URL, {
    body: formData,
    cache: "no-store",
    method: "POST",
  });

  if (!response.ok) {
    Logger.debug("error", response.status, response.statusText);
    return API_MESSAGE.MediaError;
  }

  const result: string = await response.json();

  return result;
};

export const getS3KeyFromUrl = (url: string): string => {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url;
  }
};

export const deleteMedia = async (filename: string) => {
  const jwt = await authenticateAndGetJWT();
  const s3Key = getS3KeyFromUrl(filename).replace(/^\/+/, "");
  const parsedFilename = s3Key.replace(/\//g, "-slash-");
  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/delete/${parsedFilename}`;

  try {
    const res = await fetch(URL, {
      cache: "no-store",
      headers: {
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "DELETE",
    });
    console.log("Delete response:", res.status, await res.text());
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

export const sendFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/invoke`;
  const body = {
    connectionType: "PENDING_FRIEND_REQUEST",
    targetId: novelistId,
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

export const blockUser = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/invoke`;
  const body = {
    connectionType: "BLOCKED",
    targetId: novelistId,
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

export const blacklistUser = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/invoke`;
  const body = {
    connectionType: "BLACKLISTED",
    targetId: novelistId,
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

export const acceptFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/react`;
  const body = {
    connectionType: "FRIEND",
    sourceId: novelistId,
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

export const deleteFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/delete`;
  const body = {
    connectionType: "PENDING_FRIEND_REQUEST",
    sourceId: novelistId,
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

export const cancelFriendRequest = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/cancel`;
  const body = {
    connectionType: "PENDING_FRIEND_REQUEST",
    targetId: novelistId,
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

export const reportProfile = async (novelistId: string, reason: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/report`;
  const body = {
    reason,
    targetId: novelistId,
    targetType: "PROFILE",
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

export const sendFeedbackMessage = async (message: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/feedback`;
  const body = {
    message,
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

export const unfriendNovelist = async (novelistId: string) => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/${novelistId}/unfriend`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const result = await response.json();

  return result;
};

type PromptResponse = {
  message: API_MESSAGE;
  /** The persisted prompt (with its real id), present on a successful create so
   *  the client can render it without a follow-up fetch. */
  prompt?: Prompt;
};

export const submitPrompt = async (
  prompt: SubmitPromptInput,
  type: SubmitPromptType = "prompt",
): Promise<PromptResponse> => {
  const jwt = await authenticateAndGetJWT();

  const promptWithoutTag = { ...prompt };

  let URL = `${RP_SERVICE_URL}/rp/portfolio/prompt`;

  if (type !== "prompt") {
    URL += `/${type}`;
  }

  const response = await fetch(URL, {
    body: JSON.stringify(promptWithoutTag),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  switch (response.status) {
    case 400:
      return { message: API_MESSAGE.BadPayload };
    case 401:
      return { message: API_MESSAGE.Unauthorized };
    case 403:
      return { message: API_MESSAGE.NotAllowed };
    case 500:
      return { message: API_MESSAGE.ServerError };
  }

  if (!response.ok) {
    console.log(
      "error",
      promptWithoutTag,
      URL,
      response.status,
      response.statusText,
    );
    return { message: API_MESSAGE.UncategorizedError };
  }

  const result = await response.json();

  return result;
};

export const getBlockedNovelistsAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<Friend[]> => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/blocked?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getBlockedNovelistsAction", response.status);

  if (!response.ok) {
    return [];
  }

  return response.json();
};

export const getReferredNovelistsAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<Friend[]> => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/referrals?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getReferredNovelistsAction", response.status);

  if (!response.ok) {
    return [];
  }

  return response.json();
};

export const unblockNovelistAction = async (
  novelistId: string,
): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/connection/${novelistId}/unblock`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("unblockNovelistAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const submitEventThreadReply = async (
  input: StoryBoardEventThreadInput,
): Promise<PromptResponse> => {
  const jwt = await authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${input.storyBoardEventId}/reply`;

  const response = await fetch(URL, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  switch (response.status) {
    case 400:
      return { message: API_MESSAGE.BadPayload };
    case 401:
      return { message: API_MESSAGE.Unauthorized };
    case 403:
      return { message: API_MESSAGE.NotAllowed };
    case 500:
      return { message: API_MESSAGE.ServerError };
  }

  if (!response.ok) {
    console.log("error", input, URL, response.status, response.statusText);
    return { message: API_MESSAGE.UncategorizedError };
  }

  const result = await response.json();

  return result;
};
