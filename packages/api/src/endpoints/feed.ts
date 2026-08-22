import type { Prompt, PromptThreadComment } from "@nw/types";
import type { DataType } from "@nw/types/common";
import { transformPrompt } from "@nw/utils/image";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/prompt";

/** Applies the feed image transform in place, passing the error/null shapes through. */
const withFeedImages = (result: DataType<Prompt[]>): DataType<Prompt[]> => {
  if (Array.isArray(result)) {
    for (const prompt of result) transformPrompt(prompt, "feed");
  }
  return result;
};

export const getExplorePrompts = async (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Prompt[]>> =>
  withFeedImages(
    await api.requestNullable<Prompt[]>(
      `${BASE}/explore?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getNewPromptsAction", notFound: "null" },
    ),
  );

export const getNewsFeedPage = async (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Prompt[]>> =>
  withFeedImages(
    await api.requestNullable<Prompt[]>(
      `${BASE}/posts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getNewsFeedPageAction", notFound: "null" },
    ),
  );

export const getNewsFeed = async (
  api: ApiClient,
): Promise<DataType<Prompt[]>> =>
  withFeedImages(
    await api.requestNullable<Prompt[]>(`${BASE}/posts`, {
      label: "getNewsFeed",
      notFound: "null",
    }),
  );

export const getOutgoingThreads = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<PromptThreadComment[]>> =>
  api.requestNullable<PromptThreadComment[]>(
    `${BASE}/outgoing?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getOutgoingThreadsAction", notFound: "null" },
  );

export const getUnreadReplyCount = (
  api: ApiClient,
): Promise<DataType<number>> =>
  api.requestNullable<number>(`${BASE}/outgoing/replyCount`, {
    label: "getUnreadReplyCount",
    notFound: "null",
  });
