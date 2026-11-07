import {
  acceptFriendRequest as apiAcceptFriendRequest,
  blacklistUser as apiBlacklistUser,
  blockUser as apiBlockUser,
  cancelFriendRequest as apiCancelFriendRequest,
  deleteFriendRequest as apiDeleteFriendRequest,
  deleteMedia as apiDeleteMedia,
  enhanceAvatar as apiEnhanceAvatar,
  getPresignedFileUploadObject as apiGetPresignedFileUploadObject,
  moderateUpload as apiModerateUpload,
  reportProfile as apiReportProfile,
  sendFeedbackMessage as apiSendFeedbackMessage,
  sendFriendRequest as apiSendFriendRequest,
  submitPrompt as apiSubmitPrompt,
  unfriendNovelist as apiUnfriendNovelist,
  uploadMedia as apiUploadMedia,
  getBlockedNovelists,
  getReferredNovelists,
  unblockNovelist,
} from "@nw/api/endpoints/profile";
import type { SubmitPromptInput, SubmitPromptType } from "@nw/types";
import { api, authedApi } from "@/lib/api";

export const getPresignedFileUploadObject = (formData: FormData) =>
  apiGetPresignedFileUploadObject(authedApi, formData);

export const uploadMedia = (formData: FormData) =>
  apiUploadMedia(authedApi, formData);

/** The service's NSFW check on a presigned upload; `false` = refused and deleted. */
export const moderateUpload = (fileUrl: string) =>
  apiModerateUpload(authedApi, fileUrl);

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
