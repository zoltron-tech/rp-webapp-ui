import type { Prompt, SubmitPromptInput, SubmitPromptType } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import type { Friend } from "@nw/types/novelist";
import {
  capForType,
  checkUploadAllowance,
  escapeS3Key,
  isUploadRefusal,
  type StorageUsage,
  s3KeyFromUrl,
  setMediaHosts,
  UPLOAD_FAILED_MESSAGE,
  type UploadCandidate,
  type UploadCaps,
  type UploadLimits,
  type UploadPurpose,
  type UploadRefusal,
  uploadRefusalMessage,
} from "@nw/utils";
import { type ApiClient, parseErrorCode } from "../client";

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
 * A plain object, never a `FormData`: React Native's `FormData` implements
 * `append` and nothing else (no `get`), so reading fields back off one gives
 * `undefined` for every field and an unsigned request on a phone. Every
 * upload goes through {@link uploadMediaDirect}, which builds this.
 */
export interface PresignedUploadRequest {
  contentType: string;
  prefix?: string | null;
  mediaBucket?: string | null;
  /** False drops the per-user id segment from the key. Forced off for `storyboard`. */
  scoped?: boolean;
  /**
   * What the upload is for (`personal` when left out): whether it counts
   * toward the account's storage, a post's media, or a storyboard's own
   * limit. See {@link UploadPurpose}.
   */
  purpose?: UploadPurpose | null;
  /**
   * The storyboard the file goes into; required for `purpose: "storyboard"`,
   * where it becomes the key prefix (`scoped=false`). Ignored otherwise.
   */
  storyboardId?: string | null;
  /**
   * The file's exact byte length (AWS_COST_SECURITY_PLAN.md §2.1). The service
   * signs it into the URL, so S3 refuses a PUT of any other length — send the
   * very bytes measured here. Left out when unknown (a picker that reported no
   * size): the service still accepts that for one release cycle.
   */
  size?: number | null;
}

/** A positive whole byte count, or `null` for "unknown" — never sent as 0. */
const knownSize = (size: number | null | undefined): number | null =>
  typeof size === "number" && Number.isFinite(size) && size > 0
    ? Math.floor(size)
    : null;

/**
 * Reads a refused upload off a response: 413, 429 or 503 with
 * `{ "code": "...", "message": "..." }` (AWS_COST_SECURITY_PLAN.md §2.2), or
 * the presign's bare 415 for a type the service will not sign
 * (`unsupported_type`).
 *
 * `null` for anything else, which the caller reports as an ordinary failure.
 * A 413 with no readable code is nginx's body-size limit, which is the same
 * thing to the person as `size_over_cap`. A 429 with no code
 * is a rate limit, not a quota, and a 503 with no code is the service being
 * down: both stay ordinary failures.
 */
export const readUploadRefusal = async (
  response: Response,
): Promise<UploadRefusal | null> => {
  if (response.status === 415) {
    return {
      code: "unsupported_type",
      refused: true,
      retryAfterSeconds: null,
      status: 415,
    };
  }
  if (
    response.status !== 413 &&
    response.status !== 429 &&
    response.status !== 503
  ) {
    return null;
  }
  let code: string | null = null;
  try {
    const body = (await response.json()) as { code?: unknown } | null;
    if (typeof body?.code === "string" && body.code) code = body.code;
  } catch {
    // Not JSON: nginx's HTML 413, or an empty body.
  }
  if (!code && response.status === 413) code = "size_over_cap";
  if (!code) return null;
  const header = Number(response.headers.get("Retry-After"));
  return {
    code,
    refused: true,
    retryAfterSeconds: Number.isFinite(header) && header > 0 ? header : null,
    status: response.status,
  };
};

/**
 * Where a file goes for its purpose: `storyboard` puts it under the
 * storyboard (its id as the prefix, `scoped=false`) and needs that id —
 * `null` without one, so the caller fails rather than guess a place. Every
 * other purpose keeps the caller's prefix and scope.
 */
export const presignTarget = ({
  prefix,
  purpose,
  scoped,
  storyboardId,
}: Pick<
  PresignedUploadRequest,
  "prefix" | "purpose" | "scoped" | "storyboardId"
>): {
  purpose: UploadPurpose;
  prefix: string | null;
  scoped: boolean | undefined;
} | null => {
  const resolved: UploadPurpose = purpose ?? "personal";
  if (resolved === "storyboard") {
    const id = storyboardId?.trim();
    if (!id) return null;
    return { prefix: id, purpose: resolved, scoped: false };
  }
  return { prefix: prefix || null, purpose: resolved, scoped };
};

