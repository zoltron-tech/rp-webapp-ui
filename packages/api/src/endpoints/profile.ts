import type { Prompt, SubmitPromptInput, SubmitPromptType } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import type { Friend } from "@nw/types/novelist";
import { escapeS3Key, s3KeyFromUrl } from "@nw/utils";
import type { ApiClient } from "../client";

const PORTFOLIO = "/rp/portfolio";
const CONNECTION = `${PORTFOLIO}/novelist/connection`;

export interface PresignedFileUploadObject {
  uploadUrl: string;
  fileUrl: string;
  method: string;
}

/**
 * What the service needs in order to sign an upload.
 *
 * The plain-object form of the request, and the one every caller should reach
 * for. `getPresignedFileUploadObject` below takes a `FormData` instead, because
 * on web it is called straight from a server action that receives one — but
 * React Native's `FormData` implements `append` and nothing else (no `get`), so
 * a native caller handed one back gets `undefined` for every field and an
 * unsigned request. Splitting the two is what stops that being discovered at
 * runtime on a phone.
 */
export interface PresignedUploadRequest {
  contentType: string;
  prefix?: string | null;
  mediaBucket?: string | null;
  /** False drops the per-user id segment from the key (admin thread-generator). */
  scoped?: boolean;
}

export const requestPresignedUpload = async (
  api: ApiClient,
  { contentType, mediaBucket, prefix, scoped }: PresignedUploadRequest,
): Promise<PresignedFileUploadObject | API_MESSAGE.MediaError> => {
  const queryParams = new URLSearchParams({ contentType });
  if (prefix) queryParams.append("prefix", prefix);
  queryParams.append("mediaBucket", mediaBucket ?? "APP_MEDIA");
  if (scoped === false) queryParams.append("scoped", "false");

  const response = await api.raw(
    `${PORTFOLIO}/s3/presigned-url?${queryParams.toString()}`,
    { label: "getPresignedFileUploadObject" },
  );

  if (!response.ok) return API_MESSAGE.MediaError;

  const { uploadUrl, fileUrl, method } =
    (await response.json()) as PresignedFileUploadObject;

  return { fileUrl, method, uploadUrl };
};

/** The `FormData` front door, for the web server actions that already hold one. */
export const getPresignedFileUploadObject = (
  api: ApiClient,
  formData: FormData,
): Promise<PresignedFileUploadObject | API_MESSAGE.MediaError> =>
  requestPresignedUpload(api, {
    contentType: formData.get("contentType") as string,
    mediaBucket: formData.get("mediaBucket") as string | null,
    prefix: formData.get("prefix") as string | null,
    scoped: formData.get("scoped") !== "false",
  });

/**
 * `POST /s3/upload`, telling a refused image apart from a failed upload: the
 * service screens images for sexual content before storing them and answers
 * 422 when it refuses one (APP_STORE_REVIEW_PLAN.md H1).
 */
export const uploadMediaScreened = async (
  api: ApiClient,
  formData: FormData,
): Promise<string | API_MESSAGE.MediaError | API_MESSAGE.MediaRejected> => {
  const response = await api.raw(`${PORTFOLIO}/s3/upload`, {
    body: formData,
    label: "uploadMedia",
    method: "POST",
  });

  if (response.status === 422) return API_MESSAGE.MediaRejected;
  if (!response.ok) return API_MESSAGE.MediaError;

  const result = (await response.json()) as WithMessage;
  return result.message;
};

/**
 * The same, with a refusal folded into `MediaError` — for the web callers,
 * which compare against `MediaError` alone and would otherwise take the
 * rejection string for a URL.
 */
export const uploadMedia = async (
  api: ApiClient,
  formData: FormData,
): Promise<string | API_MESSAGE.MediaError> => {
  const result = await uploadMediaScreened(api, formData);
  return result === API_MESSAGE.MediaRejected ? API_MESSAGE.MediaError : result;
};

/**
 * Screens a file just PUT to a presigned URL. `false` only when the service
 * refused it — it has already deleted the object, so the URL must not be used.
 * Anything else (allowed, not an image, the check unavailable, a service that
 * predates the route) is `true`: the check fails open, as it does server-side.
 */
export const moderateUpload = async (
  api: ApiClient,
  fileUrl: string,
): Promise<boolean> => {
  try {
    const response = await api.raw(`${PORTFOLIO}/s3/moderate`, {
      body: { fileUrl },
      label: "moderateUpload",
      method: "POST",
    });
    return response.status !== 422;
  } catch {
    return true;
  }
};

/** Unauthenticated by design — the enhance endpoint never checked a token. */
export const enhanceAvatar = async (
  api: ApiClient,
  formData: FormData,
): Promise<string | API_MESSAGE.MediaError> => {
  const response = await api.raw(`${PORTFOLIO}/s3/enhance`, {
    anonymous: true,
    body: formData,
    label: "enhanceAvatar",
    method: "POST",
  });

  if (!response.ok) return API_MESSAGE.MediaError;
  return (await response.json()) as string;
};

