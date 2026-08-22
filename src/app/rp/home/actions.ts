"use server";

import {
  getFriendActivities as fetchFriendActivities,
  getRandomStories as fetchRandomStories,
  getUserActivities as fetchUserActivities,
  getMuses,
  getMusesWithVideos,
  getStrangerNovelists,
} from "@nw/api/endpoints/home";
import { api, authedApi } from "@/lib/server-api";

export const getStrangerNovelistsAction = (
  pageNumber: number,
  pageSize: number,
) => getStrangerNovelists(authedApi, pageNumber, pageSize);

export const getMusesAction = (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
) => getMuses(authedApi, pageNumber, pageSize, type);

export const getMusesWithVideosAction = (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
) => getMusesWithVideos(authedApi, pageNumber, pageSize, type);

/** Auth optional — a token makes the viewer's own reactions render filled. */
export const getUserActivities = (
  username: string,
  pageNumber: number,
  pageSize: number,
) => fetchUserActivities(api, username, pageNumber, pageSize);

export const getFriendActivities = (
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
) => fetchFriendActivities(authedApi, pageNumber, pageSize, type);

/** Auth optional — a token folds in stories the novelist is a member of. */
export const getRandomStories = (pageNumber: number, pageSize: number) =>
  fetchRandomStories(api, pageNumber, pageSize);