/**
 * The presigned URL; an {@link UploadRefusal} the person should be told about
 * (over the cap, the daily limit, storage full, the storyboard full); or
 * `MediaError` for any other failure — also for a `storyboard` upload with no
 * storyboard id, which is never sent.
 *
 * `purpose` goes out only when it is not `personal`, so a personal upload's
 * request is exactly what it was before the parameter existed.
 */
export const requestPresignedUpload = async (
  api: ApiClient,
  {
    contentType,
    mediaBucket,
    prefix: requestedPrefix,
    purpose: requestedPurpose,
    scoped: requestedScoped,
    size,
    storyboardId,
  }: PresignedUploadRequest,
): Promise<
  PresignedFileUploadObject | UploadRefusal | API_MESSAGE.MediaError
> => {
  const target = presignTarget({
    prefix: requestedPrefix,
    purpose: requestedPurpose,
    scoped: requestedScoped,
    storyboardId,
  });
  if (!target) return API_MESSAGE.MediaError;
  const { prefix, purpose, scoped } = target;

  const queryParams = new URLSearchParams({ contentType });
  if (prefix) queryParams.append("prefix", prefix);
  queryParams.append("mediaBucket", mediaBucket ?? "APP_MEDIA");
  if (scoped === false) queryParams.append("scoped", "false");
  const bytes = knownSize(size);
  if (bytes !== null) queryParams.append("size", String(bytes));
  if (purpose !== "personal") queryParams.append("purpose", purpose);

  const response = await api.raw(
    `${PORTFOLIO}/s3/presigned-url?${queryParams.toString()}`,
    { label: "getPresignedFileUploadObject" },
  );

  if (!response.ok) {
    return (await readUploadRefusal(response)) ?? API_MESSAGE.MediaError;
  }

  const { uploadUrl, fileUrl, method } =
    (await response.json()) as PresignedFileUploadObject;

  return { fileUrl, method, uploadUrl };
};

/** A positive byte count, or `null`. */
const positive = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;

/** A configured host string, or `null` for unset/blank/not a string. */
const hostOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/**
 * `limits` off `/s3/usage`, or `null` when absent or not an object (a service
 * that predates it). A family with no usable cap reads 0, which
 * `capForType` treats as "unknown": nothing refused on the client for it.
 */
export const readUploadLimits = (value: unknown): UploadLimits | null => {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const raw =
    body.caps && typeof body.caps === "object"
      ? (body.caps as Record<string, unknown>)
      : null;
  const caps: UploadCaps | null = raw
    ? {
        audio: positive(raw.audio) ?? 0,
        image: positive(raw.image) ?? 0,
        other: positive(raw.other) ?? 0,
        video: positive(raw.video) ?? 0,
      }
    : null;
  const anyCap = caps && Object.values(caps).some((cap) => cap > 0);
  return {
    caps: anyCap ? caps : null,
    chatMediaHost: hostOrNull(body.chatMediaHost),
    enforce: body.enforce === true,
    mediaHost: hostOrNull(body.mediaHost),
    storyboardLimitBytes: positive(body.storyboardLimitBytes),
  };
};

/**
 * `GET /s3/usage`: the account's storage against its total, and today's
 * uploads against the daily limit (AWS_COST_SECURITY_PLAN.md §2.2), with the
 * service's `limits`. `null` on any failure or a shape without the two totals
 * — the settings row then draws nothing rather than a broken bar. Uncached:
 * callers that check uploads go through {@link loadStorageUsage}.
 */
