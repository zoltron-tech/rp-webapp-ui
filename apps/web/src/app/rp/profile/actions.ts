import {
  acceptFriendRequest as apiAcceptFriendRequest,
  blacklistUser as apiBlacklistUser,
  blockUser as apiBlockUser,
  cancelFriendRequest as apiCancelFriendRequest,
  deleteFriendRequest as apiDeleteFriendRequest,
  deleteMedia as apiDeleteMedia,
  enhanceAvatar as apiEnhanceAvatar,
  getUploadCaps as apiGetUploadCaps,
  getUploadLimits as apiGetUploadLimits,
  reportProfile as apiReportProfile,
  sendFeedbackMessage as apiSendFeedbackMessage,
  sendFriendRequest as apiSendFriendRequest,
  submitPrompt as apiSubmitPrompt,
  unfriendNovelist as apiUnfriendNovelist,
  type DirectUploadRequest,
  getBlacklistedNovelists,
  getBlockedNovelists,
  getReferredNovelists,
  invalidateStorageUsage,
  loadStorageUsage,
  unblacklistNovelist,
  unblockNovelist,
  uploadMediaDirect,
} from "@nw/api/endpoints/profile";
import { disableAccount } from "@nw/api/endpoints/novelists";
import type {
  DisableAccountPayload,
  SubmitPromptInput,
  SubmitPromptType,
} from "@nw/types";
import { api, authedApi } from "@/lib/api";

/**
 * Every web upload, straight to storage: check, presign, PUT, confirm
 * (AWS_COST_SECURITY_PLAN.md §2.1–2.2). Callers go through
 * `utils/upload-media`, which prepares the file and shows a refusal.
 */
export const uploadMediaDirectAction = (request: DirectUploadRequest) =>
  uploadMediaDirect(authedApi, request);

/**
 * `GET /s3/usage`, read fresh — `null` when it fails (AWS_COST_SECURITY_PLAN.md
 * §2.2). Refreshes the cache the upload checks read too.
 */
export const getStorageUsage = () =>
  loadStorageUsage(authedApi, { fresh: true });

/** The service's upload limits (caps, enforcement, media hosts), cached briefly. */
export const getUploadLimits = () => apiGetUploadLimits(authedApi);

/** The service's per-family caps, cached; `null` when unknown — refuse nothing then. */
export const getUploadCaps = () => apiGetUploadCaps(authedApi);

/** Makes the next upload check read `/s3/usage` again. */
export const refreshUploadUsage = () => invalidateStorageUsage();

/** Unauthenticated by design — this endpoint never checked a token. */
export const enhanceAvatar = (formData: FormData) =>
  apiEnhanceAvatar(api, formData);

export const deleteMedia = (filename: string) =>
  apiDeleteMedia(authedApi, filename);

export const sendFriendRequest = (novelistId: string) =>
  apiSendFriendRequest(authedApi, novelistId);

export const blockUser = (novelistId: string) =>
  apiBlockUser(authedApi, novelistId);

export const blacklistUser = (novelistId: string) =>
  apiBlacklistUser(authedApi, novelistId);

export const acceptFriendRequest = (novelistId: string) =>
  apiAcceptFriendRequest(authedApi, novelistId);

export const deleteFriendRequest = (novelistId: string) =>
  apiDeleteFriendRequest(authedApi, novelistId);

export const cancelFriendRequest = (novelistId: string) =>
  apiCancelFriendRequest(authedApi, novelistId);

export const reportProfile = (novelistId: string, reason: string) =>
  apiReportProfile(authedApi, novelistId, reason);

export const sendFeedbackMessage = (message: string) =>
  apiSendFeedbackMessage(authedApi, message);

export const unfriendNovelist = (novelistId: string) =>
  apiUnfriendNovelist(authedApi, novelistId);

export const submitPrompt = (
  prompt: SubmitPromptInput,
  type: SubmitPromptType = "prompt",
) => apiSubmitPrompt(authedApi, prompt, type);

export const getBlockedNovelistsAction = (
  pageNumber: number,
  pageSize: number,
) => getBlockedNovelists(authedApi, pageNumber, pageSize);

export const getReferredNovelistsAction = (
  pageNumber: number,
  pageSize: number,
) => getReferredNovelists(authedApi, pageNumber, pageSize);

export const unblockNovelistAction = (novelistId: string) =>
  unblockNovelist(authedApi, novelistId);

/** The caller's Blacklisted novelists list (BLOCK_BLACKLIST_PLAN.md B15). */
export const getBlacklistedNovelistsAction = (
  pageNumber: number,
  pageSize: number,
) => getBlacklistedNovelists(authedApi, pageNumber, pageSize);

/** Remove from blacklist: their chat comes back to the inbox, unmuted. */
export const unblacklistNovelistAction = (novelistId: string) =>
  unblacklistNovelist(authedApi, novelistId);

/** Disables the caller's account (ACCOUNT_DISABLE_PLAN.md). Signing in again brings it back. */
export const disableAccountAction = (payload: DisableAccountPayload) =>
  disableAccount(authedApi, payload);
