import {
  concludeComment,
  deleteComment,
  deletePrompt,
  deleteReply,
  getComment,
  getCommentsByPrompt,
  getReplies,
  report,
} from "@nw/api/endpoints/thread";
import { api, authedApi } from "@/lib/api";

export const reportAction = (
  replyId: string,
  reason: string,
  targetType: string,
) => report(authedApi, replyId, reason, targetType);

export const getCommentAction = (commentId: string) =>
  getComment(api, commentId);

export const getRepliesAction = (
  commentId: string,
  pageNumber: number,
  pageSize: number,
) => getReplies(api, commentId, pageNumber, pageSize);

export const getCommentsByPromptAction = (promptId: string) =>
  getCommentsByPrompt(api, promptId);

export const concludeCommentAction = (commentId: string, concluded: boolean) =>
  concludeComment(authedApi, commentId, concluded);

export const deleteReplyAction = (replyId: string) =>
  deleteReply(authedApi, replyId);

export const deleteCommentAction = (commentId: string) =>
  deleteComment(authedApi, commentId);

export const deletePromptAction = (promptId: string) =>
  deletePrompt(authedApi, promptId);