export const getStorageUsage = async (
  api: ApiClient,
): Promise<StorageUsage | null> => {
  try {
    const response = await api.raw(`${PORTFOLIO}/s3/usage`, {
      label: "getStorageUsage",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as Partial<StorageUsage> | null;
    const count = (value: unknown): number | null =>
      typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : null;
    const usedBytes = count(body?.usedBytes);
    const limitBytes = count(body?.limitBytes);
    if (usedBytes === null || !limitBytes) return null;
    // The daily figures are secondary: a missing one only hides its line.
    return {
      dailyFiles: count(body?.dailyFiles) ?? 0,
      dailyFilesLimit: count(body?.dailyFilesLimit) ?? 0,
      dailyLimitBytes: count(body?.dailyLimitBytes) ?? 0,
      dailyUsedBytes: count(body?.dailyUsedBytes) ?? 0,
      limitBytes,
      limits: readUploadLimits((body as { limits?: unknown } | null)?.limits),
      resetsAt: typeof body?.resetsAt === "string" ? body.resetsAt : "",
      usedBytes,
    };
  } catch {
    return null;
  }
};

/** How long a read of `/s3/usage` serves the upload checks. */
export const STORAGE_USAGE_TTL_MS = 60_000;

let usageCache: {
  api: ApiClient;
  at: number;
  usage: Promise<StorageUsage | null>;
} | null = null;

/**
 * `/s3/usage` through a short cache, the one reader of the service's upload
 * limits (caps, enforcement, media hosts) for every client. `fresh` skips the
 * cache — the settings row, and the check after an upload in a batch. A failed
 * read is not kept, so the next check asks again. Each successful read hands
 * the media hosts to `toMediaUrl` ({@link setMediaHosts}).
 */
export const loadStorageUsage = (
  api: ApiClient,
  { fresh = false }: { fresh?: boolean } = {},
): Promise<StorageUsage | null> => {
  const now = Date.now();
  if (
    !fresh &&
    usageCache &&
    usageCache.api === api &&
    now - usageCache.at < STORAGE_USAGE_TTL_MS
  ) {
    return usageCache.usage;
  }
  const usage = getStorageUsage(api).then((result) => {
    if (result?.limits) setMediaHosts(result.limits);
    if (!result && usageCache?.usage === usage) usageCache = null;
    return result;
  });
  usageCache = { api, at: now, usage };
  return usage;
};

/**
 * Drops the cached usage, so the next check reads it again: after an upload
 * went up (or was refused), when the figures it holds have moved.
 */
export const invalidateStorageUsage = (): void => {
  usageCache = null;
};

/** The service's upload limits, cached; `null` when they could not be read. */
export const getUploadLimits = async (
  api: ApiClient,
): Promise<UploadLimits | null> =>
  (await loadStorageUsage(api).catch(() => null))?.limits ?? null;

/** The service's per-family caps, cached; `null` when unknown (refuse nothing). */
export const getUploadCaps = async (
  api: ApiClient,
): Promise<UploadCaps | null> => (await getUploadLimits(api))?.caps ?? null;

/**
 * The check before any upload starts (AWS_COST_SECURITY_PLAN.md §2.2): the
 * family cap, and while the service enforces them, the daily room left and —
 * for a `personal` upload only — the storage room left. A refusal in the
 * service's shape for the shared copy, or `null` to go ahead — also when the
 * usage could not be read: the service decides then.
 */
export const checkUploadAllowed = async (
  api: ApiClient,
  file: UploadCandidate,
  purpose: UploadPurpose = "personal",
): Promise<UploadRefusal | null> =>
  checkUploadAllowance(
    file,
    await loadStorageUsage(api).catch(() => null),
    purpose,
  );

/**
 * The line to show for a refused upload, whether the service refused it or
 * {@link checkUploadAllowed} did. The numbers come from `/s3/usage` (cached):
 * the cap for the file's family, the account's total, when today's limit
 * resets — never a number baked into the client; without them, the line
 * leaves the number out.
 */
export const describeUploadRefusal = async (
  api: ApiClient,
  refusal: UploadRefusal,
  contentType?: string | null,
): Promise<string> => {
  const usage = await loadStorageUsage(api).catch(() => null);
  return uploadRefusalMessage(refusal, {
    capBytes: capForType(contentType, usage?.limits?.caps),
    limitBytes: usage?.limitBytes ?? null,
    resetsAt: usage?.resetsAt ?? null,
    storyboardLimitBytes: usage?.limits?.storyboardLimitBytes ?? null,
  });
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

// ─── Direct upload (AWS_COST_SECURITY_PLAN.md §2.1–2.2) ─────────────────────

/** A refusal in the service's shape, for the outcomes that carry no `code`. */
const refusalOf = (code: string, status: number): UploadRefusal => ({
  code,
  refused: true,
  retryAfterSeconds: null,
  status,
});

/**
 * The upload ledger's confirm and the NSFW screen, in one call:
 * `POST /s3/moderate` after the PUT. `ok` on 200 (allowed, or not screened —
 * chat media, video, audio). A refusal for 422 `media_rejected` or 413
 * `size_over_cap`; the service has deleted the object by then, so the URL
 * must not be used. Anything else — 400, 401, a 5xx, a network failure — is
 * `refusal: null`, an ordinary failure: the URL is not used either, and the
 * service's reconcile job settles the unconfirmed object.
 */
export const confirmUpload = async (
  api: ApiClient,
  fileUrl: string,
): Promise<{ ok: true } | { ok: false; refusal: UploadRefusal | null }> => {
  try {
    const response = await api.raw(`${PORTFOLIO}/s3/moderate`, {
      body: { fileUrl },
      label: "confirmUpload",
      method: "POST",
    });
    if (response.ok) return { ok: true };
    if (response.status === 422) {
      return { ok: false, refusal: refusalOf("media_rejected", 422) };
    }
    if (response.status === 413) {
      return { ok: false, refusal: await readUploadRefusal(response) };
    }
    return { ok: false, refusal: null };
  } catch {
    return { ok: false, refusal: null };
  }
};

/** Where and how to PUT the bytes, as the service signed it. */
export interface DirectUploadTarget {
  uploadUrl: string;
  method: string;
  /**
   * Exactly the type the URL was signed for. It must go out as the request's
   * `Content-Type`, byte for byte: S3 answers any other value with 403.
   */
  contentType: string;
}

/**
 * Sends the bytes to a signed URL and resolves the HTTP status; throws on a
 * network failure. Web uses the default (fetch with a `Blob`); native passes
 * its own (`FileSystem.uploadAsync` from a file URI), which must send
 * `target.contentType` as the `Content-Type` header.
 */
export type DirectUploadPut = (target: DirectUploadTarget) => Promise<number>;

/** The default PUT: `fetch` with the blob and the signed `Content-Type`. */
export const putWithFetch =
  (body: Blob): DirectUploadPut =>
  async ({ contentType, method, uploadUrl }) =>
    (
      await fetch(uploadUrl, {
        body,
        headers: { "Content-Type": contentType },
        method,
      })
    ).status;

export interface DirectUploadRequest {
  /**
   * The MIME type. Signed as given (blank becomes
   * `application/octet-stream`) and sent as the PUT's `Content-Type`.
   */
  contentType: string;
  /**
   * The exact byte length of what the PUT will send (`Blob.size` on web; the
   * measured file on native). Signed into the URL; S3 refuses any other
   * length. `null` when unknown — still accepted for one release cycle.
   */
  size: number | null;
  /** The bytes, for the default {@link putWithFetch}. Ignored when `put` is given. */
  body?: Blob | null;
  /** A PUT of the caller's own (native); defaults to {@link putWithFetch}. */
  put?: DirectUploadPut;
  /** `APP_MEDIA` (the default) or `CHAT_MEDIA` for private-message media. */
  mediaBucket?: string | null;
  prefix?: string | null;
  /** False drops the per-user id segment from the key. Forced off for `storyboard`. */
  scoped?: boolean;
  /** `personal` when left out. See {@link PresignedUploadRequest.purpose}. */
  purpose?: UploadPurpose | null;
  /** Required for `purpose: "storyboard"`: the key prefix. */
  storyboardId?: string | null;
}

/** Where a direct upload stopped. */
export type DirectUploadStage = "check" | "presign" | "put" | "confirm";

/**
 * What a direct upload came to. `refused` is a refusal the person should be
 * told about, with the shared copy in `message` (from
 * {@link describeUploadRefusal}); otherwise `message` is the generic
 * "Upload failed" line. The service's own text is never passed on.
 */
export type DirectUploadResult =
  | { ok: true; fileUrl: string }
  | {
      ok: false;
      refused: true;
      refusal: UploadRefusal;
      message: string;
      stage: DirectUploadStage;
    }
  | {
      ok: false;
      refused: false;
      message: string;
      stage: DirectUploadStage;
    };

/**
 * Every media upload, web and native: the bytes go straight to storage and
 * never through the service.
 *
 * 1. {@link checkUploadAllowed}: the family cap, and while enforced the
 *    storage and daily room, from `/s3/usage` (cached) — nothing is sent when
 *    it refuses.
 * 2. {@link requestPresignedUpload} with the exact size and the `purpose`:
 *    413 `size_over_cap` / `storage_full` / `storyboard_full`, 429
 *    `upload_daily_limit` (with `Retry-After`), 503 `upload_unavailable`,
 *    415 `unsupported_type` come back as refusals. A `storyboard` upload
 *    with no storyboard id fails here without a request.
 * 3. The PUT, with the signed `Content-Type`. A non-2xx or a network failure
 *    is a plain failure; nothing is cleaned up from here — the service's
 *    reconcile job settles an unconfirmed upload.
 * 4. {@link confirmUpload}: 422 `media_rejected` and 413 `size_over_cap` are
 *    refusals (the object is already deleted).
 *
 * The cached usage is dropped after a stored PUT and after any refusal, so
 * the next check in a batch reads `/s3/usage` again. Never throws.
 */
export const uploadMediaDirect = async (
  api: ApiClient,
  {
    body,
    contentType: declaredType,
    mediaBucket,
    prefix,
    purpose,
    put,
    scoped,
    size,
    storyboardId,
  }: DirectUploadRequest,
): Promise<DirectUploadResult> => {
  const contentType = declaredType?.trim() || "application/octet-stream";
  const bytes = knownSize(size);

  const failed = (stage: DirectUploadStage): DirectUploadResult => ({
    message: UPLOAD_FAILED_MESSAGE,
    ok: false,
    refused: false,
    stage,
  });
  const refused = async (
    refusal: UploadRefusal,
    stage: DirectUploadStage,
  ): Promise<DirectUploadResult> => {
    // The figures behind it have moved (or were stale): read them again next time.
    invalidateStorageUsage();
    const message = await describeUploadRefusal(api, refusal, contentType)
      .catch(() => null)
      .then((line) => line ?? UPLOAD_FAILED_MESSAGE);
    return { message, ok: false, refusal, refused: true, stage };
  };

  const send = put ?? (body ? putWithFetch(body) : null);
  if (!send) return failed("put");
  // A storyboard upload with no storyboard to put it in goes nowhere.
  const target = presignTarget({ prefix, purpose, scoped, storyboardId });
  if (!target) return failed("presign");

  const early = await checkUploadAllowed(
    api,
    { size: bytes ?? 0, type: contentType },
    target.purpose,
  ).catch(() => null);
  if (early) return refused(early, "check");

  let presigned: Awaited<ReturnType<typeof requestPresignedUpload>>;
  try {
    presigned = await requestPresignedUpload(api, {
      contentType,
      mediaBucket,
      prefix,
      purpose,
      scoped,
      size: bytes,
      storyboardId,
    });
  } catch {
    return failed("presign");
  }
  if (isUploadRefusal(presigned)) return refused(presigned, "presign");
  if (
    !presigned ||
    typeof presigned !== "object" ||
    !presigned.uploadUrl ||
    !presigned.fileUrl
  ) {
    return failed("presign");
  }

  let status: number;
  try {
    status = await send({
      contentType,
      method: presigned.method || "PUT",
      uploadUrl: presigned.uploadUrl,
    });
  } catch {
    return failed("put");
  }
  if (status < 200 || status >= 300) return failed("put");
  // The bytes are in storage: the next check in a batch reads usage again.
  invalidateStorageUsage();

  const confirmed = await confirmUpload(api, presigned.fileUrl);
  if (!confirmed.ok) {
    return confirmed.refusal
      ? refused(confirmed.refusal, "confirm")
      : failed("confirm");
  }
  return { fileUrl: presigned.fileUrl, ok: true };
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
    case 422:
      // More media than a post may carry (MAX_POST_MEDIA). Any other 422 is
      // an ordinary failure.
      if (
        parseErrorCode(await response.text().catch(() => "")) ===
        "too_many_media"
      ) {
        return { message: API_MESSAGE.TooManyMedia };
      }
      return { message: API_MESSAGE.UncategorizedError };
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

/**
 * The caller's Blacklisted novelists list, newest first (BLOCK_BLACKLIST_PLAN.md
 * B15). Overviews, enriched like the friends list; disabled novelists drop out
 * until they return.
 */
export const getBlacklistedNovelists = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
) =>
  listOrEmpty(
    api,
    `${PORTFOLIO}/novelist/blacklisted?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    "getBlacklistedNovelistsAction",
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

/**
 * Remove from blacklist. The chat with them returns to the inbox, unmuted.
 * Idempotent on the server.
 */
export const unblacklistNovelist = async (
  api: ApiClient,
  novelistId: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${CONNECTION}/${novelistId}/blacklist`, {
    label: "unblacklistNovelistAction",
    method: "DELETE",
  });
  return { message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};

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