/** Best-effort: failures are logged by the client and otherwise ignored. */
export const deleteMedia = async (
  api: ApiClient,
  filename: string,
): Promise<void> => {
  const parsedFilename = escapeS3Key(s3KeyFromUrl(filename));
  try {
    await api.raw(`${PORTFOLIO}/s3/delete/${parsedFilename}`, {
      label: "deleteMedia",
      method: "DELETE",
    });
  } catch {
    // The caller has no recovery path for a failed cleanup.
  }
};

// ─── Connections ─────────────────────────────────────────────────────────────

const connectionCall = (
  api: ApiClient,
  path: string,
  label: string,
  body?: unknown,
  method: "POST" | "DELETE" = "POST",
) => api.request<WithMessage>(path, { body, label, method });

export const sendFriendRequest = (api: ApiClient, novelistId: string) =>
  connectionCall(api, `${CONNECTION}/invoke`, "sendFriendRequest", {
    connectionType: "PENDING_FRIEND_REQUEST",
    targetId: novelistId,
  });

export const blockUser = (api: ApiClient, novelistId: string) =>
  connectionCall(api, `${CONNECTION}/invoke`, "blockUser", {
    connectionType: "BLOCKED",
    targetId: novelistId,
  });

export const blacklistUser = (api: ApiClient, novelistId: string) =>
  connectionCall(api, `${CONNECTION}/invoke`, "blacklistUser", {
    connectionType: "BLACKLISTED",
    targetId: novelistId,
  });

export const acceptFriendRequest = (api: ApiClient, novelistId: string) =>
  connectionCall(api, `${CONNECTION}/react`, "acceptFriendRequest", {
    connectionType: "FRIEND",
    sourceId: novelistId,
  });

export const deleteFriendRequest = (api: ApiClient, novelistId: string) =>
  connectionCall(api, `${CONNECTION}/delete`, "deleteFriendRequest", {
    connectionType: "PENDING_FRIEND_REQUEST",
    sourceId: novelistId,
  });

export const cancelFriendRequest = (api: ApiClient, novelistId: string) =>
  connectionCall(api, `${CONNECTION}/cancel`, "cancelFriendRequest", {
    connectionType: "PENDING_FRIEND_REQUEST",
    targetId: novelistId,
  });

export const unfriendNovelist = (api: ApiClient, novelistId: string) =>
  connectionCall(
    api,
    `${CONNECTION}/${novelistId}/unfriend`,
    "unfriendNovelist",
    undefined,
    "DELETE",
  );

export const reportProfile = (
  api: ApiClient,
  novelistId: string,
  reason: string,
) =>
  connectionCall(api, `${PORTFOLIO}/report`, "reportProfile", {
    reason,
    targetId: novelistId,
    targetType: "PROFILE",
  });

export const sendFeedbackMessage = (api: ApiClient, message: string) =>
  connectionCall(api, `${PORTFOLIO}/feedback`, "sendFeedbackMessage", {
    message,
  });

// ─── Prompts ─────────────────────────────────────────────────────────────────

export interface PromptResponse {
  message: API_MESSAGE;
  /**
   * The persisted prompt (with its real id), present on a successful create so
   * the client can render it without a follow-up fetch.
   */
  prompt?: Prompt;
}

export const submitPrompt = async (
  api: ApiClient,
  prompt: SubmitPromptInput,
  type: SubmitPromptType = "prompt",
): Promise<PromptResponse> => {
  const path =
    type === "prompt" ? `${PORTFOLIO}/prompt` : `${PORTFOLIO}/prompt/${type}`;

  const response = await api.raw(path, {
    body: prompt,
    label: "submitPrompt",
    method: "POST",
  });

  // This endpoint maps statuses to distinct messages the form renders
  // individually, so it cannot use the generic error shape.
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

  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };

  return (await response.json()) as PromptResponse;
};

// ─── Lists ───────────────────────────────────────────────────────────────────

/** Falls back to an empty list — these render a list or nothing. */
const listOrEmpty = async (
  api: ApiClient,
  path: string,
  label: string,
): Promise<Friend[]> => {
  const response = await api.raw(path, { label });
  if (!response.ok) return [];
  return (await response.json()) as Friend[];
};

export const getBlockedNovelists = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
) =>
  listOrEmpty(
    api,
    `${PORTFOLIO}/novelist/blocked?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    "getBlockedNovelistsAction",
  );

export const getReferredNovelists = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
) =>
  listOrEmpty(
    api,
    `${PORTFOLIO}/novelist/referrals?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    "getReferredNovelistsAction",
  );

export const unblockNovelist = async (
  api: ApiClient,
  novelistId: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${CONNECTION}/${novelistId}/unblock`, {
    label: "unblockNovelistAction",
    method: "DELETE",
  });
  return { message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};
