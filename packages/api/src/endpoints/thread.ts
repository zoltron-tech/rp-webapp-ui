import type { Comment, Reply } from "@nw/types";
import type { DataType, WithMessage } from "@nw/types/common";
import type { ApiClient } from "../client";

const PROMPT = "/rp/portfolio/prompt";

export const report = (
  api: ApiClient,
  targetId: string,
  reason: string,
  targetType: string,
): Promise<WithMessage> =>
  api.request<WithMessage>("/rp/portfolio/report", {
    body: { reason, targetId, targetType },
    label: "reportAction",
    method: "POST",
  });

export const getComment = (
  api: ApiClient,
  commentId: string,
): Promise<DataType<Comment>> =>
  api.requestNullable<Comment>(`${PROMPT}/comment/${commentId}`, {
    label: "getCommentAction",
    notFound: "null",
  });

export const getReplies = (
  api: ApiClient,
  commentId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Reply[]>> =>
  api.requestNullable<Reply[]>(
    `${PROMPT}/comment/${commentId}/replies?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getRepliesAction", notFound: "null" },
  );

/** Public: comments render for signed-out visitors, so no token is sent. */
export const getCommentsByPrompt = (
  api: ApiClient,
  promptId: string,
): Promise<DataType<Comment[]>> =>
  api.requestNullable<Comment[]>(`${PROMPT}/${promptId}/comments`, {
    anonymous: true,
    contentType: false,
    label: "getCommentsByPromptAction",
    notFound: "null",
  });

export const concludeComment = (
  api: ApiClient,
  commentId: string,
  concluded: boolean,
): Promise<WithMessage> =>
  api.request<WithMessage>(`${PROMPT}/comment/${commentId}/conclude`, {
    body: { concluded },
    label: "concludeCommentAction",
    method: "PUT",
  });

export const deleteReply = (
  api: ApiClient,
  replyId: string,
): Promise<WithMessage> =>
  api.request<WithMessage>(`${PROMPT}/reply/${replyId}`, {
    label: "deleteReplyAction",
    method: "DELETE",
  });

export const deleteComment = (
  api: ApiClient,
  commentId: string,
): Promise<WithMessage> =>
  api.request<WithMessage>(`${PROMPT}/comment/${commentId}`, {
    label: "deleteCommentAction",
    method: "DELETE",
  });

export const deletePrompt = (
  api: ApiClient,
  promptId: string,
): Promise<WithMessage> =>
  api.request<WithMessage>(`${PROMPT}/${promptId}`, {
    label: "deletePromptAction",
    method: "DELETE",
  });
